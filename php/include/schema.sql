/* we remove tables in bottom-up order to avoid foreign key issues */
DROP TABLE IF EXISTS character_owners, characters, walls, tiles, pieces,
    map_owners, maps, messages, table_users, tables, friends, users, admins;

DROP PROCEDURE IF EXISTS create_admin;
DROP PROCEDURE IF EXISTS read_admin;
DROP PROCEDURE IF EXISTS update_admin_password;

DROP PROCEDURE IF EXISTS create_user;
DROP PROCEDURE IF EXISTS read_user_login;
DROP PROCEDURE IF EXISTS read_user;
DROP PROCEDURE IF EXISTS read_users;
DROP PROCEDURE IF EXISTS update_user_password;
DROP PROCEDURE IF EXISTS update_user;
DROP PROCEDURE IF EXISTS update_user_timestamp;
DROP PROCEDURE IF EXISTS delete_user;

DROP PROCEDURE IF EXISTS create_friend;
DROP PROCEDURE IF EXISTS read_friends;
DROP PROCEDURE IF EXISTS read_friends_recieved;
DROP PROCEDURE IF EXISTS read_friends_requested;
DROP PROCEDURE IF EXISTS read_friends_confirmed;
DROP PROCEDURE IF EXISTS delete_friend;

DROP PROCEDURE IF EXISTS create_table;
DROP PROCEDURE IF EXISTS read_table;
DROP PROCEDURE IF EXISTS read_tables;
DROP PROCEDURE IF EXISTS update_table;
DROP PROCEDURE IF EXISTS delete_table;
DROP PROCEDURE IF EXISTS read_table_users;
DROP PROCEDURE IF EXISTS read_table_user_tables;
DROP PROCEDURE IF EXISTS update_table_users_permission;
DROP PROCEDURE IF EXISTS update_table_users_arrive;
DROP PROCEDURE IF EXISTS update_table_users_leave;
DROP PROCEDURE IF EXISTS update_table_users_avatar;

DROP PROCEDURE IF EXISTS create_message;
DROP PROCEDURE IF EXISTS read_messages;
DROP PROCEDURE IF EXISTS delete_messages_expired;

DROP PROCEDURE IF EXISTS create_map;
DROP PROCEDURE IF EXISTS read_maps;
DROP PROCEDURE IF EXISTS read_map;
DROP PROCEDURE IF EXISTS update_map;
DROP PROCEDURE IF EXISTS create_map_owner;
DROP PROCEDURE IF EXISTS read_map_owners;
DROP PROCEDURE IF EXISTS delete_map_owner;

DROP PROCEDURE IF EXISTS create_piece;
DROP PROCEDURE IF EXISTS read_pieces;
DROP PROCEDURE IF EXISTS update_piece;
DROP PROCEDURE IF EXISTS delete_piece;

DROP PROCEDURE IF EXISTS read_tiles;
DROP PROCEDURE IF EXISTS update_tile;
DROP PROCEDURE IF EXISTS update_tiles_fill_fog;
DROP PROCEDURE IF EXISTS update_tiles_clear_fog;

DROP PROCEDURE IF EXISTS create_wall;
DROP PROCEDURE IF EXISTS read_walls;
DROP PROCEDURE IF EXISTS delete_wall;

DROP PROCEDURE IF EXISTS create_character;
DROP PROCEDURE IF EXISTS read_characters;
DROP PROCEDURE IF EXISTS create_character_owner;
DROP PROCEDURE IF EXISTS read_character_owners;
DROP PROCEDURE IF EXISTS delete_character_owner;

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

	login: admin login name, must be unique
	hash: hashed password, visible to PHP logic but not HTTP requests
	salt: random password salt, visible to PHP logic but not HTTP requests
*/

CREATE TABLE admins (
	id INT AUTO_INCREMENT PRIMARY KEY,
	login VARCHAR(200) NOT NULL UNIQUE,
	hash TEXT NOT NULL,
	salt TEXT NOT NULL
);


