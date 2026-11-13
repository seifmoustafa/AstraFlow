import type { Metadata } from "next";
import {
  getAllChangelogReleases,
  getChangelogStats,
} from "@/lib/changelog";
import { ChangelogShell } from "@/components/scenes/changelog";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Full AstraFlow release history parsed from CHANGELOG.md with explicit provenance separating published NuGet 2.3.0 releases from unreleased 2.4.0 source milestones.",
  alternates: {
    canonical: "/changelog",
  },
};

export default function ChangelogPage() {
  const releases = getAllChangelogReleases();
  const stats = getChangelogStats();

  return <ChangelogShell releases={releases} stats={stats} />;
}
