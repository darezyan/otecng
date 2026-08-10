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

export type OrderStatus = "pending" | "paid" | "failed" | "abandoned";

export type Order = {
  id: string;
  status: OrderStatus;
  paystack_reference: string;
  total: number;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  paid_at: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  qty: number;
};
