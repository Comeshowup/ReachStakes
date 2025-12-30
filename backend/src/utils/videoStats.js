import axios from 'axios';
import { prisma } from '../config/db.js';

/**
 * Fetches video statistics from external platforms using the user's linked account tokens.
 * 
 * @param {string} platform - The platform name (YouTube, Instagram, etc.)
 * @param {string} videoId - The extracted video ID (or media URL for some platforms)
 * @param {number} userId - The ID of the user (creator) to fetch tokens for
 * @returns {Promise<Object>} - The stats object { views, likes, comments, updatedAt }
 */
export const fetchVideoStats = async (platform, videoId, userId) => {
    try {
        // 1. Get the Access Token for the user & platform
        const account = await prisma.socialAccount.findFirst({
            where: {
                userId: userId,
                platform: { equals: platform } // Case insensitive match might be needed depending on DB, but Enum usually matches
            }
        });

        if (!account) {
            throw new Error(`You have not linked your ${platform} account. Please link it in Settings > Social Accounts first.`);
        }

        // 2. Fetch based on platform
        if (platform === 'YouTube') {
            return await fetchYouTubeStats(videoId, account.accessToken);
        } else if (platform === 'Instagram') {
            // For Instagram, we need the full URL to find the matching media
            // We pass the second argument (videoId) as the URL if logic demands, 
            // but the caller passed 'videoId' which might be null for IG.
            // Let's rely on the caller passing the URL as 'videoId' or handle it differently?
            // actually, in collaborationRoutes, we can pass the URL as the second arg for IG.
            return await fetchInstagramStats(videoId, account.accessToken);
        } else if (platform === 'TikTok') {
            return await fetchTikTokStats(videoId, account.accessToken);
        }

        // Placeholder for other platforms
        throw new Error(`Strict verification not yet implemented for ${platform}.`);

    } catch (error) {
        console.error(`Error fetching stats for ${platform}:`, error.message);
        throw error; // Re-throw the error so the caller can handle it
    }
};

const fetchYouTubeStats = async (videoId, accessToken) => {
    try {
        if (!accessToken) {
            throw new Error("Missing YouTube access token. Please re-link your account.");
        }

        // A. Get Authenticated User's Channel ID ("mine")
        const channelResp = await axios.get('https://www.googleapis.com/youtube/v3/channels?part=id&mine=true', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!channelResp.data.items || channelResp.data.items.length === 0) {
            throw new Error("Could not fetch your YouTube channel details.");
        }
        const myChannelId = channelResp.data.items[0].id;

        // B. Get Video Details (Channel ID of the video uploader)
        // We also fetch stats here to save an API call
        const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}`;
        const videoResp = await axios.get(videoUrl, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!videoResp.data.items || videoResp.data.items.length === 0) {
            throw new Error("Video not found on YouTube. Please check the link.");
        }

        const videoData = videoResp.data.items[0];
        const videoChannelId = videoData.snippet.channelId;

        // C. STRICT OWNERSHIP CHECK
        if (myChannelId !== videoChannelId) {
            throw new Error(`Ownership Mismatch: This video belongs to channel '${videoData.snippet.channelTitle}', but you are logged in as a different channel. You can only submit your own content.`);
        }

        // D. Return Stats
        const stats = videoData.statistics;
        return {
            views: parseInt(stats.viewCount || 0),
            likes: parseInt(stats.likeCount || 0),
            comments: parseInt(stats.commentCount || 0),
            updatedAt: new Date().toISOString()
        };

    } catch (err) {
        // Propagate our specific errors, or axios errors
        if (err.response) {
            console.error("YouTube API Error:", err.response.data);

            // Handle 401 Unauthorized (Expired details)
            if (err.response.status === 401) {
                throw new Error("Your YouTube connection has expired. Please go to Settings > Social Accounts, disconnect, and look for 'YouTube' to reconnect it.");
            }

            throw new Error("YouTube API Error: " + (err.response.data.error?.message || err.message));
        }
        throw err;
    }
};

const fetchInstagramStats = async (submissionUrl, accessToken) => {
    try {
        if (!accessToken) throw new Error("Missing Instagram access token.");

        // 1. Fetch User's Media
        // Note: view_count is ONLY available for VIDEO and REEL media types, not IMAGE or CAROUSEL_ALBUM
        const url = `https://graph.instagram.com/me/media?fields=id,permalink,like_count,comments_count,media_type&access_token=${accessToken}`;

        console.log("Fetching Instagram media list...");
        const response = await axios.get(url);
        const mediaList = response.data.data;

        if (!mediaList || mediaList.length === 0) {
            throw new Error("No media found on your Instagram account.");
        }

        // 2. Find matching post
        // Normalize URLs to remove query params for comparison
        const cleanSubmissionUrl = submissionUrl.split('?')[0].replace(/\/$/, "");

        const matchedMedia = mediaList.find(media => {
            if (!media.permalink) return false;
            const cleanPermalink = media.permalink.split('?')[0].replace(/\/$/, "");
            return cleanPermalink.includes(cleanSubmissionUrl) || cleanSubmissionUrl.includes(cleanPermalink);
        });

        if (!matchedMedia) {
            throw new Error("Could not find this post on your connected Instagram account. Please ensure you are submitting your own post.");
        }

        console.log("Matched IG Media:", matchedMedia);

        // 3. Fetch detailed media info including view_count for VIDEO/REEL types
        let viewCount = 0;
        const isVideoContent = matchedMedia.media_type === 'VIDEO' || matchedMedia.media_type === 'REEL';

        if (isVideoContent) {
            try {
                // Fetch view_count specifically for video content
                const videoMediaUrl = `https://graph.instagram.com/${matchedMedia.id}?fields=id,media_type,like_count,comments_count,plays&access_token=${accessToken}`;
                console.log(`Fetching video details for media ${matchedMedia.id}`);

                const videoResp = await axios.get(videoMediaUrl);
                const videoData = videoResp.data;

                // 'plays' is the official field for video plays/views in Basic Display API
                viewCount = videoData.plays || 0;
                console.log("Video plays/views:", viewCount);
            } catch (videoErr) {
                console.warn("Could not fetch video plays:", videoErr.response?.data?.error?.message || videoErr.message);
            }
        } else {
            // For IMAGE and CAROUSEL_ALBUM, views are not available via Basic Display API
            // We can try the insights endpoint, but it requires Business/Creator account
            console.log(`Media type is ${matchedMedia.media_type} - views not available via Basic Display API`);

            try {
                // Try insights endpoint (only works for Business/Creator accounts)
                const insightsUrl = `https://graph.instagram.com/${matchedMedia.id}/insights?metric=impressions,reach&access_token=${accessToken}`;
                console.log(`Attempting to fetch insights for ${matchedMedia.id} (requires Business account)`);

                const insightsResp = await axios.get(insightsUrl);
                const insights = insightsResp.data.data;

                if (insights) {
                    // Find 'impressions' metric (total views including repeat views)
                    const impressionsMetric = insights.find(m => m.name === 'impressions');
                    const impressionsValue = impressionsMetric?.values?.[0]?.value || 0;

                    // Find 'reach' metric (unique accounts that saw the post)
                    const reachMetric = insights.find(m => m.name === 'reach');
                    const reachValue = reachMetric?.values?.[0]?.value || 0;

                    // Use impressions as "views" (closest equivalent)
                    viewCount = impressionsValue || reachValue;
                    console.log("Fetched IG Insights:", { impressions: impressionsValue, reach: reachValue });
                }
            } catch (insightErr) {
                // This is expected to fail for non-Business accounts
                const errorMsg = insightErr.response?.data?.error?.message || insightErr.message;
                console.warn("Insights not available (requires Instagram Business/Creator account):", errorMsg);
                // viewCount remains 0 - this is expected for personal accounts with image posts
            }
        }

        // 4. Return Stats
        console.log("Final Instagram stats:", { views: viewCount, likes: matchedMedia.like_count || 0, comments: matchedMedia.comments_count || 0 });
        return {
            views: viewCount,
            likes: matchedMedia.like_count || 0,
            comments: matchedMedia.comments_count || 0,
            updatedAt: new Date().toISOString()
        };

    } catch (err) {
        if (err.response) {
            console.error("Instagram API Error:", err.response.data);
            if (err.response.status === 401) {
                throw new Error("Your Instagram connection has expired. Please reconnect it.");
            }
            throw new Error("Instagram API Error: " + (err.response.data.error?.message || err.message));
        }
        throw err;
    }
};

