-- Catalog indexes supporting the frontend's actual filters and ordering.
-- Safe to run repeatedly in Supabase SQL Editor. RLS remains enabled and no
-- policies or permissions are changed.

create extension if not exists pg_trgm;

create index if not exists mika_products_created_at_idx
  on public.mika_products (created_at desc);

create index if not exists mika_products_category_created_idx
  on public.mika_products (category_id, created_at desc);

create index if not exists mika_products_brand_created_idx
  on public.mika_products (brand_id, created_at desc);

create index if not exists mika_products_in_stock_created_idx
  on public.mika_products (in_stock, created_at desc);

create index if not exists mika_products_name_search_idx
  on public.mika_products using gin (name gin_trgm_ops);

create index if not exists mika_products_description_search_idx
  on public.mika_products using gin (description gin_trgm_ops);

create index if not exists mika_products_price_idx
  on public.mika_products (price);

-- Used by authenticated cart reads and mutations.
create index if not exists mika_cart_user_id_idx
  on public.mika_cart (user_id);
