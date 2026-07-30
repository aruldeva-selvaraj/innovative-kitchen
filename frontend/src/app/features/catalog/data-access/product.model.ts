export interface Product {
  id: number;
  name: string;
  slug: string;
  sku?: string;
  thumbnail: string;
  images: string[];
  price: number;
  original_price?: number;
  short_description?: string;
  description?: string;
  is_new?: boolean;
  in_stock: boolean;
  stock_qty?: number;
  category_id: number;
  brand_id?: number;
  category?: { id: number; name: string; slug: string };
  brand?: { id: number; name: string; slug: string; logo?: string };
  specs?: Record<string, string>;
  tags?: string[];
  rating?: number;
  review_count?: number;
  created_at?: string;
}

export interface ProductFilters {
  category?: string;
  brand?: string | string[];
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  q?: string;
  page?: number;
  per_page?: number;
}

export interface PaginatedProducts {
  data: Product[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
