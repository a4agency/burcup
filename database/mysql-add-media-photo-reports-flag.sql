-- Apply this to an existing MySQL/Timeweb database.
-- It adds a global toggle for the "Фоторепортажи" section.

ALTER TABLE tournaments
  ADD COLUMN photo_reports_enabled TINYINT(1) NOT NULL DEFAULT 1 AFTER countdown_enabled;

UPDATE tournaments
SET photo_reports_enabled = 1
WHERE photo_reports_enabled IS NULL;

INSERT INTO schema_migrations (version, name)
VALUES ('0013', 'add_media_photo_reports_flag')
ON DUPLICATE KEY UPDATE
  name = VALUES(name);
