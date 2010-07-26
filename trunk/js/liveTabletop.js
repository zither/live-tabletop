var LT = {};

/*
LT.element Create a new HTML element and insert it into the document.

Parameters:

  elementType (required) "div", "span", "input", etc.
  attributes (required) i.e. {class: "inside-link", href: "test.html"}.
  parentElement (optional) the parent element of the new element.
  text (optional) text to appear inside the new element.

Returns: the new element

Attribute can be {} if you do not want any attributes. If you want text,
but no parentElement, you must create and insert the text node yourself.
If you want the element inserted at the end of the page, use document.body
as the parentElement.
*/
LT.element = function(elementType, attributes, parentElement, text) {
  var item = document.createElement(elementType);
  for(var attributeName in attributes){
    item.setAttribute(attributeName, attributes[attributeName]);
  }
  if(parentElement){ parentElement.appendChild(item); }
  if(divText){ item.appendChild(document.createTextNode(divText)); }
  return item
}

/*
LT.ajaxRequest Creates and sends an XMLHttpRequest

Parameters:

  method (required) "GET" or "POST"
  url (required) i.e. "php/install.php"
  args (required) an object of the form {arg1: "val1", arg2: "val2"}
  callback (optional) a function called when the request is finished

Returns: the XMLHttpRequest object


If a callback is provided, the request is asynchronous:

  LT_ajax_request("POST", "php/login.php", 
    {username:"foo", password:"bar"},
    function (ajax) {
      if (ajax.status == 200 
        && ajax.responseXML.getElementsByTagName("user").length == 1)
        alert ("You have logged in successfully");
      else
        alert ("You have not logged in successfully");
    });
  alert("The page continues to run javascript "
    + "while we wait for the login results.");


If the callback is ommited, the request is synchronous:

  var ajax = LT_ajax_request("POST", "php/login.php", 
    {username:"foo", password:"bar"});
  alert("The page will freeze while we wait for the login results");
  if (ajax.status == 200
    && ajax.responseXML.getElementsByTagName("user").length == 1)
    alert ("You have logged in successfully");
  else
    alert ("You have not logged in successfully");

*/

LT.ajaxRequest = function(method, url, args, callback) {

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

