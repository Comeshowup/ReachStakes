import express from 'express';
import { linkYoutube, linkInstagram, linkTikTok, verifyWebhook, getSocialAccounts, disconnectSocialAccount } from '../controllers/socialControllers.js';

const router = express.Router();

router.post('/youtube/link', linkYoutube);
router.post('/instagram/link', linkInstagram);
router.post('/tiktok/link', linkTikTok);
router.get('/webhook', verifyWebhook);
router.get('/:userId', getSocialAccounts);
router.delete('/:id', disconnectSocialAccount);

export default router;
