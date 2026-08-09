export type Brand = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Product = {
  id: string;
  brand_id: string;
  category_id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  description: string | null;
  source_url: string | null;
  created_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  position: number;
  is_primary: boolean;
};

export type ProductWithRelations = Product & {
  brand: Brand;
  category: Category;
  product_images: ProductImage[];
};
