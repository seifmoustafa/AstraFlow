'use client';

import type { ComponentProps } from 'react';

/** Shared textarea boundary for future feature-owned long-form input controls. */
export function Textarea(props: ComponentProps<'textarea'>) {
  return <textarea {...props} />;
}
