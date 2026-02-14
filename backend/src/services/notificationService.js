/**
 * Notification Service
 * 
 * Handles both in-app notifications and email notifications for the platform.
 * Supports managed approval workflows with deadline warnings and escalation alerts.
 */

import nodemailer from 'nodemailer';
import { prisma } from '../config/db.js';

// Email transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@reachstakes.com';
const APP_NAME = 'Reachstakes';
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

// ============================================
// EMAIL TEMPLATES
// ============================================

const emailTemplates = {
    /**
     * Deadline Warning - Sent 6 hours before escalation
     */
    deadlineWarning: ({ brandName, campaignTitle, creatorHandle, timeRemaining, approvalLink }) => ({
        subject: `⏰ Action Required: Content awaiting your review - ${campaignTitle}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
        .content { padding: 32px; }
        .alert-box { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
        .alert-box .icon { font-size: 24px; margin-bottom: 8px; }
        .alert-box h3 { color: #92400e; margin: 0 0 8px 0; font-size: 16px; }
        .alert-box p { color: #b45309; margin: 0; font-size: 14px; }
        .details { background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
        .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .details-row:last-child { border-bottom: none; }
        .details-label { color: #64748b; font-size: 13px; }
        .details-value { color: #1e293b; font-size: 13px; font-weight: 600; }
        .cta-button { display: block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff !important; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; text-align: center; margin: 24px 0; }
        .footer { background: #f8fafc; padding: 24px 32px; text-align: center; color: #64748b; font-size: 12px; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⏰ Approval Deadline Approaching</h1>
        </div>
        <div class="content">
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                Hi ${brandName},
            </p>
            
            <div class="alert-box">
                <div class="icon">⏳</div>
                <h3>Only ${timeRemaining} remaining</h3>
                <p>Content will be automatically escalated to a Campaign Manager if not reviewed.</p>
            </div>
            
            <div class="details">
                <div class="details-row">
                    <span class="details-label">Campaign</span>
                    <span class="details-value">${campaignTitle}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Creator</span>
                    <span class="details-value">@${creatorHandle}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Time Remaining</span>
                    <span class="details-value" style="color: #f59e0b;">${timeRemaining}</span>
                </div>
            </div>
            
            <a href="${approvalLink}" class="cta-button">Review Content Now →</a>
            
            <p style="color: #94a3b8; font-size: 13px; text-align: center;">
                If you're unable to review, our Campaign Manager team will ensure quality standards are maintained.
            </p>
        </div>
        <div class="footer">
            <p>You're receiving this because you have pending content to review on ${APP_NAME}.</p>
            <p><a href="${APP_URL}/brand/approvals">View all pending approvals</a></p>
        </div>
    </div>
</body>
</html>
        `,
        text: `
⏰ Approval Deadline Approaching

Hi ${brandName},

You have content from @${creatorHandle} for "${campaignTitle}" awaiting your review.

⏳ Only ${timeRemaining} remaining before automatic escalation to a Campaign Manager.

Review now: ${approvalLink}

---
${APP_NAME}
        `
    }),

    /**
     * Escalation Notice - Content escalated to CM
     */
    escalationNotice: ({ brandName, campaignTitle, creatorHandle, escalationReason }) => ({
        subject: `📋 Content Escalated to Campaign Manager - ${campaignTitle}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); padding: 32px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
        .content { padding: 32px; }
        .info-box { background: #f3e8ff; border: 1px solid #d8b4fe; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
        .info-box h3 { color: #7c3aed; margin: 0 0 8px 0; font-size: 16px; }
        .info-box p { color: #6b21a8; margin: 0; font-size: 14px; }
        .details { background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
        .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .details-row:last-child { border-bottom: none; }
        .details-label { color: #64748b; font-size: 13px; }
        .details-value { color: #1e293b; font-size: 13px; font-weight: 600; }
        .footer { background: #f8fafc; padding: 24px 32px; text-align: center; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ Content Escalated</h1>
        </div>
        <div class="content">
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                Hi ${brandName},
            </p>
            
            <div class="info-box">
                <h3>Your content has been escalated</h3>
                <p>A Campaign Manager will review and approve/reject this content on your behalf, maintaining your brand's quality standards.</p>
            </div>
            
            <div class="details">
                <div class="details-row">
                    <span class="details-label">Campaign</span>
                    <span class="details-value">${campaignTitle}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Creator</span>
                    <span class="details-value">@${creatorHandle}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Reason</span>
                    <span class="details-value">${escalationReason}</span>
                </div>
            </div>
            
            <p style="color: #94a3b8; font-size: 13px;">
                You'll receive a notification once the Campaign Manager has made a decision. If you'd like to manage approvals yourself in the future, you can adjust your settings in the campaign workspace.
            </p>
        </div>
        <div class="footer">
            <p>This is an automated notification from ${APP_NAME}.</p>
        </div>
    </div>
</body>
</html>
        `,
        text: `
🛡️ Content Escalated to Campaign Manager

Hi ${brandName},

Content from @${creatorHandle} for "${campaignTitle}" has been escalated to a Campaign Manager.

Reason: ${escalationReason}

A Campaign Manager will review and approve/reject this content on your behalf, maintaining your brand's quality standards.

---
${APP_NAME}
        `
    }),

    /**
     * CM Approval Notification - Content approved by CM
     */
    cmApprovalNotice: ({ brandName, campaignTitle, creatorHandle, cmNote }) => ({
        subject: `✅ Content Approved on Your Behalf - ${campaignTitle}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
        .content { padding: 32px; }
        .success-box { background: #d1fae5; border: 1px solid #6ee7b7; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center; }
        .success-box .icon { font-size: 32px; margin-bottom: 8px; }
        .success-box h3 { color: #047857; margin: 0; font-size: 18px; }
        .details { background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
        .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .details-row:last-child { border-bottom: none; }
        .details-label { color: #64748b; font-size: 13px; }
        .details-value { color: #1e293b; font-size: 13px; font-weight: 600; }
        .note-box { background: #fefce8; border-left: 4px solid #facc15; padding: 16px; margin-bottom: 24px; }
        .note-box h4 { color: #854d0e; margin: 0 0 8px 0; font-size: 14px; }
        .note-box p { color: #713f12; margin: 0; font-size: 13px; }
        .footer { background: #f8fafc; padding: 24px 32px; text-align: center; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Content Approved</h1>
        </div>
        <div class="content">
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                Hi ${brandName},
            </p>
            
            <div class="success-box">
                <div class="icon">✨</div>
                <h3>A Campaign Manager has approved this content on your behalf</h3>
            </div>
            
            <div class="details">
                <div class="details-row">
                    <span class="details-label">Campaign</span>
                    <span class="details-value">${campaignTitle}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Creator</span>
                    <span class="details-value">@${creatorHandle}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Status</span>
                    <span class="details-value" style="color: #10b981;">Approved ✓</span>
                </div>
            </div>
            
            ${cmNote ? `
            <div class="note-box">
                <h4>📝 CM Note</h4>
                <p>${cmNote}</p>
            </div>
            ` : ''}
            
            <p style="color: #94a3b8; font-size: 13px;">
                The creator has been notified and the content is now live. You can view this and all collaborations in your campaign workspace.
            </p>
        </div>
        <div class="footer">
            <p>This is an automated notification from ${APP_NAME}.</p>
        </div>
    </div>
</body>
</html>
        `,
        text: `
✅ Content Approved on Your Behalf

Hi ${brandName},

Content from @${creatorHandle} for "${campaignTitle}" has been APPROVED by a Campaign Manager.

${cmNote ? `CM Note: ${cmNote}` : ''}

The creator has been notified and the content is now live.

---
${APP_NAME}
        `
    }),

    /**
     * CM Rejection Notification - Content rejected by CM
     */
    cmRejectionNotice: ({ brandName, campaignTitle, creatorHandle, feedback, cmNote }) => ({
        subject: `❌ Content Rejected on Your Behalf - ${campaignTitle}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 32px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
        .content { padding: 32px; }
        .reject-box { background: #fee2e2; border: 1px solid #fca5a5; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
        .reject-box h3 { color: #b91c1c; margin: 0 0 8px 0; font-size: 16px; }
        .reject-box p { color: #991b1b; margin: 0; font-size: 14px; }
        .details { background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
        .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .details-row:last-child { border-bottom: none; }
        .details-label { color: #64748b; font-size: 13px; }
        .details-value { color: #1e293b; font-size: 13px; font-weight: 600; }
        .feedback-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin-bottom: 24px; }
        .feedback-box h4 { color: #b91c1c; margin: 0 0 8px 0; font-size: 14px; }
        .feedback-box p { color: #7f1d1d; margin: 0; font-size: 13px; }
        .footer { background: #f8fafc; padding: 24px 32px; text-align: center; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>❌ Content Rejected</h1>
        </div>
        <div class="content">
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                Hi ${brandName},
            </p>
            
            <div class="reject-box">
                <h3>A Campaign Manager has rejected this content on your behalf</h3>
                <p>The creator has been asked to revise and resubmit.</p>
            </div>
            
            <div class="details">
                <div class="details-row">
                    <span class="details-label">Campaign</span>
                    <span class="details-value">${campaignTitle}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Creator</span>
                    <span class="details-value">@${creatorHandle}</span>
                </div>
            </div>
            
            <div class="feedback-box">
                <h4>📝 Feedback Given to Creator</h4>
                <p>${feedback}</p>
            </div>
            
            ${cmNote ? `
            <p style="color: #64748b; font-size: 13px; background: #f8fafc; padding: 12px; border-radius: 8px;">
                <strong>Internal Note:</strong> ${cmNote}
            </p>
            ` : ''}
        </div>
        <div class="footer">
            <p>This is an automated notification from ${APP_NAME}.</p>
        </div>
    </div>
</body>
</html>
        `,
        text: `
❌ Content Rejected on Your Behalf

Hi ${brandName},

Content from @${creatorHandle} for "${campaignTitle}" has been REJECTED by a Campaign Manager.

Feedback given to creator: ${feedback}

${cmNote ? `Internal Note: ${cmNote}` : ''}

The creator has been asked to revise and resubmit.

---
${APP_NAME}
        `
    }),

    /**
     * Creator Content Approved - Notification to creator
     */
    creatorApproved: ({ creatorName, campaignTitle, brandName, agreedPrice }) => ({
        subject: `🎉 Your content has been approved! - ${campaignTitle}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 32px; text-align: center; }
        .header .emoji { font-size: 48px; margin-bottom: 12px; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 32px; }
        .earnings-box { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #6ee7b7; border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: center; }
        .earnings-box .label { color: #047857; font-size: 14px; margin-bottom: 4px; }
        .earnings-box .amount { color: #059669; font-size: 36px; font-weight: 700; }
        .details { background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
        .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .details-row:last-child { border-bottom: none; }
        .details-label { color: #64748b; font-size: 13px; }
        .details-value { color: #1e293b; font-size: 13px; font-weight: 600; }
        .cta-button { display: block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff !important; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; text-align: center; margin: 24px 0; }
        .footer { background: #f8fafc; padding: 24px 32px; text-align: center; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="emoji">🎉</div>
            <h1>Content Approved!</h1>
        </div>
        <div class="content">
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                Hey ${creatorName}! Great news!
            </p>
            
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                Your content for <strong>${campaignTitle}</strong> has been approved by ${brandName}. 🌟
            </p>
            
            <div class="earnings-box">
                <div class="label">You've Earned</div>
                <div class="amount">$${parseFloat(agreedPrice).toFixed(2)}</div>
            </div>
            
            <div class="details">
                <div class="details-row">
                    <span class="details-label">Campaign</span>
                    <span class="details-value">${campaignTitle}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Brand</span>
                    <span class="details-value">${brandName}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Status</span>
                    <span class="details-value" style="color: #10b981;">Approved ✓</span>
                </div>
            </div>
            
            <a href="${APP_URL}/creator/financials" class="cta-button">View Your Earnings →</a>
        </div>
        <div class="footer">
            <p>Keep up the amazing work! 💪</p>
            <p>${APP_NAME}</p>
        </div>
    </div>
</body>
</html>
        `,
        text: `
🎉 Your content has been approved!

Hey ${creatorName}!

Your content for "${campaignTitle}" has been approved by ${brandName}.

You've earned: $${parseFloat(agreedPrice).toFixed(2)}

View your earnings: ${APP_URL}/creator/financials

Keep up the amazing work!
${APP_NAME}
        `
    }),

    /**
     * Creator Content Rejected - Notification to creator
     */
    creatorRejected: ({ creatorName, campaignTitle, brandName, feedback }) => ({
        subject: `Revision requested - ${campaignTitle}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 32px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
        .content { padding: 32px; }
        .feedback-box { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
        .feedback-box h3 { color: #c2410c; margin: 0 0 12px 0; font-size: 16px; }
        .feedback-box p { color: #9a3412; margin: 0; font-size: 14px; line-height: 1.6; }
        .details { background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
        .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .details-row:last-child { border-bottom: none; }
        .details-label { color: #64748b; font-size: 13px; }
        .details-value { color: #1e293b; font-size: 13px; font-weight: 600; }
        .cta-button { display: block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff !important; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; text-align: center; margin: 24px 0; }
        .footer { background: #f8fafc; padding: 24px 32px; text-align: center; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✏️ Revision Requested</h1>
        </div>
        <div class="content">
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                Hey ${creatorName},
            </p>
            
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                ${brandName} has requested some changes to your content for <strong>${campaignTitle}</strong>.
            </p>
            
            <div class="feedback-box">
                <h3>📝 Feedback</h3>
                <p>${feedback}</p>
            </div>
            
            <div class="details">
                <div class="details-row">
                    <span class="details-label">Campaign</span>
                    <span class="details-value">${campaignTitle}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Brand</span>
                    <span class="details-value">${brandName}</span>
                </div>
            </div>
            
            <a href="${APP_URL}/creator/submissions" class="cta-button">View & Resubmit →</a>
            
            <p style="color: #94a3b8; font-size: 13px; text-align: center;">
                Don't worry! This is normal and helps ensure the content meets brand guidelines. You've got this! 💪
            </p>
        </div>
        <div class="footer">
            <p>${APP_NAME}</p>
        </div>
    </div>
</body>
</html>
        `,
        text: `
✏️ Revision Requested

Hey ${creatorName},

${brandName} has requested some changes to your content for "${campaignTitle}".

Feedback: ${feedback}

View & Resubmit: ${APP_URL}/creator/submissions

Don't worry! This is normal and helps ensure the content meets brand guidelines.

${APP_NAME}
        `
    }),

    /**
     * CM New Escalation Alert
     */
    cmNewEscalation: ({ campaignTitle, brandName, creatorHandle, escalationReason }) => ({
        subject: `🆕 New Escalation: ${campaignTitle}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); padding: 32px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
        .content { padding: 32px; }
        .details { background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
        .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .details-row:last-child { border-bottom: none; }
        .details-label { color: #64748b; font-size: 13px; }
        .details-value { color: #1e293b; font-size: 13px; font-weight: 600; }
        .cta-button { display: block; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); color: #ffffff !important; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; text-align: center; margin: 24px 0; }
        .footer { background: #f8fafc; padding: 24px 32px; text-align: center; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ New Escalation</h1>
        </div>
        <div class="content">
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                A new content approval has been escalated to your queue.
            </p>
            
            <div class="details">
                <div class="details-row">
                    <span class="details-label">Campaign</span>
                    <span class="details-value">${campaignTitle}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Brand</span>
                    <span class="details-value">${brandName}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Creator</span>
                    <span class="details-value">@${creatorHandle}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Reason</span>
                    <span class="details-value">${escalationReason}</span>
                </div>
            </div>
            
            <a href="${APP_URL}/admin/approvals" class="cta-button">Review Now →</a>
        </div>
        <div class="footer">
            <p>Managed Approvals - ${APP_NAME}</p>
        </div>
    </div>
</body>
</html>
        `,
        text: `
🛡️ New Escalation

A new content approval has been escalated to your queue.

Campaign: ${campaignTitle}
Brand: ${brandName}
Creator: @${creatorHandle}
Reason: ${escalationReason}

Review now: ${APP_URL}/admin/approvals

${APP_NAME}
        `
    })
};

