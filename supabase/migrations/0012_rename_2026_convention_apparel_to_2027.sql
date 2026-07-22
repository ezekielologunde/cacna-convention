-- The "convention" category apparel (T-Shirt, Polo) was still named for the
-- concluded 2026 convention even though 2027 is now the upcoming edition
-- (see convention_editions.status) -- stale year branding on live-for-sale
-- merchandise. Renaming in place rather than deactivating + re-inserting so
-- existing store_order_items rows tied to these product_ids (from real 2026
-- orders) keep reading correctly.
update store_products
  set name = replace(name, '2026', '2027')
  where category = 'convention' and name like '2026%';
