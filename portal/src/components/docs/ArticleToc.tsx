'use client';

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

interface ArticleTocProps {
  headings: TocHeading[];
  fallbackTitle: string;
}

export function ArticleToc({ headings, fallbackTitle }: ArticleTocProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string>(() => (headings.length > 0 ? headings[0].id : ''));

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-12% 0px -72% 0px',
        threshold: [0, 1],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  return (
    <aside aria-label="On this page">
      <p className="tiny">ON THIS PAGE</p>
      {headings.length > 0 ? (
        headings.map((h, idx) => {
          const isActive = activeId === h.id;
          return (
            <p
              key={`${h.id}-${idx}`}
              style={{
                position: 'relative',
                paddingInlineStart: h.level > 2 ? `${(h.level - 2) * 10 + 10}px` : '10px',
              }}
            >
              {isActive ? (
                <motion.span
                  layoutId="docs-toc-active-marker"
                  aria-hidden="true"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }
                  }
                  style={{
                    position: 'absolute',
                    insetInlineStart: 0,
                    top: '4px',
                    bottom: '4px',
                    width: '2px',
                    background: 'var(--signal)',
                  }}
                />
              ) : null}
              <a
                href={`#${h.id}`}
                aria-current={isActive ? 'location' : undefined}
                onClick={() => setActiveId(h.id)}
                style={{
                  color: isActive ? 'var(--action)' : undefined,
                  fontWeight: isActive ? 700 : undefined,
                  transition: 'color 160ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                {h.text}
              </a>
            </p>
          );
        })
      ) : (
        <p>
          <a href="#reading">{fallbackTitle}</a>
        </p>
      )}
    </aside>
  );
}
