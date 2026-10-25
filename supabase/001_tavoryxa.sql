-- Tavoryxa only. Root applies to the approved NEW shared Supabase project.
begin;
create schema if not exists tavoryxa_private;
revoke all on schema tavoryxa_private from public, anon;
grant usage on schema tavoryxa_private to authenticated;

create table public.tavoryxa_products (
 id text primary key, price_cents integer not null check(price_cents>0),
 name_ar text not null, name_en text not null
);
insert into public.tavoryxa_products values
('notebook',2900,'دفتر البدايات','The daily notebook'),('tray',3900,'صينية التفاصيل','The catch-all tray'),
('pen',1200,'قلم الفكرة','The everyday pen'),('calendar',2900,'تقويم على مهل','The slow calendar'),
('cup',3500,'حامل الأقلام','The pencil vessel'),('clips',900,'مشابك صغيرة','The brass clips'),
('mat',5900,'بساط التركيز','The focus mat'),('notes',1900,'أوراق عابرة','The little notes');
alter table public.tavoryxa_products enable row level security;
revoke all on public.tavoryxa_products from anon, authenticated;
grant select on public.tavoryxa_products to anon, authenticated;
create policy catalogue_read on public.tavoryxa_products for select to anon, authenticated using(true);

create table public.tavoryxa_orders (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 display_name text not null check(char_length(display_name) between 2 and 80),
 items jsonb not null,
 subtotal_cents integer not null check(subtotal_cents>0),
 delivery_cents integer not null check(delivery_cents in(0,1800)),
 total_cents integer not null check(total_cents=subtotal_cents+delivery_cents),
 status text not null default 'simulated' check(status='simulated')
);
create index tavoryxa_orders_owner_created on public.tavoryxa_orders(user_id,created_at desc);
alter table public.tavoryxa_orders enable row level security;
revoke all on public.tavoryxa_orders from anon, authenticated;
grant select on public.tavoryxa_orders to authenticated;
create policy own_orders on public.tavoryxa_orders for select to authenticated using((select auth.uid())=user_id);

-- The privileged writer is in a non-exposed schema, has fixed search_path,
-- checks auth.uid(), and takes no caller-supplied price/status/user ID.
create function tavoryxa_private.create_order(p_items jsonb,p_name text,p_request_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_owner uuid:=auth.uid(); v_item jsonb; v_product public.tavoryxa_products%rowtype;
 v_lines jsonb:='[]'::jsonb; v_subtotal integer:=0; v_delivery integer;
 v_quantity integer; v_ids text[]:='{}'; v_result jsonb;
begin
 if v_owner is null then raise exception 'Authentication required'; end if;
 if p_request_id is null then raise exception 'Request ID required'; end if;
 select to_jsonb(o) into v_result from public.tavoryxa_orders o where o.id=p_request_id and o.user_id=v_owner;
 if v_result is not null then return v_result; end if;
 if p_name is null or char_length(trim(p_name)) not between 2 and 80 then raise exception 'Invalid display name'; end if;
 if p_items is null or jsonb_typeof(p_items)<>'array' then raise exception 'Invalid cart'; end if;
 if jsonb_array_length(p_items) not between 1 and 8 then raise exception 'Cart must contain 1 to 8 unique products'; end if;
 for v_item in select value from jsonb_array_elements(p_items) loop
   if jsonb_typeof(v_item)<>'object' or jsonb_typeof(v_item->'quantity')<>'number'
      or (v_item->>'quantity')!~'^[0-9]{1,2}$' then raise exception 'Invalid quantity'; end if;
   v_quantity:=(v_item->>'quantity')::integer;
   if v_quantity not between 1 and 20 then raise exception 'Invalid quantity'; end if;
   if (v_item->>'id')=any(v_ids) then raise exception 'Duplicate product'; end if;
   select * into v_product from public.tavoryxa_products where id=v_item->>'id';
   if not found then raise exception 'Unknown product'; end if;
   v_ids:=array_append(v_ids,v_product.id);
   v_subtotal:=v_subtotal+v_product.price_cents*v_quantity;
   v_lines:=v_lines||jsonb_build_array(jsonb_build_object('id',v_product.id,'quantity',v_quantity,'unit_price',v_product.price_cents));
 end loop;
 v_delivery:=case when v_subtotal>=20000 then 0 else 1800 end;
 insert into public.tavoryxa_orders(id,user_id,display_name,items,subtotal_cents,delivery_cents,total_cents)
 values(p_request_id,v_owner,trim(p_name),v_lines,v_subtotal,v_delivery,v_subtotal+v_delivery)
 on conflict(id) do nothing;
 select to_jsonb(o) into v_result from public.tavoryxa_orders o where o.id=p_request_id and o.user_id=v_owner;
 if v_result is null then raise exception 'Request conflict'; end if;
 return v_result;
end;
$$;
revoke all on function tavoryxa_private.create_order(jsonb,text,uuid) from public, anon;
grant execute on function tavoryxa_private.create_order(jsonb,text,uuid) to authenticated;
create function public.tavoryxa_create_order(p_items jsonb,p_name text,p_request_id uuid)
returns jsonb language sql security invoker set search_path='' as $$
 select tavoryxa_private.create_order(p_items,p_name,p_request_id);
$$;
revoke all on function public.tavoryxa_create_order(jsonb,text,uuid) from public, anon;
grant execute on function public.tavoryxa_create_order(jsonb,text,uuid) to authenticated;
commit;