// ============================================
// NOTIFICATION SERVICE FUNCTIONS
// ============================================

/**
 * Send an email notification
 */
export const sendEmail = async (to, template, data) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('[NotificationService] SMTP not configured, email not sent');
            return { success: false, reason: 'smtp_not_configured' };
        }

        const { subject, html, text } = emailTemplates[template](data);

        const info = await transporter.sendMail({
            from: `"${APP_NAME}" <${FROM_EMAIL}>`,
            to,
            subject,
            text,
            html
        });

        console.log(`[NotificationService] Email sent: ${info.messageId} to ${to}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[NotificationService] Email send failed:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Create an in-app notification
 */
export const createInAppNotification = async (userId, type, title, message, metadata = {}) => {
    try {
        // Check if Notification model exists - this may need to be added to schema
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                metadata: JSON.stringify(metadata),
                read: false
            }
        });
        console.log(`[NotificationService] In-app notification created for user ${userId}`);
        return notification;
    } catch (error) {
        // If Notification model doesn't exist, log warning
        if (error.code === 'P2021' || error.message.includes('does not exist')) {
            console.warn('[NotificationService] Notification model not found in schema');
            return null;
        }
        console.error('[NotificationService] In-app notification failed:', error);
        return null;
    }
};

// ============================================
// MANAGED APPROVAL NOTIFICATIONS
// ============================================

/**
 * Send deadline warning to brand (6 hours before escalation)
 */
export const sendDeadlineWarning = async (collaboration) => {
    const brandEmail = collaboration.campaign?.brand?.email;
    const brandName = collaboration.campaign?.brand?.name || 'Brand';
    const creatorHandle = collaboration.creator?.creatorProfile?.instagramHandle || 'creator';

    if (!brandEmail) {
        console.warn('[Notification] No brand email for deadline warning');
        return;
    }

    await sendEmail(brandEmail, 'deadlineWarning', {
        brandName,
        campaignTitle: collaboration.campaign?.title || 'Campaign',
        creatorHandle,
        timeRemaining: '6 hours',
        approvalLink: `${APP_URL}/brand/approvals`
    });
};

/**
 * Notify brand that content was escalated to CM
 */
export const sendEscalationNotice = async (collaboration, reason) => {
    const brandEmail = collaboration.campaign?.brand?.email;
    const brandName = collaboration.campaign?.brand?.name || 'Brand';
    const creatorHandle = collaboration.creator?.creatorProfile?.instagramHandle || 'creator';

    const reasonText = {
        '24h_timeout': 'The 24-hour review period expired',
        'brand_request': 'You requested Campaign Manager assistance',
        'auto_managed': 'This campaign is set to auto-managed mode'
    }[reason] || reason;

    if (brandEmail) {
        await sendEmail(brandEmail, 'escalationNotice', {
            brandName,
            campaignTitle: collaboration.campaign?.title || 'Campaign',
            creatorHandle,
            escalationReason: reasonText
        });
    }

    // Also notify CMs
    await notifyCampaignManagers(collaboration, reason);
};

/**
 * Notify brand when CM approves on their behalf
 */
export const sendCMApprovalNotice = async (collaboration, cmNote = null) => {
    const brandEmail = collaboration.campaign?.brand?.email;
    const brandName = collaboration.campaign?.brand?.name || 'Brand';
    const creatorHandle = collaboration.creator?.creatorProfile?.instagramHandle || 'creator';

    if (brandEmail) {
        await sendEmail(brandEmail, 'cmApprovalNotice', {
            brandName,
            campaignTitle: collaboration.campaign?.title || 'Campaign',
            creatorHandle,
            cmNote
        });
    }

    // Also notify creator
    await sendCreatorApprovalNotice(collaboration);
};

/**
 * Notify brand when CM rejects on their behalf
 */
export const sendCMRejectionNotice = async (collaboration, feedback, cmNote = null) => {
    const brandEmail = collaboration.campaign?.brand?.email;
    const brandName = collaboration.campaign?.brand?.name || 'Brand';
    const creatorHandle = collaboration.creator?.creatorProfile?.instagramHandle || 'creator';

    if (brandEmail) {
        await sendEmail(brandEmail, 'cmRejectionNotice', {
            brandName,
            campaignTitle: collaboration.campaign?.title || 'Campaign',
            creatorHandle,
            feedback,
            cmNote
        });
    }

    // Also notify creator
    await sendCreatorRejectionNotice(collaboration, feedback);
};

/**
 * Notify creator when content is approved
 */
export const sendCreatorApprovalNotice = async (collaboration) => {
    const creatorEmail = collaboration.creator?.email;
    const creatorName = collaboration.creator?.name || 'Creator';
    const brandName = collaboration.campaign?.brand?.name || 'Brand';

    if (creatorEmail) {
        await sendEmail(creatorEmail, 'creatorApproved', {
            creatorName,
            campaignTitle: collaboration.campaign?.title || 'Campaign',
            brandName,
            agreedPrice: collaboration.agreedPrice || 0
        });
    }
};

/**
 * Notify creator when content is rejected
 */
export const sendCreatorRejectionNotice = async (collaboration, feedback) => {
    const creatorEmail = collaboration.creator?.email;
    const creatorName = collaboration.creator?.name || 'Creator';
    const brandName = collaboration.campaign?.brand?.name || 'Brand';

    if (creatorEmail) {
        await sendEmail(creatorEmail, 'creatorRejected', {
            creatorName,
            campaignTitle: collaboration.campaign?.title || 'Campaign',
            brandName,
            feedback
        });
    }
};

/**
 * Notify all Campaign Managers of new escalation
 */
export const notifyCampaignManagers = async (collaboration, reason) => {
    try {
        // Get all admin users
        const admins = await prisma.user.findMany({
            where: { role: 'admin' },
            select: { email: true }
        });

        const reasonText = {
            '24h_timeout': '24-hour timeout',
            'brand_request': 'Brand request',
            'auto_managed': 'Auto-managed campaign'
        }[reason] || reason;

        for (const admin of admins) {
            if (admin.email) {
                await sendEmail(admin.email, 'cmNewEscalation', {
                    campaignTitle: collaboration.campaign?.title || 'Campaign',
                    brandName: collaboration.campaign?.brand?.name || 'Brand',
                    creatorHandle: collaboration.creator?.creatorProfile?.instagramHandle || 'creator',
                    escalationReason: reasonText
                });
            }
        }
    } catch (error) {
        console.error('[NotificationService] Failed to notify CMs:', error);
    }
};

export default {
    sendEmail,
    createInAppNotification,
    sendDeadlineWarning,
    sendEscalationNotice,
    sendCMApprovalNotice,
    sendCMRejectionNotice,
    sendCreatorApprovalNotice,
    sendCreatorRejectionNotice,
    notifyCampaignManagers
};
