export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://fitmeet.app").replace(/\/$/, "");

export const siteRoutes = [
  {
    path: "/",
    priority: 1,
    changeFrequency: "weekly",
  },
  {
    path: "/product",
    priority: 0.92,
    changeFrequency: "weekly",
  },
  {
    path: "/scenes",
    priority: 0.9,
    changeFrequency: "weekly",
  },
  {
    path: "/community",
    priority: 0.88,
    changeFrequency: "weekly",
  },
  {
    path: "/safety",
    priority: 0.86,
    changeFrequency: "monthly",
  },
  {
    path: "/about",
    priority: 0.76,
    changeFrequency: "monthly",
  },
  {
    path: "/journal",
    priority: 0.82,
    changeFrequency: "weekly",
  },
  {
    path: "/contact",
    priority: 0.74,
    changeFrequency: "monthly",
  },
  {
    path: "/privacy",
    priority: 0.72,
    changeFrequency: "monthly",
  },
  {
    path: "/terms",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    path: "/cookies",
    priority: 0.66,
    changeFrequency: "monthly",
  },
  {
    path: "/thank-you",
    priority: 0.4,
    changeFrequency: "yearly",
  },
  {
    path: "/not-found",
    priority: 0.2,
    changeFrequency: "yearly",
  },
] as const;

export function absoluteUrl(path: string) {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: "FitMeet",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "FitMeet Social World - 一句想法，变成一次真实到场",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/twitter-image"],
    },
  };
}
