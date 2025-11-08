/**
 * Live region utilities for screen reader announcements
 * Provides hooks for announcing dynamic content changes to screen readers
 */

import { useEffect, useState, useId, type RefObject } from 'react';

/**
 * Hook to announce messages to screen readers via a live region
 * 
 * @param politeness - Politeness level for announcements (default: 'polite')
 * @returns Object with announce function and live region props
 * 
 * @example
 * ```tsx
 * const { announce, LiveRegion } = useLiveRegion('polite');
 * 
 * // Announce a message
 * announce('Layout changed to vertical');
 * 
 * // Render the live region (required)
 * return (
 *   <>
 *     <LiveRegion />
 *     <button onClick={() => announce('Button clicked')}>Click</button>
 *   </>
 * );
 * ```
 */
export function useLiveRegion(politeness: 'polite' | 'assertive' = 'polite'): {
  announce: (message: string) => void;
  LiveRegion: () => JSX.Element;
  announcement: string;
} {
  const [announcement, setAnnouncement] = useState('');
  const announcementId = useId();
  
  const announce = (message: string) => {
    setAnnouncement(message);
  };
  
  // Clear announcement after it's been read (screen readers need time to process)
  useEffect(() => {
    if (announcement) {
      const timer = setTimeout(() => setAnnouncement(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [announcement]);
  
  const LiveRegion = () => (
    <div
      id={announcementId}
      role="status"
      aria-live={politeness}
      aria-atomic={true}
      className="sr-only"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: 0,
      }}
    >
      {announcement}
    </div>
  );
  
  return { announce, LiveRegion, announcement };
}

/**
 * Hook to announce layout changes for a specific element
 * Automatically announces when the element's content or structure changes
 * 
 * @param ref - Ref to the element to watch
 * @param message - Message to announce when layout changes
 * @param politeness - Politeness level (default: 'polite')
 * 
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * useLayoutAnnouncement(containerRef, 'Layout updated', 'polite');
 * 
 * return <div ref={containerRef}>...</div>;
 * ```
 */
export function useLayoutAnnouncement(
  ref: RefObject<HTMLElement>,
  message: string,
  politeness: 'polite' | 'assertive' = 'polite'
): void {
  const { announce, LiveRegion } = useLiveRegion(politeness);
  
  useEffect(() => {
    if (!ref.current || !message) return;
    
    const element = ref.current;
    
    // Use MutationObserver to detect layout changes
    const observer = new MutationObserver(() => {
      announce(message);
    });
    
    observer.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'data-responsive'],
    });
    
    return () => {
      observer.disconnect();
    };
  }, [ref, message, announce]);
  
  // Render live region (this will be rendered by the component using this hook)
  // Note: In practice, components should render their own LiveRegion or use useLiveRegion directly
}

