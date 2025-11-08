/**
 * Tests for ARIA attribute support in layout primitives
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Grid, Sidebar, Imposter, Reel, Box, Center, Cluster, Cover, Flex, Frame, Stack, Split, Switcher } from '../../index';

describe('ARIA Attributes', () => {
  describe('Grid', () => {
    it('should apply aria-label', () => {
      const { container } = render(<Grid ariaLabel="Product grid">Content</Grid>);
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveAttribute('aria-label', 'Product grid');
    });

    it('should apply aria-labelledby', () => {
      const { container } = render(
        <>
          <h2 id="grid-title">Products</h2>
          <Grid ariaLabelledBy="grid-title">Content</Grid>
        </>
      );
      const grid = container.querySelector('.grid') as HTMLElement;
      
      expect(grid).toHaveAttribute('aria-labelledby', 'grid-title');
    });

    it('should apply aria-rowcount and aria-colcount', () => {
      const { container } = render(
        <Grid ariaRowCount={10} ariaColCount={5}>Content</Grid>
      );
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveAttribute('aria-rowcount', '10');
      expect(element).toHaveAttribute('aria-colcount', '5');
    });

    it('should apply role', () => {
      const { container } = render(<Grid role="grid">Content</Grid>);
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveAttribute('role', 'grid');
    });

    it('should apply aria-live', () => {
      const { container } = render(<Grid ariaLive="polite">Content</Grid>);
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Sidebar', () => {
    it('should apply default role="complementary"', () => {
      const { container } = render(
        <Sidebar>
          <div>Sidebar</div>
          <div>Content</div>
        </Sidebar>
      );
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveAttribute('role', 'complementary');
    });

    it('should allow overriding role', () => {
      const { container } = render(
        <Sidebar role="navigation">
          <div>Sidebar</div>
          <div>Content</div>
        </Sidebar>
      );
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveAttribute('role', 'navigation');
    });

    it('should apply aria-label', () => {
      const { container } = render(
        <Sidebar ariaLabel="Main navigation">
          <div>Sidebar</div>
          <div>Content</div>
        </Sidebar>
      );
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveAttribute('aria-label', 'Main navigation');
    });
  });

  describe('Imposter', () => {
    it('should apply role="dialog" when breakout is true', () => {
      const { container } = render(
        <Imposter breakout>Content</Imposter>
      );
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveAttribute('role', 'dialog');
    });

    it('should apply aria-modal="true" when breakout is true', () => {
      const { container } = render(
        <Imposter breakout>Content</Imposter>
      );
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveAttribute('aria-modal', 'true');
    });

    it('should apply aria-labelledby', () => {
      const { container } = render(
        <>
          <h2 id="modal-title">Modal Title</h2>
          <Imposter breakout ariaLabelledBy="modal-title">Content</Imposter>
        </>
      );
      const impostor = container.querySelector('.imposter') as HTMLElement;
      
      expect(impostor).toHaveAttribute('aria-labelledby', 'modal-title');
    });
  });

  describe('Reel', () => {
    it('should apply default role="region"', () => {
      const { container } = render(<Reel>Content</Reel>);
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveAttribute('role', 'region');
    });

    it('should apply aria-orientation="horizontal" by default', () => {
      const { container } = render(<Reel>Content</Reel>);
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('should apply aria-label', () => {
      const { container } = render(<Reel ariaLabel="Image gallery">Content</Reel>);
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveAttribute('aria-label', 'Image gallery');
    });
  });

  describe('All Primitives', () => {
    const primitives = [
      { name: 'Box', Component: Box },
      { name: 'Center', Component: Center },
      { name: 'Cluster', Component: Cluster },
      { name: 'Cover', Component: Cover },
      { name: 'Flex', Component: Flex },
      { name: 'Frame', Component: Frame, props: { ratio: '16/9' } },
      { name: 'Stack', Component: Stack, props: { spacing: 'md' } },
      { name: 'Split', Component: Split, props: { children: [<div key="1">Left</div>, <div key="2">Right</div>] } },
      { name: 'Switcher', Component: Switcher },
    ];

    primitives.forEach(({ name, Component, props = {} }) => {
      it(`${name} should apply aria-label`, () => {
        const { container } = render(
          <Component ariaLabel={`${name} label`} {...props}>
            Content
          </Component>
        );
        const element = container.firstChild as HTMLElement;
        
        expect(element).toHaveAttribute('aria-label', `${name} label`);
      });

      it(`${name} should apply aria-labelledby`, () => {
        const { container } = render(
          <>
            <h2 id={`${name.toLowerCase()}-title`}>Title</h2>
            <Component ariaLabelledBy={`${name.toLowerCase()}-title`} {...props}>
              Content
            </Component>
          </>
        );
        const primitive = container.querySelector(`.${name.toLowerCase()}`) as HTMLElement;
        
        expect(primitive).toHaveAttribute('aria-labelledby', `${name.toLowerCase()}-title`);
      });

      it(`${name} should apply aria-describedby`, () => {
        const { container } = render(
          <>
            <p id={`${name.toLowerCase()}-desc`}>Description</p>
            <Component ariaDescribedBy={`${name.toLowerCase()}-desc`} {...props}>
              Content
            </Component>
          </>
        );
        const primitive = container.querySelector(`.${name.toLowerCase()}`) as HTMLElement;
        
        expect(primitive).toHaveAttribute('aria-describedby', `${name.toLowerCase()}-desc`);
      });

      it(`${name} should apply role`, () => {
        const { container } = render(
          <Component role="region" {...props}>Content</Component>
        );
        const element = container.firstChild as HTMLElement;
        
        expect(element).toHaveAttribute('role', 'region');
      });

      it(`${name} should apply aria-live`, () => {
        const { container } = render(
          <Component ariaLive="assertive" {...props}>Content</Component>
        );
        const element = container.firstChild as HTMLElement;
        
        expect(element).toHaveAttribute('aria-live', 'assertive');
      });
    });
  });
});

