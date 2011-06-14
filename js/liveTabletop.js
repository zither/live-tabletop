var LT = {};
LT.selectedImage = '';
LT.selectedImageID = 1;
LT.images = [];
LT.messages = [];
LT.lastMessage = 0;

function emptyMe (clearMe, defaultText){
	if( clearMe.value == defaultText ){ clearMe.value = ""; }	
}
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
LT.element = function(elementType, attributes, parentElement, text, clears) {
  var item = document.createElement(elementType);
  for(var attributeName in attributes){
    item.setAttribute(attributeName, attributes[attributeName]);
  }
  if(parentElement){ parentElement.appendChild(item); }
  if( elementType == 'input' ){
    if(text){ item.setAttribute('value', text); }  
  }else{
    if(text){ item.appendChild(document.createTextNode(text)); }
  }
  if(clears) { 
    item.onfocus = function(){ 
	  if( item.value == text ){ this.value = ""; }
	}
  }
  return item
}

LT.textInput = function(attributes, parentElement, text){
  var item = LT.element('input', attributes, parentElement, text);
  //if(text){attributes.type = 'text';}
  
  item.onfocus = function(){ 
	if( item.value == text ){ this.value = ""; }
  }

}

LT.ajaxRequest = function(method, url, args, callback) {

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
    ajax.setRequestHeader("Content-length", argument_string.length);
    ajax.setRequestHeader("Connection", "close");
    ajax.send(argument_string);
  }

  // return the ajax object, especially for synchronous requests
  return ajax;
}

// Creates an array from an object
LT.sortObject = function (map, sortBy){
  sortedArray = [];
  for(id in map){
	sortedArray.push(map[id]);
  }
  sortedArray.sort( function (a,b){ 
    if( a[sortBy] > b[sortBy] ){
	  return 1;
    }else if( a[sortBy] == b[sortBy] ){
	  return 0;
	}else{
      return -1;
	}
  } );
  return sortedArray;
}

// Clears parent element and adds child
LT.fill = function (pObject, cObject){
  while(pObject.firstChild){
    pObject.removeChild(pObject.firstChild);
  }
  if (cObject){
    pObject.appendChild(cObject);
  }
}