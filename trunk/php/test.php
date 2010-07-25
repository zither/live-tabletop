<?php session_start();?>

<html>
  <head>
    <title>Live Tabletop Automated Test</title>
    <script type="text/javascript">

function LT_ajax_request(method, url, args, callback) {

  // make an asynchronous request if a callback is provided
  var ajax = new XMLHttpRequest();
  var asynchronous = false;
  if (callback) {
    asynchronous = true;
    ajax.onreadystatechange = function () {
      if (ajax.readyState == 4) callback(ajax);
    };
  }

  // combine args into urlencoded string
  var arg_list = [];
  for (var a in args) arg_list.push(a + "=" + encodeURIComponent(args[a]));
  var argument_string = arg_list.join("&");

  // with the GET method we just append the args to the URL
  if (method == "GET") {
    ajax.open(method, url + "?" + argument_string, asynchronous);
    ajax.send();
  }

  // with the POST method we send the args as a urlencoded message body
  if (method == "POST") {
    ajax.open(method, url, asynchronous);
    ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    ajax.setRequestHeader("Content-length", argument_string.length);
    ajax.setRequestHeader("Connection", "close");
    ajax.send(argument_string);
  }

  // return the ajax object, especially for synchronous requests
  return ajax;
}

function LT_create_element(tag_name, attributes, container, text) {
  var element = document.createElement(tag_name);
  for (attribute_name in attributes)
    element.setAttribute(attribute_name, attributes[attribute_name]);
  if (container) container.appendChild(element);
  if (text) element.appendChild(document.createTextNode(text));
  return element;
}

var TEST = {
  ADMIN_USERNAME: "foo",
  ADMIN_PASSWORD: "bar",
  WRONG_PASSWORD: "baz",
  TABLE_ARGS: {
    name: "My Table",
    background: 1,
    default_tile: 2,
    rows: 100,
    columns: 50,
    tile_width: 45,
    tile_height: 30},
  index: 0,
  start: function () {
    TEST.echo("STARTING TESTS ...");
    TEST.request();},
  echo: function (text) {
    LT_create_element("div", {}, document.body, text);},
  request: function () {
    var test = TEST.tests[TEST.index];
    LT_ajax_request("POST", test.action, test.args, TEST.finish);},
  blank: function (ajax) {
    var text = ajax.responseText.replace(/^\s+|\s+$/g, '');
    return (text == "") ? "PASS" : "FAIL [" + text + "]";},
  exists: function (ajax) {
    if (ajax.status == 200) return "PASS";
    else return "FAIL [status = " + ajax.status + "]";},
  unimplemented: function (ajax) {
    return "FAIL (test not implemented) [" + ajax.responseText + "]";},
  count: function (ajax, tag, target) {
    var count = ajax.responseXML.getElementsByTagName(tag).length;
    if (count == target) return "PASS";
    else return "FAIL [returned " + count + " " + tag + "s]";},
  equals: function (ajax, target) {
    var text = ajax.responseText.replace(/^\s+|\s+$/g, '');
    return (text == target) ? "PASS" : "FAIL [" + text + "]";},
  one_table: function (ajax) {return TEST.count(ajax, "table", 1);},
  one_user: function (ajax) {return TEST.count(ajax, "user", 1);},
  finish: function (ajax) {
    var test = TEST.tests[TEST.index++];
    var result = test.result(ajax);
    TEST.echo(test.action + ": " + result);
    if (TEST.index == TEST.tests.length) TEST.echo("... FINISHED!");
    else if (TEST.index != 1 || result == "PASS") TEST.request();}
};

