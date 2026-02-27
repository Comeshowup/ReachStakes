import db from '../../db.json';
import { DollarSign, Briefcase, Video, Users, TrendingUp, Activity } from 'lucide-react';

const iconMap = {
    DollarSign,
    Briefcase,
    Video,
    Users,
    TrendingUp,
    Activity
};

// Extract data from the new JSON structure
export const users = db.users || [];

// Separate users by role and merge with profile data
export const brands = users.filter(u => u.role === 'brand').map(user => {
    const profile = (db.brands || []).find(b => b.id === user.profileId) || {};
    return {
        id: user.profileId || user.id,
        ...user,
        ...profile, // Merge profile properties like name, logo
        stats: profile.stats || user.stats || { campaigns: 0, hiringSince: '2023', rating: '0/5' },
        contact: profile.contact || user.contact || { email: user.email, phone: '' },
        socials: profile.socials || user.socials || {},
        skills: profile.skills || user.skills || []
    };
});

export const creators = users.filter(u => u.role === 'creator').map(user => {
    const profile = (db.creators || []).find(c => c.id === user.profileId) || {};
    return {
        id: user.profileId || user.id,
        ...user,
        ...profile, // Merge profile properties like name, avatar, niche
        stats: profile.stats || user.stats || { campaigns: 0, hiringSince: '2023', rating: '0/5' },
        contact: profile.contact || user.contact || { email: user.email, phone: '' },
        socials: profile.socials || user.socials || {},
        skills: profile.skills || user.skills || []
    };
});

// Extract campaigns from users who have them
export const campaigns = users.flatMap(user =>
    (user.campaigns || []).map(campaign => ({
        ...campaign,
        brandName: user.name,
        brandLogo: user.logo
    }))
);

// Extract posts from users who have them
export const posts = users.flatMap(user =>
    (user.posts || []).map(post => ({
        ...post,
        authorType: user.role,
        authorId: user.id
    }))
);

// Get analytics from the first brand user that has it
const firstBrandWithAnalytics = users.find(u => u.role === 'brand' && u.analytics);
export const ROI_DATA = firstBrandWithAnalytics?.analytics?.roi_data || firstBrandWithAnalytics?.analytics?.rio_data || [];
export const STATS_DATA = (firstBrandWithAnalytics?.analytics?.stats_data || []).map((stat) => ({
    ...stat,
    icon: iconMap[stat.icon] || Activity
}));

export const ALL_BRANDS = brands;
export const ALL_CREATORS = creators;

// Profile Mocks - use first of each type
export const BRAND_PROFILE = brands[0] || {
    name: 'Demo Brand',
    stats: { campaigns: 0, hiringSince: '2023', rating: '0/5' },
    contact: { email: '', phone: '' },
    socials: {},
    skills: []
};
export const CREATOR_PROFILE = creators[0] || {
    name: 'Demo Creator',
    stats: { campaigns: 0, hiringSince: '2023', rating: '0/5' },
    contact: { email: '', phone: '' },
    socials: {},
    skills: []
};

// Posts Mocks
export const BRAND_POSTS = posts.filter(p => p.authorType === 'brand');
export const CREATOR_POSTS = posts.filter(p => p.authorType === 'creator');

// Aliases for component compatibility
export const CAMPAIGNS_DATA = campaigns.map((c) => ({
    ...c,
    title: c.name || c.title || 'Untitled Campaign',
    name: c.name || c.title || 'Untitled Campaign',
    brand: c.brand || 'Acme Corp', // Default brand name if missing
    creators: c.creators || 0,
    roi: c.roi || '-',
    progress: c.progress || 0,
    status: c.status || 'Active',
    // Enterprise Extensions
    rightsExpiration: c.rightsExpiration || '2026-12-31',
    whitelistingStatus: c.whitelistingStatus || 'Active',
    estimatedEmv: c.estimatedEmv || 14500.00,
    deliverableVersion: c.deliverableVersion || 2,
    contentUsageScope: c.contentUsageScope || ['Organic', 'Paid Social']
}));

export const AVAILABLE_CAMPAIGNS = CAMPAIGNS_DATA;

