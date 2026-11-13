export interface NavItem {
  readonly label: string;
  readonly href: string;
}

export interface FooterColumn {
  readonly heading: string;
  readonly links: readonly NavItem[];
}

export const UI_COPY = {
  brand: {
    name: "AstraFlow",
    tagline: "ENGINEERED CLARITY",
    homeAriaLabel: "AstraFlow ENGINEERED CLARITY — home",
    skipToMain: "Skip to main content",
  },
  header: {
    navAriaLabel: "Primary",
    mobileMenuLabel: "Menu ☰",
    mobileMenuAriaLabelOpen: "Close navigation menu",
    mobileMenuAriaLabelClosed: "Open navigation menu",
    githubAriaLabel: "AstraFlow GitHub repository",
    githubTitle: "View AstraFlow on GitHub",
    githubDrawerLabel: "GitHub Repository ↗",
    ctaLabel: "Get started ↗",
    ctaHref: "/docs/quick-start",
    navItems: [
      { label: "Home", href: "/" },
      { label: "Packages", href: "/packages" },
      { label: "Docs", href: "/docs" },
      { label: "Guides", href: "/guides" },
      { label: "Changelog", href: "/changelog" },
      { label: "Community", href: "/community" },
    ] satisfies readonly NavItem[],
  },
  footer: {
    headlineTop: "Complexity is optional.",
    headlineAccent: "Clarity isn't.",
    description: "Focused .NET packages. One deliberate engineering language.",
    columns: [
      {
        heading: "Explore",
        links: [
          { label: "Packages", href: "/packages" },
          { label: "Documentation", href: "/docs" },
          { label: "Guides", href: "/guides" },
        ],
      },
      {
        heading: "Project",
        links: [
          { label: "Changelog", href: "/changelog" },
          { label: "Community", href: "/community" },
          { label: "GitHub", href: "https://github.com/seifmoustafa/AstraFlow" },
        ],
      },
      {
        heading: "Build",
        links: [
          { label: "Quick start", href: "/docs/quick-start" },
          { label: "Package selection", href: "/docs/package-selection" },
          { label: "Release history", href: "/changelog" },
        ],
      },
    ] satisfies readonly FooterColumn[],
    bottomLeft: "ASTRAFLOW / THE COMPONENTS OF CLARITY",
    bottomRight: "MIT LICENSED • VERIFIED REPOSITORY SOURCE",
  },
  hero: {
    eyebrow: "OPEN SOURCE / THE .NET FLOW ENGINE",
    titleTop: "Control",
    titleBottom: "the flow",
    lead: "Make intent explicit.",
    descriptionLead:
      "A focused family of .NET packages for request dispatch, object mapping, diagnostics and testing.",
    descriptionStrong: "Compose only what your application needs.",
    primaryCta: "Start building",
    primaryHref: "/docs/quick-start",
    secondaryCta: "Explore the flow",
    secondaryHref: "#experience",
    metaItems: ["MIT LICENSED", "MODULAR PACKAGES", "DOCUMENTED APIS"] as const,
    stageTopLabel: "FIGURE 01 / REQUEST TO RESULT",
    liveSignalLabel: "LIVE SIGNAL · CONTINUOUS",
    pauseLabel: "PAUSE SIGNAL",
    resumeLabel: "RESUME SIGNAL",
    pauseAriaLabel: "PAUSE SIGNAL — pause hero trace animation",
    resumeAriaLabel: "RESUME SIGNAL — resume hero trace animation",
    reducedMotionTitle: "Movement disabled by your reduced-motion preference",
    stageSteps: [
      "01 / DECLARE",
      "02 / COMPOSE",
      "03 / EXECUTE",
      "04 / VERIFY",
    ] as const,
    underStatement: "THE SIGNAL MOVES. THE SYSTEM STAYS PUT.",
    underAction: "SEE HOW IT WORKS",
    svgAriaLabel:
      "AstraFlow A symbol with an animated orange request signal tracing its flow path",
  },
  errors: {
    notFoundEyebrow: "404 / ROUTE NOT FOUND",
    notFoundTitle: "Nothing at",
    notFoundAccent: "this address.",
    notFoundBody:
      "The requested route or documentation slug does not exist in the verified AstraFlow source index.",
    errorEyebrow: "UNEXPECTED FAULT",
    errorTitle: "Something",
    errorAccent: "interrupted the page.",
    retryLabel: "Try again",
    homeLabel: "Return home",
    docsLabel: "Browse docs",
  },
} as const;
