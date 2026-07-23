export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  pincode: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  position: number;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  in_stock: boolean;
  unit: string;
  category_id: string | null;
  is_featured: boolean;
  offer_label: string | null;
  created_at: string;
  updated_at: string;
  product_images?: ProductImage[];
  category?: Category | null;
};

export type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  link: string | null;
  position: number;
  active: boolean;
  created_at: string;
};

export type Setting = {
  key: string;
  value: string | null;
  updated_at: string;
};

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type Order = {
  id: string;
  user_id: string;
  status: OrderStatus;
  total: number;
  shipping_address: string | null;
  city: string | null;
  pincode: string | null;
  phone: string | null;
  full_name: string | null;
  payment_method: string;
  created_at: string;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  created_at: string;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
};

export type WishlistItem = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
};
