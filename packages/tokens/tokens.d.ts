/**
 * TypeScript-first token definitions
 * These complement the DTCG JSON format and provide type safety
 */
export declare const tokens: {
    readonly color: {
        readonly blue: {
            readonly 50: "oklch(0.95 0.02 250)";
            readonly 100: "oklch(0.90 0.04 250)";
            readonly 500: "oklch(0.637 0.237 25.331)";
            readonly 900: "oklch(0.30 0.15 250)";
        };
        readonly primary: "oklch(0.637 0.237 25.331)";
    };
    readonly space: {
        readonly scale: 1.5;
        readonly xs: "0.25rem";
        readonly sm: "0.5rem";
        readonly md: "calc(1rem * 1.5)";
        readonly lg: "calc(1.5rem * 1.5)";
        readonly xl: "calc(2rem * 1.5)";
    };
    readonly motion: {
        readonly duration: {
            readonly fast: "150ms";
            readonly normal: "300ms";
            readonly slow: "600ms";
        };
        readonly easing: {
            readonly ease: "cubic-bezier(0.4, 0, 0.2, 1)";
            readonly easeIn: "cubic-bezier(0.4, 0, 1, 1)";
            readonly easeOut: "cubic-bezier(0, 0, 0.2, 1)";
            readonly easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)";
            readonly bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)";
        };
        readonly spring: {
            readonly default: {
                readonly stiffness: 300;
                readonly damping: 20;
                readonly mass: 1;
            };
        };
    };
    readonly typography: {
        readonly fontFamily: {
            readonly sans: readonly ["system-ui", "-apple-system", "sans-serif"];
        };
        readonly fontSize: {
            readonly sm: "clamp(0.875rem, 0.8rem + 0.375vw, 1rem)";
            readonly base: "clamp(1rem, 0.9rem + 0.5vw, 1.125rem)";
            readonly lg: "clamp(1.125rem, 1rem + 0.625vw, 1.5rem)";
        };
    };
    readonly layout: {
        readonly breakpoint: {
            readonly xs: "20rem";
            readonly sm: "40rem";
            readonly md: "64rem";
            readonly lg: "80rem";
            readonly xl: "90rem";
        };
    };
};
export type TokenKey<T extends keyof typeof tokens> = keyof typeof tokens[T];
export type ColorToken = TokenKey<'color'>;
export type SpaceToken = TokenKey<'space'>;
export type MotionDurationToken = TokenKey<'motion'> extends 'motion' ? keyof typeof tokens.motion.duration : never;
//# sourceMappingURL=tokens.d.ts.map