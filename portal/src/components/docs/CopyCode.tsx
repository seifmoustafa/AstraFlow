'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

interface CopyCodeProps {
  code: string;
  label?: string;
  className?: string;
}

export function CopyCode({ code, label = 'Copy code block', className = 'v11-code-copy' }: CopyCodeProps) {
  const [copied, setCopied] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1700);
    } catch {
      // Fallback for restricted clipboard environments
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.setAttribute('readonly', 'true');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1700);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      aria-live="polite"
      data-copied={copied ? 'true' : 'false'}
      className={className}
      style={{
        marginTop: 0,
        padding: '5px 10px',
        position: 'relative',
        overflow: 'hidden',
        borderColor: copied ? '#56d18c' : undefined,
        color: copied ? '#ddf1dc' : undefined,
        transition: 'border-color 160ms cubic-bezier(0.22, 1, 0.36, 1), color 160ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? 'copied' : 'copy'}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -3 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.16, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'inline-block' }}
        >
          {copied ? 'COPIED ✓' : 'COPY CODE ↗'}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
