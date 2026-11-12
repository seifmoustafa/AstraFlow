import React from "react";
import { HomeHero } from "@/components/hero/HomeHero";
import { FlowExplorer } from "@/components/home/FlowExplorer";
import { ArchitectureAssembly } from "@/components/home/ArchitectureAssembly";
import { PackagePreview } from "@/components/home/PackagePreview";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <FlowExplorer />
      <ArchitectureAssembly />
      <PackagePreview />
    </>
  );
}
