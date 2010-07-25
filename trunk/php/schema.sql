DROP TABLE IF EXISTS users, tiles, tables, pieces, messages, images, stats;

DROP PROCEDURE IF EXISTS create_user;
DROP PROCEDURE IF EXISTS read_users;
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
DROP PROCEDURE IF EXISTS read_pieces;
DROP PROCEDURE IF EXISTS update_piece;
DROP PROCEDURE IF EXISTS delete_piece;
DROP PROCEDURE IF EXISTS create_message;
DROP PROCEDURE IF EXISTS read_messages;
DROP PROCEDURE IF EXISTS expire_messages;
DROP PROCEDURE IF EXISTS create_image;
DROP PROCEDURE IF EXISTS read_images;
DROP PROCEDURE IF EXISTS read_images_useable;
DROP PROCEDURE IF EXISTS update_image;
DROP PROCEDURE IF EXISTS delete_image;
DROP PROCEDURE IF EXISTS set_stat;
DROP PROCEDURE IF EXISTS get_stats;
DROP PROCEDURE IF EXISTS delete_stat;


/* USERS TABLE

   Passwords are hashed so evildoers who gain access to the database cannot see
   your password (finding another password with the same hash is very hard.) 
   The random salt is combined with your password before hashing, so two users 
   with the same password will not have the same password hash. This also makes
   dictionary attacks harder: the attacker has to guess passwords for each user
   separately because the users have different salts.

   Permissions is "user" or "administrator", and user name must be unique to 
   identify the user when logging in and creating a new user. The name field is 
   VARCHAR(200) because MYSQL can only index a finite number of characters. 
   Other references to the user (like cross-references between tables) use the 
   auto-incrementing user_id.

   The last action timestamp records the last time the user was actively using
   Live Tabletop, so it needs to be updated frequently. It allows us to remove
   inactive users and content created by inactive users.
*/

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  color TEXT,
  permissions TEXT NOT NULL,
  last_action TIMESTAMP,
  logged_in TINYINT NOT NULL DEFAULT 0
);


/* TILES TABLE

   Fog is 0 if there is no fog of war on this tile or 1 if there is fog of war
   on this tile. Right and bottom walls have the value 2 if there is a door on
   that side of the tile, 1 if there is a wall on that side of the tile and 0 
   if there is neither a wall nor a door.
*/

CREATE TABLE tiles (
  table_id INT NOT NULL,
  x SMALLINT NOT NULL,
  y SMALLINT NOT NULL,
  image_id INT,
  fog TINYINT NOT NULL DEFAULT 0,
  right_wall TINYINT NOT NULL DEFAULT 0,
  bottom_wall TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (table_id, x, y)
);


/* TABLES TABLE

   Tile height/width applies to the spacing of tile images. Grid height/width 
   snaps the positioning of pieces on the table. Image id points to the 
   background image. Name must be unique so you can switch to the new table 
   as soon as you create it. Unique columns must have a fixed length, so
   name is a VARCHAR(200) instead of TEXT.
*/

CREATE TABLE tables (
  table_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  image_id INT,
  name VARCHAR(200) NOT NULL UNIQUE,
  tile_rows SMALLINT NOT NULL,
  tile_columns SMALLINT NOT NULL,
  tile_width INT NOT NULL DEFAULT 45,
  tile_height INT NOT NULL DEFAULT 45,
  grid_width INT NOT NULL DEFAULT 45,
  grid_height INT NOT NULL DEFAULT 45,
  grid_thickness INT NOT NULL DEFAULT 0,
  grid_color TEXT,
  piece_stamp DATETIME,
  tile_stamp DATETIME,
  message_stamp DATETIME
);


/* PIECES TABLE

   Width and height refer to the size of the image in tile rows and columns. 
   x, y and the offsets are measured in screen pixels. x and y can be converted
   to rows and columns by dividing them by the row and column height.
*/

CREATE TABLE pieces (
  piece_id INT AUTO_INCREMENT PRIMARY KEY,
  table_id INT NOT NULL,
  user_id INT NOT NULL,
  image_id INT,
  name TEXT,
  x INT NOT NULL DEFAULT 0,
  y INT NOT NULL DEFAULT 0,
  x_offset INT NOT NULL DEFAULT 0,
  y_offset INT NOT NULL DEFAULT 0,
  width SMALLINT NOT NULL DEFAULT 1,
  height SMALLINT NOT NULL DEFAULT 1,
  color TEXT
);


/* MESSAGES TABLE */

CREATE TABLE messages (
  table_id INT NOT NULL,
  user_id INT NOT NULL,
  text TEXT,
  time_stamp TIMESTAMP
);


/* IMAGES TABLE */