export const CREATOR_STATS = [
    { label: "Active Campaigns", value: "3", icon: Briefcase, change: "+1 this week", color: "text-blue-500" },
    { label: "Pending Invites", value: "2", icon: Users, change: "New!", color: "text-purple-500" },
    { label: "Total Earnings", value: "$4,250", icon: DollarSign, change: "+12%", color: "text-green-500" },
    { label: "Avg. Engagement", value: "4.8%", icon: Activity, change: "+0.5%", color: "text-orange-500" },
];

export const FEED_DATA = posts.map((post) => {
    // Normalize content
    let content = post.content;
    if (typeof content === 'string') {
        content = {
            text: content,
            media: null,
            timestamp: post.date || 'Just now'
        };
    }

    // Resolve author if using ID reference
    let author = post.author;
    if (post.authorId) {
        const authorList = post.authorType === 'brand' ? brands : creators;
        // loose equality for string/num ids handled by using == in logic or ensure types match. 
        // In this project brands/creators use numeric IDs, post.authorId is number.
        // However, safely using == covers the case if one becomes string. 
        // But to be clean we use === and assume types match or cast.
        // Given existing data is correct (numbers), I will use ===.
        const foundAuthor = authorList.find((a) => a.id === post.authorId);
        if (foundAuthor) {
            author = {
                name: foundAuthor.name,
                id: foundAuthor.id,
                avatar: foundAuthor.logo || foundAuthor.image || foundAuthor.avatar || "https://i.pravatar.cc/150",
                type: post.authorType,
                badge: foundAuthor.status || foundAuthor.niche || 'User'
            };
        }
    }

    // Ensure author object exists fallback
    if (!author) {
        author = {
            name: "Unknown User",
            avatar: "https://i.pravatar.cc/150",
            type: "user",
            badge: "Guest"
        };
    }

    // Normalize stats
    const stats = post.stats || {
        likes: post.likes || 0,
        comments: post.comments || 0,
        shares: 0
    };

    return {
        ...post,
        content,
        author,
        stats,
        comments: [] // Initialize comments
    };
});

// Navigation Data
import { LayoutGrid, Compass, MessageSquare, CreditCard, User, LogOut, Settings, Target, FileText, Home, FolderOpen, Send, DollarSign as DollarIcon, Users as UsersIcon, CheckCircle, Link, BarChart3, Headphones } from 'lucide-react';

export const NAV_GROUPS = [
    {
        title: "Overview",
        items: [
            { label: "Dashboard", path: "/brand", icon: LayoutGrid },
            { label: "Active Campaigns", path: "/brand/campaigns", icon: Briefcase },
            { label: "Approvals", path: "/brand/approvals", icon: CheckCircle, badge: "3" },
            { label: "Escrow Vault", path: "/brand/financials", icon: CreditCard },
        ]
    },
    {
        title: "Support",
        items: [
            { label: "Support Center", path: "/brand/support", icon: Headphones },
        ]
    },
    {
        title: "Settings",
        items: [
            { label: "Profile", path: "/brand/profile", icon: User },
        ]
    }
];

export const CREATOR_NAV_GROUPS = [
    {
        title: "Overview",
        items: [
            { label: "Dashboard", path: "/creator", icon: Home },
            { label: "Find Campaigns", path: "/creator/explore", icon: Compass },
            { label: "My Work", path: "/creator/submissions", icon: FolderOpen },
            { label: "Video Stats", path: "/creator/video-stats", icon: BarChart3 },
            { label: "Documents", path: "/creator/documents", icon: FileText },
        ]
    },
    {
        title: "Support",
        items: [
            { label: "Support Center", path: "/creator/support", icon: Headphones },
        ]
    },
    {
        title: "Management",
        items: [
            { label: "Earnings", path: "/creator/financials", icon: DollarIcon },
            { label: "Invoices", path: "/creator/invoices", icon: FileText },
            { label: "Social Accounts", path: "/creator/social-accounts", icon: Link },
            { label: "Profile", path: "/creator/profile", icon: User },
        ]
    }
];

export const ADMIN_NAV_GROUPS = [
    {
        title: "Overview",
        items: [
            { label: "Dashboard", path: "/admin", icon: LayoutGrid },
        ]
    },
    {
        title: "Management",
        items: [
            { label: "Users", path: "/admin/users", icon: UsersIcon },
            { label: "Campaigns", path: "/admin/campaigns", icon: Target },
            { label: "Financials", path: "/admin/financials", icon: CreditCard },
        ]
    }
];
