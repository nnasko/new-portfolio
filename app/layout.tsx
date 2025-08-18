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
  "@type": ["Person", "ProfessionalService", "LocalBusiness"],
  name: siteConfig.author,
  alternateName: ["Atanas Kyurkchiev", "Atanas K", "Web Developer Norwich"],
  url: siteConfig.url,
  jobTitle: "Web Developer & Digital Solutions Specialist",
  description: siteConfig.description,
  familyName: "Kyurkchiev",
  givenName: "Atanas",
  serviceType: [
    "Web Development",
    "Website Design", 
    "Custom Web Applications",
    "E-commerce Development",
    "Digital Solutions",
    "API Development",
    "Responsive Web Design",
    "Business Website Development"
  ],
  areaServed: [
    {
      "@type": "City",
      "name": "Norwich",
      "containedInPlace": {
        "@type": "AdministrativeArea",
        "name": "Norfolk"
      }
    },
    {
      "@type": "AdministrativeArea", 
      "name": "Norfolk"
    },
    {
      "@type": "AdministrativeArea",
      "name": "East Anglia"
    },
    "United Kingdom"
  ],
  address: {
    "@type": "PostalAddress",
    "addressLocality": "Norwich",
    "addressRegion": "Norfolk", 
    "addressCountry": "GB"
  },
  geo: {
    "@type": "GeoCoordinates",
    "latitude": 52.6309,
    "longitude": 1.2974
  },
  sameAs: [
    "https://github.com/nnasko",
    "https://www.linkedin.com/in/atanas-kyurkchiev-36a609291/",
  ],
  knowsAbout: [
    "Web Development Norwich",
    "Website Design Norwich",
    "Full Stack Development",
    "Next.js",
    "TypeScript", 
    "React",
    "E-commerce Solutions",
    "API Development",
    "Business Websites",
    "Local Business Websites",
    "Norwich Web Development",
    "Norfolk Web Design"
  ],
  offers: [
    {
      "@type": "Service",
      name: "Website Design Norwich",
      description: "Professional website design services for Norwich businesses, including responsive design and modern web development",
      areaServed: "Norwich, Norfolk"
    },
    {
      "@type": "Service", 
      name: "E-commerce Development",
      description: "Custom e-commerce solutions for Norwich businesses to sell products online",
      areaServed: "Norwich, Norfolk"
    },
    {
      "@type": "Service",
      name: "Business Website Development", 
      description: "Custom business websites for Norwich companies to generate leads and grow online",
      areaServed: "Norwich, Norfolk"
    }
  ],
  memberOf: {
    "@type": "Organization",
    name: "Kyurkchiev Group",
    description: "Digital solutions company specializing in web development and business automation",
    address: {
      "@type": "PostalAddress",
      "addressLocality": "Norwich",
      "addressRegion": "Norfolk",
      "addressCountry": "GB"
    }
  },
  priceRange: "£300-£8000",
  paymentAccepted: ["Cash", "Credit Card", "Bank Transfer"],
  currenciesAccepted: "GBP"
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
  verification: {
    google: process.env.GOOGLE_VERIFICATION_CODE,
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
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
        <meta name="description" content={siteConfig.description} />
        <meta name="theme-color" content="#171717" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/alogo.png" />
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