CREATE TABLE images (
  image_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  file TEXT NOT NULL,
  type TEXT NOT NULL,
  public TINYINT NOT NULL DEFAULT 0,
  time_stamp TIMESTAMP
);


/* STATS TABLE */

CREATE TABLE stats (
  piece_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  value TEXT,
  PRIMARY KEY (piece_id, name)
);



/* STORED PROCEDURES */


/* Users Procedures */

CREATE PROCEDURE create_user (IN the_name VARCHAR(200), IN the_hash TEXT,
  IN the_salt TEXT, IN the_color TEXT, IN the_permissions TEXT)
BEGIN
  INSERT INTO users (name, password_hash, password_salt, color, permissions)
    VALUES (the_name, the_hash, the_salt, the_color, the_permissions);
END; 

CREATE PROCEDURE read_users ()
BEGIN
  SELECT user_id, name, password_hash, password_salt, color, permissions, logged_in,
    TIME_TO_SEC(TIMEDIFF(last_action, '1970-01-01 00:00:00')) AS last_action
    FROM users ORDER BY name;
END; 

CREATE PROCEDURE read_user_by_name (IN the_name VARCHAR(200))
BEGIN
  SELECT user_id, name, password_hash, password_salt, color, permissions, logged_in,
    TIME_TO_SEC(TIMEDIFF(last_action, '1970-01-01 00:00:00')) AS last_action
    FROM users WHERE LOWER(name) = LOWER(the_name);
END; 

CREATE PROCEDURE update_user_password (IN the_user INT, IN the_hash TEXT, IN the_salt TEXT)
BEGIN
  UPDATE users SET password_hash = the_hash, password_salt = the_salt WHERE user_id = the_user;
END; 

CREATE PROCEDURE update_user (IN the_user INT, IN the_name VARCHAR(200),
  IN the_color TEXT, IN the_permissions TEXT)
BEGIN
  UPDATE users SET name = the_name, color = the_color, permissions = the_permissions
    WHERE user_id = the_user;
END; 

CREATE PROCEDURE update_user_timestamp (IN the_user INT)
BEGIN
  UPDATE users SET last_action = NOW() WHERE user_id = the_user;
END; 

CREATE PROCEDURE delete_user (IN the_user INT)
BEGIN
  START TRANSACTION;
  DELETE FROM messages WHERE user_id = the_user;
  DELETE FROM messages WHERE table_id IN (
    SELECT table_id FROM tables WHERE user_id = the_user);
  DELETE FROM stats WHERE piece_id IN (
    SELECT piece_id FROM pieces WHERE table_id IN (
      SELECT table_id FROM tables WHERE user_id = the_user));
  DELETE FROM pieces WHERE table_id IN (
    SELECT table_id FROM tables WHERE user_id = the_user);
  DELETE FROM tiles WHERE table_id IN (
    SELECT table_id FROM tables WHERE user_id = the_user);
  DELETE FROM tables WHERE user_id = the_user;
  DELETE FROM images WHERE user_id = the_user;
  DELETE FROM users WHERE user_id = the_user;
  COMMIT;
END; 



/* Tiles Procedures */

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
  SELECT image_id, fog, right_wall, bottom_wall FROM tiles WHERE table_id = the_table
    ORDER BY y, x ASC;
END; 

CREATE PROCEDURE update_tile (IN the_table INT, IN the_x SMALLINT, IN the_y SMALLINT,
  IN the_image INT, IN the_fog TINYINT, IN the_right TINYINT, IN the_bottom TINYINT)
BEGIN
  START TRANSACTION;
  UPDATE tiles SET image_id = the_image, fog = the_fog, 
      right_wall = the_right, bottom_wall = the_bottom
    WHERE x = the_x AND y = the_y AND table_id = the_table;
  UPDATE tables SET tile_stamp = NOW() WHERE table_id = the_table;
  COMMIT;
END; 

CREATE PROCEDURE update_tiles_fill_fog (IN the_table INT)
BEGIN
  START TRANSACTION;
  UPDATE tiles SET fog = 1 WHERE table_id = the_table;
  UPDATE tables SET tile_stamp = NOW() WHERE table_id = the_table;
  COMMIT;
END; 

CREATE PROCEDURE update_tiles_clear_fog (IN the_table INT)
BEGIN
  START TRANSACTION;
  UPDATE tiles SET fog = 0 WHERE table_id = the_table;
  UPDATE tables SET tile_stamp = NOW() WHERE table_id = the_table;
  COMMIT;
END; 



/* Tables Procedures */

CREATE PROCEDURE create_table (IN the_name VARCHAR(200), IN the_image INT,
  IN the_user INT, IN the_rows SMALLINT, IN the_columns SMALLINT, 
  IN the_width INT, IN the_height INT)
