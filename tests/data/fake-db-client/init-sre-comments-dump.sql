CREATE TABLE `comments` ( 
	`id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	`account_id` Int( 11 ) NOT NULL,
	`context_resource` Int( 11 ) NOT NULL,
	`context_id` Int( 11 ) NOT NULL,
	`comment_type` Int( 11 ) NOT NULL,
	`text` Text NOT NULL,
	`created_at` DateTime NULL DEFAULT CURRENT_TIMESTAMP,
	`created_by` Int( 11 ) NULL,
	`updated_at` DateTime NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_by` Int( 11 ) NULL,
	`source_table` VarChar( 255 ) NULL,
	`source_id` Int( 11 ) NULL
	)
;
