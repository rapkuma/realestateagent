import { NewsArticle, RealEstateListing, FAQPage, BreadcrumbList, WithContext } from 'schema-dts';

export function generateNewsArticleJsonLd(
  title: string,
  slug: string,
  publishedAt: string,
  authorName: string = '부동산 청약 알리미'
): WithContext<NewsArticle> {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    datePublished: publishedAt,
    dateModified: publishedAt,
    author: [
      {
        '@type': 'Person',
        name: authorName,
      },
    ],
    url: `https://your-domain.com/archive/${slug}`,
  };
}

export function generateRealEstateListingJsonLd(
  name: string,
  address: string,
  price: string
): WithContext<RealEstateListing> {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: name,
    about: {
      '@type': 'Place',
      address: address,
    },
    offers: {
      '@type': 'Offer',
      price: price,
      priceCurrency: 'KRW',
    },
  };
}

export function generateFAQPageJsonLd(faqs: { question: string; answer: string }[]): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateBreadcrumbListJsonLd(
  items: { name: string; url: string }[]
): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