/* USERS TABLE

	Passwords are hashed so evildoers who gain access to the database can't see
	your password (finding another password with the same hash is very hard.)
	The random salt is combined with your password before hashing, so two users
	with the same password will not have the same password hash. This also 
	makes dictionary attacks harder: the attacker has to guess passwords
	for each user separately because the users have different salts.

	login: user login name, must be unique, visible to everyone, unchangeable
		It is VARCHAR(200) because MYSQL can only index finite length strings.
		Other references to the user (like cross-references between tables)
		use the auto-incrementing id.
	hash: hashed password, visible to PHP logic but not HTTP requests
	salt: random password salt, visible to PHP logic but not HTTP requests
	last_action: indicates whether the user has been active recently
	logged_in: 0 if the user has logged out since his last login
	name: preferred form of address, not unique, can be changed at any time
	color: ???
	email: the user's e-mail address for contact and password reset
	subscribed: 1 if the user wants to receive Live Tabletop announcements
*/

CREATE TABLE users (
	id INT AUTO_INCREMENT PRIMARY KEY,
	login VARCHAR(200) NOT NULL UNIQUE,
	hash TEXT NOT NULL,
	salt TEXT NOT NULL,
	last_action TIMESTAMP,
	logged_in TINYINT NOT NULL DEFAULT 0,
	name TEXT,
	color TEXT,
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
);


/* TABLES TABLE

	Tables are virtual places where users can chat, edit tables and play games
	together. Each table roughly corresponds to a campaign being played by a
	group of players. The state of the table is saved between games.

	map: each table shows one map at a time
	private: anyone with the table’s permalink URL can join if this is 0
	turns: JSON array of turns (character ids?) in a sequence
	last_message: id of last new message
	users modified: time of last change to this table's list of users
*/

CREATE TABLE tables (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name TEXT,
	map INT,
	private TINYINT NOT NULL DEFAULT 1,
	turns TEXT NOT NULL, /* DEFAULT '[]' */
	last_message INT,
	users_modified DATETIME
);


/* TABLE_USERS TABLE

	unique relationships between tables and users.

	name: the name of the table, duplicated here so we only need this table
		to populate and frequently refresh the user's Tables list
	permission: one of four mutually exclusive states
		“owner”: can invite people to join the table, change the public/private
		   setting, invite members, change the map, edit the map and move any
		   piece the map.
		“member”: can join the table when it is not public
		“banned” (blacklisted): cannot see the table even if it is public
		NULL (guest): can only join the table when it is public
	viewing: 1 if the user is currently online and viewing this table
	avatar: the user is speaking as this character at this table
*/

