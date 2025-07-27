import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import { siteConfig } from "./metadata";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClientLayout } from "./components/ClientLayout";
import ClientGoogleAds from "./components/ClientGoogleAds";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["Person", "ProfessionalService"],
  name: siteConfig.author,
  url: siteConfig.url,
  jobTitle: "Web Developer & Digital Solutions Specialist",
  description: siteConfig.description,
  serviceType: [
    "Web Development",
    "Custom Web Applications",
    "E-commerce Development", 
    "Website Design",
    "Digital Solutions",
    "API Development"
  ],
  areaServed: "Worldwide",
  sameAs: [
    "https://github.com/nnasko",
    "https://www.linkedin.com/in/atanas-kyurkchiev-36a609291/",
  ],
  knowsAbout: [
    "Web Development",
    "Full Stack Development",
    "Next.js",
    "TypeScript",
    "React",
    "E-commerce Solutions",
    "API Development",
    "Business Websites"
  ],
  offers: {
    "@type": "Service",
    name: "Professional Web Development Services",
    description: "Custom web development solutions for businesses including websites, web applications, and e-commerce platforms"
  }
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.title,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@atanaskyurkchiev",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/alogo.png",
    shortcut: "/alogo.png",
    apple: "/alogo.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="canonical" href={siteConfig.url} />
        <meta name="theme-color" content="#171717" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${spaceGrotesk.variable} font-sans text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-900 transition-colors`}>
        <ClientLayout>{children}</ClientLayout>
        <ClientGoogleAds />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