BEGIN
  INSERT INTO tables (name, image_id, user_id, tile_rows, tile_columns,
      tile_width, tile_height, grid_width, grid_height,
      tile_stamp, message_stamp, piece_stamp)
    VALUES (the_name, the_image, the_user, the_rows, the_columns,
      the_width, the_height, the_width, the_height, NOW(), NOW(), NOW());
END; 

CREATE PROCEDURE read_table (IN the_table INT)
BEGIN
  SELECT table_id, user_id, image_id, name, tile_rows, tile_columns,
    tile_width, tile_height, grid_width, grid_height, grid_thickness, grid_color, 
    TIME_TO_SEC(TIMEDIFF(piece_stamp, '1970-01-01 00:00:00')) AS piece_stamp,
    TIME_TO_SEC(TIMEDIFF(tile_stamp, '1970-01-01 00:00:00')) AS tile_stamp,
    TIME_TO_SEC(TIMEDIFF(message_stamp, '1970-01-01 00:00:00')) AS message_stamp
 FROM tables WHERE table_id = the_table;
END; 

CREATE PROCEDURE read_table_by_name (IN the_name VARCHAR(200))
BEGIN
  SELECT table_id, user_id, image_id, name, tile_rows, tile_columns,
    tile_width, tile_height, grid_width, grid_height, grid_thickness, grid_color, 
    TIME_TO_SEC(TIMEDIFF(piece_stamp, '1970-01-01 00:00:00')) AS piece_stamp,
    TIME_TO_SEC(TIMEDIFF(tile_stamp, '1970-01-01 00:00:00')) AS tile_stamp,
    TIME_TO_SEC(TIMEDIFF(message_stamp, '1970-01-01 00:00:00')) AS message_stamp
  FROM tables WHERE name = the_name;
END; 

CREATE PROCEDURE read_tables ()
BEGIN
  SELECT table_id, user_id, image_id, name, tile_rows, tile_columns,
    tile_width, tile_height, grid_width, grid_height, grid_thickness, grid_color, 
    TIME_TO_SEC(TIMEDIFF(piece_stamp, '1970-01-01 00:00:00')) AS piece_stamp,
    TIME_TO_SEC(TIMEDIFF(tile_stamp, '1970-01-01 00:00:00')) AS tile_stamp,
    TIME_TO_SEC(TIMEDIFF(message_stamp, '1970-01-01 00:00:00')) AS message_stamp
  FROM tables, users WHERE tables.user_id = users.user_id
    ORDER BY users.name;
END; 

CREATE PROCEDURE read_tables_by_user_id (IN the_user INT)
BEGIN
  SELECT table_id, user_id, image_id, name, tile_rows, tile_columns,
    tile_width, tile_height, grid_width, grid_height, grid_thickness, grid_color, 
    TIME_TO_SEC(TIMEDIFF(piece_stamp, '1970-01-01 00:00:00')) AS piece_stamp,
    TIME_TO_SEC(TIMEDIFF(tile_stamp, '1970-01-01 00:00:00')) AS tile_stamp,
    TIME_TO_SEC(TIMEDIFF(message_stamp, '1970-01-01 00:00:00')) AS message_stamp
  FROM tables WHERE user_id = the_user;
END; 

CREATE PROCEDURE read_table_timestamps (IN the_table INT)
BEGIN
  SELECT TIME_TO_SEC(TIMEDIFF(piece_stamp, '1970-01-01 00:00:00')) AS piece_stamp,
         TIME_TO_SEC(TIMEDIFF(tile_stamp, '1970-01-01 00:00:00')) AS tile_stamp,
         TIME_TO_SEC(TIMEDIFF(message_stamp, '1970-01-01 00:00:00')) AS message_stamp
    FROM tables WHERE table_id = the_table;
END; 

CREATE PROCEDURE update_table (IN the_table INT, IN the_name VARCHAR(200),
  IN the_user INT, IN the_image INT, IN the_grid_width INT,
  IN the_grid_height INT, IN the_grid_thickness INT, the_grid_color TEXT)
BEGIN
  UPDATE tables SET name = the_name, user_id = the_user, image_id = the_image,
      grid_width = the_grid_width, grid_height = the_grid_height,
      grid_thickness = the_grid_thickness, grid_color = the_grid_color
    WHERE table_id = the_table;
END; 

CREATE PROCEDURE delete_table (IN the_table INT)
BEGIN
  START TRANSACTION;
  DELETE FROM stats WHERE piece_id IN (
    SELECT piece_id FROM pieces WHERE table_id = the_table);
  DELETE FROM pieces WHERE table_id = the_table;
  DELETE FROM messages WHERE table_id = the_table;
  DELETE FROM tables WHERE table_id = the_table;
  COMMIT;
