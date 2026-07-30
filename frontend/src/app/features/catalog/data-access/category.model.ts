export interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
  icon?: string;
  description?: string;
  parent_id?: number | null;
  children?: Category[];
  products_count?: number;
}
