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

/*
LT.element creates a new HTML element and inserts it into the document.

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
LT.element = function (elementType, attributes, parentElement, text, clears) {
  var item = document.createElement(elementType);
  for (var attributeName in attributes) {
    item.setAttribute(attributeName, attributes[attributeName]);
  }
  if (parentElement) parentElement.appendChild(item);
  if (text) {
    if (elementType == 'input') item.setAttribute('value', text);
    else item.appendChild(document.createTextNode(text));
  }
  if (clears) item.onfocus = function () {
    if (item.value == text) this.value = "";
  }
  return item
}

LT.textInput = function (attributes, parentElement, text) {
  var item = LT.element('input', attributes, parentElement, text, true);
}

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

document.onselectstart = function () {return false;}

// Stop dragging when the mouse button is released.
document.onmouseup = function () {
  LT.holdTimestamps = 0;
  LT.Panel.stopDragging();
  LT.clickDragGap = 0;
  LT.Tile.dragging = 0;
  LT.Piece.stopDragging();
  LT.Panel.saveCookie();
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
  LT.Piece.drag();
  LT.Panel.drag();
  e.preventDefault();
  return false;
};

LT.checkTimestamps = function () {
  if (LT.currentTable && !LT.holdTimestamps) {
    cT = LT.currentTable
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
        LT.readTiles();
      }
      if (cT.message_stamp < table.message_stamp) {
        cT.message_stamp = table.message_stamp;
        LT.refreshMessageList();
      }
    });
  }
}
