import React from "react";
import type { Metadata } from "next";
import { getChangelogData } from "@/lib/changelog-loader";
import {
  VersionFolio,
  ReleaseFolioEntry,
} from "@/components/changelog/VersionFolio";

export const metadata: Metadata = {
  title: "Changelog — AstraFlow Visual Exploration",
  description:
    "Explore the AstraFlow version history and understand the difference between source milestones and published packages. Interactive design prototype.",
  alternates: {
    canonical: "/changelog",
  },
};

const PINNED_COMMIT_SHA = "b163535864199bfb05cef62807d89509ac2239f8";

interface EditorialReleaseMeta {
  id?: string;
  displayVersion?: string;
  versionSublabel?: string;
  headline: string;
  summary: string;
  statusVariant: "source" | "published" | "neutral";
  statusLabel: string;
  dateQualification: string;
  provenanceNote: string;
  nugetUrl?: string;
}

const EDITORIAL_RELEASE_MAP: Record<string, EditorialReleaseMeta> = {
  "2.4.0": {
    id: "r24",
    displayVersion: "2.4",
    versionSublabel: "WORK IN PROGRESS",
    headline: "Work under development.",
    summary: "Future work must never be presented as a NuGet release.",
    statusVariant: "source",
    statusLabel: "Unpublished",
    dateQualification: "Unreleased (in-development source)",
    provenanceNote:
      "Use repository and NuGet evidence before displaying individual planned capabilities.",
  },
  "2.3.0": {
    id: "r23",
    displayVersion: "2.3",
    headline: "Source milestone, qualified status.",
    summary:
      "API governance, CLI graph work and generated mapping extensions in source; exact package publication requires verification.",
    statusVariant: "source",
    statusLabel: "Verify per package",
    dateQualification: "published 2026-11-10; per maintainer confirmation",
    provenanceNote:
      "Treat source change, GitHub Release and installability as separate states.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow",
  },
  "2.2.0": {
    id: "r22",
    displayVersion: "2.2",
    headline: "Reproducibility and release discipline.",
    summary:
      "The supplied project guide reports top-level AstraFlow 2.2.0 on NuGet; separate package IDs require their own check.",
    statusVariant: "published",
    statusLabel: "Umbrella verified in supplied evidence",
    dateQualification: "published; prior release",
    provenanceNote:
      "Never infer NuGet availability of every satellite package from the umbrella package listing.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow/2.2.0",
  },
  "2.1.0": {
    id: "r210",
    displayVersion: "2.1.0",
    versionSublabel: "UNDATED IN SOURCE",
    headline: "Opt-in generated scalar mapping foundation.",
    summary:
      "v2.1.0 source is merged and a GitHub Release exists ([AstraGenerateMapping] partial methods and AFM001); NuGet publication has not been verified.",
    statusVariant: "source",
    statusLabel: "GitHub Release; NuGet unverified",
    dateQualification: "GitHub Release; NuGet unverified (undated in CHANGELOG.md)",
    provenanceNote:
      "v2.1.0 source is merged and a GitHub Release exists. NuGet publication has not been verified, so this version is not listed as published in the compatibility table.",
  },
  "2.0.0": {
    headline: "Shared security governance and redaction taxonomy.",
    summary:
      "Adds AstraFlow.Security with sensitive-name classification and value redaction policy primitives shared across OpenTelemetry and convention mapping.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow",
  },
  "1.13.1": {
    headline: "Host compatibility samples and migration cookbook gate.",
    summary:
      "Compile-checked host compatibility samples, migration cookbook verification, and scoped DI consumer coverage against the 1.13.0 baseline.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow",
  },
  "1.13.0": {
    headline: "Public API compatibility and upgrade smoke gates.",
    summary:
      "Adds automated XML doc member ID compatibility checks, previous-version consumer upgrade smoke verification, and API governance documentation.",
    statusVariant: "published",
    statusLabel: "Prior baseline · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Referenced in CHANGELOG.md as the prior published compatibility baseline line; verify individual satellite package IDs on NuGet.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow",
  },
  "1.12.0": {
    headline: "OpenTelemetry activities, metrics, and safe redaction defaults.",
    summary:
      "Introduces AstraFlow.OpenTelemetry built on ActivitySource and Meter with payload-safe redaction defaults and sampling switches.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow",
  },
  "1.11.0": {
    headline: "ASP.NET Core and FluentValidation integrations.",
    summary:
      "Adds AstraFlow.AspNetCore minimal API and controller helpers, problem-details mapping, redacted diagnostics endpoints, and FluentValidation behaviors.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow",
  },
  "1.10.0": {
    headline: "AstraFlow CLI inspection, validation, and migration scanning.",
    summary:
      "Introduces the astraflow .NET tool package with inspect, validate, report, diff, graph, and MediatR/AutoMapper migration candidate scanning.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow.Cli",
  },
  "1.9.0": {
    headline: "BenchmarkDotNet harness and measurement methodology.",
    summary:
      "Adds non-packable AstraFlow.Benchmarks covering dispatch, cold start, pipeline depth, mapping, projections, and claim policy documentation.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Non-packable harness",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "AstraFlow.Benchmarks is a non-packable repository benchmark project; it is not published as a NuGet package.",
  },
  "1.8.4": {
    headline: "Compile-time mapper and projection metadata generation.",
    summary:
      "Extends AstraFlow.Generators with IGeneratedMapperMetadataProvider and compile-time mapping rule and projection metadata helpers.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow.Generators",
  },
  "1.8.3": {
    headline: "Deterministic source-generated mediator registrations.",
    summary:
      "Introduces the AstraFlow.Generators compiler package and AddAstraFlowGeneratedMediatorRegistrations for closed handlers and processors.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow.Generators",
  },
  "1.8.2": {
    headline: "Mapper and projection Roslyn analyzer diagnostics.",
    summary:
      "Adds compile-time warnings AFAN0201–AFAN0202 and AFAN0301–AFAN0304 for undeclared mapping rules, reverse sensitive writes, and query projection risks.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow.Analyzers",
  },
  "1.8.1": {
    headline: "Mediator handler and lifetime Roslyn analyzers.",
    summary:
      "Adds AFAN0101–AFAN0105 diagnostics for missing handlers, duplicate handlers, ambiguous request contracts, missing stream handlers, and singleton lifetimes.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow.Analyzers",
  },
  "1.8.0": {
    headline: "AstraFlow.Analyzers Roslyn foundation.",
    summary:
      "Establishes the analyzer package foundation, stable rule ID catalog, severity policy, and Roslyn compilation test infrastructure.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow.Analyzers",
  },
  "1.7.2": {
    headline: "Projection plan parameter type and sensitivity assertions.",
    summary:
      "Expands AstraFlow.Testing with deterministic assertions for projection parameter types and sensitive/non-sensitive parameter classification.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow.Testing",
  },
  "1.7.1": {
    headline: "Deterministic projection plan test assertions.",
    summary:
      "Adds ProjectionPlanAssertions in AstraFlow.Testing for inspecting projection plans, parameters, member decisions, and findings.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow.Testing",
  },
  "1.7.0": {
    headline: "Parameterized query projections and plan export.",
    summary:
      "Adds IParameterizedProjection, ProjectWith expression binding, ProjectionPlan export, AFP106/AFP107 diagnostics, and EF Core parameter translation checks.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow.Mapper",
  },
  "1.6.2": {
    headline: "Explicit convention inheritance and polymorphic dispatch.",
    summary:
      "Adds IncludeBase and IncludeDerived support with AFC017–AFC019 diagnostics for inspectable polymorphic convention mapping.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow.Mapper.Conventions",
  },
  "1.6.1": {
    headline: "Convention value transformers and before/after map hooks.",
    summary:
      "Adds AddValueTransformer, BeforeMap, and AfterMap hooks with AFC014–AFC016 diagnostics and Transformed member plan visibility.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow.Mapper.Conventions",
  },
  "1.6.0": {
    headline: "Flattening, unflattening, explicit ReverseMap, and resolvers.",
    summary:
      "Expands convention mapping with opt-in flattening/unflattening, explicit ReverseMap, IncludeMembers, MapFrom, ForPath, and IConventionValueResolver.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow.Mapper.Conventions",
  },
  "1.5.2": {
    headline: "Constructor/record binding and explicit update mapping.",
    summary:
      "Adds immutable constructor and record convention binding, IConventionMapper, and explicit MapInto update mapping with sensitive destination protection.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow.Mapper.Conventions",
  },
  "1.5.1": {
    headline: "Fluent member configuration and conversion diagnostics.",
    summary:
      "Adds ForMember, MapFrom, Required, NullSubstitute, ConvertUsing, and Condition with enum, nullable, and numeric conversion diagnostics.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow.Mapper.Conventions",
  },
  "1.5.0": {
    headline: "Opt-in convention mapping and mapping plan export.",
    summary:
      "Introduces AstraFlow.Mapper.Conventions with profiles, strict mode, sensitive-member protection, and IMappingPlanProvider diagnostics.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow.Mapper.Conventions",
  },
  "1.4.2": {
    headline: "Preserved DI registration order in diagnostics reports.",
    summary:
      "Ensures diagnostics registration tables reflect actual runtime dependency-injection order for pipelines, processors, and notification handlers.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow.Diagnostics",
  },
  "1.4.1": {
    headline: "Cross-cutting diagnostics reporting and stream stabilization.",
    summary:
      "Expands diagnostics reporting for pre/post-processors and exception handlers, with regression coverage for stream cancellation and disposal.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow.Mediator",
  },
  "1.4.0": {
    headline: "Shared contracts, void requests, streams, and exception flows.",
    summary:
      "Introduces AstraFlow.Contracts, void IRequest, IStreamRequest<TResponse>, pre/post-processors, exception handlers, and parallel notification strategies.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow.Contracts",
  },
  "1.3.0": {
    headline: "Framework-neutral AstraFlow.Testing package.",
    summary:
      "Adds fake sender/publisher/mediator helpers, handler and pipeline test harnesses, and deterministic assertions across netstandard2.0 and net8.0–net10.0.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow.Testing",
  },
  "1.2.3": {
    headline: "Automated clean package install verification.",
    summary:
      "Adds verify-package-install.ps1 to test packed NuGet artifacts in clean external netstandard2.0, net8.0, net9.0, and net10.0 consumer projects.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow",
  },
  "1.2.2": {
    headline: "Multi-target support for core AstraFlow packages.",
    summary:
      "Ships netstandard2.0, net8.0, net9.0, and net10.0 assets for AstraFlow, AstraFlow.Mediator, AstraFlow.Mapper, and AstraFlow.Diagnostics.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow",
  },
  "1.2.1": {
    headline: "Target framework compatibility and package selection guidance.",
    summary:
      "Adds compatibility guidance, focused vs. umbrella package selection docs, and release checklist gates for dependency review.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow",
  },
  "1.2.0": {
    headline: "Projection registry, validation findings, and EF Core integration.",
    summary:
      "Adds deterministic unnamed/named projection lookup, projection expression validation warnings, and AstraFlow.Mapper.EntityFrameworkCore.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow.Mapper.EntityFrameworkCore",
  },
  "1.1.0": {
    headline: "AstraFlow.Diagnostics registration reports and health summaries.",
    summary:
      "Introduces framework-neutral registration reports, severity-coded findings, JSON and Markdown export, and health-check-ready summaries.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow.Diagnostics",
  },
  "1.0.1": {
    headline: "Dispatch ambiguity hardening and registration resilience.",
    summary:
      "Hardens multi-contract request dispatch diagnostics, assembly scanning resilience, and public API reference documentation.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow.Mediator",
  },
  "1.0.0": {
    headline: "Initial AstraFlow, Mediator, and Mapper foundation.",
    summary:
      "Establishes AstraFlow.Mediator, AstraFlow.Mapper, and the AstraFlow convenience package with explicit mapping rules, projections, and secure ID abstractions.",
    statusVariant: "neutral",
    statusLabel: "Source milestone · Verify per package",
    dateQualification: "Undated in CHANGELOG.md",
    provenanceNote:
      "Recorded in repository CHANGELOG.md without a release date. Verify individual package availability on NuGet per package ID.",
    nugetUrl: "https://www.nuget.org/packages/AstraFlow",
  },
};

