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

        // 1. Fetch User's Media with all available fields including plays
        // Note: 'plays' field is for VIDEO/REEL content
        const url = `https://graph.instagram.com/me/media?fields=id,permalink,like_count,comments_count,media_type,plays&access_token=${accessToken}`;

        console.log("=== INSTAGRAM STATS FETCH START ===");
        console.log("Fetching Instagram media list...");
        const response = await axios.get(url);
        const mediaList = response.data.data;

        console.log("Media count:", mediaList?.length || 0);
        console.log("First 2 media items:", JSON.stringify(mediaList?.slice(0, 2), null, 2));

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
            console.log("Could not match. Looking for:", cleanSubmissionUrl);
            console.log("Available permalinks:", mediaList.map(m => m.permalink));
            throw new Error("Could not find this post on your connected Instagram account. Please ensure you are submitting your own post.");
        }

        console.log("Matched IG Media:", JSON.stringify(matchedMedia, null, 2));

        // 3. Fetch detailed media info and insights
        // Check if 'plays' was returned (only for VIDEO type)
        let viewCount = matchedMedia.plays || 0;
        console.log("Initial plays from media response:", viewCount);

        const isVideoContent = matchedMedia.media_type === 'VIDEO';

        // Always try insights endpoint for professional accounts - it's the most reliable
        // Insights requires instagram_manage_insights permission for Business/Creator accounts
        try {
            // Different metrics available: plays, reach, impressions
            // For reels/videos: 'plays' is the primary metric
            // For images: 'impressions' or 'reach'
            const metrics = isVideoContent ? 'plays,reach' : 'impressions,reach';
            const insightsUrl = `https://graph.instagram.com/${matchedMedia.id}/insights?metric=${metrics}&access_token=${accessToken}`;
            console.log(`Fetching insights for media ${matchedMedia.id} (media_type: ${matchedMedia.media_type})`);
            console.log(`Metrics requested: ${metrics}`);

            const insightsResp = await axios.get(insightsUrl);
            const insights = insightsResp.data.data;

            console.log("Insights response:", JSON.stringify(insights, null, 2));

            if (insights && insights.length > 0) {
                // Try 'plays' for video content
                const playsMetric = insights.find(m => m.name === 'plays');
                const playsValue = playsMetric?.values?.[0]?.value || 0;

                // Try 'impressions' as fallback (total views including repeat)
                const impressionsMetric = insights.find(m => m.name === 'impressions');
                const impressionsValue = impressionsMetric?.values?.[0]?.value || 0;

                // Try 'reach' as final fallback (unique accounts)
                const reachMetric = insights.find(m => m.name === 'reach');
                const reachValue = reachMetric?.values?.[0]?.value || 0;

                console.log("Insights values:", { plays: playsValue, impressions: impressionsValue, reach: reachValue });

                // Priority: plays > impressions > reach > initial plays
                if (playsValue > 0) {
                    viewCount = playsValue;
                    console.log("Using 'plays' metric:", viewCount);
                } else if (impressionsValue > 0) {
                    viewCount = impressionsValue;
                    console.log("Using 'impressions' metric:", viewCount);
                } else if (reachValue > 0) {
                    viewCount = reachValue;
                    console.log("Using 'reach' metric:", viewCount);
                }
            }
        } catch (insightErr) {
            const errorMsg = insightErr.response?.data?.error?.message || insightErr.message;
            const errorCode = insightErr.response?.data?.error?.code;
            console.warn("Insights API error:", { code: errorCode, message: errorMsg });
            console.warn("Full error response:", JSON.stringify(insightErr.response?.data, null, 2));

            // Keep using the 'plays' value from initial media request if we have it
            if (matchedMedia.plays) {
                viewCount = matchedMedia.plays;
                console.log("Falling back to 'plays' from media response:", viewCount);
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
