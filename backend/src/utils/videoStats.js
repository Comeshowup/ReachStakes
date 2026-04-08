import axios from 'axios';
import { prisma } from '../config/db.js';
import { OAuth2Client } from 'google-auth-library';

/**
 * Fetches video statistics from external platforms using the user's linked account tokens.
 *
 * @param {string} platform - The platform name (YouTube, Instagram, TikTok)
 * @param {string} videoId  - The extracted video ID (or full URL for Instagram/TikTok)
 * @param {number} userId   - The ID of the creator
 * @returns {Promise<{ views, likes, comments, shares, updatedAt }>}
 */
export const fetchVideoStats = async (platform, videoId, userId) => {
    try {
        const account = await prisma.socialAccount.findFirst({
            where: {
                userId: userId,
                platform: { equals: platform }
            }
        });

        if (!account) {
            throw new Error(`You have not linked your ${platform} account. Please link it in Settings > Social Accounts first.`);
        }

        const accessToken = await getValidAccessToken(account);

        if (platform === 'YouTube') {
            return await fetchYouTubeStats(videoId, accessToken);
        } else if (platform === 'Instagram') {
            return await fetchInstagramStats(videoId, accessToken);
        } else if (platform === 'TikTok') {
            return await fetchTikTokStats(videoId, accessToken);
        }

        throw new Error(`Strict verification not yet implemented for ${platform}.`);
    } catch (error) {
        throw error;
    }
};

/**
 * Checks if the social account for the given user & platform exists.
 * Returns the account record or null.
 *
 * @param {number} userId
 * @param {string} platform
 * @returns {Promise<object|null>}
 */
export const getSocialAccountForUser = async (userId, platform) => {
    return await prisma.socialAccount.findFirst({
        where: {
            userId: userId,
            platform: { equals: platform }
        }
    });
};

/**
 * Fetches audience demographics for the given creator using the platform account stored in DB.
 * For Instagram Basic Display API, most demographics are unavailable — returns graceful zeros.
 * For YouTube Authenticated users, tries the YouTube Analytics API.
 *
 * @param {number} userId   - The creator's user ID
 * @param {string} platform - 'Instagram' | 'YouTube' | 'TikTok'
 * @returns {Promise<{ ageRanges, genderSplit, topCountries }>}
 */
export const fetchAudienceDemographics = async (userId, platform) => {
    const emptyDemographics = {
        ageRanges: {},
        genderSplit: {},
        topCountries: {},
        note: null
    };

    try {
        const account = await prisma.socialAccount.findFirst({
            where: { userId, platform: { equals: platform } }
        });

        if (!account) return emptyDemographics;

        const accessToken = await getValidAccessToken(account).catch(() => null);
        if (!accessToken) return emptyDemographics;

        if (platform === 'Instagram') {
            // Basic Display API does NOT support follower_demographics.
            // Only the Instagram Graph API (Business accounts via Facebook Login) supports this.
            // We return empty data with a note.
            return {
                ...emptyDemographics,
                note: 'Audience demographics require an Instagram Business or Creator account connected via Facebook Login.'
            };
        }

        if (platform === 'YouTube') {
            return await fetchYouTubeDemographics(account, accessToken);
        }

        if (platform === 'TikTok') {
            // TikTok sandbox has very limited analytics. Return from stored creator demographics.
            const profile = await prisma.creatorProfile.findUnique({
                where: { userId },
                include: { demographics: true }
            });
            if (profile?.demographics) {
                return {
                    ageRanges: profile.demographics.ageRanges || {},
                    genderSplit: profile.demographics.genderSplit || {},
                    topCountries: profile.demographics.topCountries || {},
                    note: 'Demographics sourced from creator profile.'
                };
            }
            return emptyDemographics;
        }

        return emptyDemographics;
    } catch (err) {
        console.error(`[fetchAudienceDemographics] Error for ${platform}:`, err.message);
        return emptyDemographics;
    }
};

// ─── Token Refresh Logic ─────────────────────────────────────────────────────