export default function ChangelogPage() {
  const { releases } = getChangelogData();

  if (!releases || releases.length === 0) {
    throw new Error(
      "CHANGELOG.md ingestion failed: release chronology must not be empty.",
    );
  }

  const folioEntries: ReleaseFolioEntry[] = releases.map((rel) => {
    const editorial = EDITORIAL_RELEASE_MAP[rel.version];
    const fallbackId = `r${rel.version.replace(/[^a-zA-Z0-9]/g, "")}`;

    return {
      id: editorial?.id ?? fallbackId,
      version: rel.version,
      displayVersion: editorial?.displayVersion ?? rel.version,
      versionSublabel:
        editorial?.versionSublabel ??
        (rel.dateNotice ? undefined : "UNDATED IN SOURCE"),
      rawHeader: rel.rawHeader,
      dateQualification:
        editorial?.dateQualification ??
        rel.dateNotice ??
        "Undated in CHANGELOG.md",
      headline: editorial?.headline ?? `AstraFlow ${rel.version} milestone.`,
      summary:
        editorial?.summary ??
        rel.summary ??
        rel.sections[0]?.items[0] ??
        "Recorded in repository CHANGELOG.md.",
      statusVariant: editorial?.statusVariant ?? "neutral",
      statusLabel:
        editorial?.statusLabel ?? "Source milestone · Verify per package",
      provenanceNote:
        editorial?.provenanceNote ??
        "Recorded in repository CHANGELOG.md. Verify individual package availability on NuGet per package ID.",
      sourceUrl: `https://github.com/seifmoustafa/AstraFlow/blob/${PINNED_COMMIT_SHA}/CHANGELOG.md`,
      nugetUrl: editorial?.nugetUrl,
      sections: rel.sections.map((s) => ({
        title: s.title,
        items: s.items,
      })),
    };
  });

  return (
    <div data-page="changelog">
      <section className="hero">
        <div className="site-wrap page-intro grid">
          <div>
            <p className="eyebrow">THE RECORD / NOT THE HYPE</p>
            <h1>
              Every version.
              <span className="ital">An honest story.</span>
            </h1>
            <p className="lead">
              An editorial changelog for the entire history—not a release
              marketing poster. Publication, repository milestones and work in
              progress must have separate labels.
            </p>
            <a className="button button-outline" href="#releases">
              Explore the chronology
              <span aria-hidden="true" className="arrow">
                ↗
              </span>
            </a>
          </div>
          <div className="release-art">
            <div className="geo-grid"></div>
            <div className="sheet">
              <small>EARLIER SOURCE</small>
              <big>2.2</big>
            </div>
            <div className="sheet">
              <small>SOURCE MILESTONE · VERIFY PUBLICATION</small>
              <big>2.3</big>
            </div>
            <div className="sheet">
              <small>IN PROGRESS / NOT PUBLISHED</small>
              <big>2.4</big>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-panel" id="releases">
        <div className="site-wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">A LIVING HISTORY / DEMONSTRATION</p>
              <h2>
                Progress, with
                <br />
                <span className="ital signal">provenance.</span>
              </h2>
            </div>
            <p className="section-caption">
              The production view must ingest all CHANGELOG.md entries. These
              are illustrative rows only, not a complete release catalog.
            </p>
          </div>

          <VersionFolio
            releases={folioEntries}
            sourceCommitSha={PINNED_COMMIT_SHA}
          />

          <p className="bottom-note" style={{ marginTop: "26px" }}>
            Prototype chronology. Full source: repository CHANGELOG.md; published
            status: per NuGet package ID.
          </p>
        </div>
      </section>
    </div>
  );
}
