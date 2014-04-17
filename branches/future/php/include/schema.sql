DROP TABLE IF EXISTS admins, users, friends, tables, table_users, messages,
	tables, map_owners, pieces, tiles, walls, characters, character_owners;

/* TODO update this after the procedures are done */
DROP PROCEDURE IF EXISTS create_user;
DROP PROCEDURE IF EXISTS read_users;
DROP PROCEDURE IF EXISTS read_user;
DROP PROCEDURE IF EXISTS read_user_by_name;
DROP PROCEDURE IF EXISTS update_user_password;
DROP PROCEDURE IF EXISTS update_user;
DROP PROCEDURE IF EXISTS update_user_timestamp;
DROP PROCEDURE IF EXISTS delete_user;
DROP PROCEDURE IF EXISTS create_tiles;
DROP PROCEDURE IF EXISTS read_tiles;
DROP PROCEDURE IF EXISTS update_tile;
DROP PROCEDURE IF EXISTS update_tiles_fill_fog;
DROP PROCEDURE IF EXISTS update_tiles_clear_fog;
DROP PROCEDURE IF EXISTS create_table;
DROP PROCEDURE IF EXISTS read_table;
DROP PROCEDURE IF EXISTS read_table_by_name;
DROP PROCEDURE IF EXISTS read_tables;
DROP PROCEDURE IF EXISTS read_tables_by_user_id;
DROP PROCEDURE IF EXISTS read_table_timestamps;
DROP PROCEDURE IF EXISTS update_table;
DROP PROCEDURE IF EXISTS delete_table;
DROP PROCEDURE IF EXISTS create_piece;
DROP PROCEDURE IF EXISTS read_piece;
DROP PROCEDURE IF EXISTS read_pieces;
DROP PROCEDURE IF EXISTS update_piece;
DROP PROCEDURE IF EXISTS delete_piece;
DROP PROCEDURE IF EXISTS create_message;
DROP PROCEDURE IF EXISTS read_messages;
DROP PROCEDURE IF EXISTS expire_messages;
DROP PROCEDURE IF EXISTS create_image;
DROP PROCEDURE IF EXISTS read_image;
DROP PROCEDURE IF EXISTS read_images;
DROP PROCEDURE IF EXISTS read_images_useable;
DROP PROCEDURE IF EXISTS update_image;
DROP PROCEDURE IF EXISTS delete_image;
DROP PROCEDURE IF EXISTS set_stat;
DROP PROCEDURE IF EXISTS get_stats;
DROP PROCEDURE IF EXISTS delete_stat;
DROP PROCEDURE IF EXISTS create_wall;
DROP PROCEDURE IF EXISTS read_walls;
DROP PROCEDURE IF EXISTS delete_wall;

  /***************************************************************************/
 /******************************* T A B L E S *******************************/
/***************************************************************************/

/* ADMINS TABLE

	Passwords are hashed so evildoers who gain access to the database cannot see
	your password (finding another password with the same hash is very hard.)
	The random salt is combined with your password before hashing, so two admins
	with the same password will not have the same password hash. This also makes
	dictionary attacks harder: the attacker has to guess passwords for each admin
	separately because the admins have different salts.

	Admin name must be unique to identify the admin when logging in. The name
	field is VARCHAR(200) because MYSQL can only index finite length strings.
	TODO: do admins need an id or can we use their name as the primary key?
*/

CREATE TABLE admins (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(200) NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	password_salt TEXT NOT NULL,
);


/* USERS TABLE

	Passwords are hashed so evildoers who gain access to the database cannot see
	your password (finding another password with the same hash is very hard.)
	The random salt is combined with your password before hashing, so two users
	with the same password will not have the same password hash. This also makes
	dictionary attacks harder: the attacker has to guess passwords for each user
	separately because the users have different salts.

	Users.login_name must be unique to identify the user when logging in.
	It is VARCHAR(200) because MYSQL can only index finite length strings.
	Other references to the user (like cross-references between tables)
	use the auto-incrementing id.

	Users.name is the name displayed to other users. Unlike login_name it can
	be changed after creating the account and it does not have to be unique.

	The last action timestamp records the last time the user was actively using
	Live Tabletop, so it needs to be updated frequently. It allows us to remove
	inactive users and content created by inactive users.
*/

