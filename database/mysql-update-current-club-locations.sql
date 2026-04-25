-- Backfill locations for the current 2026 tournament clubs.
-- Run this once on existing MySQL databases (Railway, Timeweb) if city/country is empty.

UPDATE clubs SET country = 'Россия', city = 'Санкт-Петербург' WHERE slug = 'almaz-antey';
UPDATE clubs SET country = 'Беларусь', city = 'Минск' WHERE slug = 'dinamo-minsk';
UPDATE clubs SET country = 'Россия', city = 'Санкт-Петербург' WHERE slug = 'zenit';
UPDATE clubs SET country = 'Бразилия', city = 'Сан-Паулу' WHERE slug = 'palmeiras';
UPDATE clubs SET country = 'Мексика', city = 'Мехико' WHERE slug = 'cruz-azul';
UPDATE clubs SET country = 'Аргентина', city = 'Буэнос-Айрес' WHERE slug = 'san-lorenzo';
UPDATE clubs SET country = 'Турция', city = 'Стамбул' WHERE slug = 'fenerbahce';
UPDATE clubs SET country = 'Сербия', city = 'Белград' WHERE slug = 'crvena-zvezda';