CREATE TABLE table_users (
	user_id INT NOT NULL,
	table_id INT NOT NULL,
	name TEXT,
	permission TEXT,
	viewing TINYINT NOT NULL DEFAULT 0,
	avatar INT,
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

CREATE TABLE maps (
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
	grid_color TEXT,
	wall_thickness TINYINT NOT NULL DEFAULT 3,
	wall_color TEXT,
	door_thickness TINYINT NOT NULL DEFAULT 3, /* TODO: Is this needed? */
	door_color TEXT,
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
	markers TEXT NOT NULL, /* DEFAULT '[]' TODO: make this a table? */
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
	PRIMARY KEY (user_id, character_id)
);


  /***************************************************************************/
 /*************************** P R O C E D U R E S ***************************/
/***************************************************************************/

DELIMITER //

/*** ADMINS PROCEDURES ***/

/* Admin creates an account while installing Live Tabletop
or Admin creates an account for another admin. */ 
CREATE PROCEDURE create_admin
	(IN the_login VARCHAR(200), IN the_hash TEXT, IN the_salt TEXT)
BEGIN
	START TRANSACTION;
	INSERT INTO admins (login, hash, salt)
		VALUES (the_login, the_hash, the_salt);
	SELECT LAST_INSERT_ID() as id;
	COMMIT;
END//

/* Admin logs in and PHP logic validates his password  */
CREATE PROCEDURE read_admin (IN the_login VARCHAR(200))
BEGIN
	SELECT id, hash, salt FROM admins WHERE login = the_login;
END//

/* Admin changes his password
or Admin changes another admin's password? */
CREATE PROCEDURE update_admin_password
	(IN the_admin INT, IN the_hash TEXT, IN the_salt TEXT)
BEGIN
	UPDATE admins SET hash = the_hash, salt = the_salt WHERE id = the_admin;
END//


/*** USERS PROCEDURES ***/

/* User creates his own account. */
CREATE PROCEDURE create_user (IN the_login VARCHAR(200), IN the_hash TEXT,
	IN the_salt TEXT, IN the_email TEXT, IN the_subscribed TINYINT)
BEGIN
	START TRANSACTION;
	INSERT INTO users (login, hash, salt, last_action, email, subscribed)
		VALUES 
			(the_login, the_hash, the_salt, NOW(), the_email, the_subscribed);
	SELECT LAST_INSERT_ID() as id;
	COMMIT;
END//

/* User logs in and PHP logic validates his password */
CREATE PROCEDURE read_user_login (IN the_login VARCHAR(200))
BEGIN
	SELECT id, login, hash, salt, UNIX_TIMESTAMP(last_action) AS last_action,
		logged_in, name, color, e-mail, subscribed
		FROM users WHERE login = the_login;
END//

/* User views his own account info
or User views another user's id, login, logged_in, name and color */
CREATE PROCEDURE read_user (IN the_user INT)
BEGIN
	SELECT id, login, logged_in, name, color, e-mail, subscribed
		FROM users WHERE id = the_user;
END//

/* Admin views all users */
CREATE PROCEDURE read_users ()
BEGIN
	SELECT id, login, hash, salt, UNIX_TIMESTAMP(last_action) AS last_action,
		logged_in, name, color, e-mail, subscribed
		FROM users ORDER BY name, login, id;
END//

/* User changes his password
or Admin resets his password */
CREATE PROCEDURE update_user_password
	(IN the_user INT, IN the_hash TEXT, IN the_salt TEXT)
BEGIN
	UPDATE users SET hash = the_hash, salt = the_salt, last_action = NOW()
	WHERE id = the_user;
END//

/* User updates his account information */
CREATE PROCEDURE update_user (IN the_user INT, IN the_name VARCHAR(200),
	IN the_color TEXT, IN the_email TEXT, IN the_subscribed TINYINT)
BEGIN
	UPDATE users SET name = the_name, color = the_color, last_action = NOW(),
		email = the_email, subscribed = the_subscribed WHERE id = the_user;
END//

/* User sent a message or changed something */
CREATE PROCEDURE update_user_timestamp (IN the_user INT)
BEGIN
	UPDATE users SET last_action = NOW() WHERE id = the_user;
END//

/* User deletes his own account?
or Admin deletes a user account */
CREATE PROCEDURE delete_user (IN the_user INT)
BEGIN
	START TRANSACTION;
/* delete the user */
	DELETE FROM users WHERE id = the_user;
/* delete tables without owners */
	DELETE FROM tables WHERE id NOT IN 
		(SELECT table_id FROM table_users WHERE permission = "owner");
/* delete maps without owners */
	DELETE FROM maps WHERE id NOT IN
		(SELECT map_id FROM map_owners);
/* delete maps without owners */
	DELETE FROM characters WHERE id NOT IN
		(SELECT character_id FROM character_owners);
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
	DELETE FROM walls WHERE map_id NOT IN (SELECT id FROM maps);
*/
	COMMIT;
END//


/*** FRIENDS PROCEDURES ***/

/* User sends a friend request
or User confirms a friend request */
CREATE PROCEDURE create_friend (IN the_sender INT, IN the_recipient INT)
BEGIN
	REPLACE INTO friends (sender, recipient)
		VALUES (the_sender, the_recipient);
END//

/* Admin views all friend requests sent and received by the user */
CREATE PROCEDURE read_friends (IN the_user INT)
BEGIN
	SELECT sender, recipient, UNIX_TIMESTAMP(time) AS time
	FROM friends WHERE sender = the_user OR recipient = the_user;
END//

/* User sees the friend requests he has recieved */
CREATE PROCEDURE read_friends_recieved (IN the_user INT)
BEGIN
	SELECT sender FROM friends WHERE recipient = the_user ORDER BY time;
END//

/* User sees the friend requests he has sent */
CREATE PROCEDURE read_friends_requested (IN the_user INT)
BEGIN
	SELECT recipient FROM friends WHERE sender = the_user ORDER BY time;
END//

/* User views his list of confirmed friends */
CREATE PROCEDURE read_friends_confirmed (IN the_user INT)
BEGIN
	SELECT a.recipient AS user_id FROM friends a, friends b
		WHERE a.sender = the_user
		AND a.sender = b.recipient AND b.sender = a.recipient;
END//

/* User stops being friends with the recipient
or User cancels a friend request */
CREATE PROCEDURE delete_friend (IN the_sender INT, IN the_recipient INT)
BEGIN
	DELETE FROM friends WHERE sender = the_sender AND recipient = the_recipient;
END//


/*** TABLES PROCEDURES ***/

/* User creates a new table. */
CREATE PROCEDURE create_table
	(IN the_user INT, IN the_name VARCHAR(200), IN the_map INT)
BEGIN
	DECLARE new_table_id INT;
	START TRANSACTION;
/* create the table */
	INSERT INTO tables (name, map, users_modified)
		VALUES (the_name, the_map, NOW());
	SET new_table_id = LAST_INSERT_ID();
/* make the user an owner */
	INSERT INTO table_users (user_id, table_id, permission)
		VALUES (the_user, new_table_id, 'owner');
/* return the new table's id */
	SELECT new_table_id AS id;
	COMMIT;
END//

/* User loads a table
or User polls for new messages and changes to the users list */
CREATE PROCEDURE read_table (IN the_table INT)
BEGIN
	SELECT id, name, map, private, turns, last_message,
		UNIX_TIMESTAMP(users_modified) AS users_modified
		FROM tables WHERE id = the_table;
END//

/* Admin views all the tables. */
CREATE PROCEDURE read_tables ()
BEGIN
	SELECT id, name, map, private, turns, last_message,
		UNIX_TIMESTAMP(users_modified) AS users_modified
		FROM tables ORDER BY name, id;
END//

/* User renames the table
or User toggles the table's private/public setting
or User changes the initiative list (turns) */
CREATE PROCEDURE update_table (IN the_table INT, IN the_name VARCHAR(200),
	IN the_private TINYINT, IN the_turns TEXT)
BEGIN
	UPDATE tables SET name = the_name, private = the_private, turns = the_turns
		WHERE id = the_table;
END//

/* Admin deletes the table */
CREATE PROCEDURE delete_table (IN the_table INT)
BEGIN
	DELETE FROM tables WHERE id = the_table;
END//


/*** TABLE_USERS PROCEDURES ***/

/* User views the owners, members, viewers and blacklist of this table */
CREATE PROCEDURE read_table_users (IN the_table INT)
BEGIN
	SELECT user_id, permission, viewing, avatar, login, users.name AS name
		FROM table_users, users WHERE id = user_id AND table_id = the_table;
END//

/* User views tables he owns and tables he has been invited to */
CREATE PROCEDURE read_table_user_tables (IN the_user INT)
BEGIN
	SELECT table_id, name, permission FROM table_users
		WHERE user_id = the_user AND permission IN ('owner', 'member')
		ORDER BY name, id;
END//

/* User invites another user to play at the table (who becomes a member)
or User shares the table with another user (who becomes an owner)
or User changes an owner or blacklisted user's permission to member
or User changes a member or blacklisted user's permission to owner
or User adds a user to the table's blacklist
or User removes a user from the table's blacklist (NULL permission)
or User revokes a user's ownership or membership (NULL permission)
or User disowns the table (NULL permission) */
CREATE PROCEDURE update_table_users_permission
	(IN the_user INT, IN the_table INT, IN the_permission INT)
BEGIN
	START TRANSACTION;
/* create or update the table user's permission */
	REPLACE INTO table_users (user_id, table_id, permission)
		VALUES (the_user, the_table, the_permission);
/* delete guests (NULL permission) who are not viewing the table */
	DELETE FROM table_users WHERE user_id = the_user AND table_id = the_table
		AND permission = NULL AND viewing = 0;
/* delete tables without owners */
	IF (SELECT COUNT(*) FROM table_users WHERE user_id = the_user
		AND table_id = the_table AND permission = 'owner') = 0
	THEN
		DELETE FROM tables WHERE id = the_table;
	END IF;
	COMMIT;
END//

/* User joins a table */
CREATE PROCEDURE update_table_users_arrive (IN the_user INT, IN the_table INT)
BEGIN
	REPLACE INTO table_users (user_id, table_id, viewing)
		VALUES (the_user, the_table, 1);
END//

/* User leaves a table */
CREATE PROCEDURE update_table_users_leave (IN the_user INT, IN the_table INT)
BEGIN
	START TRANSACTION;
/* delete this table user if it was just a guest (NULL permission) */
	DELETE FROM table_users 
		WHERE user_id = the_user AND table_id = the_table 
		AND permission = NULL;
/* set this table user's viewing to 0 if the user is a member or owner */
	UPDATE table_users SET viewing = 0
		WHERE user_id = the_user AND table_id = the_table;
	COMMIT;
END//

/* User joins a table */
CREATE PROCEDURE update_table_users_avatar
	(IN the_user INT, IN the_table INT, IN the_avatar INT)
BEGIN
	UPDATE table_users SET avatar = the_avatar
		WHERE user_id = the_user AND table_id = the_table;
END//


/*** MESSAGES PROCEDURES ***/

/* User posts a message at a table */
CREATE PROCEDURE create_message
	(IN the_table INT, IN the_user INT, IN the_avatar INT, IN the_text TEXT)
BEGIN
	START TRANSACTION;
	INSERT INTO messages (table_id, user_id, avatar, text)
		VALUES (the_table, the_user, the_avatar, the_text);
	UPDATE tables SET last_message = LAST_INSERT_ID() WHERE id = the_table;
	COMMIT;
END//

/* User joins a table (the_last_message = 0)
or User looks for new messages
	(the_last_message = id of the most recent message already seen by user)
or Admin views all messages at a table (the_last_message = 0) */
CREATE PROCEDURE read_messages (IN the_table INT, IN the_last_message INT)
BEGIN
	START TRANSACTION; /* TODO: is this needed ? */
	DELETE FROM messages WHERE time_stamp < DATE_SUB(NOW(), INTERVAL 6 HOUR);
	SELECT id, table_id, user_id, avatar, text, UNIX_TIMESTAMP(time) AS time 
		FROM messages WHERE table_id = the_table AND id > the_last_message
		ORDER BY id ASC;
	COMMIT;
END//

/* Admin deletes old messages because no users have viewed tables recently */
/* TODO: how can we call this at some regular interval? */
CREATE PROCEDURE delete_messages_expired ()
BEGIN
	DELETE FROM messages WHERE time_stamp < DATE_SUB(NOW(), INTERVAL 6 HOUR);
END//


/*** MAPS PROCEDURES ***/

/* User creates a new map */
CREATE PROCEDURE create_map (IN the_user INT, IN the_type TEXT,
	IN the_rows SMALLINT, IN the_columns SMALLINT,
	IN the_bg_id INT, IN the_bg_url TEXT, IN the_tile TEXT, IN the_name TEXT)
BEGIN
	DECLARE new_map_id INT;
	DECLARE loop_row INT;
	DECLARE loop_column INT;
	START TRANSACTION;
/* create the map */
	INSERT INTO maps 
		(type, tile_rows, tile_columns, background_id, background_url, name)
	VALUES (the_type, the_rows, the_columns, the_bg_id, the_bg_url, the_name);
	SET new_map_id = LAST_INSERT_ID();
/* make the user an owner */
	INSERT INTO map_owners (user_id, map_id) VALUES (the_user, new_map_id);
/* create the tiles */
	SET loop_row = 0;
	WHILE loop_row < the_rows DO
		SET loop_column = 0;
		WHILE loop_column < the_columns DO
			INSERT INTO tiles (x, y, image_id, map_id)
				VALUES (loop_column, loop_row, the_tile, new_map_id);
			SET loop_column = loop_column + 1;
		END WHILE;
		SET loop_row = loop_row + 1;
	END WHILE;
/* return the new map's id */
	SELECT new_map_id AS id;
	COMMIT;
END//

/* User views the maps he owns */
CREATE PROCEDURE read_maps (IN the_user INT)
BEGIN
	SELECT id, name, type, tile_rows, tile_columns
		FROM maps, map_owners WHERE id = map_id and user_id = the_user;
END//

/* User loads a map
or User polls for changes to the map, its pieces and tiles */
CREATE PROCEDURE read_map (IN the_map INT)
BEGIN
	SELECT id, name, type, tile_rows, tile_columns,
		background_id, background_url, min_zoom, max_zoom,
		min_rotate, max_rotate, min_tilt, max_tilt,
		grid_thickness, grid_color, wall_thickness, wall_color, 
		door_thickness, door_color,
		UNIX_TIMESTAMP(piece_stamp) AS piece_stamp,
		UNIX_TIMESTAMP(tile_stamp) AS tile_stamp
		FROM maps WHERE map_id = the_map;
END//

/* User changes map settings */
CREATE PROCEDURE update_map (IN the_map INT, IN the_name TEXT,
	IN the_type TEXT, IN the_left SMALLINT, IN the_top SMALLINT,
	IN the_right SMALLINT, IN the_bottom SMALLINT,
	IN the_background_id TEXT, IN the_background_url TEXT,
	IN the_min_zoom FLOAT,      IN the_max_zoom FLOAT,
	IN the_min_rotate SMALLINT, IN the_max_rotate SMALLINT,
	IN the_min_tilt SMALLINT,   IN the_max_tilt SMALLINT,
	IN the_grid_thickness TINYINT, IN the_grid_color TEXT,
	IN the_wall_thickness TINYINT, IN the_wall_color TEXT,
	IN the_door_thickness TINYINT, IN the_door_color TEXT)
BEGIN
	DECLARE loop_row INT;
	DECLARE loop_column INT;
	DECLARE width SMALLINT;
	DECLARE height SMALLINT;
	START TRANSACTION;
	SET width = the_right - the_left;
	SET height = the_bottom - the_top;
/* update map properties */
	UPDATE maps SET name = the_name, type = the_type,
		tile_rows = height, tile_columns = width,
		background_id = the_background_id, background_url = the_background_url,
		min_zoom   = the_min_zoom,   max_zoom   = the_max_zoom,
		min_rotate = the_min_rotate, max_rotate = the_max_rotate,
		min_tilt   = the_min_tilt,   max_tilt   = the_max_tilt,
		grid_thickness = the_grid_thickness, grid_color = the_grid_color,
		wall_thickness = the_wall_thickness, wall_color = the_wall_color,
		door_thickness = the_door_thickness, door_color = the_door_color
		WHERE id = the_map;
/* delete tiles and walls outside the new rectangle */
	DELETE FROM tiles WHERE map_id = the_map AND 
		(x < the_left OR x >= the_right OR y < the_top OR y >= the_bottom);
	DELETE FROM walls WHERE map_id = the_map AND 
		(x < the_left OR x >= the_right OR y < the_top OR y >= the_bottom);
/* TODO: what to do about pieces outside the rectangle? */
/* shift coordinates to post-resize coordinate system */
	UPDATE tiles SET x = x - the_left, y = y - the_top WHERE map_id = the_map;
	UPDATE walls SET x = x - the_left, y = y - the_top WHERE map_id = the_map;
	UPDATE peices SET x = x - the_left, y = y - the_top WHERE map_id = the_map;
/* add new tile rows and columns */
/* TODO: default tile when resizing instead of null? */
	SET loop_row = 0;
	WHILE loop_row < height DO
		SET loop_column = 0;
		WHILE loop_column < width DO
			INSERT IGNORE INTO tiles (x, y, image_id, map_id)
				VALUES (loop_column, loop_row, null, the_map);
			SET loop_column = loop_column + 1;
		END WHILE;
		SET loop_row = loop_row + 1;
	END WHILE;
	COMMIT;
END//


/*** MAP_OWNERS PROCEDURES ***/

/* User shares map with another user */
CREATE PROCEDURE create_map_owner (IN the_user INT, IN the_map INT)
BEGIN
	INSERT INTO map_owners (user_id, map_id) VALUES (the_user, the_map);
END//

/* User opens a map and sees the map's owners */
CREATE PROCEDURE read_map_owners (IN the_map INT)
BEGIN
	SELECT id, login, logged_in, name, color FROM map_owners, users
		WHERE map_id = the_map AND id = user_id;
END//

/* User disowns map
or User removes another user from this map's owners */
CREATE PROCEDURE delete_map_owner (IN the_user INT, IN the_map INT)
BEGIN
	START TRANSACTION;
/* remove the map owner */
	DELETE FROM map_owners WHERE user_id = the_user AND map_id = the_map;	
/* delete maps without owners */
	IF (SELECT COUNT(*) FROM map_owners WHERE user_id = the_user
		AND map_id = the_map) = 0
	THEN
		DELETE FROM maps WHERE id = the_map;
	END IF;
	COMMIT;
END//


/*** PIECE PROCEDURES ***/

/* User creates a new piece */
CREATE PROCEDURE create_piece (IN the_map INT, IN the_image_id INT,
	IN the_image_url INT, IN the_name TEXT, IN the_x FLOAT, IN the_y FLOAT,
	IN the_x_center INT, IN the_y_center INT,
	IN the_x_tiles FLOAT, IN the_y_tiles FLOAT, IN the_scale FLOAT,
	IN the_character INT, IN the_color TEXT)
BEGIN
	START TRANSACTION;
	INSERT INTO pieces (map_id, image_id, image_url, name, x, y, x_center, 
			y_center, x_tiles, y_tiles, scale, character_id, markers, color)
		VALUES (the_map, the_image_id, the_image_url, the_name, the_x, the_y,
			the_x_center, the_y_center, the_x_tiles, the_y_tiles, the_scale,
			the_character, the_color);
	UPDATE maps SET piece_stamp = NOW() WHERE id = the_map;
	COMMIT;
END//

/* User loads a map
or User refreshes an updated map */
CREATE PROCEDURE read_pieces (IN the_map INT)
BEGIN
	SELECT * FROM pieces WHERE map_id = the_map ORDER BY name, user_id;
END//

/* User moves a piece
or User modifies a piece's settings */
CREATE PROCEDURE update_piece (IN the_piece INT, IN the_image INT,
	IN the_name TEXT, IN the_x FLOAT, IN the_y FLOAT,
	IN the_x_center INT, IN the_y_center INT,
	IN the_x_tiles FLOAT, IN the_y_tiles FLOAT, IN the_scale FLOAT,
	IN the_character INT, IN the_color TEXT)
BEGIN
	START TRANSACTION;
	UPDATE pieces SET image_id = the_image, name = the_name,
		x = the_x, y = the_y, x_center = the_x_center, y_center = the_y_center,
		x_tiles = the_x_tiles, y_tiles = the_y_tiles, scale = the_scale,
		character_id = the_character, color = the_color
		WHERE id = the_piece;
	UPDATE maps SET piece_stamp = NOW() WHERE id = (
		SELECT map_id FROM pieces WHERE id = the_piece);
	COMMIT;
END//

/* User deletes a piece */
CREATE PROCEDURE delete_piece (IN the_piece INT)
BEGIN
	DECLARE my_map_id INT;
	START TRANSACTION;
	SELECT my_map_id = map_id FROM pieces WHERE id = the_piece;
	UPDATE maps SET piece_stamp = NOW() WHERE id = my_map_id;
	DELETE FROM pieces WHERE id = the_piece;
	COMMIT;
END//

/*** TILES PROCEDURES ***/

/* User opens a map
or User refreshes and updated map */
CREATE PROCEDURE read_tiles (IN the_map INT)
BEGIN
	SELECT image_id, fog FROM tiles WHERE map_id = the_map
		ORDER BY y, x ASC;
END//

/* User paints or erases tiles */
CREATE PROCEDURE update_tile (IN the_map INT, IN the_x SMALLINT,
	IN the_y SMALLINT, IN the_image INT, IN the_fog TINYINT)
BEGIN
	START TRANSACTION;
	UPDATE tiles SET image_id = the_image, fog = the_fog
		WHERE x = the_x AND y = the_y AND map_id = the_map;
	UPDATE maps SET tile_stamp = NOW() WHERE id = the_map;
	COMMIT;
END//

/* User covers the map with fog */
CREATE PROCEDURE update_tiles_fill_fog (IN the_map INT)
BEGIN
	START TRANSACTION;
	UPDATE tiles SET fog = 1 WHERE map_id = the_map;
	UPDATE maps SET tile_stamp = NOW() WHERE id = the_map;
	COMMIT;
END//

/* User removes all the fog from the map */
CREATE PROCEDURE update_tiles_clear_fog (IN the_map INT)
BEGIN
	START TRANSACTION;
	UPDATE tiles SET fog = 0 WHERE map_id = the_map;
	UPDATE maps SET tile_stamp = NOW() WHERE id = the_map;
	COMMIT;
END//


/*** WALLS PROCEDURES ***/

/* User paints walls and doors */
CREATE PROCEDURE create_wall (IN the_map INT, IN the_x SMALLINT,
	IN the_y SMALLINT, IN the_direction VARCHAR(2), IN the_contents TEXT)
BEGIN
	START TRANSACTION;
	REPLACE INTO walls (map_id, x, y, direction, contents)
	VALUES (the_map, the_x, the_y, the_direction, the_contents);
	UPDATE maps SET wall_stamp = NOW() WHERE id = the_map;
	COMMIT;
END//

/* User opens a map
or User refreshes and updated map */
CREATE PROCEDURE read_walls (IN the_map INT)
BEGIN
	SELECT * FROM walls WHERE map_id = the_map;
END//

/* User erases walls and doors */
CREATE PROCEDURE delete_wall (IN the_map INT, IN the_x SMALLINT,
	IN the_y SMALLINT, IN the_direction VARCHAR(2))
BEGIN
	START TRANSACTION;
	DELETE FROM walls WHERE map_id = the_map AND x = the_x
		AND y = the_y AND direction = the_direction;
	UPDATE maps SET wall_stamp = NOW() WHERE id = the_map;
	COMMIT;
END//


/*** CHARACTERS PROCEDURES ***/

/* User creates a new character */
CREATE PROCEDURE create_character (IN the_user INT, IN the_name TEXT,
	IN the_system TEXT, IN the_stats TEXT, IN the_notes TEXT,
	IN the_portrait_id INT, IN the_prortrait_url TEXT,
	IN the_piece_image_id INT, IN the_piece_image_url TEXT, IN color TEXT)
BEGIN
	DECLARE new_character_id INT;
	START TRANSACTION;
/* create the character */
	INSERT INTO characters (name, system, stats, notes, portrait_id,
		portrait_url, piece_image_id, piece_image_url, color)
		VALUES (the_name, the_system, the_stats, the_notes, the_portrait_id,
		the_portrait_url, the_piece_image_id, the_piece_image_url, the_color);
	SELECT new_character_id = LAST_INSERT_ID();
/* make this user the character's owner */
	INSERT INTO character_owners (user_id, character_id)
		VALUES (the_user, new_character_id);
/* return the new character's id */
	SELECT new_character_id;
	COMMIT;
END//
 
/* User views a list of characters he owns */
CREATE PROCEDURE read_characters (IN the_user INT)
BEGIN
	SELECT id, name, system, stats, notes, portrait_id, portrait_url,
		piece_image_id, piece_image_url, color
		FROM characters, character_owners
		WHERE id = character_id AND user_id = the_user;
END//


/*** CHARACTER_OWNERS PROCEDURES ***/

/* User shares this character with another user */
CREATE PROCEDURE create_character_owner (IN the_user INT, IN the_character INT)
BEGIN
	INSERT INTO character_owners (user_id, character_id)
		VALUES (the_user, the_character);
END//

/* User views a list of this character's owners */
CREATE PROCEDURE read_character_owners (IN the_character INT)
BEGIN
	SELECT id, login, logged_in, name, color FROM character_owners, users
		WHERE character_id = the_character AND id = user_id;
END//

/* User disowns a character
or User removes another user from this character's owners */
CREATE PROCEDURE delete_character_owner (IN the_user INT, IN the_character INT)
BEGIN
	START TRANSACTION;
/* remove the character owner */
	DELETE FROM character_owners
		WHERE user_id = the_user AND character_id = the_character;	
/* delete characterss without owners */
	IF (SELECT COUNT(*) FROM character_owners WHERE user_id = the_user
		AND character_id = the_character) = 0
	THEN
		DELETE FROM characters WHERE id = the_character;
	END IF;
	COMMIT;
END//

DELIMITER ;