CREATE TABLE users (
	id INT AUTO_INCREMENT PRIMARY KEY,
	login_name VARCHAR(200) NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	password_salt TEXT NOT NULL,
	last_action TIMESTAMP,
	logged_in TINYINT NOT NULL DEFAULT 0,
	name TEXT,
	color TEXT,
	avatar INT,
	email TEXT,
	subscribed TINYINT NOT NULL DEFAULT 0
);

/* FRIENDS TABLE

	Each entry in this table is either a friend request from sender to recipient
	(both user ids) or sender's confirmation of a friend request from recipient.
*/

CREATE TABLE friends (
	sender INT NOT NULL,
	recipient INT NOT NULL,
	time TIMESTAMP, /* TODO: do we need this? */
	FOREIGN KEY (sender) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (recipient) REFERENCES users(id) ON DELETE CASCADE,
	PRIMARY KEY (sender, recipient)
}


/* TABLES TABLE

	Tables are virtual places where users can chat, edit tables and play games
	together. Each table roughly corresponds to a campaign being played by a
	group of players. The state of the table is saved between games.

	map: each table shows one map at a time
	private: anyone with the table’s permalink URL can join if this is 0
	turns: JSON array of turns (character ids?) in a sequence
*/

CREATE TABLE tables (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name TEXT,
	map INT,
	private TINYINT NOT NULL DEFAULT 1,
	turns TEXT,
	message_stamp DATETIME
);


/* TABLE_USERS TABLE

	unique relationships between tables and users.

	viewing: 1 if the user is currently online and viewing this table
	permission: one of four mutually exclusive states
		“owner”: can invite people to join the table, change the public/private
		   setting, invite members, change the map, edit the map and move any
		   piece the map.
		“member”: can join the table when it is not public
		“banned” (blacklisted): cannot see the table even if it is public
		null (guest): can only join the table when it is public
*/

CREATE TABLE table_users (
	user_id INT NOT NULL,
	table_id INT NOT NULL,
	permission TEXT,
	viewing TINYINT NOT NULL DEFAULT 0,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE,
	PRIMARY KEY (user_id, table_id)
);


/* MESSAGES TABLE

	Messages from users of this table, character dialog and die rolls.
	avatar: optional id of a character whose persona the user takes on.
	text: can contain die rolls wrapped and styled with HTML/CSS
*/

