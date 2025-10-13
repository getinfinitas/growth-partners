import { MetadataRoute } from 'next'

const baseUrl = 'https://getinfinitas.com' // Update with your actual domain

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date()

  return [
    // Public pages (indexed)
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Note: Private pages like /dashboard, /contacts are not included
    // They have noindex=true in SEO config
  ]
}