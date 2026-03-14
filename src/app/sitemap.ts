import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600; // 1 hour

import { getSiteUrl } from "@/lib/utils";
 
const siteUrl = getSiteUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/battles`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/emcees`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/search`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/random`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  try {
    const supabase = await createClient();

    const [battlesRes, emceesRes] = await Promise.all([
      supabase.from("battles").select("id").neq("status", "excluded"),
      supabase.from("emcees").select("id"),
    ]);

    const battleRoutes: MetadataRoute.Sitemap =
      battlesRes.data?.map((battle) => ({
        url: `${siteUrl}/battle/${battle.id}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      })) ?? [];

    const emceeRoutes: MetadataRoute.Sitemap =
      emceesRes.data?.map((emcee) => ({
        url: `${siteUrl}/emcees/${emcee.id}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.5,
      })) ?? [];

    return [...staticRoutes, ...battleRoutes, ...emceeRoutes];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return staticRoutes;
  }
}
