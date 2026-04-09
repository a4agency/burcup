CREATE TABLE IF NOT EXISTS news_article_photos (
  id BIGSERIAL PRIMARY KEY,
  news_article_id BIGINT NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_article_photos_article
ON news_article_photos(news_article_id, sort_order, id);
