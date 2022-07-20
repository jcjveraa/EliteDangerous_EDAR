DROP TABLE IF EXISTS `EDAR_state`;
CREATE TABLE IF NOT EXISTS `EDAR_state` (uuid TEXT, created_at INTEGER, last_seen INTEGER, PRIMARY KEY(`uuid`));
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE IF NOT EXISTS `sessions` (sid_hash TEXT, token_encrypted TEXT, expires INTEGER, PRIMARY KEY(`sid_hash`));
