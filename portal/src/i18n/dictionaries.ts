export type Locale = "en" | "ar";

export interface Dictionary {
  nav: {
    overview: string;
    docs: string;
    architecture: string;
    knowledge: string;
    changelog: string;
    community: string;
    searchPlaceholder: string;
    themeToggle: string;
    langToggle: string;
    github: string;
    nuget: string;
  };
  hero: {
    badge: string;
    titleStart: string;
    titleHighlight: string;
    titleEnd: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    installCommand: string;
  };
  pillars: {
    mediatorTitle: string;
    mediatorDesc: string;
    mapperTitle: string;
    mapperDesc: string;
    diagnosticsTitle: string;
    diagnosticsDesc: string;
    testingTitle: string;
    testingDesc: string;
  };
  footer: {
    tagline: string;
    licensedUnder: string;
    allRightsReserved: string;
    builtForDotNet: string;
  };
}

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    nav: {
      overview: "Overview",
      docs: "Documentation",
      architecture: "Architecture",
      knowledge: "Knowledge Base",
      changelog: "Changelog",
      community: "Community",
      searchPlaceholder: "Search docs, APIs, guides (Cmd+K)...",
      themeToggle: "Toggle Theme",
      langToggle: "العربية",
      github: "GitHub",
      nuget: "NuGet",
    },
    hero: {
      badge: "v2.3.0 Published · v2.4.0 In Development",
      titleStart: "Explicit application flow for",
      titleHighlight: ".NET",
      titleEnd: "engineered with clarity.",
      subtitle:
        "A modular, dependency-free family of .NET libraries for request dispatch, object projection, structured diagnostics, and predictable pipeline testing.",
      primaryCta: "Explore Documentation",
      secondaryCta: "View Architecture",
      installCommand: "dotnet add package AstraFlow.Mediator",
    },
    pillars: {
      mediatorTitle: "Mediator & Pipelines",
      mediatorDesc: "Predictable command/query dispatch, streaming channels, and modular pipeline behaviors.",
      mapperTitle: "Projections & Mappings",
      mapperDesc: "Type-safe compile-time source-generated mapping with expression tree projection support.",
      diagnosticsTitle: "Observability & OpenTelemetry",
      diagnosticsDesc: "ActivitySource tracing, redaction-safe telemetry, and structured diagnostic listeners.",
      testingTitle: "Testing Harness",
      testingDesc: "Predictable pipeline testing utilities, mock harnesses, and verification baselines.",
    },
    footer: {
      tagline: "AstraFlow — Declare intent. Execute predictably. Inspect with confidence.",
      licensedUnder: "Licensed under MIT License.",
      allRightsReserved: "AstraFlow Project · Built for netstandard2.0, .NET 8, .NET 9, and .NET 10 systems.",
      builtForDotNet: "Engineered Clarity for modern enterprise .NET.",
    },
  },
  ar: {
    nav: {
      overview: "نظرة عامة",
      docs: "التوثيق",
      architecture: "المعمارية",
      knowledge: "قاعدة المعرفة",
      changelog: "سجل التغييرات",
      community: "المجتمع",
      searchPlaceholder: "ابحث في التوثيق والمكتبات (Cmd+K)...",
      themeToggle: "تبديل المظهر",
      langToggle: "English",
      github: "غيت هاب",
      nuget: "نيوجت",
    },
    hero: {
      badge: "الإصدار 2.3.0 متاح · الإصدار 2.4.0 قيد التطوير",
      titleStart: "تدفق تطبيقي واضح ومحدد لمنظومة",
      titleHighlight: "دوت نت",
      titleEnd: "مصمم بأعلى معايير الدقة الهندسية.",
      subtitle:
        "حزمة مكتبات نموذجية خفيفة بدون تبعيات خارجية لمعالجة الطلبات والوسيط، الإسقاطات، التشخيص المهيكل، واختبار المسارات بكل موثوقية.",
      primaryCta: "استكشف التوثيق",
      secondaryCta: "المعمارية التقنية",
      installCommand: "dotnet add package AstraFlow.Mediator",
    },
    pillars: {
      mediatorTitle: "الوسيط ومسارات المعالجة",
      mediatorDesc: "توزيع الأوامر والاستعلامات التوقعي، مع قنوات البث وسلوكيات المسارات المعيارية.",
      mapperTitle: "الإسقاطات والتحويلات",
      mapperDesc: "تحويل كائنات آمن نوعياً مولّد أثناء التجميع مع دعم إسقاطات شجرة التعبيرات.",
      diagnosticsTitle: "القياس والتشخيص",
      diagnosticsDesc: "تتبع كامل عبر ActivitySource مع تنقيح البيانات الحساسة وسجلات التشخيص المهيكلة.",
      testingTitle: "أدوات الاختبار والتحقق",
      testingDesc: "حزم اختبار مسارات التدفق التوقعي، والمحاكاة المعيارية للتحقق من الأداء والسلوك.",
    },
    footer: {
      tagline: "أسترافلو — حدد الهدف، نفذ بثقة، وافحص بدقة مطلقة.",
      licensedUnder: "مرخص بموجب رخصة MIT.",
      allRightsReserved: "مشروع أسترافلو · مصمم لمنظومات netstandard2.0 و دوت نت 8 و 9 و 10.",
      builtForDotNet: "وضوح هندسي مصمم لتطبيقات دوت نت الحديثة.",
    },
  },
};
