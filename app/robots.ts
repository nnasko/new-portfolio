import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/offline/', '/admin/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/offline/', '/admin/'],
        crawlDelay: 1,
      }
    ],
    sitemap: 'https://atanaskyurkchiev.info/sitemap.xml',
    host: 'https://atanaskyurkchiev.info',
  }
} 