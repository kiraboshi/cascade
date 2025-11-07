/**
 * Stack layout primitive
 * Vertical flex container with configurable spacing and alignment
 */

import { forwardRef, type HTMLAttributes } from 'react';
import * as stylex from '@stylexjs/stylex';
import { tokens, type SpaceToken } from '@cascade/tokens';

const stackStyles = stylex.create({
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--stack-gap, 0)',
    alignItems: 'var(--stack-align, stretch)',
    justifyContent: 'var(--stack-justify, flex-start)',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  alignStretch: {
    alignItems: 'stretch',
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  justifyBetween: {
    justifyContent: 'space-between',
  },
});

export interface StackProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  spacing: SpaceToken;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between';
  responsive?: Record<string, Partial<Omit<StackProps, 'responsive'>>>;
  as?: keyof JSX.IntrinsicElements;
}

export const Stack = forwardRef<HTMLElement, StackProps>(
  ({ spacing, align = 'stretch', justify = 'start', responsive, as: Component = 'div', style, className, ...props }, ref) => {
    // Resolve spacing token
    const gap = tokens.space[spacing];
    
    // Generate responsive data-attributes
    const dataResponsive = responsive ? JSON.stringify(responsive) : undefined;
    
    // Build className with alignment utilities
    const alignClass = align === 'start' ? stackStyles.alignStart :
                       align === 'center' ? stackStyles.alignCenter :
                       align === 'end' ? stackStyles.alignEnd :
                       stackStyles.alignStretch;
    
    const justifyClass = justify === 'start' ? stackStyles.justifyStart :
                         justify === 'center' ? stackStyles.justifyCenter :
                         justify === 'end' ? stackStyles.justifyEnd :
                         stackStyles.justifyBetween;
    
    const combinedClassName = stylex.props(
      stackStyles.base,
      alignClass,
      justifyClass
    ).className + (className ? ` ${className}` : '');
    
    return (
      <Component
        ref={ref as any}
        className={combinedClassName}
        style={{
          '--stack-gap': gap,
          ...style,
        } as React.CSSProperties}
        data-responsive={dataResponsive}
        {...props}
      />
    );
  }
);

Stack.displayName = 'Stack';

