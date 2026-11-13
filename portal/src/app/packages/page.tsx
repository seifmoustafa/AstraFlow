import type { Metadata } from "next";
import { getAllPackages, getComposerPresets } from "@/lib/packages";
import { PackagesWorkspace } from "@/components/scenes/packages";

export const metadata: Metadata = {
  title: "Packages",
  description:
    "Discover all 16 AstraFlow .NET packages, verify target frameworks and NuGet publication status, and assemble an install plan.",
  alternates: {
    canonical: "/packages",
  },
};

export default function PackagesPage() {
  const packages = getAllPackages();
  const presets = getComposerPresets();

  return (
    <main id="main" data-page="packages">
      <PackagesWorkspace packages={packages} presets={presets} />
    </main>
  );
}
