/*
# Create product-images storage bucket

1. Creates a public storage bucket `product-images` for product/category/banner images.
2. Sets a policy allowing anyone to read, and authenticated users to upload/update/delete.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "read_product_images_bucket" ON storage.objects;
CREATE POLICY "read_product_images_bucket" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "insert_product_images_bucket" ON storage.objects;
CREATE POLICY "insert_product_images_bucket" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "update_product_images_bucket" ON storage.objects;
CREATE POLICY "update_product_images_bucket" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "delete_product_images_bucket" ON storage.objects;
CREATE POLICY "delete_product_images_bucket" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'product-images');
