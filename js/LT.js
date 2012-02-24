var LT = {};

LT.selectedImage = '';
LT.selectedImageID = 1;
LT.images = [];
LT.messages = [];
LT.lastMessage = 0;

LT.brush = null; // paint 'tile', 'wall' or 'fog'

LT.clickDragGap = 0; 
LT.dragX = 0; // current horizontal mouse position
LT.dragY = 0; // current vertical mouse position
LT.clickX = 0; // relative horizontal position of mouse when the button was pressed
LT.clickY = 0; // relative vertical position of mouse when the button was pressed

// Get a string stored in the browser's cookie for this page.
LT.getCookie = function (cookieName) {
  var cookieStrings = document.cookie.split(";");
  for (var i = 0; i < cookieStrings.length; i++) {
    var equalsPosition = cookieStrings[i].indexOf("=");
    var left = cookieStrings[i].substr(0, equalsPosition);
    var right = cookieStrings[i].substr(equalsPosition + 1);
    left = left.replace(/^\s+|\s+$/g, ""); // trim white space
    if (left == cookieName) {
      return unescape(right);
    }
  }
};

// Assign each property of an object as an element's attributes.
LT.elementAttributes = function (element, attributes) {
  for (var key in attributes) {
    var value = attributes[key];
    if (key == "style" && typeof(value) == "object") {
      var styles = [];
      for (var prop in value) styles.push(prop + ": " + value[prop]);
      value = styles.join("; ");
    }
    element.setAttribute(key, value);
  }
};

// Insert text and elements inside an element.
LT.elementChildren = function (element, children) {
  for (var i = 0; i < children.length; i++) {
    if (typeof(children[i]) == "string") {
      if (element.tagName.toLowerCase() == "input") element.value = children[i];
      else element.appendChild(document.createTextNode(children[i]));
    }
    else if (children[i] instanceof Element) element.appendChild(children[i]);
    else if (children[i] instanceof Array) element.appendChild(LT.element(
      children[i][0], children[i][1], children[i][2], children[i][3]));
  }
};

/*
Associate the items in an array by their type and class.
Used in functions that take arguments in any order, distinguished by type.
*/
LT.associateByType = function (items) {
  var results = {};
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var type = typeof(item);
    if (type == "object") {
      if (item instanceof Element) results.element = item;
      else if (item instanceof Array) results.array = item;
      else results.object = item;
    }
    else results[type] = item;
  }
  return results;
};

/*
Create an HTML element.

This function takes 0 to 4 arguments in any order, distinguished by type.

tag:         A string argument is interpreted as the new element's tagName.
             If none of the arguments is a string, the new element is a div.

parent:      An HTML element argument becomes the parent of the new element.

attributes:  If an argument is an object but not an HTML element or array,
             it's properties become the attributes of the new element.
             If the style attribute is an object instead of a string,
             the properties of that object are converted into CSS properties.

children:    Contents of an array argument become children of the new element.
             Strings are appended as text nodes.
             Arrays are converted to an element as arguments to this function.
*/
LT.element = function (arg1, arg2, arg3, arg4) {
  var args = LT.associateByType([arg1, arg2, arg3, arg4]);
  var newElement = document.createElement(args.string || 'div');
  if (args.element) args.element.appendChild(newElement);
  if (args.object) LT.elementAttributes(newElement, args.object);
  if (args.array) LT.elementChildren(newElement, args.array);
  return newElement;
};

/*
Create a text input field.

This function takes 0 to 3 arguments in any order, distinguished by type.

text:        A string argument is interpreted as the default text.
             The default text is selected when you select the field.
             TODO: it is immediately unselected when you click on the field in chrome browser

parent:      An HTML element argument becomes the parent of the new element.

attributes:  If an argument is an object but not an HTML element or array,
             it's properties become the attributes of the new element.
             If the style attribute is an object instead of a string,
             the properties of that object are converted into CSS properties.
*/
LT.text = function (arg1, arg2, arg3) {
  var args = LT.associateByType([arg1, arg2, arg3]);
  var input = document.createElement("input");
  input.type = "text";
  if (args.element) args.element.appendChild(input);
  if (args.object) LT.elementAttributes(input, args.object);
  if (args.string) {
    input.value = args.string;
    input.onfocus = function () {
      if (input.value == args.string)
        this.select();
    };
  }
  return input;
};

