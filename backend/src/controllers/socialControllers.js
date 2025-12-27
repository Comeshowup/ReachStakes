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

    try {

        // 1. Exchange Code for Short-Lived Token
        // Endpoint: https://api.instagram.com/oauth/access_token
        // Content-Type: application/x-www-form-urlencoded
        const formData = new URLSearchParams();
        formData.append('client_id', process.env.INSTAGRAM_CLIENT_ID);
        formData.append('client_secret', process.env.INSTAGRAM_CLIENT_SECRET);
        formData.append('grant_type', 'authorization_code');

        // Use the redirect_uri passed from frontend (dynamic), or fallback if missing
        const redirectParam = req.body.redirectUri || 'https://c958bf235ae3.ngrok-free.app/creator/social-accounts';
        formData.append('redirect_uri', redirectParam);

        formData.append('code', code);

        const tokenResponse = await axios.post('https://api.instagram.com/oauth/access_token', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, user_id } = tokenResponse.data;

        // 2. Exchange for Long-Lived Token (Optional but recommended)
        // Endpoint: https://graph.instagram.com/access_token
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

        // 3. Fetch User Details (Username, Account Type) via Graph API
        // Endpoint: https://graph.instagram.com/me
        const userDetailsResponse = await axios.get('https://graph.instagram.com/me', {
            params: {
                fields: 'id,username,account_type,media_count',
                access_token: longLivedToken
            }
        });

        const igUser = userDetailsResponse.data;

        // 4. Save to DB
        const existingAccount = await prisma.socialAccount.findFirst({
            where: {
                userId: parseInt(userId),
                platform: 'Instagram',
            }
        });

        let newAccount;
        const accountData = {
            username: igUser.username,
            handle: igUser.username,
            profileUrl: `https://instagram.com/${igUser.username}`, // Construct simplified URL
            accessToken: longLivedToken, // Store the long-lived one
            expiresAt: expiryDate,
            platform: 'Instagram'
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

        console.log('Instagram account saved/updated for:', igUser.username);
        res.status(200).json({ status: 'success', data: newAccount });


    } catch (error) {
        const errorMsg = error.response?.data?.error_message || error.message;
        res.status(500).json({ status: 'error', message: 'Failed to link Instagram account: ' + errorMsg });
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

export { linkYoutube, linkInstagram, verifyWebhook, getSocialAccounts, disconnectSocialAccount };
