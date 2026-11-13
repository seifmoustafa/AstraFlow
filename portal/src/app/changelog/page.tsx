import type { Metadata } from "next";
import {
  getAllChangelogReleases,
  getChangelogStats,
} from "@/lib/changelog";
import { ChangelogShell } from "@/components/scenes/changelog";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Complete AstraFlow release history covering 36 releases from 1.0.0 through the latest 2.4.0 updates, new capabilities, and migration notes.",
  alternates: {
    canonical: "/changelog",
  },
};

export default function ChangelogPage() {
  const releases = getAllChangelogReleases();
  const stats = getChangelogStats();

  return <ChangelogShell releases={releases} stats={stats} />;
}