const fetchTikTokStats = async (submissionUrl, accessToken) => {
    try {
        if (!accessToken) throw new Error("Missing TikTok access token.");

        // 1. Fetch User's Videos from TikTok Display API
        // For Sandbox, we mostly use the /video/list/ endpoint.
        // POST https://open.tiktokapis.com/v2/video/list/
        // Headers: Authorization: Bearer <access_token>, Content-Type: application/json
        // Body: { "max_count": 20 }

        const url = 'https://open.tiktokapis.com/v2/video/list/?fields=id,title,share_url,like_count,comment_count,share_count,view_count';
        // Note: 'view_count' availability depends on permissions, standard scope usually includes it for own videos.

        const response = await axios.post(url, {
            max_count: 20 // Fetch last 20 videos
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const videos = response.data.data?.videos;

        if (!videos || videos.length === 0) {
            throw new Error("No videos found on your TikTok account.");
        }

        // 2. Find matching video
        // TikTok share URLs can vary (vm.tiktok.com vs tiktok.com/@user/video/ID).
        // Best bet: extract ID from submissionUrl if possible, OR fuzzy match the share_url.
        // Assuming submissionUrl contains the video ID. Let's try to find if the video ID or share URL matches.

        const matchedVideo = videos.find(video => {
            // Check if share_url matches (fuzzy)
            if (video.share_url && submissionUrl.includes(video.share_url)) return true;
            if (video.share_url && video.share_url.includes(submissionUrl)) return true;

            // Check ID if possible (frontend logic might not extract ID for TikTok yet)
            return false;
        });

        if (!matchedVideo) {
            // Fallback: If we can't match, maybe we just return the most recent one? NO, that's bad.
            // Let's log the share_urls available for debugging
            console.log("Available TikTok Videos:", videos.map(v => v.share_url));
            throw new Error("Could not find this video on your connected TikTok account. Please check the URL.");
        }

        console.log("Matched TikTok Video:", matchedVideo);

        // 3. Return Stats
        return {
            views: matchedVideo.view_count || 0,
            likes: matchedVideo.like_count || 0,
            comments: matchedVideo.comment_count || 0,
            updatedAt: new Date().toISOString()
        };

    } catch (err) {
        if (err.response) {
            console.error("TikTok API Error:", err.response.data);
            if (err.response.status === 401) {
                throw new Error("Your TikTok connection has expired. Please reconnect it.");
            }
            const platformErr = err.response.data.error?.message || JSON.stringify(err.response.data);
            throw new Error("TikTok API Error: " + platformErr);
        }
        throw err;
    }
};
