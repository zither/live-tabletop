<?php session_start();?>

<html>
  <head>
    <title>Live Tabletop Automated Test</title>
    <link rel="stylesheet" href="test.css"/>
    <script type="text/javascript" src="../../js/liveTabletop.js"></script>
    <script type="text/javascript" src="test.js"></script>
    <script type="text/javascript">

// constants
TEST.ADMIN_USERNAME = "foo";
TEST.ADMIN_PASSWORD = "bar";
TEST.WRONG_PASSWORD = "baz";
TEST.TABLE_ARGS = {
name: "My Table",
  background: 1,
  default_tile: 2,
  rows: 100,
  columns: 50,
  tile_width: 45,
  tile_height: 30};

// special result tests
TEST.one_table = function (ajax) {return TEST.count(ajax, "table", 1);};
TEST.one_user = function (ajax) {return TEST.count(ajax, "user", 1);},

// list of tests
TEST.tests = [

  {group: "INSTALL",
    action: "install.php",
    abort: true,
    args: {
      location:"<?php echo $_REQUEST['location'];?>",
      database:"<?php echo $_REQUEST['database'];?>",
      username:"<?php echo $_REQUEST['username'];?>",
      password:"<?php echo $_REQUEST['password'];?>",
      admin_username : TEST.ADMIN_USERNAME,
      admin_password : TEST.ADMIN_PASSWORD},
    result: TEST.blank},
  {action: "db_config.php", args: {}, result: TEST.exists},

  {group: "LOGIN",
    action: "login.php",
    args: {username: TEST.ADMIN_USERNAME, password: TEST.WRONG_PASSWORD},
    result: function (ajax) {return TEST.count(ajax, "user", 0);}},
  {action: "login.php",
    args: {username: TEST.ADMIN_USERNAME, password: TEST.ADMIN_PASSWORD},
    result: TEST.one_user},

  {group: "LOGOUT", action: "logout.php", args: {}, result: TEST.blank},
  {action: "create_table.php",
    args: TEST.TABLE_ARGS,
    result: function (ajax) {
      return TEST.equals(ajax, "You are not logged in.");}},
  {action: "login.php", args: {},
    args: {username: TEST.ADMIN_USERNAME, password: TEST.ADMIN_PASSWORD},
    result: function (ajax) {return TEST.count(ajax, "user", 1);}},
  {action: "create_table.php", args: TEST.TABLE_ARGS, result: TEST.one_table},

  // M E S S A G E

  {group: "CREATE MESSAGE",
    action: "create_message.php",
    args: {table_id: 1, user_id: 1, text: "Hello, world!"},
    result: TEST.blank},

  {group: "READ MESSAGES",
    action: "read_messages.php",
    args: {table_id: 1, time: 0},
    result: function (ajax) {return TEST.count(ajax, "message", 1);}},

  {group: "PRIVATE ROLL",
    action: "private_roll.php",
    args: {text: "From 1975 - 2010, [0 + 2010 - 1975] years passed."},
    result: function (ajax) {
      var roll = ajax.responseXML.getElementsByTagName("message")[0];
      var text = unescape(roll.textContent.replace(/^\s+|\s+$/g, ''));
      return (text == 'From 1975 - 2010, <span title="0 + 2010 - 1975">'
        + '35</span> years passed.') ? "PASS" : "FAIL [" + text + "]";}},

  // U S E R

  {group: "CHANGE PASSWORD",
    action: "update_user_password.php",
    args: {password: TEST.WRONG_PASSWORD},
    result: TEST.blank},
  {action: "login.php",
    args: {username: TEST.ADMIN_USERNAME, password: TEST.WRONG_PASSWORD},
    result: TEST.one_user},
  {action: "update_user_password.php",
    args: {password: TEST.ADMIN_PASSWORD},
    result: TEST.blank},
  {action: "login.php",
    args: {username: TEST.ADMIN_USERNAME, password: TEST.ADMIN_PASSWORD},
    result: TEST.one_user},

  {group: "CREATE USER",
    action: "create_user.php",
    args: {username: "larry", password: "curly", permissions: "user"},
    result: TEST.blank},
  {action: "login.php",
    args: {username: "larry", password: "curly"},
    result: TEST.one_user},
  {action: "login.php",
    args: {username: TEST.ADMIN_USERNAME, password: TEST.ADMIN_PASSWORD},
    result: TEST.one_user},

  {group: "READ USERS",
    action: "read_users.php",
    args: {},
    result: function (ajax) {return TEST.count(ajax, "user", 2);}},

  {group: "UPDATE USER",
    action: "update_user.php",
    args: {
      user_id: 2,
      username: "moe",
      color: "green",
      permissions: "administrator"},
    result: TEST.blank},
  {action: "read_users.php",
    args: {},
    result: function (ajax) {
      var users = ajax.responseXML.getElementsByTagName("user");
      for (var i = 0; i < users.length; i++) {
        if (users[i].getAttribute("id") == "2"
          && users[i].getAttribute("name") == "moe"
          && users[i].getAttribute("color") == "green"
          && users[i].getAttribute("permissions") == "administrator"
        ) return "PASS";
      }
      return "FAIL [" + ajax.responseText + "]";}},

  {group: "DELETE USER",
    action: "delete_user.php",
    args: {user_id: 2},
    result: TEST.blank},
  {action: "read_users.php", args: {}, result: TEST.one_user},

  // T A B L E

  {group: "CREATE TABLE",
    action: "create_table.php",
    args: {
      name: "My Other Table",
      background: 5,
      default_tile: 7,
      rows: 16,
      columns: 25,
      tile_width: 32,
      tile_height: 40},
    result: TEST.one_table},

  {group: "READ TABLE",
    action: "read_table.php",
    args: {table_id: 2},
    result: TEST.one_table},

  {group: "READ TABLES",
    action: "read_tables.php",
    args: {},
    result: function (ajax) {return TEST.count(ajax, "table", 2);}},

  {group: "UPDATE TABLE",
    action: "update_table.php",
    args: {
      table_id: 1,
      name: "My Original Table",
      background: 3,
      grid_width: 15,
      grid_height: 10,
      grid_thickness: 2,
      grid_color: "brown"},
    result: TEST.blank},
  {action: "read_table.php",
    args: {table_id: 1},
    result: function (ajax) {
      var tables = ajax.responseXML.getElementsByTagName("table");
      for (var i = 0; i < tables.length; i++) {
        if (tables[i].getAttribute("id") == "1"
          && tables[i].getAttribute("name") == "My Original Table"
          && tables[i].getAttribute("background") == "3"
          && tables[i].getAttribute("grid_width") == "15"
          && tables[i].getAttribute("grid_height") == "10"
          && tables[i].getAttribute("grid_thickness") == "2"
          && tables[i].getAttribute("grid_color") == "brown"
        ) return "PASS";
      }
      return "FAIL [" + ajax.responseText + "]";}},

  {group: "DELETE TABLE",
    action: "delete_table.php",
    args: {table_id: 2},
    result: TEST.blank},
  {action: "read_tables.php", args: {}, result: TEST.one_table},

  // T I L E

  {group: "READ TILES",
    action: "read_tiles.php",
    args: {table_id: 1},
    result: function (ajax) {
      var text = ajax.responseXML.documentElement.textContent;
      var tiles = text.replace(/^\s+|\s+$/g, '').split(' ');
      if (tiles.length != 5000) return "FAIL [" + tiles.length + " tiles]";
      for (var i = 0; i < tiles.length; i++)
         if (tiles[i] != "0002") return "FAIL [" + i + ": " + tiles[i] + "]";
      return "PASS";}},

  {group: "UPDATE TILE",
    action: "update_tile.php",
    args: {
      table_id: 1,
      x: 7,
      y: 10,
      image_id: 4,
      fog: 1,
      right: 2,
      bottom: 1},
    result: TEST.blank},
  {action: "read_tiles.php",
    args: {table_id: 1},
    result: function (ajax) {
      var text = ajax.responseXML.documentElement.textContent;
      var tiles = text.replace(/^\s+|\s+$/g, '').split(' ');
      if (tiles.length != 5000) return "FAIL [" + tiles.length + " tiles]";
      for (var i = 0; i < tiles.length; i++) {
         var target = (i == 507) ? "1214" : "0002";
         if (tiles[i] != target) return "FAIL [" + i + ": " + tiles[i] + "]";
      }
      return "PASS";}},

  {group: "FILL FOG",
    action: "fill_fog.php", args: {table_id: 1}, result: TEST.blank},
  {action: "read_tiles.php",
    args: {table_id: 1},
    result: function (ajax) {
      var text = ajax.responseXML.documentElement.textContent;
      var tiles = text.replace(/^\s+|\s+$/g, '').split(' ');
      if (tiles.length != 5000) return "FAIL [" + tiles.length + " tiles]";
      for (var i = 0; i < tiles.length; i++) {
         var target = (i == 507) ? "1214" : "1002";
         if (tiles[i] != target) return "FAIL [" + i + ": " + tiles[i] + "]";
      }
      return "PASS";}},

  {group: "CLEAR FOG",
    action: "clear_fog.php", args: {table_id: 1}, result: TEST.blank},
  {action: "read_tiles.php",
    args: {table_id: 1},
    result: function (ajax) {
      var text = ajax.responseXML.documentElement.textContent;
      var tiles = text.replace(/^\s+|\s+$/g, '').split(' ');
      if (tiles.length != 5000) return "FAIL [" + tiles.length + " tiles]";
      for (var i = 0; i < tiles.length; i++) {
         var target = (i == 507) ? "0214" : "0002";
         if (tiles[i] != target) return "FAIL [" + i + ": " + tiles[i] + "]";
      }
      return "PASS";}},

  // P I E C E

  {group: "CREATE PIECE",
    action: "create_piece.php",
    args: {
      table_id: 1,
      image_id: 10,
      user_id: 1,
      name: "My Piece",
      x: 30,
      y: 100,
      x_offset: -32,
      y_offset: -8,
      height: 16,
      width: 64},
    result: TEST.blank},

  {group: "READ PIECES",
    action: "read_pieces.php",
    args: {table_id: 1},
    result: function (ajax) {return TEST.count(ajax, "piece", 1);}},

  {group: "UPDATE PIECE",
    action: "update_piece.php",
    args: {
      piece_id: 1,
      image_id: 11,
      user_id: 2,
      name: "Still My Piece",
      x: 99,
      y: 49,
      x_offset: 5,
      y_offset: 10,
      width: 20,
      height: 40,
      color: "orange"},
    result: TEST.blank},
  {action: "read_pieces.php",
    args: {table_id: 1},
    result: function (ajax) {
      var pieces = ajax.responseXML.getElementsByTagName("piece");
      for (var i = 0; i < pieces.length; i++) {
        if (pieces[i].getAttribute("id") == "1"
          && pieces[i].getAttribute("image") == "11"
          && pieces[i].getAttribute("user") == "2"
          && pieces[i].getAttribute("name") == "Still My Piece"
          && pieces[i].getAttribute("x") == "99"
          && pieces[i].getAttribute("y") == "49"
          && pieces[i].getAttribute("x_offset") == "5"
          && pieces[i].getAttribute("y_offset") == "10"
          && pieces[i].getAttribute("width") == "20"
          && pieces[i].getAttribute("height") == "40"
          && pieces[i].getAttribute("color") == "orange"
        ) return "PASS";
      }
      return "FAIL [" + ajax.responseText + "]";}},

  {group: "UPDATE STAT",
    action: "update_stat.php",
    args: {piece_id: 1, name: "hit points", value: "20"},
    result: TEST.blank},
  {action: "read_pieces.php",
    args: {table_id: 1},
    result: function (ajax) {
      var stats = ajax.responseXML.getElementsByTagName("stat");
      for (var i = 0; i < stats.length; i++) {
        if (stats[i].getAttribute("name") == "hit points"
          && stats[i].textContent == "20") return "PASS";
      }
      return "FAIL [" + ajax.responseText + "]";}},

  {group: "DELETE STAT",
    action: "delete_stat.php",
    args: {piece_id: 1, name: "hit points"},
    result: TEST.blank},
  {action: "read_pieces.php",
    args: {table_id: 1},
    result: function (ajax) {return TEST.count(ajax, "stat", 0);}},

  {group: "DELETE PIECE",
    action: "delete_piece.php", args: {piece_id: 1}, result: TEST.blank},
  {action: "read_pieces.php",
    args: {table_id: 1},
    result: function (ajax) {return TEST.count(ajax, "piece", 0);}},

  // I M A G E

  {group: "CREATE IMAGE",
    action: "create_image.php",
    uploader: true, // this action does not use ajax
    args: {file: "background.gif", type: "background"},
    result: TEST.unimplemented},

  {group: "READ IMAGES",
    action: "read_images.php",
    args: {type: "background"},
    result: TEST.unimplemented},

  {group: "READ IMAGES USEABLE",
    action: "read_images_useable.php",
    args: {type: "background"},
    result: TEST.unimplemented},

  {group: "UPDATE IMAGE",
    action: "update_image.php",
    args: {image_id: 1, user_id: 2, public: 1},
    result: TEST.unimplemented},
  {action: "read_images.php",
    args: {type: "background"},
    result: TEST.unimplemented},

  {group: "DELETE IMAGE",
    action: "delete_image.php",
    args: {image_id: 1},
    result: TEST.unimplemented},
  {action: "read_images.php",
    args: {type: "background"},
    result: TEST.unimplemented}
];

onload = TEST.start;

    </script>
  </head>
  <body>
  </body>
</html>