const getValidAccessToken = async (account) => {
    const REFRESH_BUFFER = 5 * 60 * 1000;
    const now = Date.now();
    const expiryTime = new Date(account.expiresAt).getTime();

    if (expiryTime - now > REFRESH_BUFFER) {
        return account.accessToken;
    }

    console.log(`Token for ${account.platform} (User ${account.userId}) is expiring or expired. Refreshing...`);

    let newAccessToken = null;
    let newExpiryDate = null;
    let newRefreshToken = account.refreshToken;

    try {
        if (account.platform === 'YouTube') {
            const { token, expiry } = await refreshYouTubeToken(account.refreshToken);
            newAccessToken = token;
            newExpiryDate = expiry;
        } else if (account.platform === 'Instagram') {
            const { token, expiry } = await refreshInstagramToken(account.accessToken);
            newAccessToken = token;
            newExpiryDate = expiry;
        } else if (account.platform === 'TikTok') {
            const { token, expiry, refreshToken } = await refreshTikTokToken(account.refreshToken);
            newAccessToken = token;
            newExpiryDate = expiry;
            newRefreshToken = refreshToken;
        } else {
            console.warn(`No refresh logic for ${account.platform}. Using existing token.`);
            return account.accessToken;
        }

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
        throw new Error(`Your ${account.platform} connection has expired and could not be auto-refreshed. Please reconnect your account.`);
    }
};

// ─── Token Refresh Implementors ──────────────────────────────────────────────

const refreshYouTubeToken = async (refreshToken) => {
    if (!refreshToken) throw new Error('No refresh token available for YouTube.');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
    client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await client.refreshAccessToken();
    return { token: credentials.access_token, expiry: new Date(credentials.expiry_date) };
};

const refreshInstagramToken = async (currentAccessToken) => {
    const response = await axios.get('https://graph.instagram.com/refresh_access_token', {
        params: { grant_type: 'ig_refresh_token', access_token: currentAccessToken }
    });
    const { access_token, expires_in } = response.data;
    return { token: access_token, expiry: new Date(Date.now() + expires_in * 1000) };
};

const refreshTikTokToken = async (currentRefreshToken) => {
    const params = new URLSearchParams();
    params.append('client_key', process.env.TIKTOK_CLIENT_KEY);
    params.append('client_secret', process.env.TIKTOK_CLIENT_SECRET);
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', currentRefreshToken);

    const response = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const { access_token, refresh_token, expires_in } = response.data;
    return { token: access_token, refreshToken: refresh_token, expiry: new Date(Date.now() + expires_in * 1000) };
};

// ─── Platform Stat Fetchers ──────────────────────────────────────────────────

const fetchYouTubeStats = async (videoId, accessToken) => {
    try {
        if (!accessToken) throw new Error('Missing YouTube access token. Please re-link your account.');

        // A. Verify the video belongs to the authenticated user's channel
        const channelResp = await axios.get('https://www.googleapis.com/youtube/v3/channels?part=id&mine=true', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!channelResp.data.items || channelResp.data.items.length === 0) {
            throw new Error('Could not fetch your YouTube channel details.');
        }
        const myChannelId = channelResp.data.items[0].id;

        // B. Fetch video details including statistics
        const videoResp = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!videoResp.data.items || videoResp.data.items.length === 0) {
            throw new Error('Video not found on YouTube. Please check the link.');
        }

        const videoData = videoResp.data.items[0];
        const videoChannelId = videoData.snippet.channelId;

        // C. Strict ownership check
        if (myChannelId !== videoChannelId) {
            throw new Error(`Ownership Mismatch: This video belongs to channel '${videoData.snippet.channelTitle}', but you are logged in as a different channel. You can only submit your own content.`);
        }

        // D. Return stats (shareCount was deprecated by Google in 2019 — graceful 0)
        const stats = videoData.statistics;
        return {
            views: parseInt(stats.viewCount || 0),
            likes: parseInt(stats.likeCount || 0),
            comments: parseInt(stats.commentCount || 0),
            shares: parseInt(stats.shareCount || 0), // Will almost always be 0 (deprecated by Google)
            updatedAt: new Date().toISOString()
        };
    } catch (err) {
        if (err.response) {
            console.error('YouTube API Error:', err.response.data);
            if (err.response.status === 401) {
                throw new Error('Your YouTube connection has expired. Please go to Settings > Social Accounts, disconnect, and reconnect YouTube.');
            }
            throw new Error('YouTube API Error: ' + (err.response.data.error?.message || err.message));
        }
        throw err;
    }
};

