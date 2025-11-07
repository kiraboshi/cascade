/**
 * Frame layout primitive
 * Aspect ratio container with object-fit support
 */

import { forwardRef, type HTMLAttributes } from 'react';
import * as stylex from '@stylexjs/stylex';

const frameStyles = stylex.create({
  base: {
    position: 'relative',
    aspectRatio: 'var(--frame-ratio)',
  },
  content: {
    position: 'absolute',
    inset: 0,
    objectFit: 'var(--frame-object-fit, cover)',
  },
});

export interface FrameProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  ratio: `${number}/${number}`;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  as?: keyof JSX.IntrinsicElements;
}

export const Frame = forwardRef<HTMLElement, FrameProps>(
  ({ ratio, objectFit = 'cover', as: Component = 'div', style, className, children, ...props }, ref) => {
    // Parse ratio (e.g., "16/9" -> 16/9)
    const [width, height] = ratio.split('/').map(Number);
    const aspectRatio = width / height;
    
    const combinedClassName = stylex.props(frameStyles.base).className + (className ? ` ${className}` : '');
    
    return (
      <Component
        ref={ref as any}
        className={combinedClassName}
        style={{
          '--frame-ratio': aspectRatio,
          '--frame-object-fit': objectFit,
          ...style,
        } as React.CSSProperties}
        {...props}
      >
        <div {...stylex.props(frameStyles.content)}>
          {children}
        </div>
      </Component>
    );
  }
);

Frame.displayName = 'Frame';

