import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AstraFlow Design Lab',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CraftLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
