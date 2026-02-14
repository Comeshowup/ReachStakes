/**
 * Design Tokens
 * Semantic design system for consistent styling across the dashboard
 * 
 * Based on 8pt grid system with semantic naming
 */

// ======================
// COLORS
// ======================

export const colors = {
    // Background tiers
    bg: {
        base: '#09090B',          // Page background
        elevated: '#0F0F12',      // Cards, surfaces
        muted: 'rgba(255, 255, 255, 0.02)',
        hover: 'rgba(255, 255, 255, 0.04)',
        overlay: 'rgba(0, 0, 0, 0.8)'
    },

    // Text hierarchy
    text: {
        primary: '#FFFFFF',
        secondary: 'rgba(255, 255, 255, 0.70)',
        muted: 'rgba(255, 255, 255, 0.50)',
        disabled: 'rgba(255, 255, 255, 0.30)'
    },

    // Borders
    border: {
        subtle: 'rgba(255, 255, 255, 0.05)',
        default: 'rgba(255, 255, 255, 0.10)',
        strong: 'rgba(255, 255, 255, 0.20)'
    },

    // Semantic colors
    status: {
        success: '#10B981',       // Emerald
        warning: '#F59E0B',       // Amber
        error: '#EF4444',         // Rose
        info: '#6366F1'           // Indigo
    },

    // Brand accents
    accent: {
        primary: '#6366F1',       // Indigo
        primaryHover: '#818CF8',
        secondary: '#8B5CF6',     // Violet
        tertiary: '#EC4899'       // Pink
    },

    // Status backgrounds (10% opacity)
    statusBg: {
        success: 'rgba(16, 185, 129, 0.10)',
        warning: 'rgba(245, 158, 11, 0.10)',
        error: 'rgba(239, 68, 68, 0.10)',
        info: 'rgba(99, 102, 241, 0.10)'
    }
};

// ======================
// SPACING (8pt grid)
// ======================

export const spacing = {
    '0': '0',
    '1': '4px',     // 0.5x
    '2': '8px',     // 1x
    '3': '12px',    // 1.5x
    '4': '16px',    // 2x
    '5': '20px',    // 2.5x
    '6': '24px',    // 3x
    '8': '32px',    // 4x
    '10': '40px',   // 5x
    '12': '48px',   // 6x
    '16': '64px',   // 8x
    '20': '80px',   // 10x
    '24': '96px'    // 12x
};

// ======================
// TYPOGRAPHY
// ======================

export const typography = {
    fontFamily: {
        sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        mono: '"JetBrains Mono", "Fira Code", monospace'
    },

    fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
        '5xl': '48px'
    },

    fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800
    },

    lineHeight: {
        tight: 1.2,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625
    }
};

// ======================
// RADII
// ======================

export const radii = {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    '3xl': '24px',
    full: '9999px'
};

// ======================
// SHADOWS
// ======================

export const shadows = {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.4)',
    glow: {
        primary: '0 0 20px rgba(99, 102, 241, 0.3)',
        success: '0 0 20px rgba(16, 185, 129, 0.3)',
        warning: '0 0 20px rgba(245, 158, 11, 0.3)',
        error: '0 0 20px rgba(239, 68, 68, 0.3)'
    }
};

// ======================
// TRANSITIONS
// ======================

export const transitions = {
    duration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
        slower: '500ms'
    },
    easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
};

// ======================
// Z-INDEX
// ======================

export const zIndex = {
    base: 0,
    dropdown: 100,
    sticky: 200,
    fixed: 300,
    modalBackdrop: 400,
    modal: 500,
    popover: 600,
    tooltip: 700,
    toast: 800
};

// ======================
// BREAKPOINTS
// ======================

export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
};

// ======================
// COMPONENT TOKENS
// ======================

export const components = {
    // Card component
    card: {
        padding: spacing['6'],
        borderRadius: radii['2xl'],
        background: colors.bg.muted,
        border: colors.border.subtle,
        hoverBackground: colors.bg.hover,
        hoverTranslate: '-2px'
    },

    // Button variants
    button: {
        height: {
            sm: '32px',
            md: '40px',
            lg: '48px'
        },
        paddingX: {
            sm: spacing['3'],
            md: spacing['4'],
            lg: spacing['6']
        },
        fontSize: {
            sm: typography.fontSize.xs,
            md: typography.fontSize.sm,
            lg: typography.fontSize.base
        }
    },

    // Badge/Pill
    badge: {
        height: '24px',
        paddingX: spacing['3'],
        fontSize: typography.fontSize.xs,
        borderRadius: radii.full
    },

    // Input
    input: {
        height: '40px',
        paddingX: spacing['4'],
        fontSize: typography.fontSize.sm,
        borderRadius: radii.lg,
        background: colors.bg.muted,
        border: colors.border.default
    }
};

// ======================
// CSS VARIABLE EXPORT
// ======================

export const getCSSVariables = () => `
  :root {
    --color-bg-base: ${colors.bg.base};
    --color-bg-elevated: ${colors.bg.elevated};
    --color-bg-muted: ${colors.bg.muted};
    --color-bg-hover: ${colors.bg.hover};
    
    --color-text-primary: ${colors.text.primary};
    --color-text-secondary: ${colors.text.secondary};
    --color-text-muted: ${colors.text.muted};
    
    --color-border-subtle: ${colors.border.subtle};
    --color-border-default: ${colors.border.default};
    
    --color-accent-primary: ${colors.accent.primary};
    --color-status-success: ${colors.status.success};
    --color-status-warning: ${colors.status.warning};
    --color-status-error: ${colors.status.error};
    
    --spacing-1: ${spacing['1']};
    --spacing-2: ${spacing['2']};
    --spacing-4: ${spacing['4']};
    --spacing-6: ${spacing['6']};
    --spacing-8: ${spacing['8']};
    
    --radius-md: ${radii.md};
    --radius-lg: ${radii.lg};
    --radius-xl: ${radii.xl};
    --radius-2xl: ${radii['2xl']};
    
    --transition-fast: ${transitions.duration.fast};
    --transition-normal: ${transitions.duration.normal};
  }
`;

export default {
    colors,
    spacing,
    typography,
    radii,
    shadows,
    transitions,
    zIndex,
    breakpoints,
    components
};
