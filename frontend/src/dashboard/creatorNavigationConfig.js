/**
 * Creator Dashboard — Navigation Configuration
 * 
 * Single source of truth for sidebar structure.
 * The sidebar component renders entirely from this config.
 */
import {
    Home,
    Briefcase,
    BarChart3,
    DollarSign,
    Settings,
    Headphones,
    LogOut,
} from 'lucide-react';

// ─── Section definitions ────────────────────────────────────
export const SECTION_MAIN = 'MAIN';
export const SECTION_WORK = 'WORK';
export const SECTION_FINANCE = 'FINANCE';
export const SECTION_ACCOUNT = 'ACCOUNT';
export const SECTION_FOOTER = 'FOOTER';

// ─── Primary nav items (rendered in sidebar body) ───────────
export const CREATOR_NAV_CONFIG = [
    {
        section: SECTION_MAIN,
        items: [
            { label: 'Overview', path: '/creator', icon: Home, end: true },
        ],
    },
    {
        section: SECTION_WORK,
        items: [
            {
                label: 'Campaigns',
                path: '/creator/campaigns',
                icon: Briefcase,
                children: [
                    { label: 'Discover', path: '/creator/campaigns/discover' },
                    { label: 'Active', path: '/creator/campaigns/active' },
                    { label: 'Submitted', path: '/creator/campaigns/submitted' },
                    { label: 'Completed', path: '/creator/campaigns/completed' },
                ],
            },
            { label: 'Analytics', path: '/creator/analytics', icon: BarChart3 },
        ],
    },
    {
        section: SECTION_FINANCE,
        items: [
            {
                label: 'Earnings',
                path: '/creator/earnings',
                icon: DollarSign,
                children: [
                    { label: 'Overview',        path: '/creator/earnings' },
                    { label: 'Transactions',    path: '/creator/earnings/transactions' },
                    { label: 'Payout Settings', path: '/creator/earnings/settings' },
                ],
            },
        ],
    },
    {
        section: SECTION_ACCOUNT,
        items: [
            {
                label: 'Settings',
                path: '/creator/settings',
                icon: Settings,
                children: [
                    { label: 'Profile', path: '/creator/settings/profile' },
                    { label: 'Social Accounts', path: '/creator/settings/social' },
                ],
            },
        ],
    },
];

// ─── Footer items (rendered at bottom of sidebar) ───────────
export const CREATOR_FOOTER_NAV = [
    { label: 'Support Center', path: '/creator/support', icon: Headphones },
];
