import { prisma } from '../config/db.js';

/**
 * GET /api/creators/analytics
 *
 * Returns analytics data for the authenticated creator, aggregated from
 * CampaignCollaboration records. Supports a `range` query param:
 *   - "7d"  → last 7 days   (compare vs 7 days before that)
 *   - "30d" → last 30 days  (compare vs 30 days before that)  [default]
 *   - "90d" → last 90 days
 *   - "12m" → last 365 days
 *
 * Response:
 * {
 *   status: "success",
 *   data: {
 *     metrics: { views, engagements, engagementRate, videosPublished },
 *     timeline: [{ date, views, engagements, videos }],
 *     platformStats: [{ platform, views, engagementRate }],
 *     videos: [{ id, title, campaignTitle, platform, views, likes, comments, engagementRate, publishDate }]
 *   }
 * }
 */
export const getCreatorAnalytics = async (req, res) => {
    try {
        const creatorId = req.user.id;
        const range = req.query.range || '30d';

        // ─── Compute date windows ──────────────────────────────
        const now = new Date();
        const dayMs = 1000 * 60 * 60 * 24;

        const rangeDays = {
            '7d': 7,
            '30d': 30,
            '90d': 90,
            '12m': 365,
        }[range] ?? 30;

        const currentStart = new Date(now.getTime() - rangeDays * dayMs);
        const previousStart = new Date(currentStart.getTime() - rangeDays * dayMs);

        // ─── Fetch all submitted collaborations ───────────────
        const allCollabs = await prisma.campaignCollaboration.findMany({
            where: {
                creatorId,
                submissionUrl: { not: null }, // Only submitted content
            },
            include: {
                campaign: {
                    select: {
                        title: true,
                        brand: {
                            select: {
                                brandProfile: { select: { companyName: true } },
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        // ─── Helper: extract numeric stats from a collab ──────
        const extractStats = (collab) => {
            const raw = collab.videoStats || {};
            const views =
                parseInt(collab.viewsCount || 0) ||
                parseInt(raw.views || raw.viewCount || 0) ||
                0;
            const likes =
                parseInt(collab.likesCount || 0) ||
                parseInt(raw.likes || raw.likeCount || 0) ||
                0;
            const comments =
                parseInt(raw.comments || raw.commentCount || 0) || 0;
            const engRate =
                parseFloat(collab.engagementRate || 0) ||
                (views > 0 ? ((likes + comments) / views) * 100 : 0);

            return { views, likes, comments, engRate };
        };

        // ─── Partition into current vs previous windows ───────
        const current = allCollabs.filter(
            (c) => new Date(c.updatedAt) >= currentStart
        );
        const previous = allCollabs.filter(
            (c) =>
                new Date(c.updatedAt) >= previousStart &&
                new Date(c.updatedAt) < currentStart
        );

        const sumStats = (collabs) =>
            collabs.reduce(
                (acc, c) => {
                    const { views, likes, comments } = extractStats(c);
                    acc.views += views;
                    acc.likes += likes;
                    acc.comments += comments;
                    acc.engagements += likes + comments;
                    return acc;
                },
                { views: 0, likes: 0, comments: 0, engagements: 0 }
            );

        const curTotals = sumStats(current);
        const prevTotals = sumStats(previous);

        const pctChange = (cur, prev) => {
            if (prev === 0) return cur > 0 ? 100 : 0;
            return parseFloat((((cur - prev) / prev) * 100).toFixed(1));
        };

        const curEngRate =
            curTotals.views > 0
                ? parseFloat(
                      ((curTotals.engagements / curTotals.views) * 100).toFixed(2)
                  )
                : 0;
        const prevEngRate =
            prevTotals.views > 0
                ? parseFloat(
                      ((prevTotals.engagements / prevTotals.views) * 100).toFixed(2)
                  )
                : 0;

        const metrics = {
            views: {
                value: curTotals.views,
                change: pctChange(curTotals.views, prevTotals.views),
            },
            engagements: {
                value: curTotals.engagements,
                change: pctChange(curTotals.engagements, prevTotals.engagements),
            },
            engagementRate: {
                value: curEngRate,
                change: pctChange(curEngRate, prevEngRate),
            },
            videosPublished: {
                value: current.length,
                change: pctChange(current.length, previous.length),
            },
        };

        // ─── Timeline: bucket current-window collabs by date ──
        // Group by calendar date string (YYYY-MM-DD)
        const timelineMap = {};
        current.forEach((collab) => {
            const dateKey = new Date(collab.updatedAt).toISOString().split('T')[0];
            if (!timelineMap[dateKey]) {
                timelineMap[dateKey] = { date: dateKey, views: 0, engagements: 0, videos: 0 };
            }
            const { views, likes, comments } = extractStats(collab);
            timelineMap[dateKey].views += views;
            timelineMap[dateKey].engagements += likes + comments;
            timelineMap[dateKey].videos += 1;
        });

        // Fill in zero-value dates for continuity
        const timeline = [];
        for (let i = rangeDays - 1; i >= 0; i--) {
            const d = new Date(now.getTime() - i * dayMs);
            const dateKey = d.toISOString().split('T')[0];
            timeline.push(
                timelineMap[dateKey] || { date: dateKey, views: 0, engagements: 0, videos: 0 }
            );
        }

        // If range is 12m, collapse into weekly buckets to avoid 365 data points
        const finalTimeline =
            range === '12m' ? bucketByWeek(timeline) : timeline;

        // ─── Platform Stats ───────────────────────────────────
        const platformMap = {};
        current.forEach((collab) => {
            const platform = collab.submissionPlatform || 'Other';
            if (!platformMap[platform]) {
                platformMap[platform] = { platform, views: 0, engagements: 0, count: 0 };
            }
            const { views, likes, comments } = extractStats(collab);
            platformMap[platform].views += views;
            platformMap[platform].engagements += likes + comments;
            platformMap[platform].count += 1;
        });

        const platformStats = Object.values(platformMap).map((p) => ({
            platform: p.platform,
            views: p.views,
            engagementRate:
                p.views > 0
                    ? parseFloat(((p.engagements / p.views) * 100).toFixed(2))
                    : 0,
        }));

        // Ensure YouTube, Instagram, TikTok always appear (with zeros if no data)
        const knownPlatforms = ['YouTube', 'Instagram', 'TikTok'];
        knownPlatforms.forEach((platform) => {
            if (!platformStats.find((p) => p.platform === platform)) {
                platformStats.push({ platform, views: 0, engagementRate: 0 });
            }
        });

        // ─── Videos: top content list ─────────────────────────
        const videos = allCollabs.map((collab) => {
            const { views, likes, comments, engRate } = extractStats(collab);
            return {
                id: collab.id,
                title: collab.submissionTitle || collab.campaign.title,
                campaignTitle: collab.campaign.title,
                platform: collab.submissionPlatform || 'Other',
                views,
                likes,
                comments,
                engagementRate: parseFloat(engRate.toFixed(2)),
                publishDate: collab.updatedAt,
                link: collab.submissionUrl,
            };
        });

        return res.json({
            status: 'success',
            data: {
                metrics,
                timeline: finalTimeline,
                platformStats,
                videos,
            },
        });
    } catch (error) {
        console.error('[getCreatorAnalytics] error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch analytics data',
        });
    }
};

// ─── Utility: collapse daily timeline into ISO-week buckets ──────────────────
function bucketByWeek(dailyTimeline) {
    const weekMap = {};
    dailyTimeline.forEach(({ date, views, engagements, videos }) => {
        const d = new Date(date);
        // ISO week key: year-W##
        const jan1 = new Date(d.getFullYear(), 0, 1);
        const weekNum =
            Math.ceil(
                ((d - jan1) / (1000 * 60 * 60 * 24) + jan1.getDay() + 1) / 7
            );
        const key = `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
        if (!weekMap[key]) {
            weekMap[key] = { date: date, views: 0, engagements: 0, videos: 0 };
        }
        weekMap[key].views += views;
        weekMap[key].engagements += engagements;
        weekMap[key].videos += videos;
    });
    return Object.values(weekMap);
}
