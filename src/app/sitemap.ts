import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://your-domain.com';

  const { data: newsletters } = await supabase
    .from('newsletters')
    .select('*')
    .order('created_at', { ascending: false });

  const newsletterUrls =
    newsletters?.map((newsletter) => ({
      url: `${baseUrl}/archive/${newsletter.slug || newsletter.id}`,
      lastModified: new Date(newsletter.published_at || newsletter.created_at),
      changeFrequency: 'never' as const,
      priority: 0.8,
    })) || [];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/archive`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...newsletterUrls,
  ];
}
