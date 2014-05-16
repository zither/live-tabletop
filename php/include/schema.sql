/* we remove tables in bottom-up order to avoid foreign key issues */
DROP TABLE IF EXISTS character_owners, characters, pieces, map_owners,
	maps, messages, campaign_users, campaigns, friends, users, admins;

DROP PROCEDURE IF EXISTS create_admin;
DROP PROCEDURE IF EXISTS read_admin;
DROP PROCEDURE IF EXISTS update_admin_password;
DROP PROCEDURE IF EXISTS delete_admin;

DROP PROCEDURE IF EXISTS create_user;
DROP PROCEDURE IF EXISTS read_user_login;
DROP PROCEDURE IF EXISTS read_user;
DROP PROCEDURE IF EXISTS read_users;
DROP PROCEDURE IF EXISTS update_user_logged_in;
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

DROP PROCEDURE IF EXISTS create_campaign;
DROP PROCEDURE IF EXISTS read_campaign;
DROP PROCEDURE IF EXISTS read_campaigns;
DROP PROCEDURE IF EXISTS update_campaign_map;
DROP PROCEDURE IF EXISTS update_campaign_name;
DROP PROCEDURE IF EXISTS update_campaign_private;
DROP PROCEDURE IF EXISTS update_campaign_turns;
DROP PROCEDURE IF EXISTS delete_campaign;
DROP PROCEDURE IF EXISTS read_campaign_user_permission;
DROP PROCEDURE IF EXISTS read_campaign_user_campaigns;
DROP PROCEDURE IF EXISTS read_campaign_users;
DROP PROCEDURE IF EXISTS update_campaign_user_permission;
DROP PROCEDURE IF EXISTS update_campaign_user_arrive;
DROP PROCEDURE IF EXISTS update_campaign_user_leave;
DROP PROCEDURE IF EXISTS update_campaign_user_avatar;
DROP PROCEDURE IF EXISTS create_message;
DROP PROCEDURE IF EXISTS read_messages;
DROP PROCEDURE IF EXISTS delete_messages_expired;

DROP PROCEDURE IF EXISTS create_map;
DROP PROCEDURE IF EXISTS read_maps;
DROP PROCEDURE IF EXISTS read_map_changes;
DROP PROCEDURE IF EXISTS read_map;
DROP PROCEDURE IF EXISTS read_map_tiles;
DROP PROCEDURE IF EXISTS read_map_campaigns;
DROP PROCEDURE IF EXISTS update_map_tiles;
DROP PROCEDURE IF EXISTS update_map_size;
DROP PROCEDURE IF EXISTS update_map;
DROP PROCEDURE IF EXISTS create_map_owner;
DROP PROCEDURE IF EXISTS read_map_owners;
DROP PROCEDURE IF EXISTS read_map_owner;
DROP PROCEDURE IF EXISTS read_map_viewer;
DROP PROCEDURE IF EXISTS delete_map_owner;
DROP PROCEDURE IF EXISTS create_piece;
DROP PROCEDURE IF EXISTS read_pieces;
DROP PROCEDURE IF EXISTS update_piece_position;
DROP PROCEDURE IF EXISTS update_piece;
DROP PROCEDURE IF EXISTS delete_piece;

DROP PROCEDURE IF EXISTS create_character;
DROP PROCEDURE IF EXISTS read_characters;
DROP PROCEDURE IF EXISTS create_character_owner;
DROP PROCEDURE IF EXISTS read_character_owners;
DROP PROCEDURE IF EXISTS read_character_owner;
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


/* CAMPAIGNS TABLE

	Campaigns are virtual places where users can chat, edit campaigns and play games
	together. Each campaign roughly corresponds to a campaign being played by a
	group of players. The state of the campaign is saved between games.

	map: each campaign shows one map at a time
	private: anyone with the campaign’s permalink URL can join if this is 0
	turns: JSON array of turns (character ids?) in a sequence
	last_message: id of last new message
	users modified: time of last change to this campaign's list of users
*/

CREATE TABLE campaigns (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name TEXT,
	map INT,
	private TINYINT NOT NULL DEFAULT 1,
	turns TEXT NOT NULL, /* DEFAULT '[]' */
	last_message INT NOT NULL DEFAULT 0,
	users_modified DATETIME
);


/* CAMPAIGN_USERS TABLE

	unique relationships between campaigns and users.

	name: the name of the campaign, duplicated here so we only need this table
		to populate and frequently refresh the user's campaign list
		TODO: is this an efficient and useful optimization?
	permission: one of four mutually exclusive states
		“owner”: can invite people to join the campaign, change the public/private
			setting, invite members, change the map, edit the map and move any
			piece on the map.
		“member”: can join the campaign when it is not public
		“banned” (blacklisted): cannot see the campaign even if it is public
		NULL (guest): can only join the campaign when it is public
	viewing: 1 if the user is currently online and viewing this campaign
	avatar: the user is speaking as this character in this campaign
*/

