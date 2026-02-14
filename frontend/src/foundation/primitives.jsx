/**
 * Layout Primitives
 * Composable layout components for consistent spacing and structure
 */

import React from 'react';
import { spacing, radii, colors, shadows } from './tokens';

// ======================
// STACK (Vertical Layout)
// ======================

/**
 * Stack - Vertical flex container with consistent gap
 * 
 * @example
 * <Stack gap="4">
 *   <Card />
 *   <Card />
 * </Stack>
 */
export const Stack = ({
    children,
    gap = '4',
    align = 'stretch',
    justify = 'flex-start',
    className = '',
    as: Component = 'div',
    ...props
}) => {
    const style = {
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[gap] || gap,
        alignItems: align,
        justifyContent: justify
    };

    return (
        <Component style={style} className={className} {...props}>
            {children}
        </Component>
    );
};

// ======================
// INLINE (Horizontal Layout)
// ======================

/**
 * Inline - Horizontal flex container with consistent gap
 * 
 * @example
 * <Inline gap="3" align="center">
 *   <Icon />
 *   <Text />
 * </Inline>
 */
export const Inline = ({
    children,
    gap = '3',
    align = 'center',
    justify = 'flex-start',
    wrap = false,
    className = '',
    as: Component = 'div',
    ...props
}) => {
    const style = {
        display: 'flex',
        flexDirection: 'row',
        gap: spacing[gap] || gap,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? 'wrap' : 'nowrap'
    };

    return (
        <Component style={style} className={className} {...props}>
            {children}
        </Component>
    );
};

// ======================
// SURFACE (Card Container)
// ======================

/**
 * Surface - Elevated card container with consistent styling
 * 
 * @example
 * <Surface padding="6" hover>
 *   <Content />
 * </Surface>
 */
export const Surface = ({
    children,
    padding = '6',
    radius = '2xl',
    border = true,
    hover = false,
    elevated = false,
    className = '',
    onClick,
    ...props
}) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const style = {
        padding: spacing[padding] || padding,
        borderRadius: radii[radius] || radius,
        background: elevated ? colors.bg.elevated : colors.bg.muted,
        border: border ? `1px solid ${colors.border.subtle}` : 'none',
        transition: 'all 200ms ease',
        cursor: onClick ? 'pointer' : 'default',
        ...(hover && isHovered ? {
            background: colors.bg.hover,
            transform: 'translateY(-2px)',
            boxShadow: shadows.md
        } : {})
    };

    return (
        <div
            style={style}
            className={className}
            onClick={onClick}
            onMouseEnter={() => hover && setIsHovered(true)}
            onMouseLeave={() => hover && setIsHovered(false)}
            {...props}
        >
            {children}
        </div>
    );
};

// ======================
// GRID
// ======================

/**
 * Grid - CSS Grid container
 * 
 * @example
 * <Grid cols={4} gap="4">
 *   {items.map(item => <Card />)}
 * </Grid>
 */
export const Grid = ({
    children,
    cols = 1,
    gap = '4',
    colsMd,
    colsLg,
    className = '',
    ...props
}) => {
    const style = {
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: spacing[gap] || gap
    };

    // For responsive columns, we'll use CSS classes
    const responsiveClass = [
        className,
        colsMd ? `md:grid-cols-${colsMd}` : '',
        colsLg ? `lg:grid-cols-${colsLg}` : ''
    ].filter(Boolean).join(' ');

    return (
        <div style={style} className={responsiveClass} {...props}>
            {children}
        </div>
    );
};

// ======================
// DIVIDER
// ======================

/**
 * Divider - Horizontal or vertical separator
 */
export const Divider = ({
    vertical = false,
    spacing: spacingProp = '4',
    className = ''
}) => {
    const style = vertical ? {
        width: '1px',
        height: 'auto',
        marginLeft: spacing[spacingProp],
        marginRight: spacing[spacingProp],
        background: colors.border.subtle
    } : {
        height: '1px',
        width: '100%',
        marginTop: spacing[spacingProp],
        marginBottom: spacing[spacingProp],
        background: colors.border.subtle
    };

    return <div style={style} className={className} />;
};

// ======================
// SPACER
// ======================

/**
 * Spacer - Empty space for layout adjustment
 */
export const Spacer = ({ size = '4' }) => (
    <div style={{ height: spacing[size] || size, width: '100%' }} />
);

// ======================
// CONTAINER
// ======================

/**
 * Container - Max-width wrapper with padding
 */
export const Container = ({
    children,
    maxWidth = '1280px',
    paddingX = '8',
    paddingY = '10',
    className = ''
}) => {
    const style = {
        maxWidth,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: spacing[paddingX],
        paddingRight: spacing[paddingX],
        paddingTop: spacing[paddingY],
        paddingBottom: spacing[paddingY]
    };

    return (
        <div style={style} className={className}>
            {children}
        </div>
    );
};

// ======================
// ROW (Dashboard Row)
// ======================

/**
 * Row - Dashboard section with consistent bottom margin
 */
export const Row = ({
    children,
    marginBottom = '8',
    className = ''
}) => {
    const style = {
        marginBottom: spacing[marginBottom]
    };

    return (
        <div style={style} className={className}>
            {children}
        </div>
    );
};

export default {
    Stack,
    Inline,
    Surface,
    Grid,
    Divider,
    Spacer,
    Container,
    Row
};
