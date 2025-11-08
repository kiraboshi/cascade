/**
 * @cascade/tokens
 *
 * Unified export supporting both DTCG JSON and TypeScript formats
 */
import { tokens, type TokenKey, type ColorToken, type SpaceToken, type MotionDurationToken } from '../tokens.js';
export { tokens, type TokenKey, type ColorToken, type SpaceToken, type MotionDurationToken };
export declare const dtcgTokens: {
    $schema: string;
    color: {
        blue: {
            "50": {
                $value: string;
                $type: string;
            };
            "100": {
                $value: string;
                $type: string;
            };
            "500": {
                $value: string;
                $type: string;
            };
            "900": {
                $value: string;
                $type: string;
            };
        };
        primary: {
            $value: string;
            $type: string;
        };
    };
    space: {
        scale: {
            $value: number;
            $type: string;
        };
        xs: {
            $value: string;
            $type: string;
        };
        sm: {
            $value: string;
            $type: string;
        };
        md: {
            $value: string;
            $type: string;
        };
        lg: {
            $value: string;
            $type: string;
        };
        xl: {
            $value: string;
            $type: string;
        };
    };
    motion: {
        duration: {
            fast: {
                $value: string;
                $type: string;
            };
            normal: {
                $value: string;
                $type: string;
            };
            slow: {
                $value: string;
                $type: string;
            };
        };
        easing: {
            ease: {
                $value: string;
                $type: string;
            };
            "ease-in": {
                $value: string;
                $type: string;
            };
            "ease-out": {
                $value: string;
                $type: string;
            };
            "ease-in-out": {
                $value: string;
                $type: string;
            };
            bounce: {
                $value: string;
                $type: string;
            };
        };
        spring: {
            default: {
                stiffness: {
                    $value: number;
                    $type: string;
                };
                damping: {
                    $value: number;
                    $type: string;
                };
                mass: {
                    $value: number;
                    $type: string;
                };
            };
        };
    };
    typography: {
        "font-family": {
            sans: {
                $value: string[];
                $type: string;
            };
        };
        "font-size": {
            sm: {
                $value: string;
                $type: string;
            };
            base: {
                $value: string;
                $type: string;
            };
            lg: {
                $value: string;
                $type: string;
            };
        };
    };
    layout: {
        breakpoint: {
            xs: {
                $value: string;
                $type: string;
            };
            sm: {
                $value: string;
                $type: string;
            };
            md: {
                $value: string;
                $type: string;
            };
            lg: {
                $value: string;
                $type: string;
            };
            xl: {
                $value: string;
                $type: string;
            };
        };
    };
};
/**
 * Resolve a token value from either format
 */
export declare function resolveToken(category: string, key: string): string;
/**
 * Get all tokens for a category
 */
export declare function getTokens<T extends keyof typeof tokens>(category: T): typeof tokens[T];
//# sourceMappingURL=index.d.ts.map