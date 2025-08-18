import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web Developer Norwich | Professional Website Design Norfolk | Atanas Kyurkchiev',
  description: 'Professional web developer in Norwich offering website design, e-commerce development, and digital solutions for Norfolk businesses. Local expertise, face-to-face meetings, quick support. Serving Norwich, Norfolk, and East Anglia.',
  keywords: [
    'web developer norwich',
    'website design norwich', 
    'norwich web developer',
    'norwich website design',
    'web developer norfolk',
    'website developer norwich',
    'norwich web design',
    'freelance web developer norwich',
    'business websites norwich',
    'e-commerce development norwich',
    'local web developer norwich',
    'norfolk web development',
    'norwich business websites',
    'responsive web design norwich',
    'east anglia web developer'
  ],
  openGraph: {
    title: 'Web Developer Norwich | Professional Website Design Norfolk',
    description: 'Professional web developer in Norwich offering website design, e-commerce development, and digital solutions for Norfolk businesses. Local expertise with face-to-face meetings available.',
    url: 'https://atanaskyurkchiev.info/web-developer-norwich',
    type: 'website',
    locale: 'en_GB',
    images: [
      {
        url: 'https://atanaskyurkchiev.info/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Web Developer Norwich - Professional Website Design Norfolk'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web Developer Norwich | Professional Website Design Norfolk',
    description: 'Professional web developer in Norwich offering website design, e-commerce development, and digital solutions for Norfolk businesses.',
    images: ['https://atanaskyurkchiev.info/og-image.jpg']
  },
  alternates: {
    canonical: 'https://atanaskyurkchiev.info/web-developer-norwich'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
};

export default function WebDeveloperNorwichLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["LocalBusiness", "ProfessionalService"],
            "name": "Atanas Kyurkchiev - Web Developer Norwich",
            "description": "Professional web developer in Norwich offering website design, e-commerce development, and digital solutions for Norfolk businesses.",
            "url": "https://atanaskyurkchiev.info/web-developer-norwich", 
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Norwich",
              "addressRegion": "Norfolk",
              "addressCountry": "GB"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 52.6309,
              "longitude": 1.2974
            },
            "areaServed": [
              {
                "@type": "City",
                "name": "Norwich"
              },
              {
                "@type": "AdministrativeArea",
                "name": "Norfolk"
              },
              {
                "@type": "AdministrativeArea", 
                "name": "East Anglia"
              }
            ],
            "serviceType": [
              "Website Design Norwich",
              "Web Development Norfolk", 
              "E-commerce Development",
              "Business Website Development",
              "Local SEO Services"
            ],
            "priceRange": "£300-£8000",
            "paymentAccepted": ["Cash", "Credit Card", "Bank Transfer"],
            "currenciesAccepted": "GBP",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Web Development Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Business Website Development",
                    "description": "Professional websites for Norwich businesses"
                  },
                  "priceCurrency": "GBP",
                  "price": "500-800"
                },
                {
                  "@type": "Offer", 
                  "itemOffered": {
                    "@type": "Service",
                    "name": "E-commerce Development",
                    "description": "Online stores for Norfolk retailers"
                  },
                  "priceCurrency": "GBP",
                  "price": "800-1500"
                }
              ]
            }
          })
        }}
      />
    </>
  );
}