CREATE TABLE campaign_users (
	user_id INT NOT NULL,
	campaign_id INT NOT NULL,
	name TEXT,
	permission TEXT,
	viewing TINYINT NOT NULL DEFAULT 0,
	avatar INT,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
	PRIMARY KEY (user_id, campaign_id)
);


/* MESSAGES TABLE

	Messages from users of this campaign, character dialog and die rolls.
	avatar: optional id of a character whose persona the user takes on.
	text: can contain die rolls wrapped and styled with HTML/CSS
*/

CREATE TABLE messages (
	id INT AUTO_INCREMENT PRIMARY KEY,
	campaign_id INT NOT NULL,
	user_id INT NOT NULL,
	avatar INT,
	text TEXT,
	time TIMESTAMP,
	FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


/* MAPS TABLE

	Maps are graphical things with pieces, background images and tiles.

	name: an optional name to help identify the map
		(only visible to map and campaign owners?)
	type: "hex" or "square"
	tile_rows/columns: height and width of the map, in grid units
	background: image JSON data. See piece.image. No base; Probably no view.
	min/max zoom, rotate and tilt: allowed viewing options
	grid/wall/door thickness and color: style for grid and wall overlay
	tiles: JSON array containing the image ids of each tile in the map
	flags: string of characters representing fog, walls and doors of each tile
		symbol  0ABCDEFGHIJKLMNOPQRSTUVWXYZ1abcdefghijklmnopqrstuvwxyz
		fog                                ***************************
		S wall           *********                  *********
		S door                    *********                  *********
		E wall     ***      ***      ***      ***      ***      ***   
		E door        ***      ***      ***      ***      ***      ***
		SE wall    ***      ***      ***      ***      ***      ***   
		SE door       ***      ***      ***      ***      ***      ***
		NE wall  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * 
		NE door   *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
*/

CREATE TABLE maps (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name TEXT,
	type TEXT NOT NULL,
	tile_rows SMALLINT NOT NULL,
	tile_columns SMALLINT NOT NULL,
	background TEXT,
	min_zoom FLOAT NOT NULL DEFAULT 0.25,
	max_zoom FLOAT NOT NULL DEFAULT 4.0,
	min_rotate SMALLINT NOT NULL DEFAULT -180,
	max_rotate SMALLINT NOT NULL DEFAULT 180,
	min_tilt SMALLINT NOT NULL DEFAULT 30,
	max_tilt SMALLINT NOT NULL DEFAULT 90,
	grid_thickness TINYINT NOT NULL DEFAULT 1,
	grid_color TEXT,
	wall_thickness TINYINT NOT NULL DEFAULT 3,
	wall_color TEXT,
	door_thickness TINYINT NOT NULL DEFAULT 3, /* TODO: Is this needed? */
	door_color TEXT,
	piece_changes INT NOT NULL DEFAULT 0,
	tile_changes INT NOT NULL DEFAULT 0,
	tiles TEXT,
	flags TEXT
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

	map_id: every piece is part of a map
	image_id: piece image/class
	image_url: link to a piece image from another site
	x, y: center of the piece in square map units
	   if you use square tiles the center of tile 0, 0 is 0.5, 0.5
	image: JSON data {
		"id": id of an image from our library
		"url": web address of an image linked from another site
		"center.x/y": center of the piece image in pixels
			the middle bottom of a 100 x 100 image is 50, 100
			this position is based on the unscaled image
		"base.x/y": tile columns and rows occupied by this piece
		"scale.x/y": decrease or increase the apparent size of the piece
			100% scale shows the image at 1:1 image to screen pixel ratio
			when viewing the map at 100% zoom from the top view
		"angle": degrees to rotate the image
		"view": how the image should look when the view rotates.
			front: it looks the same from every angle
			side: flips horizontally when facing left
			top: flat and oriented, rotates and tilts with the view
			flat: low-relief, can squish/tilt but does not rotate
			multi: the image has been rendered from each direction
	}
	character_id: an optional character associated with this piece
	locked: only campaign+map owners & character owners can move the piece if 1
	markers: status icons with metadata attached to the piece
*/

CREATE TABLE pieces (
	id INT AUTO_INCREMENT PRIMARY KEY,
	map_id INT NOT NULL,
	image TEXT,
	name TEXT,
	x FLOAT NOT NULL DEFAULT 0.5,
	y FLOAT NOT NULL DEFAULT 0.5,
	character_id INT,
	locked TINYINT NOT NULL DEFAULT 1,
	markers TEXT NOT NULL,
	color TEXT, /* TODO: do we need this? */
	FOREIGN KEY (map_id) REFERENCES maps(id) ON DELETE CASCADE
);


/* CHARACTERS TABLE

	Characters are a bridge between the social (campaign, users) and graphical (map, pieces.)
	They also contain game mechanics, which are neither entirely social nor entirely graphical,
	but lean toward social because die rolls are already part of campaign chat.

	name: the character's name
	system: game system to use if this character has stats
	stats: system specific JSON data
	notes: additional user-defined status effects? (like markers without icons)
	portrait: JSON image data. See pieces.image.
		No base or view; Maybe no center, scale or angle.
	piece: JSON image data. See pieces.image.
	color: TODO: is this needed? What is it used for?
*/

CREATE TABLE characters (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name TEXT,
	system TEXT,
	stats TEXT,
	notes TEXT,
	portrait TEXT,
	piece TEXT,
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

/* DELIMITER // /* MySQL Workbench speaks only MySQL command-line syntax. */

/*** ADMINS PROCEDURES ***/

/* Admin creates an account while installing Live Tabletop
or Admin creates an account for another admin. */ 
CREATE PROCEDURE create_admin
	(IN the_login VARCHAR(200), IN the_hash TEXT, IN the_salt TEXT)
BEGIN
	INSERT INTO admins (login, hash, salt)
		VALUES (the_login, the_hash, the_salt);
END;

/* Admin logs in and PHP logic validates his password  */
CREATE PROCEDURE read_admin (IN the_login VARCHAR(200))
BEGIN
	SELECT hash, salt FROM admins WHERE login = the_login;
END;

/* Admin changes his password
or Admin changes another admin's password? */
CREATE PROCEDURE update_admin_password
	(IN the_admin INT, IN the_hash TEXT, IN the_salt TEXT)
BEGIN
	UPDATE admins SET hash = the_hash, salt = the_salt WHERE login = the_admin;
END;

/* Admin deletes his own account
or Admin deletes another admin's ac */
CREATE PROCEDURE delete_admin (IN the_login VARCHAR(200))
BEGIN
	DELETE FROM admins WHERE login = the_login;
END;


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
END;

/* User logs in and PHP logic validates his password */
CREATE PROCEDURE read_user_login (IN the_login VARCHAR(200))
BEGIN
	SELECT id, login, hash, salt, UNIX_TIMESTAMP(last_action) AS last_action,
		logged_in, name, color, email, subscribed
		FROM users WHERE login = the_login;
END;

/* User views his own account info
or User views another user's id, login, logged_in, name and color */
CREATE PROCEDURE read_user (IN the_user INT)
BEGIN
	SELECT id, login, logged_in, name, color, email, subscribed
		FROM users WHERE id = the_user;
END;

/* Admin views all users */
CREATE PROCEDURE read_users ()
BEGIN
	SELECT id, login, UNIX_TIMESTAMP(last_action) AS last_action,
		logged_in, name, color, email, subscribed
		FROM users ORDER BY name, login, id;
END;

/* User has logged in or logged out */
/* TODO: do these count as actions for the purpose of last_action? */
CREATE PROCEDURE update_user_logged_in (IN the_user INT, IN the_status TINYINT)
BEGIN
	UPDATE users SET logged_in = the_status WHERE id = the_user;
END;

/* User changes his password
or Admin resets his password */
CREATE PROCEDURE update_user_password
	(IN the_user INT, IN the_hash TEXT, IN the_salt TEXT)
BEGIN
	UPDATE users SET hash = the_hash, salt = the_salt, last_action = NOW()
	WHERE id = the_user;
END;

/* User updates his account information */
CREATE PROCEDURE update_user (IN the_user INT, IN the_name VARCHAR(200),
	IN the_color TEXT, IN the_email TEXT, IN the_subscribed TINYINT)
BEGIN
	UPDATE users SET name = the_name, color = the_color, last_action = NOW(),
		email = the_email, subscribed = the_subscribed WHERE id = the_user;
END;

/* User sent a message or changed something */
/* TODO: when, if ever, do we need to call this? */
CREATE PROCEDURE update_user_timestamp (IN the_user INT)
BEGIN
	UPDATE users SET last_action = NOW() WHERE id = the_user;
END;

/* User deletes his own account?
or Admin deletes a user account */
CREATE PROCEDURE delete_user (IN the_user INT)
BEGIN
	START TRANSACTION;
/* delete the user */
	DELETE FROM users WHERE id = the_user;
/* delete campaigns without owners */
	DELETE FROM campaigns WHERE id NOT IN 
		(SELECT campaign_id FROM campaign_users WHERE permission = "owner");
/* delete maps without owners */
	DELETE FROM maps WHERE id NOT IN
		(SELECT map_id FROM map_owners);
/* delete characters without owners */
	DELETE FROM characters WHERE id NOT IN
		(SELECT character_id FROM character_owners);
/*
handled by ON DELETE CASCADE when you delete the user:
	DELETE FROM friends WHERE sender = the_user OR recipient = the_user;
	DELETE FROM campaign_users WHERE user_id = the_user;
	DELETE FROM messages WHERE user_id = the_user;
	DELETE FROM map_owners WHERE user_id = the_user;
handled by ON DELETE CASCADE when you delete the campaign:
	DELETE FROM messages WHERE campaign_id NOT IN (SELECT id FROM campaigns);
handled by ON DELETE CASCADE when you delete the map:
	DELETE FROM pieces WHERE map_id NOT IN (SELECT id FROM maps);
*/
	COMMIT;
END;


/*** FRIENDS PROCEDURES ***/

/* User sends a friend request
or User confirms a friend request */
CREATE PROCEDURE create_friend (IN the_sender INT, IN the_recipient INT)
BEGIN
	IF the_sender <> the_recipient
	THEN
		REPLACE INTO friends (sender, recipient)
			VALUES (the_sender, the_recipient);
	END IF;
END;

/* Admin views all friend requests sent and received by the user */
CREATE PROCEDURE read_friends (IN the_user INT)
BEGIN
	SELECT sender, recipient, UNIX_TIMESTAMP(time) AS time
	FROM friends WHERE sender = the_user OR recipient = the_user;
END;

/* User sees the friend requests he has recieved */
CREATE PROCEDURE read_friends_recieved (IN the_user INT)
BEGIN
	SELECT sender FROM friends WHERE recipient = the_user ORDER BY time;
END;

/* User sees the friend requests he has sent */
CREATE PROCEDURE read_friends_requested (IN the_user INT)
BEGIN
	SELECT recipient FROM friends WHERE sender = the_user ORDER BY time;
END;

/* User views his list of confirmed friends */
CREATE PROCEDURE read_friends_confirmed (IN the_user INT)
BEGIN
	SELECT requested.recipient AS user_id FROM
		(SELECT * FROM friends WHERE sender = the_user) AS requested,
		(SELECT * FROM friends WHERE recipient = the_user) AS received
		WHERE received.sender = requested.recipient;
END;

/* User stops being friends with the recipient
or User cancels a friend request */
CREATE PROCEDURE delete_friend (IN the_sender INT, IN the_recipient INT)
BEGIN
	DELETE FROM friends WHERE sender = the_sender AND recipient = the_recipient;
END;


/*** CAMPAIGNS PROCEDURES ***/

/* User creates a new campaign. */
CREATE PROCEDURE create_campaign
	(IN the_user INT, IN the_name VARCHAR(200))
BEGIN
	START TRANSACTION;
/* create the campaign */
	INSERT INTO campaigns (name, turns, users_modified)
		VALUES (the_name, '[]', NOW());
	SET @new_id = LAST_INSERT_ID();
/* make the user an owner */
	INSERT INTO campaign_users (user_id, campaign_id, name, permission)
		VALUES (the_user, @new_id, the_name, 'owner');
/* return the new campaign's id */
	SELECT @new_id AS id;
	COMMIT;
END;

/* User loads a campaign
or User polls for new messages and changes to the users list */
CREATE PROCEDURE read_campaign (IN the_campaign INT)
BEGIN
	SELECT id, name, map, private, turns, last_message,
		UNIX_TIMESTAMP(users_modified) AS users_modified
		FROM campaigns WHERE id = the_campaign;
END;

/* Admin views all the campaigns. */
CREATE PROCEDURE read_campaigns ()
BEGIN
	SELECT id, name, map, private, turns, last_message,
		UNIX_TIMESTAMP(users_modified) AS users_modified
		FROM campaigns ORDER BY name, id;
END;

/* User changes the campaign's map */
CREATE PROCEDURE update_campaign_map (IN the_campaign INT, IN the_map INT)
BEGIN
	UPDATE campaigns SET map = the_map WHERE id = the_campaign;
END;

/* User renames the campaign */
CREATE PROCEDURE update_campaign_name (IN the_campaign INT, IN the_name TEXT)
BEGIN
	START TRANSACTION;
	UPDATE campaigns SET name = the_name WHERE id = the_campaign;
	UPDATE campaign_users SET name = the_name WHERE campaign_id = the_campaign;
	COMMIT;
END;

/* User toggles the campaign's private/public setting */
CREATE PROCEDURE update_campaign_private (IN the_campaign INT, IN the_private TINYINT)
BEGIN
	UPDATE campaigns SET private = the_private WHERE id = the_campaign;
END;

/* User changes the initiative list (turns) */
CREATE PROCEDURE update_campaign_turns (IN the_campaign INT, IN the_turns TEXT)
BEGIN
	UPDATE campaigns SET turns = the_turns WHERE id = the_campaign;
END;

/* Admin deletes the campaign */
CREATE PROCEDURE delete_campaign (IN the_campaign INT)
BEGIN
	DELETE FROM campaigns WHERE id = the_campaign;
END;


/*** CAMPAIGN_USERS PROCEDURES ***/

/* User tries to view campaign and PHP logic checks whether that is allowed */
CREATE PROCEDURE read_campaign_user_permission
	(IN the_user INT, IN the_campaign INT)
BEGIN
	SELECT permission FROM campaign_users
		WHERE user_id = the_user AND campaign_id = the_campaign;
END;

/* User views campaigns he owns and campaigns he has been invited to */
CREATE PROCEDURE read_campaign_user_campaigns (IN the_user INT)
BEGIN
	SELECT campaign_id, name, permission FROM campaign_users
		WHERE user_id = the_user AND permission IN ('owner', 'member')
		ORDER BY name, campaign_id;
END;

/* User views the owners, members, viewers and blacklist of this campaign */
CREATE PROCEDURE read_campaign_users (IN the_campaign INT)
BEGIN
/*
	SELECT user_id, permission, viewing, avatar, login, users.name AS name
		FROM campaign_users, users WHERE id = user_id AND campaign_id = the_campaign;
*/
	SELECT user_id, permission, viewing, avatar, login, users.name AS name
		FROM campaign_users JOIN users ON id = user_id
		WHERE campaign_id = the_campaign;
END;

/* User invites another user to play at the campaign (who becomes a member)
or User shares the campaign with another user (who becomes an owner)
or User changes an owner or blacklisted user's permission to member
or User changes a member or blacklisted user's permission to owner
or User adds a user to the campaign's blacklist
or User removes a user from the campaign's blacklist (NULL permission)
or User revokes a user's ownership or membership (NULL permission)
or User disowns the campaign (NULL permission) */
CREATE PROCEDURE update_campaign_user_permission
	(IN the_user INT, IN the_campaign INT, IN the_permission TEXT)
BEGIN
	START TRANSACTION;
/* create or update the campaign user's permission */
/*
	IF (SELECT COUNT(*) FROM campaign_users
		WHERE user_id = the_user AND campaign_id = the_campaign) = 0
*/
	IF (the_user, the_campaign) NOT IN
		(SELECT user_id, campaign_id FROM campaign_users)
	THEN
		SELECT name INTO @name FROM campaigns WHERE id = the_campaign;
		INSERT INTO campaign_users (user_id, campaign_id, name, permission)
			VALUES (the_user, the_campaign, @name, the_permission);
	ELSE
		UPDATE campaign_users SET permission = the_permission
			WHERE user_id = the_user AND campaign_id = the_campaign;
	END IF;
/* delete guests (NULL permission) who are not viewing the campaign */
	DELETE FROM campaign_users WHERE user_id = the_user AND campaign_id = the_campaign
		AND permission = NULL AND viewing = 0;
/* delete campaigns without owners */
/*
	IF (SELECT COUNT(*) FROM campaign_users
		WHERE campaign_id = the_campaign AND permission = 'owner') = 0
*/
	IF the_campaign NOT IN
		(SELECT campaign_id FROM campaign_users WHERE permission = 'owner')
	THEN
		DELETE FROM campaigns WHERE id = the_campaign;
	END IF;
	COMMIT;
END;

/* User joins a campaign */
CREATE PROCEDURE update_campaign_user_arrive (IN the_user INT, IN the_campaign INT)
BEGIN
	START TRANSACTION;
/*
	IF (SELECT COUNT(*) FROM campaign_users
		WHERE user_id = the_user AND campaign_id = the_campaign) = 0
*/
	IF (the_user, the_campaign) NOT IN
		(SELECT user_id, campaign_id FROM campaign_users)
	THEN
		SELECT name INTO @name FROM campaigns WHERE id = the_campaign;
		INSERT INTO campaign_users (user_id, campaign_id, name, viewing)
			VALUES (the_user, the_campaign, @name, 1);
	ELSE
		UPDATE campaign_users SET viewing = 1
			WHERE user_id = the_user AND campaign_id = the_campaign;
	END IF;
	COMMIT;
END;

/* User leaves a campaign */
CREATE PROCEDURE update_campaign_user_leave (IN the_user INT, IN the_campaign INT)
BEGIN
	START TRANSACTION;
/* delete this campaign user if it was just a guest (NULL permission) */
	DELETE FROM campaign_users 
		WHERE user_id = the_user AND campaign_id = the_campaign 
		AND permission = NULL;
/* set this campaign user's viewing to 0 if the user is a member or owner */
	UPDATE campaign_users SET viewing = 0
		WHERE user_id = the_user AND campaign_id = the_campaign;
	COMMIT;
END;

/* User selects his avatar for this campaign */
CREATE PROCEDURE update_campaign_user_avatar
	(IN the_user INT, IN the_campaign INT, IN the_avatar INT)
BEGIN
	UPDATE campaign_users SET avatar = the_avatar
		WHERE user_id = the_user AND campaign_id = the_campaign;
END;


/*** MESSAGES PROCEDURES ***/

/* User posts a message in a campaign */
CREATE PROCEDURE create_message
	(IN the_campaign INT, IN the_user INT, IN the_avatar INT, IN the_text TEXT)
BEGIN
	START TRANSACTION;
	INSERT INTO messages (campaign_id, user_id, avatar, text)
		VALUES (the_campaign, the_user, the_avatar, the_text);
	UPDATE campaigns SET last_message = LAST_INSERT_ID() WHERE id = the_campaign;
	COMMIT;
END;

/* User joins a campaign (the_last_message = 0)
or User looks for new messages
	(the_last_message = id of the most recent message already seen by user)
or Admin views all messages in a campaign (the_last_message = 0) */
CREATE PROCEDURE read_messages (IN the_campaign INT, IN the_last_message INT)
BEGIN
	START TRANSACTION; /* TODO: is this needed ? */
	DELETE FROM messages WHERE time < DATE_SUB(NOW(), INTERVAL 6 HOUR);
	SELECT id, user_id, avatar, text, UNIX_TIMESTAMP(time) AS time 
		FROM messages WHERE campaign_id = the_campaign AND id > the_last_message
		ORDER BY id ASC;
	COMMIT;
END;

/* Admin deletes old messages because no users have viewed campaigns recently */
/* TODO: how can we call this at some regular interval? */
CREATE PROCEDURE delete_messages_expired ()
BEGIN
	DELETE FROM messages WHERE time < DATE_SUB(NOW(), INTERVAL 6 HOUR);
END;


/*** MAPS PROCEDURES ***/

/* User creates a new map */
CREATE PROCEDURE create_map (IN the_user INT, IN the_type TEXT,
	IN the_rows SMALLINT, IN the_columns SMALLINT, IN the_background TEXT,
	IN the_name TEXT, IN the_tiles TEXT, IN the_flags TEXT)
BEGIN
	START TRANSACTION;
/* create the map */
	INSERT INTO maps 
		(type, tile_rows, tile_columns, background, name, tiles, flags)
	VALUES (the_type, the_rows, the_columns, the_background, the_name,
		the_tiles, the_flags);
	SET @new_id = LAST_INSERT_ID();
/* make the user an owner */
	INSERT INTO map_owners (user_id, map_id) VALUES (the_user, @new_id);
/* return the new map's id */
	SELECT @new_id AS id;
	COMMIT;
END;

/* User views the maps he owns */
CREATE PROCEDURE read_maps (IN the_user INT)
BEGIN
/*
	SELECT id, name, type, tile_rows, tile_columns
		FROM maps, map_owners WHERE id = map_id AND user_id = the_user;
*/
	SELECT id, name, type, tile_rows, tile_columns
		FROM maps JOIN map_owners ON id = map_id WHERE user_id = the_user;
END;

/* User polls for changes to the map, its pieces and tiles */
CREATE PROCEDURE read_map_changes (IN the_map INT)
BEGIN
	SELECT name, type, tile_rows, tile_columns, background,
		min_zoom, max_zoom, min_rotate, max_rotate, min_tilt, max_tilt,
		grid_thickness, grid_color, wall_thickness, wall_color, 
		door_thickness, door_color, piece_changes, tile_changes
		FROM maps WHERE id = the_map;
END;

/* User opens a map
or User refreshes an updated map */
CREATE PROCEDURE read_map (IN the_map INT)
BEGIN
	SELECT * FROM maps WHERE id = the_map;
END;

/* User paints or erases tiles, fog or walls */
CREATE PROCEDURE read_map_tiles (IN the_map INT)
BEGIN
	SELECT tile_rows, tile_columns, tiles, flags FROM maps WHERE id = the_map
		FOR UPDATE; /* lock row so simultaneous edits don't cancel each other */
END;

/* User tries to view a map and PHP logic checks whether the user can. */
CREATE PROCEDURE read_map_campaigns (IN the_map INT)
BEGIN
	SELECT id, private FROM campaigns WHERE map = the_map;
END;

/* User tries to view a map and PHP logic checks whether they can */
CREATE PROCEDURE read_map_viewer (IN the_user INT, the_map INT)
BEGIN
	SELECT * FROM (SELECT id, private FROM campaigns WHERE map = the_map) AS c
		LEFT JOIN campaign_users ON id = campaign_id
		WHERE private = 0 OR (id = user_id AND permission IN ('member', 'owner'));
/*
	SELECT * FROM (SELECT id FROM campaigns WHERE map = the_map AND private = 1)
		JOIN (SELECT campaign_id FROM campaign_users WHERE user_id = the_user
			AND permission IN ('member', 'owner')) ON id = campaign_id
		UNION (SELECT id FROM campaigns WHERE map = the_map AND private = 0);
*/
END;

/* User paints or erases tiles, fog or walls */
CREATE PROCEDURE update_map_tiles
	(IN the_map INT, IN the_tiles TEXT, IN the_flags TEXT)
BEGIN
	UPDATE maps
		SET tile_changes = tile_changes + 1, tiles = the_tiles, flags = the_flags
		WHERE id = the_map;
END;

/* User resizes a map */
CREATE PROCEDURE update_map_size (IN the_map INT, IN the_left SMALLINT,
	IN the_top SMALLINT, IN the_right SMALLINT, IN the_bottom SMALLINT,
	IN the_tiles TEXT, IN the_flags TEXT)
BEGIN
	START TRANSACTION;
/* update map properties */
	UPDATE maps SET tile_changes = tile_changes + 1,
		tile_rows = the_bottom - the_top, tile_columns = the_right - the_left,
		tiles = the_tiles, flags = the_flags
		WHERE id = the_map;
/* shift coordinates to post-resize coordinate system */
	UPDATE pieces SET x = x - the_left, y = y - the_top WHERE map_id = the_map;
	COMMIT;
END;

/* User changes map settings */
CREATE PROCEDURE update_map (IN the_map INT,
	IN the_name TEXT, IN the_type TEXT, IN the_background TEXT,
	IN the_min_zoom FLOAT,      IN the_max_zoom FLOAT,
	IN the_min_rotate SMALLINT, IN the_max_rotate SMALLINT,
	IN the_min_tilt SMALLINT,   IN the_max_tilt SMALLINT,
	IN the_grid_thickness TINYINT, IN the_grid_color TEXT,
	IN the_wall_thickness TINYINT, IN the_wall_color TEXT,
	IN the_door_thickness TINYINT, IN the_door_color TEXT)
BEGIN
	UPDATE maps SET
		name = the_name, type = the_type, background = the_background,
		min_zoom   = the_min_zoom,   max_zoom   = the_max_zoom,
		min_rotate = the_min_rotate, max_rotate = the_max_rotate,
		min_tilt   = the_min_tilt,   max_tilt   = the_max_tilt,
		grid_thickness = the_grid_thickness, grid_color = the_grid_color,
		wall_thickness = the_wall_thickness, wall_color = the_wall_color,
		door_thickness = the_door_thickness, door_color = the_door_color
		WHERE id = the_map;
END;


/*** MAP_OWNERS PROCEDURES ***/

/* User shares map with another user */
CREATE PROCEDURE create_map_owner (IN the_user INT, IN the_map INT)
BEGIN
	INSERT INTO map_owners (user_id, map_id) VALUES (the_user, the_map);
END;

/* User opens a map and sees the map's owners */
CREATE PROCEDURE read_map_owners (IN the_map INT)
BEGIN
/*
	SELECT id, login, logged_in, name, color FROM map_owners, users
		WHERE map_id = the_map AND id = user_id;
*/
	SELECT id, login, logged_in, name, color
		FROM map_owners JOIN users ON id = user_id WHERE map_id = the_map;
END;

/* User tries to edit a map and and PHP logic checks whether they own it */
CREATE PROCEDURE read_map_owner (IN the_user INT, IN the_map INT)
BEGIN
	SELECT * FROM map_owners WHERE user_id = the_user AND map_id = the_map;
END;

/* User disowns map
or User removes another user from this map's owners */
CREATE PROCEDURE delete_map_owner (IN the_user INT, IN the_map INT)
BEGIN
	START TRANSACTION;
/* remove the map owner */
	DELETE FROM map_owners WHERE user_id = the_user AND map_id = the_map;	
/* delete maps without owners */
/*
	IF (SELECT COUNT(*) FROM map_owners WHERE map_id = the_map) = 0
*/
	IF the_map NOT IN (SELECT map_id FROM map_owners)
	THEN
		DELETE FROM maps WHERE id = the_map;
	END IF;
	COMMIT;
END;


/*** PIECE PROCEDURES ***/

/* User creates a new piece */
CREATE PROCEDURE create_piece (IN the_map INT, IN the_image TEXT)
BEGIN
	START TRANSACTION;
	UPDATE maps SET piece_changes = piece_changes + 1 WHERE id = the_map;
	INSERT INTO pieces (map_id, image, markers)
		VALUES (the_map, the_image, '[]');
	SELECT LAST_INSERT_ID() AS id;
	COMMIT;
END;

/* User loads a map
or User refreshes an updated map */
CREATE PROCEDURE read_pieces (IN the_map INT)
BEGIN
	SELECT * FROM pieces WHERE map_id = the_map ORDER BY name, image, id;
END;

/* User moves a piece */
CREATE PROCEDURE update_piece_position
	(IN the_piece INT, IN the_x FLOAT, IN the_y FLOAT)
BEGIN
	START TRANSACTION;
	UPDATE pieces SET x = the_x, y = the_y WHERE id = the_piece;
	UPDATE maps SET piece_changes = piece_changes + 1
		WHERE id = (SELECT map_id FROM pieces WHERE id = the_piece);
	COMMIT;
END;

/* User modifies a piece's settings */
CREATE PROCEDURE update_piece (IN the_piece INT, IN the_image TEXT,
	IN the_name TEXT, IN the_character INT, IN the_locked TINYINT,
	IN the_markers TEXT, IN the_color TEXT)
BEGIN
	START TRANSACTION;
	UPDATE pieces SET image = the_image, name = the_name, locked = the_locked,
		character_id = the_character, markers = the_markers, color = the_color
		WHERE id = the_piece;
	UPDATE maps SET piece_changes = piece_changes + 1 
		WHERE id = (SELECT map_id FROM pieces WHERE id = the_piece);
	COMMIT;
END;

/* User deletes a piece */
CREATE PROCEDURE delete_piece (IN the_piece INT)
BEGIN
	START TRANSACTION;
	UPDATE maps SET piece_changes = piece_changes + 1
		WHERE id = (SELECT map_id FROM pieces WHERE id = the_piece);
	DELETE FROM pieces WHERE id = the_piece;
	COMMIT;
END;


/*** CHARACTERS PROCEDURES ***/

/* User creates a new character */
/* TODO: do we actually need to initialize all these fields? */
CREATE PROCEDURE create_character (IN the_user INT, IN the_name TEXT,
	IN the_system TEXT, IN the_stats TEXT, IN the_notes TEXT,
	IN the_portrait TEXT, IN the_piece TEXT, IN the_color TEXT)
BEGIN
	START TRANSACTION;
/* create the character */
	INSERT INTO characters (name, system, stats, notes, portrait, piece, color)
		VALUES (the_name, the_system, the_stats, the_notes, the_portrait,
		the_piece, the_color);
	SET @new_id = LAST_INSERT_ID();
/* make this user the character's owner */
	INSERT INTO character_owners (user_id, character_id)
		VALUES (the_user, @new_id);
/* return the new character's id */
	SELECT @new_id;
	COMMIT;
END;
 
/* User views a list of characters he owns */
CREATE PROCEDURE read_characters (IN the_user INT)
BEGIN
/*
	SELECT id, name, system, stats, notes, portrait, piece, color
		FROM characters, character_owners
		WHERE id = character_id AND user_id = the_user;
*/
	SELECT id, name, system, stats, notes, portrait, piece, color
		FROM characters JOIN character_owners ON id = character_id
		WHERE user_id = the_user;
END;


/*** CHARACTER_OWNERS PROCEDURES ***/

/* User shares this character with another user */
CREATE PROCEDURE create_character_owner (IN the_user INT, IN the_character INT)
BEGIN
	INSERT INTO character_owners (user_id, character_id)
		VALUES (the_user, the_character);
END;

/* User views a list of this character's owners */
CREATE PROCEDURE read_character_owners (IN the_character INT)
BEGIN
/*
	SELECT id, login, logged_in, name, color FROM character_owners, users
		WHERE character_id = the_character AND id = user_id;
*/
	SELECT id, login, logged_in, name, color
		FROM character_owners JOIN users ON id = user_id
		WHERE character_id = the_character;
END;

/* User edits character and PHP logic checks whether user owns character */
CREATE PROCEDURE read_character_owner (IN the_user INT, IN the_character INT)
BEGIN
	SELECT * FROM character_owners
		WHERE user_id = the_user AND character_id = the_character;
END;

/* User disowns a character
or User removes another user from this character's owners */
CREATE PROCEDURE delete_character_owner (IN the_user INT, IN the_character INT)
BEGIN
	START TRANSACTION;
/* remove the character owner */
	DELETE FROM character_owners
		WHERE user_id = the_user AND character_id = the_character;	
/* delete characters without owners */
/*
	IF (SELECT COUNT(*) FROM character_owners
		WHERE character_id = the_character) = 0
*/
	IF the_character NOT IN (SELECT character_id FROM character_owners)
	THEN
		DELETE FROM characters WHERE id = the_character;
	END IF;
	COMMIT;
END;

