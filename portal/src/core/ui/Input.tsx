'use client';

import type { ComponentProps } from 'react';

/** Shared input boundary for accessible feature-owned form controls. */
export function Input(props: ComponentProps<'input'>) {
  return <input {...props} />;
}
