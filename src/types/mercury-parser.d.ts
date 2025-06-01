declare module '@postlight/parser' {
  interface MercuryResult {
    title?: string;
    content?: string;
    author?: string;
    date_published?: string;
    lead_image_url?: string;
    dek?: string;
    next_page_url?: string;
    url?: string;
    domain?: string;
    excerpt?: string;
    word_count?: number;
    direction?: string;
    total_pages?: number;
    rendered_pages?: number;
  }

  interface MercuryOptions {
    headers?: Record<string, string>;
    html?: string;
    uri?: string;
  }

  function mercury(url: string, options?: MercuryOptions): Promise<MercuryResult | null>;
  
  export = mercury;
} 