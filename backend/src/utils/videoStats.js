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
import { OAuth2Client } from 'google-auth-library';

export const fetchVideoStats = async (platform, videoId, userId) => {
    try {
        // 1. Get the Social Account
        const account = await prisma.socialAccount.findFirst({
            where: {
                userId: userId,
                platform: { equals: platform }
            }
        });

        if (!account) {
            throw new Error(`You have not linked your ${platform} account. Please link it in Settings > Social Accounts first.`);
        }

        // 2. Get a Valid Access Token (Refresh if needed)
        const accessToken = await getValidAccessToken(account);

        // 3. Fetch based on platform
        if (platform === 'YouTube') {
            return await fetchYouTubeStats(videoId, accessToken);
        } else if (platform === 'Instagram') {
            return await fetchInstagramStats(videoId, accessToken);
        } else if (platform === 'TikTok') {
            return await fetchTikTokStats(videoId, accessToken);
        }

        throw new Error(`Strict verification not yet implemented for ${platform}.`);

    } catch (error) {
        console.error(`Error fetching stats for ${platform}:`, error.message);
        throw error;
    }
};

/**
 * Checks if the access token is valid or expiring soon.
 * If expiring (or expired), attempts to refresh it and updates the DB.
 */
const getValidAccessToken = async (account) => {
    // Buffer time: Refresh if expiring within the next 5 minutes
    const REFRESH_BUFFER = 5 * 60 * 1000;
    const now = Date.now();
    const expiryTime = new Date(account.expiresAt).getTime();

    // If token is valid for more than 5 mins, use it.
    if (expiryTime - now > REFRESH_BUFFER) {
        return account.accessToken;
    }

    console.log(`Token for ${account.platform} (User ${account.userId}) is expiring or expired. Refreshing...`);

    let newAccessToken = null;
    let newExpiryDate = null;
    let newRefreshToken = account.refreshToken; // Initialize with old one

    try {
        if (account.platform === 'YouTube') {
            const { token, expiry } = await refreshYouTubeToken(account.refreshToken);
            newAccessToken = token;
            newExpiryDate = expiry;
        } else if (account.platform === 'Instagram') {
            // Instagram Long-Lived tokens last 60 days. We refresh them if they are old.
            const { token, expiry } = await refreshInstagramToken(account.accessToken);
            newAccessToken = token;
            newExpiryDate = expiry;
        } else if (account.platform === 'TikTok') {
            // TikTok tokens last ~24h.
            const { token, expiry, refreshToken } = await refreshTikTokToken(account.refreshToken);
            newAccessToken = token;
            newExpiryDate = expiry;
            newRefreshToken = refreshToken; // TikTok rotates refresh tokens!
        } else {
            // For platforms without refresh logic implemented yet, return old token and hope it works or user re-auths
            console.warn(`No refresh logic for ${account.platform}. using existing token.`);
            return account.accessToken;
        }

        // Update DB
        if (newAccessToken) {
            await prisma.socialAccount.update({
                where: { id: account.id },
                data: {
                    accessToken: newAccessToken,
                    expiresAt: newExpiryDate,
                    refreshToken: newRefreshToken
                }
            });
            console.log(`Successfully refreshed token for ${account.platform}.`);
            return newAccessToken;
        }

    } catch (error) {
        console.error(`Failed to refresh token for ${account.platform}:`, error.message);
        // If refresh fails (revoked, etc.), we throw error so the main loop knows.
        // The user effectively needs to re-login.
        throw new Error(`Your ${account.platform} connection has expired and could not be auto-refreshed. Please reconnect your account.`);
    }
};

const refreshYouTubeToken = async (refreshToken) => {
    if (!refreshToken) throw new Error("No refresh token available for YouTube.");

    const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    client.setCredentials({ refresh_token: refreshToken });

    const { credentials } = await client.refreshAccessToken();
    return {
        token: credentials.access_token,
        expiry: new Date(credentials.expiry_date)
    };
};

const refreshInstagramToken = async (currentAccessToken) => {
    // GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token={access_token}
    const response = await axios.get('https://graph.instagram.com/refresh_access_token', {
        params: {
            grant_type: 'ig_refresh_token',
            access_token: currentAccessToken
        }
    });

    const { access_token, expires_in } = response.data;
    const expiryDate = new Date(Date.now() + expires_in * 1000);

    return { token: access_token, expiry: expiryDate };
};

