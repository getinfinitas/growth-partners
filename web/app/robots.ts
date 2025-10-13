import { MetadataRoute } from 'next'

const baseUrl = 'https://getinfinitas.com' // Update with your actual domain

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/contacts/',
          '/properties/',
          '/activities/',
          '/sentry-example-page/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}