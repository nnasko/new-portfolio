import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Atanas Kyurkchiev | Web Developer & Digital Solutions',
  description: 'Learn about Atanas Kyurkchiev, a professional web developer based in Norwich, Norfolk. Specializing in modern web development, e-commerce solutions, and digital transformation for businesses.',
  keywords: [
    'Atanas Kyurkchiev',
    'web developer',
    'about atanas',
    'norwich web developer',
    'professional web developer',
    'digital solutions specialist',
    'react developer',
    'next.js developer',
    'typescript developer',
    'uk web developer'
  ],
  openGraph: {
    title: 'About Atanas Kyurkchiev | Web Developer & Digital Solutions',
    description: 'Learn about Atanas Kyurkchiev, a professional web developer based in Norwich, Norfolk. Specializing in modern web development and digital solutions.',
    url: 'https://atanaskyurkchiev.info/about',
    type: 'profile',
    images: [
      {
        url: 'https://atanaskyurkchiev.info/me.png',
        width: 400,
        height: 400,
        alt: 'Atanas Kyurkchiev - Web Developer'
      }
    ]
  },
  twitter: {
    card: 'summary',
    title: 'About Atanas Kyurkchiev | Web Developer',
    description: 'Professional web developer based in Norwich, Norfolk. Specializing in modern web development and digital solutions.',
    images: ['https://atanaskyurkchiev.info/me.png']
  },
  alternates: {
    canonical: 'https://atanaskyurkchiev.info/about'
  }
};

export default function AboutLayout({
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
            "@type": "Person",
            "name": "Atanas Kyurkchiev",
            "jobTitle": "Web Developer & Digital Solutions Specialist",
            "description": "Professional web developer based in Norwich, Norfolk, specializing in modern web development, e-commerce solutions, and digital transformation for businesses.",
            "url": "https://atanaskyurkchiev.info/about",
            "image": "https://atanaskyurkchiev.info/me.png",
            "sameAs": [
              "https://github.com/nnasko",
              "https://www.linkedin.com/in/atanas-kyurkchiev-36a609291/"
            ],
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Norwich",
              "addressRegion": "Norfolk",
              "addressCountry": "GB"
            },
            "knowsAbout": [
              "Web Development",
              "React",
              "Next.js",
              "TypeScript",
              "JavaScript",
              "E-commerce Development",
              "Digital Solutions",
              "Business Websites"
            ],
            "hasOccupation": {
              "@type": "Occupation",
              "name": "Web Developer",
              "occupationLocation": {
                "@type": "City",
                "name": "Norwich"
              }
            }
          })
        }}
      />
    </>
  );
}