const refreshTikTokToken = async (currentRefreshToken) => {
    // POST https://open.tiktokapis.com/v2/oauth/token/
    const params = new URLSearchParams();
    params.append('client_key', process.env.TIKTOK_CLIENT_KEY);
    params.append('client_secret', process.env.TIKTOK_CLIENT_SECRET);
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', currentRefreshToken);

    const response = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token, refresh_token, expires_in } = response.data; // TikTok returns new refresh token
    const expiryDate = new Date(Date.now() + expires_in * 1000);

    return {
        token: access_token,
        refreshToken: refresh_token,
        expiry: expiryDate
    };
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

        // Try multiple approaches to get view counts
        // The Basic Display API has limited metrics support

        // Approach 1: Try fetching the media directly with video fields
        if (isVideoContent && viewCount === 0) {
            try {
                // Try to get video_views field directly from the media endpoint
                const videoUrl = `https://graph.instagram.com/${matchedMedia.id}?fields=id,media_type,like_count,comments_count&access_token=${accessToken}`;
                console.log("Fetching video details...");
                const videoResp = await axios.get(videoUrl);
                console.log("Video details response:", JSON.stringify(videoResp.data, null, 2));
                // Note: Basic Display API doesn't return view counts directly
            } catch (videoErr) {
                console.log("Video details fetch info:", videoErr.response?.data?.error?.message || videoErr.message);
            }
        }

        // Approach 2: Try insights endpoint with various metrics
        // Different Instagram account types support different metrics:
        // - For IG Reels via Business accounts: ig_reels_aggregated_all_plays_count, reach
        // - For regular videos: video_views
        // - For all media: reach, impressions
        const metricsToTry = [
            'reach',                              // Available for most media types
            'impressions',                        // Available for images and some videos
            'video_views',                        // Legacy video views metric
            'ig_reels_aggregated_all_plays_count' // Reels specific metric (Business API)
        ];

        for (const metric of metricsToTry) {
            if (viewCount > 0) break; // Stop if we got a value

            try {
                const insightsUrl = `https://graph.instagram.com/${matchedMedia.id}/insights?metric=${metric}&access_token=${accessToken}`;
                console.log(`Trying metric: ${metric}`);

                const insightsResp = await axios.get(insightsUrl);
                const insights = insightsResp.data.data;

                if (insights && insights.length > 0) {
                    const metricData = insights[0];
                    const value = metricData?.values?.[0]?.value || 0;
                    console.log(`${metric} returned:`, value);

                    if (value > 0) {
                        viewCount = value;
                        console.log(`Using '${metric}' as view count:`, viewCount);
                        break;
                    }
                }
            } catch (metricErr) {
                const errorMsg = metricErr.response?.data?.error?.message || metricErr.message;
                console.log(`Metric '${metric}' not available:`, errorMsg);
            }
        }

        // If no insights worked, log the limitation
        if (viewCount === 0 && isVideoContent) {
            console.log("NOTE: View counts unavailable. This is a known limitation of the Instagram Basic Display API.");
            console.log("To access view counts, the Instagram account needs to be a Business/Creator account");
            console.log("connected via Facebook Login (Instagram Graph API), not Basic Display API.");
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
        console.log("Submission URL:", submissionUrl);
        const resolvedUrl = await resolveTikTokUrl(submissionUrl);
        console.log("Resolved URL:", resolvedUrl);

        const submissionVideoId = extractTikTokVideoId(resolvedUrl);

        const matchedVideo = videos.find(video => {
            // Priority 1: Match by ID
            if (submissionVideoId && video.id === submissionVideoId) return true;

            // Priority 2: Match by share_url (fuzzy)
            if (video.share_url) {
                const cleanShareUrl = video.share_url.split('?')[0];
                const cleanResolvedUrl = resolvedUrl.split('?')[0];

                if (cleanResolvedUrl === cleanShareUrl) return true;
                if (cleanResolvedUrl.includes(cleanShareUrl)) return true;
                if (cleanShareUrl.includes(cleanResolvedUrl)) return true;
            }
            return false;
        });

        if (!matchedVideo) {
            console.log("Available TikTok Videos (IDs):", videos.map(v => v.id));
            console.log("Available TikTok Videos (URLs):", videos.map(v => v.share_url));
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

/**
 * Resolves a shortened TikTok URL (e.g. vt.tiktok.com) to the full canonical URL.
 */
const resolveTikTokUrl = async (shortUrl) => {
    if (!shortUrl.includes('tiktok.com')) return shortUrl;

    try {
        // Use a real user agent to avoid bot detection on redirects
        const response = await axios.get(shortUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            maxRedirects: 5,
            validateStatus: (status) => status < 400 // Accept redirects if axios doesn't follow automatically (it does by default)
        });
        return response.request.res.responseUrl || shortUrl;
    } catch (error) {
        console.log("Error resolving TikTok URL:", error.message);
        // If we got a response URL before failing, return it
        if (error.request && error.request.res && error.request.res.responseUrl) {
            return error.request.res.responseUrl;
        }
        return shortUrl;
    }
};

/**
 * Extracts the video ID from a full TikTok URL.
 * Format: https://www.tiktok.com/@user/video/741961...
 */
const extractTikTokVideoId = (url) => {
    const match = url.match(/\/video\/(\d+)/);
    return match ? match[1] : null;
};
