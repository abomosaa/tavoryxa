-- 2026-10-25: user-authorized affordable illustrative prices, in halalas.
-- Changes ONLY the canonical catalogue. Saved order snapshots keep their original amounts.
begin;
do $$
begin
  if (select count(*) from public.tavoryxa_products where id in
      ('notebook','tray','pen','calendar','cup','clips','mat','notes')) <> 8 then
    raise exception 'Expected all eight catalogue products; no prices changed';
  end if;
end $$;
update public.tavoryxa_products p set price_cents = v.price_cents
from (values ('notebook',2900),('tray',3900),('pen',1200),('calendar',2900),
             ('cup',3500),('clips',900),('mat',5900),('notes',1900)) as v(id,price_cents)
where p.id = v.id;
commit;