const fetchInstagramStats = async (submissionUrl, accessToken) => {
    try {
        if (!accessToken) throw new Error('Missing Instagram access token.');

        // 1. Fetch the user's recent media from Basic Display API
        const url = `https://graph.instagram.com/me/media?fields=id,permalink,like_count,comments_count,media_type,plays&access_token=${accessToken}`;

        console.log('=== INSTAGRAM STATS FETCH START ===');
        const response = await axios.get(url);
        const mediaList = response.data.data;

        console.log('Media count:', mediaList?.length || 0);

        if (!mediaList || mediaList.length === 0) {
            throw new Error('No media found on your Instagram account.');
        }

        // 2. Match the submitted URL against the media list permalinks
        const cleanSubmissionUrl = submissionUrl.split('?')[0].replace(/\/$/, '');

        const matchedMedia = mediaList.find(media => {
            if (!media.permalink) return false;
            const cleanPermalink = media.permalink.split('?')[0].replace(/\/$/, '');
            return cleanPermalink.includes(cleanSubmissionUrl) || cleanSubmissionUrl.includes(cleanPermalink);
        });

        if (!matchedMedia) {
            console.log('Could not match. Looking for:', cleanSubmissionUrl);
            console.log('Available permalinks:', mediaList.map(m => m.permalink));
            throw new Error('Could not find this post on your connected Instagram account. Please ensure you are submitting your own post.');
        }

        console.log('Matched IG Media:', JSON.stringify(matchedMedia, null, 2));

        // 3. Determine view count — try `plays` field first (available for VIDEO/REEL)
        let viewCount = matchedMedia.plays || 0;
        let sharesCount = 0;

        const isVideoContent = matchedMedia.media_type === 'VIDEO';

        // 4. Try insights endpoint for additional metrics (Business accounts only)
        //    Basic Display API will return errors here — we catch and continue gracefully.
        const metricsToTry = [
            'reach',                               // Available for most media types (Business)
            'impressions',                         // Available for images (Business)
            'video_views',                         // Legacy video views (Business)
            'ig_reels_aggregated_all_plays_count', // Reels metric (Business)
        ];

        for (const metric of metricsToTry) {
            if (viewCount > 0) break;
            try {
                const insightsUrl = `https://graph.instagram.com/${matchedMedia.id}/insights?metric=${metric}&access_token=${accessToken}`;
                const insightsResp = await axios.get(insightsUrl);
                const insights = insightsResp.data.data;
                if (insights && insights.length > 0) {
                    const value = insights[0]?.values?.[0]?.value || 0;
                    if (value > 0) {
                        viewCount = value;
                        console.log(`Using '${metric}' as view count:`, viewCount);
                        break;
                    }
                }
            } catch {
                // Silently skip — insights not available on Basic Display API
            }
        }

        // 5. Try to get shares from insights (Business only — graceful fallback)
        try {
            const sharesUrl = `https://graph.instagram.com/${matchedMedia.id}/insights?metric=shares&access_token=${accessToken}`;
            const sharesResp = await axios.get(sharesUrl);
            const sharesData = sharesResp.data.data;
            if (sharesData && sharesData.length > 0) {
                sharesCount = sharesData[0]?.values?.[0]?.value || 0;
            }
        } catch {
            // Silently skip — shares insight not available on Basic Display API
            console.log('NOTE: Shares count unavailable (Basic Display API limitation).');
        }

        if (viewCount === 0 && isVideoContent) {
            console.log('NOTE: View counts unavailable (Basic Display API limitation). Business account via Facebook Login required for full metrics.');
        }

        console.log('Final Instagram stats:', {
            views: viewCount,
            likes: matchedMedia.like_count || 0,
            comments: matchedMedia.comments_count || 0,
            shares: sharesCount
        });

        return {
            views: viewCount,
            likes: matchedMedia.like_count || 0,
            comments: matchedMedia.comments_count || 0,
            shares: sharesCount,
            updatedAt: new Date().toISOString()
        };
    } catch (err) {
        if (err.response) {
            console.error('Instagram API Error:', err.response.data);
            if (err.response.status === 401) {
                throw new Error('Your Instagram connection has expired. Please reconnect it.');
            }
            throw new Error('Instagram API Error: ' + (err.response.data.error?.message || err.message));
        }
        throw err;
    }
};