END; 



/* Piece Procedures */

CREATE PROCEDURE create_piece (IN the_table INT, IN the_image INT,
  IN the_user INT, IN the_name TEXT, IN the_x INT, IN the_y INT,
  IN the_x_offset INT, IN the_y_offset INT, IN the_width SMALLINT,
  IN the_height SMALLINT)
BEGIN
  START TRANSACTION;
  INSERT INTO pieces (table_id, image_id, user_id, name, x, y,
      x_offset, y_offsetname, width, height) 
    VALUES (the_table, the_image, the_user, the_name, the_x, the_y,
      the_x_offset, the_y_offset, the_width, the_height);
  UPDATE tables SET piece_stamp = NOW() WHERE table_id = the_table;
  COMMIT;
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
      x = the_x, y = the_x, x_offset = the_x_offset, y_offset = the_y_offset,
      width = the_width, height = the_height, color = the_color 
    WHERE piece_id = the_piece;
  UPDATE tables SET piece_stamp = NOW() WHERE table_id = (
    SELECT table_id FROM pieces WHERE piece_id = the_piece);
  COMMIT;
END; 

CREATE PROCEDURE delete_piece (IN the_piece INT)
BEGIN
  START TRANSACTION;
  UPDATE tables SET piece_stamp = NOW() WHERE table_id = (
    SELECT table_id FROM pieces WHERE piece_id = the_piece);
  DELETE FROM pieces WHERE piece_id = the_piece;
  COMMIT;
END; 



/* Messages Procedures */

CREATE PROCEDURE create_message (IN the_table INT, IN the_user INT, IN the_text TEXT)
BEGIN
  START TRANSACTION;
  INSERT INTO messages (table_id, user_id, text) VALUES (the_table, the_user, the_text);
  UPDATE tables SET message_stamp = NOW() WHERE table_id = the_table;
  COMMIT;
END; 

CREATE PROCEDURE read_messages (IN the_table INT, IN the_time INT)
BEGIN
  SELECT table_id, user_id, text,
    TIME_TO_SEC(TIMEDIFF(time_stamp, '1970-01-01 00:00:00')) AS time
    FROM messages WHERE table_id = the_table 
    AND TIME_TO_SEC(TIMEDIFF(time_stamp, '1970-01-01 00:00:00')) > the_time
    ORDER BY time ASC;
END; 

CREATE PROCEDURE expire_messages ()
BEGIN
  DELETE FROM messages WHERE time_stamp < DATE_SUB(NOW(), INTERVAL 6 HOUR);
END; 


/* Images Procedures */

CREATE PROCEDURE create_image (IN the_user INT, IN the_file TEXT,
  IN the_type TEXT, in the_public TINYINT)
BEGIN
  INSERT INTO images (user_id, file, type, public)
    VALUES (the_user, the_file, the_type, the_public);
END; 

CREATE PROCEDURE read_images (IN the_type TEXT)
BEGIN
  SELECT image_id, user_id, file, type, public,
    TIME_TO_SEC(TIMEDIFF(time_stamp, '1970-01-01 00:00:00')) AS time
    FROM images WHERE type = the_type;
END; 

CREATE PROCEDURE read_images_useable (IN the_user INT, IN the_type TEXT)
BEGIN
  SELECT image_id, user_id, file, type, public,
    TIME_TO_SEC(TIMEDIFF(time_stamp, '1970-01-01 00:00:00')) AS time
    FROM images WHERE type = the_type AND (user_id = the_user OR public = 1);
END; 

CREATE PROCEDURE update_image (IN the_image INT, IN the_user INT, IN the_public INT)
BEGIN
  UPDATE images SET user_id = the_user, public = the_public WHERE image_id = the_image;
END; 

CREATE PROCEDURE delete_image (IN the_image INT)
BEGIN
  DELETE FROM images WHERE image_id = the_image;
END; 


/* Stats Procedures */

CREATE PROCEDURE set_stat (IN the_piece INT, IN the_name VARCHAR(200), IN the_value TEXT)
BEGIN
  REPLACE INTO stats (piece_id, name, value) VALUES (the_piece, the_name, the_value);
END; 

CREATE PROCEDURE get_stats (IN the_piece INT)
BEGIN
  SELECT * FROM stats WHERE piece_id = the_piece;
END; 

CREATE PROCEDURE delete_stat (IN the_piece INT, IN the_name VARCHAR(200))
BEGIN
  DELETE FROM stats WHERE piece_id = the_piece AND name = the_name;
END; 


