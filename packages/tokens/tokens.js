/**
 * TypeScript-first token definitions
 * These complement the DTCG JSON format and provide type safety
 */
export const tokens = {
    color: {
        blue: {
            50: 'oklch(0.95 0.02 250)',
            100: 'oklch(0.90 0.04 250)',
            500: 'oklch(0.637 0.237 25.331)',
            900: 'oklch(0.30 0.15 250)',
        },
        primary: 'oklch(0.637 0.237 25.331)',
    },
    space: {
        scale: 1.5,
        xs: '0.25rem',
        sm: '0.5rem',
        md: 'calc(1rem * 1.5)',
        lg: 'calc(1.5rem * 1.5)',
        xl: 'calc(2rem * 1.5)',
    },
    motion: {
        duration: {
            fast: '150ms',
            normal: '300ms',
            slow: '600ms',
        },
        easing: {
            ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
            easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
            easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
            bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        },
        spring: {
            default: {
                stiffness: 300,
                damping: 20,
                mass: 1,
            },
        },
    },
    typography: {
        fontFamily: {
            sans: ['system-ui', '-apple-system', 'sans-serif'],
        },
        fontSize: {
            sm: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
            base: 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
            lg: 'clamp(1.125rem, 1rem + 0.625vw, 1.5rem)',
        },
    },
    layout: {
        breakpoint: {
            xs: '20rem',
            sm: '40rem',
            md: '64rem',
            lg: '80rem',
            xl: '90rem',
        },
    },
};
//# sourceMappingURL=tokens.js.map