const fetchTikTokStats = async (submissionUrl, accessToken) => {
    try {
        if (!accessToken) throw new Error('Missing TikTok access token.');

        const url = 'https://open.tiktokapis.com/v2/video/list/?fields=id,title,share_url,like_count,comment_count,share_count,view_count';

        const response = await axios.post(url, { max_count: 20 }, {
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
        });

        const videos = response.data.data?.videos;

        if (!videos || videos.length === 0) {
            throw new Error('No videos found on your TikTok account.');
        }

        const resolvedUrl = await resolveTikTokUrl(submissionUrl);
        const submissionVideoId = extractTikTokVideoId(resolvedUrl);

        const matchedVideo = videos.find(video => {
            if (submissionVideoId && video.id === submissionVideoId) return true;
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
            console.log('Available TikTok Videos (IDs):', videos.map(v => v.id));
            throw new Error('Could not find this video on your connected TikTok account. Please check the URL.');
        }

        console.log('Matched TikTok Video:', matchedVideo);

        return {
            views: matchedVideo.view_count || 0,
            likes: matchedVideo.like_count || 0,
            comments: matchedVideo.comment_count || 0,
            shares: matchedVideo.share_count || 0,
            updatedAt: new Date().toISOString()
        };
    } catch (err) {
        if (err.response) {
            console.error('TikTok API Error:', err.response.data);
            if (err.response.status === 401) {
                throw new Error('Your TikTok connection has expired. Please reconnect it.');
            }
            const platformErr = err.response.data.error?.message || JSON.stringify(err.response.data);
            throw new Error('TikTok API Error: ' + platformErr);
        }
        throw err;
    }
};

// ─── YouTube Demographics ────────────────────────────────────────────────────

const fetchYouTubeDemographics = async (account, accessToken) => {
    const emptyDemographics = { ageRanges: {}, genderSplit: {}, topCountries: {}, note: null };

    try {
        // 1. Get channel ID
        const channelResp = await axios.get('https://www.googleapis.com/youtube/v3/channels?part=id&mine=true', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const channelId = channelResp.data.items?.[0]?.id;
        if (!channelId) return emptyDemographics;

        const today = new Date().toISOString().split('T')[0];
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // 2. Fetch age/gender demographics
        const ageGenderResp = await axios.get('https://youtubeanalytics.googleapis.com/v2/reports', {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
                ids: `channel==${channelId}`,
                startDate: thirtyDaysAgo,
                endDate: today,
                metrics: 'viewerPercentage',
                dimensions: 'ageGroup,gender',
                sort: '-viewerPercentage'
            }
        }).catch(() => null);

        // 3. Fetch country demographics
        const countryResp = await axios.get('https://youtubeanalytics.googleapis.com/v2/reports', {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
                ids: `channel==${channelId}`,
                startDate: thirtyDaysAgo,
                endDate: today,
                metrics: 'views',
                dimensions: 'country',
                sort: '-views',
                maxResults: 5
            }
        }).catch(() => null);

        const ageRanges = {};
        const genderSplit = { Male: 0, Female: 0 };

        if (ageGenderResp?.data?.rows) {
            ageGenderResp.data.rows.forEach(([ageGroup, gender, percentage]) => {
                const label = ageGroup.replace('age', '').replace('-', '–');
                if (!ageRanges[label]) ageRanges[label] = 0;
                ageRanges[label] += parseFloat(percentage);

                const genderKey = gender === 'male' ? 'Male' : 'Female';
                genderSplit[genderKey] += parseFloat(percentage) / 2;
            });
        }

        const topCountries = {};
        if (countryResp?.data?.rows) {
            const totalViews = countryResp.data.rows.reduce((sum, [, v]) => sum + v, 0);
            countryResp.data.rows.forEach(([country, views]) => {
                topCountries[country] = totalViews > 0 ? parseFloat(((views / totalViews) * 100).toFixed(1)) : 0;
            });
        }

        return { ageRanges, genderSplit, topCountries, note: null };
    } catch (err) {
        console.error('[fetchYouTubeDemographics] Error:', err.message);
        return { ageRanges: {}, genderSplit: {}, topCountries: {}, note: 'Demographics unavailable. Ensure YouTube Analytics API is enabled for your Google project.' };
    }
};

// ─── TikTok URL Utilities ────────────────────────────────────────────────────

const resolveTikTokUrl = async (shortUrl) => {
    if (!shortUrl.includes('tiktok.com')) return shortUrl;
    try {
        const response = await axios.get(shortUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
            maxRedirects: 5,
            validateStatus: (status) => status < 400
        });
        return response.request.res.responseUrl || shortUrl;
    } catch (error) {
        if (error.request?.res?.responseUrl) return error.request.res.responseUrl;
        return shortUrl;
    }
};

const extractTikTokVideoId = (url) => {
    const match = url.match(/\/video\/(\d+)/);
    return match ? match[1] : null;
};
