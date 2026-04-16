import { prisma } from "../config/db.js";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
// NOTE: Client is initialized inside handler to ensure env vars are loaded.

const linkYoutube = async (req, res) => {
    const { code, userId } = req.body;

    // Validate Env Vars
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.error("CRITICAL: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing.");
        return res.status(500).json({ status: 'error', message: 'Server Misconfiguration: Missing Google Client Credentials' });
    }

    if (!userId) {
        return res.status(400).json({ status: 'error', message: 'User ID is missing from request' });
    }

    // Initialize client dynamically
    const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'postmessage'
    );

    try {
        console.log(`Attempting to link YouTube for User ${userId}`);

        // 1. Exchange code for tokens
        const { tokens } = await client.getToken(code);
        // tokens contains access_token, refresh_token (if prompt=consent), expiry_date, etc.

        // 2. Fetch Channel Info
        const youtubeResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
            params: {
                part: 'snippet,statistics',
                mine: true
            },
            headers: {
                Authorization: `Bearer ${tokens.access_token}`
            }
        });

        const channel = youtubeResponse.data.items?.[0];

        if (!channel) {
            return res.status(400).json({ status: 'error', message: 'No YouTube channel found for this account.' });
        }

        // 3. Save to DB
        // Check if account already linked to this user
        const existingAccount = await prisma.socialAccount.findFirst({
            where: {
                userId: parseInt(userId),
                platform: 'YouTube',
            }
        });

        // Upsert logic manually
        let newAccount;
        if (existingAccount) {
            newAccount = await prisma.socialAccount.update({
                where: { id: existingAccount.id },
                data: {
                    username: channel.snippet.title,
                    handle: channel.snippet.customUrl || channel.snippet.title,
                    profileUrl: `https://youtube.com/${channel.snippet.customUrl || 'channel/' + channel.id}`,
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token, // might need to keep old one if new one is undefined
                    expiresAt: new Date(tokens.expiry_date),
                }
            });
        } else {
            newAccount = await prisma.socialAccount.create({
                data: {
                    userId: parseInt(userId),
                    platform: 'YouTube',
                    username: channel.snippet.title,
                    handle: channel.snippet.customUrl || channel.snippet.title, // customUrl might be null
                    profileUrl: `https://youtube.com/${channel.snippet.customUrl || 'channel/' + channel.id}`,
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiresAt: new Date(tokens.expiry_date),
                }
            });
        }

        res.status(200).json({
            status: 'success',
            data: newAccount
        });

    } catch (error) {
        console.error('Link YouTube Error:', error.response?.data || error);
        res.status(500).json({ status: 'error', message: 'Failed to link YouTube account' });
    }
};

const linkInstagram = async (req, res) => {
    const { code, userId } = req.body;

    // Validate Env Vars
    if (!process.env.INSTAGRAM_CLIENT_ID || !process.env.INSTAGRAM_CLIENT_SECRET) {
        console.error("CRITICAL: INSTAGRAM_CLIENT_ID or INSTAGRAM_CLIENT_SECRET is missing.");
        return res.status(500).json({ status: 'error', message: 'Server Misconfiguration: Missing Instagram Credentials' });
    }

    if (!userId) {
        return res.status(400).json({ status: 'error', message: 'User ID is missing' });
    }

    // redirect_uri MUST be the exact same one used in the frontend auth URL
    if (!req.body.redirectUri) {
        return res.status(400).json({ status: 'error', message: 'redirectUri is required' });
    }

    try {
        console.log(`Attempting to link Instagram for User ${userId}`);

        // 1. Exchange Code for Short-Lived Token
        // New Instagram Login API — same endpoint as before
        const formData = new URLSearchParams();
        formData.append('client_id', process.env.INSTAGRAM_CLIENT_ID);
        formData.append('client_secret', process.env.INSTAGRAM_CLIENT_SECRET);
        formData.append('grant_type', 'authorization_code');
        formData.append('redirect_uri', req.body.redirectUri);
        formData.append('code', code);

        const tokenResponse = await axios.post('https://api.instagram.com/oauth/access_token', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, user_id } = tokenResponse.data;

        // 2. Exchange for Long-Lived Token (60-day token)
        const longLivedResponse = await axios.get('https://graph.instagram.com/access_token', {
            params: {
                grant_type: 'ig_exchange_token',
                client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
                access_token: access_token
            }
        });

        const longLivedToken = longLivedResponse.data.access_token;
        const expiresSeconds = longLivedResponse.data.expires_in;
        const expiryDate = new Date(Date.now() + expiresSeconds * 1000);

        // 3. Fetch User Details via Graph API
        // New Instagram Login API returns: user_id, username, account_type, profile_picture_url
        const userDetailsResponse = await axios.get(`https://graph.instagram.com/v22.0/${user_id}`, {
            params: {
                fields: 'id,username,account_type,media_count,profile_picture_url',
                access_token: longLivedToken
            }
        });

        const igUser = userDetailsResponse.data;
        console.log('Instagram user details fetched:', igUser.username);

        // 4. Upsert to DB
        const existingAccount = await prisma.socialAccount.findFirst({
            where: { userId: parseInt(userId), platform: 'Instagram' }
        });

        const accountData = {
            username: igUser.username,
            handle: igUser.username,
            profileUrl: `https://instagram.com/${igUser.username}`,
            accessToken: longLivedToken,
            expiresAt: expiryDate,
            platform: 'Instagram'
        };

        let newAccount;
        if (existingAccount) {
            newAccount = await prisma.socialAccount.update({
                where: { id: existingAccount.id },
                data: accountData
            });
        } else {
            newAccount = await prisma.socialAccount.create({
                data: { ...accountData, userId: parseInt(userId) }
            });
        }

        console.log('Instagram account saved/updated for:', igUser.username);
        res.status(200).json({ status: 'success', data: newAccount });

    } catch (error) {
        const igError = error.response?.data;
        const logContent = `\n[${new Date().toISOString()}] IG Error: ${JSON.stringify(error.response?.data || error.message)}\n`;
        import('fs').then(fs => fs.appendFileSync('ig_error.log', logContent));
        
        console.error('Link Instagram Error — Meta API response:', JSON.stringify(igError, null, 2));
        console.error('Link Instagram Error — raw:', error.message);
        // Surface the full Meta error so the frontend can show it
        const errorMsg =
            igError?.error_message ||           // short-lived token exchange errors
            igError?.error?.message ||          // Graph API errors
            igError?.error_description ||       // OAuth errors
            error.message;
        const errorCode = igError?.error_type || igError?.error?.code || igError?.error?.type || '';
        res.status(500).json({
            status: 'error',
            message: 'Failed to link Instagram account: ' + errorMsg,
            metaError: igError || null,
            errorCode,
        });
    }
};

