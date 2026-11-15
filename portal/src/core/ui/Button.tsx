'use client';

import type { ComponentProps } from 'react';

/** Shared button boundary that keeps native button behavior and caller styling unchanged. */
export function Button(props: ComponentProps<'button'>) {
  return <button {...props} />;
}
