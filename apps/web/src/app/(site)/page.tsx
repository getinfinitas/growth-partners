import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Transform how you manage customer relationships. Infinitas combines powerful contact management, activity tracking, and Google Business Profile integration to help you grow your local presence and strengthen business connections.',
  openGraph: {
    title: 'Infinitas - Business Relationship Platform',
    description: 'Transform how you manage customer relationships with powerful contact management and Google Business Profile integration.',
  },
};

export default function HomePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Infinitas',
    applicationCategory: 'BusinessApplication',
    description: 'Transform how you manage customer relationships with powerful contact management, activity tracking, and Google Business Profile integration.',
    url: 'https://infinitas.app',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold tracking-tight'>Infinitas</h1>
        <p className='text-muted-foreground mt-2'>
          Streamline business relationships and unlock Google Business Profile potential
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>0</p>
            <p className='text-sm text-muted-foreground'>
              People and companies in your CRM
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>0</p>
            <p className='text-sm text-muted-foreground'>
              Real estate and locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>0</p>
            <p className='text-sm text-muted-foreground'>
              Recent communications and tasks
            </p>
          </CardContent>
        </Card>
      </div>
      </main>
    </>
  );
}