TEST.tests = [
  // INSTALL
  {action: "install.php",
    args: {
      location:"<?php echo $_REQUEST['location'];?>",
      database:"<?php echo $_REQUEST['database'];?>",
      username:"<?php echo $_REQUEST['username'];?>",
      password:"<?php echo $_REQUEST['password'];?>",
      admin_username : TEST.ADMIN_USERNAME,
      admin_password : TEST.ADMIN_PASSWORD},
    result: TEST.blank},
  {action: "db_config.php", args: {}, result: TEST.exists},

  // LOGIN
  {action: "login.php",
    args: {username: TEST.ADMIN_USERNAME, password: TEST.WRONG_PASSWORD},
    result: function (ajax) {return TEST.count(ajax, "user", 0);}},
  {action: "login.php",
    args: {username: TEST.ADMIN_USERNAME, password: TEST.ADMIN_PASSWORD},
    result: TEST.one_user},

  // LOGOUT
  {action: "logout.php", args: {}, result: TEST.blank},
  {action: "create_table.php",
    args: TEST.TABLE_ARGS,
    result: function (ajax) {
      return TEST.equals(ajax, "You are not logged in.");}},
  {action: "login.php", args: {},
    args: {username: TEST.ADMIN_USERNAME, password: TEST.ADMIN_PASSWORD},
    result: function (ajax) {return TEST.count(ajax, "user", 1);}},
  {action: "create_table.php", args: TEST.TABLE_ARGS, result: TEST.one_table},

  // M E S S A G E

  // CREATE MESSAGE
  {action: "create_message.php",
    args: {table_id: 1, user_id: 1, text: "Hello, world!"},
    result: TEST.blank},

  // READ MESSAGES
  {action: "read_messages.php",
    args: {table_id: 1, time: 0},
    result: function (ajax) {return TEST.count(ajax, "message", 1);}},

  // PRIVATE ROLL
  {action: "private_roll.php",
    args: {text: "From 1975 - 2010, [0 + 2010 - 1975] years passed."},
    result: function (ajax) {
      var roll = ajax.responseXML.getElementsByTagName("message")[0];
      var text = unescape(roll.textContent.replace(/^\s+|\s+$/g, ''));
      return (text == 'From 1975 - 2010, <span title="0 + 2010 - 1975">'
        + '35</span> years passed.') ? "PASS" : "FAIL [" + text + "]";}},

  // U S E R

  // CHANGE PASSWORD
  {action: "update_user_password.php",
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

  // CREATE USER
  {action: "create_user.php",
    args: {username: "larry", password: "curly", permissions: "user"},
    result: TEST.blank},
  {action: "login.php",
    args: {username: "larry", password: "curly"},
    result: TEST.one_user},
  {action: "login.php",
    args: {username: TEST.ADMIN_USERNAME, password: TEST.ADMIN_PASSWORD},
    result: TEST.one_user},

  // READ USERS
  {action: "read_users.php",
    args: {},
    result: function (ajax) {return TEST.count(ajax, "user", 2);}},

  // UPDATE USER
  {action: "update_user.php",
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

  // DELETE USER
  {action: "delete_user.php", args: {user_id: 2}, result: TEST.blank},
  {action: "read_users.php", args: {}, result: TEST.one_user},

  // T A B L E

  // CREATE TABLE
  {action: "create_table.php",
    args: {
      name: "My Other Table",
      background: 5,
      default_tile: 7,
      rows: 16,
      columns: 25,
      tile_width: 32,
      tile_height: 40},
    result: TEST.one_table},

  // READ TABLE
  {action: "read_table.php", args: {table_id: 2}, result: TEST.one_table},

  // READ TABLES
  {action: "read_tables.php",
    args: {},
    result: function (ajax) {return TEST.count(ajax, "table", 2);}},

  // UPDATE TABLE
  {action: "update_table.php",
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

  // DELETE TABLE
  {action: "delete_table.php", args: {table_id: 2}, result: TEST.blank},
  {action: "read_tables.php", args: {}, result: TEST.one_table},

  // T I L E

  // READ TILES
  {action: "read_tiles.php",
    args: {table_id: 1},
    result: function (ajax) {
      var text = ajax.responseXML.documentElement.textContent;
      var tiles = text.replace(/^\s+|\s+$/g, '').split(' ');
      if (tiles.length != 5000) return "FAIL [" + tiles.length + " tiles]";
      for (var i = 0; i < tiles.length; i++)
         if (tiles[i] != "0002") return "FAIL [" + i + ": " + tiles[i] + "]";
      return "PASS";}},

  // UPDATE TILE
  {action: "update_tile.php",
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

  // FILL FOG
  {action: "fill_fog.php", args: {table_id: 1}, result: TEST.blank},
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

  // CLEAR FOG
  {action: "clear_fog.php", args: {table_id: 1}, result: TEST.blank},
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

  // CREATE PIECE
  {action: "create_piece.php",
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

  // READ PIECES
  {action: "read_pieces.php",
    args: {table_id: 1},
    result: function (ajax) {return TEST.count(ajax, "piece", 1);}},

  // UPDATE PIECE
  {action: "update_piece.php",
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

  // UPDATE STAT
  {action: "update_stat.php",
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

  // DELETE STAT
  {action: "delete_stat.php",
    args: {piece_id: 1, name: "hit points"},
    result: TEST.blank},
  {action: "read_pieces.php",
    args: {table_id: 1},
    result: function (ajax) {return TEST.count(ajax, "stat", 0);}},

  // DELETE PIECE
  {action: "delete_piece.php", args: {piece_id: 1}, result: TEST.blank},
  {action: "read_pieces.php",
    args: {table_id: 1},
    result: function (ajax) {return TEST.count(ajax, "piece", 0);}},

  // I M A G E

  // CREATE IMAGE - actually this will not be done with AJAX
  {action: "create_image.php",
    args: {file: "background.gif", type: "background"},
    result: TEST.unimplemented},

  // READ IMAGES
  {action: "read_images.php",
    args: {type: "background"},
    result: TEST.unimplemented},

  // READ IMAGES USEABLE
  {action: "read_images_useable.php",
    args: {type: "background"},
    result: TEST.unimplemented},

  // UPDATE IMAGE
  {action: "update_image.php",
    args: {image_id: 1, user_id: 2, public: 1},
    result: TEST.unimplemented},
  {action: "read_images.php",
    args: {type: "background"},
    result: TEST.unimplemented},

  // DELETE IMAGE
  {action: "delete_image.php",
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
