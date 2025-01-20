import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "atanas kyurkchiev | software dev",
  description:
    "full-stack developer specializing in modern web applications. let's build something amazing together.",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "atanas kyurkchiev | software dev",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://atanaskyurkchiev.info",
    title: "atanas kyurkchiev | software dev",
    description:
      "full-stack developer specializing in modern web applications. let's build something amazing together.",
    images: [
      {
        url: "https://atanaskyurkchiev.info/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "atanas kyurkchiev | software dev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "atanas kyurkchiev | software dev",
    description:
      "full-stack developer specializing in modern web applications. let's build something amazing together.",
    images: ["https://atanaskyurkchiev.info/og-image.jpg"],
  },
};

export const siteConfig = {
  title: "atanas kyurkchiev | software dev",
  description: "full-stack software dev focused on creating intuitive and efficient applications. specializing in next.js, typescript, and modern web development.",
  url: "https://atanaskyurkchiev.info",
  author: "atanas kyurkchiev",
  ogImage: "https://atanaskyurkchiev.info/og-image.jpg",
  keywords: [
    "software developer",
    "web development",
    "full stack",
    "next.js",
    "typescript",
    "react",
    "portfolio",
    "atanas kyurkchiev",
  ],
};

export const projectMetadata = {
  surplush: {
    title: "surplush | sustainable business supplies platform",
    description: "a next.js-powered marketplace revolutionizing how businesses source their essential supplies with a focus on sustainability and cost-effectiveness.",
  },
  kronos: {
    title: "kronos clothing | modern e-commerce platform",
    description: "a custom-built e-commerce store for uk streetwear, combining high-performance technology with sleek design for an exceptional shopping experience.",
  },
  jacked: {
    title: "jacked fitness | professional training platform",
    description: "a modern platform showcasing professional training services with tiered pricing, subscription capabilities, and an intuitive interface for fitness content delivery.",
  },
}; 