/*
Create a password input field.
The arguments are the same as LT.text() 
*/
LT.password = function (arg1, arg2, arg3) {
  var input = LT.text(arg1, arg2, arg3);
  input.type = "password";
  return input;
};

/*
Create a button.

This function takes 0 to 3 arguments in any order, distinguished by type.

text:        A string argument is interpreted as the text on the button.

parent:      An HTML element argument becomes the parent of the new element.

attributes:  If an argument is an object but not an HTML element or array,
             it's properties become the attributes of the new element.
             If the style attribute is an object instead of a string,
             the properties of that object are converted into CSS properties.
*/
LT.button = function (arg1, arg2, arg3) {
  var args = LT.associateByType([arg1, arg2, arg3]);
  var input = document.createElement("input");
  input.type = "button";
  input.value = args.string;
  if (args.element) args.element.appendChild(input);
  if (args.object) LT.elementAttributes(input, args.object);
  if (args['function']) input.onclick = args['function'];
  return input;
};

/*
Send an HTTP request.
*/
LT.ajaxRequest = function (method, url, args, callback) {

  var ajax = new XMLHttpRequest();

  // do not send a request when the page is viewed locally
  if (window.location.protocol == 'file:') {
    return ajax;
  }

  // make an asynchronous request if a callback is provided
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
    // some ajax tutorials say we should set the following request headers
    // but the W3C standard says that browsers should ignore them
    //ajax.setRequestHeader("Content-length", argument_string.length);
    //ajax.setRequestHeader("Connection", "close");
    ajax.send(argument_string);
  }

  // return the ajax object, especially for synchronous requests
  return ajax;
}

// Creates an array from an object
LT.sortObject = function (map, sortBy) {
  sortedArray = [];
  for (id in map) {
    sortedArray.push(map[id]);
  }
  sortedArray.sort(function (a,b) { 
    if (a[sortBy] > b[sortBy]) {
      return 1;
    }else if (a[sortBy] == b[sortBy]) {
      return 0;
    } else {
      return -1;
    }
  });
  return sortedArray;
}

// Clears parent element and adds child
LT.fill = function (pObject, cObject) {
  while(pObject.firstChild) {
    pObject.removeChild(pObject.firstChild);
  }
  if (cObject) {
    pObject.appendChild(cObject);
  }
}

LT.dragHandlers = [];
LT.dropHandlers = [];

document.onselectstart = function () {return false;}

// Stop dragging when the mouse button is released.
document.onmouseup = function (e) {
  if (!e) var e = window.event;
  LT.holdTimestamps = 0;
  for (var i = 0; i < LT.dropHandlers.length; i++)
    LT.dropHandlers[i](e);
  LT.clickDragGap = 0;
}
document.onmousedown = function () {
  LT.holdTimestamps = 1;
}

// Move or resize a panel when the mouse is dragged.
document.onmousemove = function (e) {
  if (!e) var e = window.event;
  // grab the X and Y position of the mouse cursor
  if (document.all) { // IE browser
    LT.dragX = e.clientX + document.body.scrollLeft;
    LT.dragY = e.clientY + document.body.scrollTop;
  } else { // NS browser
    LT.dragX = e.pageX;
    LT.dragY = e.pageY;
  }
  for (var i = 0; i < LT.dragHandlers.length; i++)
    LT.dragHandlers[i](e);
  e.preventDefault();
  return false;
};

LT.checkTimestamps = function () {
  if (LT.currentTable && !LT.holdTimestamps && LT.currentUser) {
    var cT = LT.currentTable;
    var args = {table_id: LT.currentTable.id};
    LT.ajaxRequest("POST", "php/read_table.php", args, function (ajax) {
      var tableResponse = ajax.responseXML.getElementsByTagName("table");
      var table = new LT.Table(tableResponse[0]);
      if (cT.piece_stamp < table.piece_stamp) {
        cT.piece_stamp = table.piece_stamp;
        LT.loadPieces();
      }
      if (cT.tile_stamp < table.tile_stamp) {
        cT.tile_stamp = table.tile_stamp;
        LT.Table.readTiles();
      }
      if (cT.message_stamp < table.message_stamp) {
        cT.message_stamp = table.message_stamp;
        LT.refreshMessageList();
      }
    });
  }
}
LT.processImages = function(){
  LT.ajaxRequest("POST", "php/create_images.php", {});
}