CREATE TABLE messages (
	id INT AUTO_INCREMENT PRIMARY KEY,
	table_id INT NOT NULL,
	user_id INT NOT NULL,
	avatar INT,
	text TEXT,
	time_stamp TIMESTAMP,
	FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


/* MAPS TABLE

	Maps are graphical things with pieces, background images and tiles.

	grid_style: width, color...?
	wall_style: width, color...? (TODO: also door style?)
	type: “hex” or “square”
	min/max zoom, rotate and tilt
	background: image id or URL (TODO: and settings?)
*/

CREATE TABLE tables (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name TEXT,
	type TEXT NOT NULL,
	tile_rows SMALLINT NOT NULL,
	tile_columns SMALLINT NOT NULL,
	background_id INT,
	background_url TEXT,
	min_zoom FLOAT NOT NULL DEFAULT 0.25,
	max_zoom FLOAT NOT NULL DEFAULT 4.0,
	min_rotate SMALLINT NOT NULL DEFAULT -180,
	max_rotate SMALLINT NOT NULL DEFAULT 180,
	min_tilt SMALLINT NOT NULL DEFAULT 0,
	max_tilt SMALLINT NOT NULL DEFAULT 90,
	grid_thickness TINYINT NOT NULL DEFAULT 1,
	wall_thickness TINYINT NOT NULL DEFAULT 3,
	door_thickness TINYINT NOT NULL DEFAULT 3, /* TODO: Is this needed? */
	grid_color: TEXT,
	wall_color: TEXT,
	door_color: TEXT,
	piece_stamp DATETIME,
	tile_stamp DATETIME
);


/* MAP_OWNERS TABLE

	Users who have permission to edit this map and it’s contents, including pieces.
*/

CREATE TABLE map_owners (
	user_id INT NOT NULL,
	map_id INT NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE,
	PRIMARY KEY (user_id, map_id)
);


/* PIECES TABLE

	map_id: every peice is part of a map
	image_id: piece image/class
	image_url: link to a piece image from another site
	x, y: center of the piece in square map units
	   if you use square tiles the center of tile 0, 0 is 0.5, 0.5
	x_center, y_center: center of the piece image in pixels
	   the middle bottom of a 100 x 100 image is 50, 100
	   this position is based on the unscaled image
	x_tiles, y_tiles: tile rows and columns occupied by this piece
	scale: decrease or increase the apparent size of the piece
	   100% scale shows the image at 1:1 image to screen pixel ratio
	   when viewing the map at 100% zoom/default scale
	character_id: an optional character associated with this piece
	markers: status icons with metadata attached to the piece
*/

CREATE TABLE pieces (
	id INT AUTO_INCREMENT PRIMARY KEY,
	map_id INT NOT NULL,
	image_id INT,
	image_url TEXT,
	name TEXT,
	x FLOAT NOT NULL DEFAULT 0,
	y FLOAT NOT NULL DEFAULT 0,
	x_center INT NOT NULL DEFAULT 0,
	y_center INT NOT NULL DEFAULT 0,
	x_tiles FLOAT NOT NULL DEFAULT 1,
	y_tiles FLOAT NOT NULL DEFAULT 1,
	scale FLOAT NOT NULL DEFAULT 1,
	character_id INT,
	markers TEXT, /* TODO: make this a table? */
	color TEXT, /* TODO: do we need this? */
	FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE
);

/* TILES TABLE

	Fog is 0 if there is no fog of war on this tile or 1 if there is fog of war
	on this tile. Right and bottom walls have the value 2 if there is a door on
	that side of the tile, 1 if there is a wall on that side of the tile and 0
	if there is neither a wall nor a door.
*/

CREATE TABLE tiles (
	map_id INT NOT NULL,
	x SMALLINT NOT NULL,
	y SMALLINT NOT NULL,
	image_id INT,
	fog TINYINT NOT NULL DEFAULT 0,
	FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE,
	PRIMARY KEY (map_id, x, y)
);


/* WALLS TABLE

	map_id: this map
	x: -1 .. the number of tile columns in this map
	y: -1 .. the number of tile rows in this map
	direction: "s" (bottom), "e" (right), "se" or "ne"
	contents: "wall" or "door"
*/

CREATE TABLE walls (
	map_id INT NOT NULL,
	x SMALLINT NOT NULL,
	y SMALLINT NOT NULL,
	direction VARCHAR(2) NOT NULL,
	contents TEXT NOT NULL,
	FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE,
	PRIMARY KEY (map_id, x, y, direction)
);


/* CHARACTERS TABLE

	Characters are a bridge between the social (table, users) and graphical (map, pieces.)
	They also contain game mechanics, which are neither entirely social nor entirely graphical,
	but lean toward social because die rolls are already part of table chat.

	name:
	system: game system to use if this character has stats
	stats: system specific JSON data
	notes: additional user-defined status effects? (like markers without icons)
	portrait: illustration (id or URL?)
	piece_image: default piece image/class (id or URL, what about centering, etc?)
*/

CREATE TABLE characters (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name TEXT,
	system TEXT,
	stats TEXT,
	notes TEXT,
	portrait_id INT,
	portrait_url TEXT,
	piece_image_id INT,
	piece_image_url TEXT,
	color TEXT
);

/* CHARACTER_OWNERS TABLE

	Users who have permission to edit this character, move pieces linked to this character,
	and link pieces to this character (if they also own the map containing the piece.)
*/

CREATE TABLE character_owners (
	user_id INT,
	character_id INT,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
	PRIMARY_KEY (user_id, character_id)
);


  /***************************************************************************/
 /*************************** P R O C E D U R E S ***************************/
/***************************************************************************/

/* ADMINS PROCEDRUES */

CREATE PROCEDURE create_admin
	(IN the_name VARCHAR(200), IN the_hash TEXT, IN the_salt TEXT)
BEGIN
	INSERT INTO admins (name, password_hash, password_salt)
		VALUES (the_name, the_hash, the_salt);
END;


/* USERS PROCEDURES */

/* User creates his own account. */
CREATE PROCEDURE create_user (IN the_login_name VARCHAR(200), IN the_hash TEXT,
	IN the_salt TEXT, IN the_email TEXT, IN the_subscribed TINYINT)
BEGIN
	INSERT INTO users (login_name, password_hash, password_salt, last_action, email, subscribed)
		VALUES (the_login_name, the_hash, the_salt, NOW(), the_email, the_subscribed);
END;

/* Admin views all of the users */
CREATE PROCEDURE read_users ()
BEGIN
	SELECT id, login_name, password_hash, password_salt,
		UNIX_TIMESTAMP(last_action) AS last_action,
		logged_in, name, color, avatar, e-mail, subscribed
		FROM users ORDER BY name, login_name, id;
END;

/* Business Logic tier needs user info to
	 - check the user's password
	 - show the user his own account info
	 - show the user info about other users
	Hide last action and password hash/salt from all users
	Hide e-mail and subscribed from other users
*/
CREATE PROCEDURE read_user (IN the_user INT)
BEGIN
	SELECT id, login_name, password_hash, password_salt,
		UNIX_TIMESTAMP(last_action) AS last_action,
		logged_in, name, color, avatar, email, subscribed    
		FROM users WHERE id = the_user;
END;

/* FIXME: do not need?
CREATE PROCEDURE read_user_by_name (IN the_name VARCHAR(200))
BEGIN
	SELECT id, login_name, password_hash, password_salt,
		UNIX_TIMESTAMP(last_action) AS last_action,
		logged_in, name, color, avatar, email, subscribed    
		FROM users WHERE LOWER(name) = LOWER(the_name);
END;
*/

/* The user changes his password */
CREATE PROCEDURE update_user_password
	(IN the_user INT, IN the_hash TEXT, IN the_salt TEXT)
BEGIN
	UPDATE users SET password_hash = the_hash, password_salt = the_salt,
		last_action = NOW()
		WHERE id = the_user;
END;

/* The user updates his account information */
CREATE PROCEDURE update_user (IN the_user INT, IN the_name VARCHAR(200),
	IN the_color TEXT, IN the_avatar INT, IN the_email TEXT,
	IN the_subscribed TINYINT)
BEGIN
	UPDATE users SET name = the_name, color = the_color, avatar = the_avatar,
		email = the_email, subscribed = the_subscribed, last_action = NOW()
		WHERE id = the_user;
END;

/* The user sent a message or changed something */
CREATE PROCEDURE update_user_timestamp (IN the_user INT)
BEGIN
	UPDATE users SET last_action = NOW() WHERE id = the_user;
END;

CREATE PROCEDURE delete_user (IN the_user INT)
BEGIN
	START TRANSACTION;
	DELETE FROM users WHERE id = the_user;
	DELETE FROM tables WHERE table_id NOT IN (
		SELECT table_id FROM table_users WHERE permission = "owner");
	DELETE FROM maps WHERE map_id NOT IN (
		SELECT map_id FROM map_owners);
	DELETE FROM characters WHERE character_id NOT IN (
		SELECT character_id FROM character_owners);
/*
handled by ON DELETE CASCADE when you delete the user:
	DELETE FROM friends WHERE sender = the_user OR recipient = the_user;
	DELETE FROM table_users WHERE user_id = the_user;
	DELETE FROM messages WHERE user_id = the_user;
	DELETE FROM map_owners WHERE user_id = the_user;
handled by ON DELETE CASCADE when you delete the table:
	DELETE FROM messages WHERE table_id NOT IN (SELECT id FROM tables);
handled by ON DELETE CASCADE when you delete the map:
	DELETE FROM pieces WHERE map_id NOT IN (SELECT id FROM maps);
	DELETE FROM tiles WHERE map_id NOT IN (SELECT id FROM maps);
	DELETE FROM walls WHERE table_id NOT IN (SELECT id FROM maps);
*/
	COMMIT;
END;


/* FRIENDS PROCEDURES */

CREATE PROCEDURE create_friend (IN the_sender INT, IN the_recipient INT)
BEGIN
	INSERT INTO friends (sender, recipient) VALUES (the_sender, the_recipient);
END;

CREATE PROCEDURE delete_friend (IN the_sender INT, IN the_recipient INT)
BEGIN
	DELETE FROM friends WHERE sender = the_sender AND recipient = the_recipient;
END;


/* TILES PROCEDURES */

CREATE PROCEDURE create_tiles (IN the_table INT, IN the_image INT,
	IN the_width SMALLINT, IN the_height SMALLINT)
BEGIN
	DECLARE loop_row INT;
	DECLARE loop_column INT;
	START TRANSACTION;
	SET loop_row = 0;
	WHILE loop_row < the_height DO
		SET loop_column = 0;
		WHILE loop_column < the_width DO
			INSERT INTO tiles (x, y, image_id, table_id)
				VALUES (loop_column, loop_row, the_image, the_table);
			SET loop_column = loop_column + 1;
		END WHILE;
		SET loop_row = loop_row + 1;
	END WHILE;
	COMMIT;
END;

CREATE PROCEDURE read_tiles (IN the_table INT)
BEGIN
	SELECT image_id, fog FROM tiles WHERE table_id = the_table
		ORDER BY y, x ASC;
END;

CREATE PROCEDURE update_tile (IN the_table INT, IN the_x SMALLINT,
	IN the_y SMALLINT, IN the_image INT, IN the_fog TINYINT)
BEGIN
	START TRANSACTION;
	UPDATE tiles SET image_id = the_image, fog = the_fog
		WHERE x = the_x AND y = the_y AND table_id = the_table;
	UPDATE tables SET tile_stamp = NOW() WHERE id = the_table;
	COMMIT;
END;

CREATE PROCEDURE update_tiles_fill_fog (IN the_table INT)
BEGIN
	START TRANSACTION;
	UPDATE tiles SET fog = 1 WHERE table_id = the_table;
	UPDATE tables SET tile_stamp = NOW() WHERE id = the_table;
	COMMIT;
END;

CREATE PROCEDURE update_tiles_clear_fog (IN the_table INT)
BEGIN
	START TRANSACTION;
	UPDATE tiles SET fog = 0 WHERE table_id = the_table;
	UPDATE tables SET tile_stamp = NOW() WHERE id = the_table;
	COMMIT;
END;



/* TABLES PROCEDURES */

CREATE PROCEDURE create_table (IN the_name VARCHAR(200), IN the_image INT,
	IN the_user INT, IN the_rows SMALLINT, IN the_columns SMALLINT,
	IN the_width INT, IN the_height INT,
	IN the_grid_thickness INT, IN the_grid_color TEXT,
	IN the_wall_thickness INT, IN the_wall_color TEXT,
	IN the_tile_mode TEXT)
BEGIN
	INSERT INTO tables (name, image_id, user_id, tile_rows, tile_columns,
		tile_width, tile_height,
		grid_thickness, grid_color, wall_thickness, wall_color,
		tile_stamp, message_stamp, piece_stamp,
		tile_mode)
	VALUES (the_name, the_image, the_user, the_rows, the_columns,
		the_width, the_height,
		the_grid_thickness, the_grid_color, the_wall_thickness, the_wall_color,
		NOW(), NOW(), NOW(),
		the_tile_mode);
END;

CREATE PROCEDURE read_table (IN the_table INT)
BEGIN
	SELECT id, user_id, image_id, name,
		tile_rows, tile_columns, tile_width, tile_height,
		grid_thickness, grid_color, wall_thickness, wall_color,
		UNIX_TIMESTAMP(piece_stamp) AS piece_stamp,
		UNIX_TIMESTAMP(tile_stamp) AS tile_stamp,
		UNIX_TIMESTAMP(message_stamp) AS message_stamp,
		tile_mode
 FROM tables WHERE id = the_table;
END;

CREATE PROCEDURE read_table_by_name (IN the_name VARCHAR(200))
BEGIN
	SELECT id, user_id, image_id, name,
		tile_rows, tile_columns, tile_width, tile_height,
		grid_thickness, grid_color, wall_thickness, wall_color,
		UNIX_TIMESTAMP(piece_stamp) AS piece_stamp,
		UNIX_TIMESTAMP(tile_stamp) AS tile_stamp,
		UNIX_TIMESTAMP(message_stamp) AS message_stamp,
		tile_mode
	FROM tables WHERE name = the_name;
END;

CREATE PROCEDURE read_tables ()
BEGIN
	SELECT id, user_id, image_id, name,
		tile_rows, tile_columns, tile_width, tile_height,
		grid_thickness, grid_color, wall_thickness, wall_color,
		UNIX_TIMESTAMP(piece_stamp) AS piece_stamp,
		UNIX_TIMESTAMP(tile_stamp) AS tile_stamp,
		UNIX_TIMESTAMP(message_stamp) AS message_stamp,
		tile_mode
	FROM tables ORDER BY name;
END;

CREATE PROCEDURE read_tables_by_user_id (IN the_user INT)
BEGIN
	SELECT id, user_id, image_id, name,
		tile_rows, tile_columns, tile_width, tile_height,
		grid_thickness, grid_color, wall_thickness, wall_color,
		UNIX_TIMESTAMP(piece_stamp) AS piece_stamp,
		UNIX_TIMESTAMP(tile_stamp) AS tile_stamp,
		UNIX_TIMESTAMP(message_stamp) AS message_stamp,
		tile_mode
	FROM tables WHERE user_id = the_user ORDER BY name;
END;

CREATE PROCEDURE read_table_timestamps (IN the_table INT)
BEGIN
	SELECT UNIX_TIMESTAMP(piece_stamp) AS piece_stamp,
			   UNIX_TIMESTAMP(tile_stamp) AS tile_stamp,
			   UNIX_TIMESTAMP(message_stamp) AS message_stamp
	FROM tables WHERE table_id = the_table;
END;

CREATE PROCEDURE update_table (IN the_table INT, IN the_name VARCHAR(200),
	IN the_user INT, IN the_image INT,
	IN the_tile_width INT, IN the_tile_height INT,
	IN the_grid_thickness INT, IN the_grid_color TEXT,
	IN the_wall_thickness INT, IN the_wall_color TEXT,
	IN the_tile_mode TEXT)
BEGIN
	UPDATE tables SET name = the_name, user_id = the_user, image_id = the_image,
		tile_width = the_tile_width, tile_height = the_tile_height,
		grid_thickness = the_grid_thickness, grid_color = the_grid_color,
		wall_thickness = the_wall_thickness, wall_color = the_wall_color,
		tile_mode = the_tile_mode
	WHERE id = the_table;
END;

CREATE PROCEDURE delete_table (IN the_table INT)
BEGIN
	START TRANSACTION;
	DELETE FROM stats WHERE piece_id IN (
		SELECT id FROM pieces WHERE table_id = the_table);
	DELETE FROM pieces WHERE table_id = the_table;
	DELETE FROM walls WHERE table_id = the_table;
	DELETE FROM messages WHERE table_id = the_table;
	DELETE FROM tables WHERE id = the_table;
	COMMIT;
END;



/* PIECE PROCEDURES */

CREATE PROCEDURE create_piece (IN the_table INT, IN the_image INT,
	IN the_user INT, IN the_name TEXT, IN the_x INT, IN the_y INT,
	IN the_x_offset INT, IN the_y_offset INT, IN the_width SMALLINT,
	IN the_height SMALLINT)
BEGIN
	START TRANSACTION;
	INSERT INTO pieces (table_id, image_id, user_id, name, x, y,
			x_offset, y_offset, width, height)
		VALUES (the_table, the_image, the_user, the_name, the_x, the_y,
			the_x_offset, the_y_offset, the_width, the_height);
	UPDATE tables SET piece_stamp = NOW() WHERE id = the_table;
	COMMIT;
END;

CREATE PROCEDURE read_piece (IN the_piece INT)
BEGIN
	SELECT * FROM pieces WHERE id = the_piece;
END;

CREATE PROCEDURE read_pieces (IN the_table INT)
BEGIN
	SELECT * FROM pieces WHERE table_id = the_table ORDER BY name, user_id;
END;

CREATE PROCEDURE update_piece (IN the_piece INT, IN the_image INT,
	IN the_user INT, IN the_name TEXT, IN the_x INT, IN the_y INT,
	IN the_x_offset INT, IN the_y_offset INT,
	IN the_width SMALLINT, IN the_height SMALLINT, IN the_color TEXT)
BEGIN
	START TRANSACTION;
	UPDATE pieces SET image_id = the_image, user_id = the_user, name = the_name,
			x = the_x, y = the_y, x_offset = the_x_offset, y_offset = the_y_offset,
			width = the_width, height = the_height, color = the_color
		WHERE id = the_piece;
	UPDATE tables SET piece_stamp = NOW() WHERE id = (
		SELECT table_id FROM pieces WHERE id = the_piece);
	COMMIT;
END;

CREATE PROCEDURE delete_piece (IN the_piece INT)
BEGIN
	START TRANSACTION;
	UPDATE tables SET piece_stamp = NOW() WHERE id = (
		SELECT table_id FROM pieces WHERE id = the_piece);
	DELETE FROM pieces WHERE id = the_piece;
	COMMIT;
END;


/* MESSAGES PROCEDURES */

CREATE PROCEDURE create_message (IN the_table INT, IN the_user INT, IN the_text TEXT)
BEGIN
	START TRANSACTION;
	INSERT INTO messages (table_id, user_id, text) VALUES (the_table, the_user, the_text);
	UPDATE tables SET message_stamp = NOW() WHERE id = the_table;
	COMMIT;
END;

CREATE PROCEDURE read_messages (IN the_table INT, IN the_id INT)
BEGIN
	SELECT id, table_id, user_id, text, UNIX_TIMESTAMP(time_stamp) AS time
		FROM messages WHERE table_id = the_table AND id > the_id ORDER BY id ASC;
END;

CREATE PROCEDURE expire_messages ()
BEGIN
	DELETE FROM messages WHERE time_stamp < DATE_SUB(NOW(), INTERVAL 6 HOUR);
END;


/* IMAGES PROCEDURES */

CREATE PROCEDURE create_image (IN the_user INT, IN the_file TEXT,
	IN the_type TEXT, IN the_public TINYINT,
	IN the_width INT, IN the_height INT,
	IN the_tile_width INT, IN the_tile_height INT,
	IN the_center_x INT, IN the_center_y INT,
	IN the_tile_mode TEXT, IN the_layer INT)
BEGIN
	INSERT INTO images (user_id, file, type, public, width, height,
		tile_width, tile_height, center_x, center_y, tile_mode, layer)
	VALUES (the_user, the_file, the_type, the_public, the_width, the_height,
		the_tile_width, the_tile_height, the_center_x, the_center_y,
		the_tile_mode, the_layer);
END;

CREATE PROCEDURE read_image (IN the_image INT)
BEGIN
	SELECT id, user_id, file, type, public, UNIX_TIMESTAMP(time_stamp) AS time,
		width, height, tile_width, tile_height, center_x, center_y, tile_mode, layer
	FROM images WHERE id = the_image;
END;

CREATE PROCEDURE read_images (IN the_type TEXT)
BEGIN
	SELECT id, user_id, file, type, public, UNIX_TIMESTAMP(time_stamp) AS time,
		width, height, tile_width, tile_height, center_x, center_y, tile_mode, layer
	FROM images WHERE type = the_type;
END;

CREATE PROCEDURE read_images_useable (IN the_user INT, IN the_type TEXT)
BEGIN
	SELECT id, user_id, file, type, public, UNIX_TIMESTAMP(time_stamp) AS time,
		width, height, tile_width, tile_height, center_x, center_y, tile_mode, layer
	FROM images WHERE type = the_type AND (user_id = the_user OR public = 1);
END;

CREATE PROCEDURE update_image (IN the_image INT, IN the_user INT,
	IN the_public INT, IN the_tile_width INT, IN the_tile_height INT,
	IN the_center_x INT, IN the_center_y INT, IN the_tile_mode TEXT,
	IN the_layer INT)
BEGIN
	UPDATE images SET user_id = the_user, public = the_public,
		tile_width = the_tile_width, tile_height = the_tile_height,
		center_x = the_center_x, center_y = the_center_y,
		tile_mode = the_tile_mode, layer = the_layer
	WHERE id = the_image;
END;

CREATE PROCEDURE delete_image (IN the_image INT)
BEGIN
	DELETE FROM images WHERE id = the_image;
END;


/* STATS PROCEDURES */

CREATE PROCEDURE set_stat (IN the_piece INT, IN the_name VARCHAR(200), IN the_value TEXT)
BEGIN
	REPLACE INTO stats (piece_id, name, value) VALUES (the_piece, the_name, the_value);
	UPDATE tables SET piece_stamp = NOW() WHERE id = (
		SELECT table_id FROM pieces WHERE id = the_piece
	);
END;

CREATE PROCEDURE get_stats (IN the_piece INT)
BEGIN
	SELECT * FROM stats WHERE piece_id = the_piece;
END;

CREATE PROCEDURE delete_stat (IN the_piece INT, IN the_name VARCHAR(200))
BEGIN
	DELETE FROM stats WHERE piece_id = the_piece AND name = the_name;
	UPDATE tables SET piece_stamp = NOW() WHERE id = (
		SELECT table_id FROM pieces WHERE id = the_piece
	);
END;

/* WALLS PROCEDURES */

CREATE PROCEDURE create_wall (IN the_table INT, IN the_x SMALLINT,
	IN the_y SMALLINT, IN the_direction VARCHAR(2), IN the_contents TEXT)
BEGIN
	REPLACE INTO walls (table_id, x, y, direction, contents)
	VALUES (the_table, the_x, the_y, the_direction, the_contents);
END;

CREATE PROCEDURE read_walls (IN the_table INT)
BEGIN
	SELECT * FROM walls WHERE table_id = the_table;
END;

CREATE PROCEDURE delete_wall (IN the_table INT, IN the_x SMALLINT,
	IN the_y SMALLINT, IN the_direction VARCHAR(2))
BEGIN
	DELETE FROM walls WHERE table_id = the_table AND x = the_x
		AND y = the_y AND direction = the_direction;
END;


