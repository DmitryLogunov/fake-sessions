CREATE TABLE IF NOT EXISTS `test_table` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
  `info` TEXT,
  `created_at` DateTime DEFAULT CURRENT_TIMESTAMP, 
  `created_by` Int( 11 ) NULL, 
  `updated_at` DateTime DEFAULT CURRENT_TIMESTAMP, 
  `updated_by` Int( 11 ) NULL);

INSERT INTO `test_table` (`info`, `created_at`, `updated_at`) VALUES ( 'test1', '2019-05-01 12:00:00', '2019-05-01 11:00:00');
INSERT INTO `test_table` (`info`, `created_at`, `updated_at`) VALUES ( 'test2', '2019-05-01 12:00:00', '2019-05-01 12:00:00');
INSERT INTO `test_table` (`info`, `created_at`, `updated_at`) VALUES ( 'test3', '2019-05-01 12:00:00', '2019-05-01 13:00:00');
INSERT INTO `test_table` (`info`, `created_at`, `updated_at`) VALUES ( 'test4', '2019-05-01 12:00:00', '2019-05-01 14:00:00');