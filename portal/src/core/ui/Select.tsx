'use client';

import type { ComponentProps } from 'react';

/** Shared select boundary for future feature-owned choice controls. */
export function Select(props: ComponentProps<'select'>) {
  return <select {...props} />;
}