const linkTikTok = async (req, res) => {
    const { code, userId, redirectUri } = req.body;

    // Validate Env Vars
    if (!process.env.TIKTOK_CLIENT_KEY || !process.env.TIKTOK_CLIENT_SECRET) {
        console.error("CRITICAL: TIKTOK_CLIENT_KEY or TIKTOK_CLIENT_SECRET is missing.");
        return res.status(500).json({ status: 'error', message: 'Server Misconfiguration: Missing TikTok Credentials' });
    }

    if (!userId) {
        return res.status(400).json({ status: 'error', message: 'User ID is missing' });
    }

    try {
        // 1. Exchange Code for Access Token
        // Endpoint: https://open.tiktokapis.com/v2/oauth/token/
        const tokenParams = new URLSearchParams();
        tokenParams.append('client_key', process.env.TIKTOK_CLIENT_KEY);
        tokenParams.append('client_secret', process.env.TIKTOK_CLIENT_SECRET);
        tokenParams.append('code', code);
        tokenParams.append('grant_type', 'authorization_code');
        tokenParams.append('redirect_uri', redirectUri);

        const tokenResponse = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', tokenParams, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, refresh_token, expires_in, open_id } = tokenResponse.data;

        // 2. Fetch User Info
        // Endpoint: https://open.tiktokapis.com/v2/user/info/
        const userInfoResponse = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            },
            params: {
                fields: 'open_id,display_name,avatar_url'
            }
        });

        const tiktokUser = userInfoResponse.data.data.user;

        // 3. Save directly to DB
        // Check if account already linked
        const existingAccount = await prisma.socialAccount.findFirst({
            where: {
                userId: parseInt(userId),
                platform: 'TikTok',
            }
        });

        const expiryDate = new Date(Date.now() + (expires_in * 1000));

        let newAccount;
        const accountData = {
            username: tiktokUser.display_name,
            handle: tiktokUser.display_name, // TikTok often uses display_name akin to handle, or we can fetch 'union_id' if needed but 'display_name' is usually the public handle.
            profileUrl: `https://www.tiktok.com/@${tiktokUser.display_name}`, // Construct URL. Note: display_name might allow spaces/special chars, ideally we'd get the unique handle if available in other scopes/fields. Basic scope grants display_name.
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresAt: expiryDate,
            platform: 'TikTok'
        };

        if (existingAccount) {
            newAccount = await prisma.socialAccount.update({
                where: { id: existingAccount.id },
                data: accountData
            });
        } else {
            newAccount = await prisma.socialAccount.create({
                data: {
                    ...accountData,
                    userId: parseInt(userId)
                }
            });
        }

        console.log('TikTok account saved/updated for:', tiktokUser.display_name);
        res.status(200).json({ status: 'success', data: newAccount });

    } catch (error) {
        console.error('TikTok Link Error:', error.response?.data || error.message);
        const errorMsg = error.response?.data?.error_description || error.message;
        res.status(500).json({ status: 'error', message: 'Failed to link TikTok account: ' + errorMsg });
    }
};

const verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // In a real app, use process.env.WEBHOOK_VERIFY_TOKEN
    // For this user testing instance, we match what they typed: 'MySecretToken'
    const VERIFY_TOKEN = 'MySecretToken';

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
};

const getSocialAccounts = async (req, res) => {
    const { userId } = req.params;

    try {
        const accounts = await prisma.socialAccount.findMany({
            where: {
                userId: parseInt(userId)
            }
        });
        res.status(200).json({ status: 'success', data: accounts });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch accounts' });
    }
};

const disconnectSocialAccount = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.socialAccount.delete({
            where: { id: parseInt(id) }
        });
        res.status(200).json({ status: 'success', message: 'Account disconnected' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to disconnect account' });
    }
};

export { linkYoutube, linkInstagram, linkTikTok, verifyWebhook, getSocialAccounts, disconnectSocialAccount };
