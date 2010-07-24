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

var ADMIN_USERNAME = "foo";
var ADMIN_PASSWORD = "bar";
var WRONG_PASSWORD = "baz";
var CREATE_TABLE_ARGS = {
  name: "My Table",
  background: 1,
  default_tile: 2,
  rows: 100,
  columns: 50,
  tile_width: 45,
  tile_height: 30};

var tests = [
  function () {
    LT_create_element("div", {}, document.body, "Starting tests ...");
    LT_ajax_request("POST", "install.php", {
        location:"<?php echo $_REQUEST['location'];?>",
        database:"<?php echo $_REQUEST['database'];?>",
        username:"<?php echo $_REQUEST['username'];?>",
        password:"<?php echo $_REQUEST['password'];?>",
        admin_username : ADMIN_USERNAME,
        admin_password : ADMIN_PASSWORD
      }, tests.shift());    
  },
  function (ajax) {
    var text = ajax.responseText.replace(/^\s+|\s+$/g, '');
    var result = (text == "") ? "PASS" : "FAIL [" + text + "]";
    LT_create_element("pre", {}, document.body, "install.php: " + result);
    if (text == "") // only continue if this first test passes 
      LT_ajax_request("POST", "db_config.php", {}, tests.shift());
  },
  function (ajax) {
    var result = (ajax.status == 200) ? "PASS" : "FAIL [status = " + ajax.status + "]";
    LT_create_element("pre", {}, document.body, "db_config.php: " + result);
    LT_ajax_request("POST", "login.php", 
      {username:ADMIN_USERNAME, password:WRONG_PASSWORD}, tests.shift());
  },
  function (ajax) {
    var count = ajax.responseXML.getElementsByTagName("user").length;
    var result = (count == 0) ? "PASS" : "FAIL [returned " + count + " users]";
    LT_create_element("pre", {}, document.body, "login.php(wrong password): " + result);
    LT_ajax_request("POST", "login.php", 
      {username:ADMIN_USERNAME, password:ADMIN_PASSWORD}, tests.shift());
  },
  function (ajax) {
    var count = ajax.responseXML.getElementsByTagName("user").length;
    var result = (count == 1) ? "PASS" : "FAIL [returned " + count + " users]";
    LT_create_element("pre", {}, document.body, "login.php(right password): " + result);
    LT_ajax_request("POST", "logout.php", 
      {}, tests.shift());
  },
  function (ajax) {
    var text = ajax.responseText.replace(/^\s+|\s+$/g, '');
    var result = (text == "") ? "PASS" : "FAIL [" + text + "]";
    LT_create_element("pre", {}, document.body, "logout.php: " + result);
    LT_ajax_request("POST", "create_table.php", CREATE_TABLE_ARGS, tests.shift());
  },
  function (ajax) {
    var text = ajax.responseText.replace(/^\s+|\s+$/g, '');
    var result = (text == "You are not logged in.") ? "PASS" : "FAIL : [" + text + "]";
    LT_create_element("pre", {}, document.body, "create_table.php(logged out): " + result);
    LT_ajax_request("POST", "login.php", 
      {username:ADMIN_USERNAME, password:ADMIN_PASSWORD}, tests.shift());
  },
  function (ajax) {
    var count = ajax.responseXML.getElementsByTagName("user").length;
    var result = (count == 1) ? "PASS" : "FAIL [returned " + count + " users]";
    LT_create_element("pre", {}, document.body, "login.php: " + result);
    LT_ajax_request("POST", "create_table.php", CREATE_TABLE_ARGS, tests.shift());
  },
  function (ajax) {
    var count = ajax.responseXML.getElementsByTagName("table").length;
    var result = (count == 1) ? "PASS" : "FAIL [returned " + count + " tables]";
    LT_create_element("pre", {}, document.body, "create_table.php(logged in): " + result);
    LT_ajax_request("POST", "create_message.php", 
      {table_id: 1, user_id: 1, text: "Hello, world!"}, tests.shift());
  },
  function (ajax) {
    var text = ajax.responseText.replace(/^\s+|\s+$/g, '');
    var result = (text == "") ? "PASS" : "FAIL [" + text + "]";
    LT_create_element("pre", {}, document.body, "create_message.php: " + result);
    LT_ajax_request("POST", "read_table.php", {table_id: 1}, tests.shift());
  },
  function (ajax) {
    var count = ajax.responseXML.getElementsByTagName("table").length;
    var result = (count == 1) ? "PASS" : "FAIL [returned " + count + " tables]";
    LT_create_element("pre", {}, document.body, "read_table.php: " + result);
    LT_ajax_request("POST", "read_messages.php", {table_id: 1, time: 0}, tests.shift());
  },
  function (ajax) {
    var count = ajax.responseXML.getElementsByTagName("message").length;
    var result = (count == 1) ? "PASS" : "FAIL [returned " + count + " messages]";
    LT_create_element("pre", {}, document.body, "read_messages.php: " + result);
    LT_create_element("div", {}, document.body, "... finished!");
  }];

onload = tests.shift();

    </script>
  </head>
  <body>
  </body>
</html>
