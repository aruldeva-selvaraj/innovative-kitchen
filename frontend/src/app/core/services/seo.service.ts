import { Injectable, inject, DOCUMENT } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  canonical?: string;
  jsonLd?: object | object[];
  noIndex?: boolean;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

const UAE_CITIES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly titleSvc = inject(Title);
  private readonly doc = inject(DOCUMENT);

  // ── Single source of truth: all contact info from environment ──
  readonly SITE      = environment.businessName;
  readonly BASE_URL  = environment.siteUrl;
  readonly phone     = environment.phone;
  readonly displayPhone = environment.displayPhone;
  readonly email     = environment.email;

  readonly DEFAULT_IMAGE    = `${environment.siteUrl}/assets/og-image.jpg`;
  readonly DEFAULT_KEYWORDS = `${environment.businessName} UAE, commercial kitchen equipment UAE, kitchen equipment Dubai, restaurant equipment UAE, hotel kitchen equipment Abu Dhabi, catering equipment Sharjah, commercial kitchen supplier, kitchen installation UAE, kitchen AMC UAE, professional kitchen appliances UAE`;

  /** Returns a WhatsApp deep-link using the number from environment. */
  whatsappUrl(message = ''): string {
    const q = message ? `?text=${encodeURIComponent(message)}` : '';
    return `https://wa.me/${environment.whatsappNumber}${q}`;
  }

  /** tel: href using the phone from environment. */
  get telHref(): string { return `tel:${environment.phone}`; }

  /** mailto: href using the email from environment. */
  get mailHref(): string { return `mailto:${environment.email}`; }

  // ── Main per-route SEO setter ──
  set(cfg: SeoConfig): void {
    const fullTitle = cfg.title.includes(this.SITE)
      ? cfg.title
      : `${cfg.title} | ${this.SITE}`;

    // Auto-append contact details so Google snippets show phone & email
    const hasContact = cfg.description.includes(environment.phone)
      || cfg.description.includes(environment.displayPhone)
      || cfg.description.includes(environment.email);
    const description = hasContact
      ? cfg.description
      : `${cfg.description} Call ${environment.displayPhone} | ${environment.email}`;

    const canonical = cfg.canonical
      ?? (this.BASE_URL + this.doc.location.pathname.replace(/\/$/, '') || `${this.BASE_URL}/`);
    const image    = cfg.image ?? this.DEFAULT_IMAGE;
    const keywords = cfg.keywords ?? this.DEFAULT_KEYWORDS;

    this.titleSvc.setTitle(fullTitle);

    this.upsert('name', 'description', description);
    this.upsert('name', 'keywords',    keywords);
    this.upsert('name', 'robots', cfg.noIndex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1');

    this.upsert('property', 'og:title',       fullTitle);
    this.upsert('property', 'og:description', description);
    this.upsert('property', 'og:image',       image);
    this.upsert('property', 'og:image:alt',   cfg.title);
    this.upsert('property', 'og:type',        cfg.type ?? 'website');
    this.upsert('property', 'og:url',         canonical);
    this.upsert('property', 'og:site_name',   this.SITE);
    this.upsert('property', 'og:locale',      'en_AE');

    this.upsert('name', 'twitter:card',        'summary_large_image');
    this.upsert('name', 'twitter:title',       fullTitle);
    this.upsert('name', 'twitter:description', description);
    this.upsert('name', 'twitter:image',       image);

    this.setCanonical(canonical);

    this.clearJsonLd();
    const schemas: object[] = [];
    if (cfg.breadcrumbs?.length) schemas.push(this.buildBreadcrumb(cfg.breadcrumbs));
    if (cfg.jsonLd) {
      const extra = Array.isArray(cfg.jsonLd) ? cfg.jsonLd : [cfg.jsonLd];
      schemas.push(...extra);
    }
    schemas.forEach(s => this.appendJsonLd(s));
  }

  /** Call once from AppComponent to inject the base Organization + LocalBusiness schema. */
  injectBaseSchema(): void {
    // Remove any previous base schema
    this.doc.head.querySelectorAll('script[type="application/ld+json"][data-base]')
      .forEach(s => s.remove());

    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${this.BASE_URL}/#organization`,
          name: environment.businessName,
          url: this.BASE_URL,
          logo: {
            '@type': 'ImageObject',
            url: `${this.BASE_URL}/assets/logo.png`,
            width: 200,
            height: 60,
          },
          email: environment.email,
          contactPoint: [
            {
              '@type': 'ContactPoint',
              telephone: environment.phone,
              contactType: 'sales',
              areaServed: 'AE',
              availableLanguage: ['English', 'Arabic'],
            },
            {
              '@type': 'ContactPoint',
              telephone: environment.phone,
              contactType: 'customer service',
              areaServed: 'AE',
            },
          ],
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'AE',
            addressLocality: 'Dubai',
            addressRegion: 'Dubai',
          },
          sameAs: [`https://wa.me/${environment.whatsappNumber}`],
        },
        {
          '@type': 'LocalBusiness',
          '@id': `${this.BASE_URL}/#localbusiness`,
          name: environment.businessName,
          image: this.DEFAULT_IMAGE,
          url: this.BASE_URL,
          telephone: environment.phone,
          email: environment.email,
          priceRange: '$$',
          currenciesAccepted: 'AED',
          paymentAccepted: 'Credit Card, Bank Transfer, Cash on Delivery',
          description: `Leading commercial kitchen equipment supplier in UAE offering complete kitchen solutions — supply, installation, and annual maintenance contracts (AMC) for restaurants, hotels, cafes, and catering businesses across all UAE emirates.`,
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'AE',
            addressLocality: 'Dubai',
            addressRegion: 'Dubai',
          },
          geo: { '@type': 'GeoCoordinates', latitude: 25.2048, longitude: 55.2708 },
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Sunday'],
              opens: '09:00',
              closes: '18:00',
            },
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: 'Saturday',
              opens: '10:00',
              closes: '15:00',
            },
          ],
          areaServed: UAE_CITIES.map(name => ({ '@type': 'City', name })),
          hasMap: 'https://maps.google.com/?q=Innovative+Kitchen+Dubai+UAE',
          knowsAbout: [
            'Commercial Kitchen Equipment',
            'Restaurant Equipment UAE',
            'Hotel Kitchen Equipment',
            'Catering Equipment',
            'Kitchen Installation UAE',
            'Annual Maintenance Contract Kitchen UAE',
          ],
        },
        {
          '@type': 'WebSite',
          '@id': `${this.BASE_URL}/#website`,
          url: this.BASE_URL,
          name: environment.businessName,
          description: 'UAE commercial kitchen equipment supplier – supply, installation & AMC',
          publisher: { '@id': `${this.BASE_URL}/#organization` },
          inLanguage: 'en-AE',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${this.BASE_URL}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        },
      ],
    };

    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-base', 'true');
    script.text = JSON.stringify(schema);
    this.doc.head.appendChild(script);
  }

  buildProduct(p: {
    name: string; description: string; sku: string;
    price: number; image: string; slug: string;
    brand?: string; inStock: boolean;
  }): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      description: p.description,
      sku: p.sku,
      image: [p.image],
      brand: p.brand ? { '@type': 'Brand', name: p.brand } : undefined,
      offers: {
        '@type': 'Offer',
        url: `${this.BASE_URL}/shop/product/${p.slug}`,
        priceCurrency: 'AED',
        price: p.price,
        priceValidUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        itemCondition: 'https://schema.org/NewCondition',
        availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: environment.businessName },
      },
    };
  }

  private buildBreadcrumb(items: Array<{ name: string; url: string }>): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: this.BASE_URL },
        ...items.map((b, i) => ({
          '@type': 'ListItem',
          position: i + 2,
          name: b.name,
          item: this.BASE_URL + b.url,
        })),
      ],
    };
  }

  private upsert(attr: 'name' | 'property', key: string, content: string): void {
    const tag: MetaDefinition = attr === 'name' ? { name: key, content } : { property: key, content };
    if (this.doc.head.querySelector(`meta[${attr}="${key}"]`)) {
      this.meta.updateTag(tag);
    } else {
      this.meta.addTag(tag);
    }
  }

  private setCanonical(url: string): void {
    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.rel = 'canonical';
      this.doc.head.appendChild(link);
    }
    link.href = url;
  }

  private clearJsonLd(): void {
    this.doc.head.querySelectorAll('script[type="application/ld+json"][data-dynamic]')
      .forEach(s => s.remove());
  }

  private appendJsonLd(schema: object): void {
    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-dynamic', 'true');
    script.text = JSON.stringify(schema);
    this.doc.head.appendChild(script);
  }
}
