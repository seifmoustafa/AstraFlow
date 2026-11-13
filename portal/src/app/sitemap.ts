import type { MetadataRoute } from "next";
import { getAllDocs } from "@/lib/docs";
import { SITE_URL } from "@/lib/site-config";

const STATIC_ROUTES = [
  "",
  "/packages",
  "/docs",
  "/guides",
  "/changelog",
  "/community",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: route === "" || route === "/changelog" ? "weekly" : "monthly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  const docEntries: MetadataRoute.Sitemap = getAllDocs().map((doc) => ({
    url: `${SITE_URL}${doc.href}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...docEntries];
}
