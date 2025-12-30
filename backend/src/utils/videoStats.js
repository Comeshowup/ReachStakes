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
        // "me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,like_count,comments_count"
        const url = `https://graph.instagram.com/me/media?fields=id,permalink,like_count,comments_count&access_token=${accessToken}`;

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

        // 3. Return Stats
        return {
            views: 0, // Views are not available via Basic Display API for all account types easily
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

