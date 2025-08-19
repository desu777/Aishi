/**
 * @fileoverview Simplified PillNav component for CTA buttons replacement
 * @description Clean pill navigation with logo and 3 action buttons, no mobile menu
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { useTheme } from '../../contexts/ThemeContext';
import './PillNav.css';

export type PillNavItem = {
  label: string;
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
};

export interface PillNavProps {
  items: PillNavItem[];
  className?: string;
  ease?: string;
}

const PillNav: React.FC<PillNavProps> = ({
  items,
  className = '',
  ease = 'power3.easeOut'
}) => {
  const { theme } = useTheme();
  const router = useRouter();
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement as HTMLElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector<HTMLElement>('.pill-label');
        const hover = pill.querySelector<HTMLElement>('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (hover) gsap.set(hover, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(
          circle,
          { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' },
          0
        );

        if (label) {
          tl.to(
            label,
            { y: -(h + 8), duration: 2, ease, overwrite: 'auto' },
            0
          );
        }

        if (hover) {
          gsap.set(hover, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(
            hover,
            { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' },
            0
          );
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease]);

  const handlePillEnter = (index: number) => {
    const tl = tlRefs.current[index];
    if (!tl) return;
    activeTweenRefs.current[index]?.kill();
    activeTweenRefs.current[index] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto',
    });
  };

  const handlePillLeave = (index: number) => {
    const tl = tlRefs.current[index];
    if (!tl) return;
    activeTweenRefs.current[index]?.kill();
    activeTweenRefs.current[index] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto',
    });
  };


  const handleItemClick = (item: PillNavItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      if (item.href.startsWith('http') || item.href.startsWith('//')) {
        window.open(item.href, '_blank', 'noopener,noreferrer');
      } else {
        router.push(item.href);
      }
    }
  };

  const cssVars = {
    '--base': theme.bg.card,
    '--pill-bg': theme.accent.primary,
    '--hover-text': theme.text.white,
    '--pill-text': theme.text.primary,
  } as React.CSSProperties;

  return (
    <nav
      className={`pill-nav ${className}`}
      aria-label="Primary navigation"
      style={cssVars}
    >
      <div className="pill-nav-items">
        <ul className="pill-list" role="menubar">
          {items.map((item, index) => (
            <li key={`${item.label}-${index}`} role="none">
              <button
                type="button"
                role="menuitem"
                className="pill"
                aria-label={item.ariaLabel || item.label}
                onMouseEnter={() => handlePillEnter(index)}
                onMouseLeave={() => handlePillLeave(index)}
                onClick={() => handleItemClick(item)}
              >
                <span
                  className="hover-circle"
                  aria-hidden="true"
                  ref={(el) => {
                    circleRefs.current[index] = el;
                  }}
                />
                <span className="label-stack">
                  <span className="pill-label">{item.label}</span>
                  <span className="pill-label-hover" aria-hidden="true">
                    {item.label}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default PillNav;