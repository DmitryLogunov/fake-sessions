CREATE TABLE `roles` ( 
  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` VarChar( 255 ) NULL,
	`key` VarChar( 100 ) NULL,
	`description` VarChar( 255 ) NULL,
	`created_at` DateTime NULL DEFAULT CURRENT_TIMESTAMP,
	`created_by` Int( 11 ) NULL,
	`updated_at` DateTime NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_by` Int( 11 ) NULL,
	`source_table` VarChar( 255 )  NULL,
	`source_id` Int( 11 ) NULL
	)
;