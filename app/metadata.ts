import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "web developer norwich | website design norwich | atanas kyurkchiev",
  description:
    "professional web developer in norwich offering website design, e-commerce development, and digital solutions for norwich businesses. custom websites that drive results. serving norfolk, uk.",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "atanas kyurkchiev | web developer",
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
    locale: "en_GB",
    url: "https://atanaskyurkchiev.info",
    title: "web developer norwich | website design norwich | atanas kyurkchiev",
    description:
      "professional web developer in norwich offering website design, e-commerce development, and digital solutions for norwich businesses. custom websites that drive results. serving norfolk, uk.",
    images: [
      {
        url: "https://atanaskyurkchiev.info/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "atanas kyurkchiev | web developer & digital solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "web developer norwich | website design norwich | atanas kyurkchiev",
    description:
      "professional web developer in norwich offering website design, e-commerce development, and digital solutions for norwich businesses. custom websites that drive results. serving norfolk, uk.",
    images: ["https://atanaskyurkchiev.info/og-image.jpg"],
  },
};

export const siteConfig = {
  title: "atanas kyurkchiev | web developer & digital solutions",
  description: "professional web developer creating modern, high-performance websites and web applications. custom solutions, e-commerce development, and digital transformation that drive real business results.",
  url: "https://atanaskyurkchiev.info",
  author: "atanas kyurkchiev",
  ogImage: "https://atanaskyurkchiev.info/og-image.jpg",
  keywords: [
    "web developer norwich",
    "website design norwich", 
    "norwich web developer",
    "norwich website design",
    "web developer norfolk",
    "website developer norwich",
    "norwich web design",
    "freelance web developer norwich",
    "business websites norwich",
    "e-commerce development norwich",
    "custom web applications norwich",
    "digital solutions norwich",
    "web development services norwich",
    "professional web development norfolk",
    "local web developer norwich",
    "next.js developer norwich",
    "react developer norwich",
    "uk web developer",
    "east anglia web developer",
    "atanas kyurkchiev",
    "norwich business websites",
    "norfolk web development",
    "responsive web design norwich",
    "small business websites norwich",
    "startup websites norwich"
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