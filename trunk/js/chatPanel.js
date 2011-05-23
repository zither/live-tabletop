LT.readChat = function(){
  var readChat = LT.ajaxRequest("POST", "php/read_messages.php",{ 
    table_id : LT.tableID, last_message : LT.lastMessage });
  if (readChat.responseXML){
    var chatElements = readChat.responseXML.getElementsByTagName('message');
    LT.messages = [];
    for( var i = 0 ; i < chatElements.length; i++ ){
      var message = new LT.Message(chatElements[i]);
      LT.messages.push(message);
	  for( var n=0; n < LT.users.length; n++){
        if( LT.users[n].id == LT.messages[i].user_id){
          LT.messages[i].userName = LT.users[n].name
	    }
	  }
      LT.lastMessage = LT.messages[i].id;
    }
  }
}

LT.refreshMessageList = function () {
  LT.readChat();
  //var messagesArray = LT.sortObject(LT.messages, 'time');
  for (var i = 0; i < LT.messages.length; i++) {
    // convert the time in seconds to a javascript date object
    var then = new Date(LT.messages[i].time * 1000);
    // get a javascript date object for the current date and time
    var now = new Date();
    // create an element to contain the timestamp
    // the element's title (mouseover text) is the full date and time
    var time = LT.element('span', {title: then.toString()}, LT.chatOutput);
    if (then.toDateString() == now.toDateString()) {
      // if the message is from today, then only show hours and minutes
      time.textContent = "[" + then.getHours() + ":" + then.getMinutes() + "]";
    } else {
      // if the message is not from today, show year, month, day, hours and minutes
      time.textContent = "[" + then.getFullYear() + "." + (then.getMonth() + 1) + "."
        + then.getDate() + " " + then.getHours() + ":" + then.getMinutes() + "]";
    }
    // show the user who sent the message
    LT.element('span', {}, LT.chatOutput, " " + LT.messages[i].userName + ": ");
    // show the content of the message
    LT.chatOutput.appendChild(LT.messages[i].element);
    // start a new line after the message
	LT.element('br', {}, LT.chatOutput);
  }
  
  LT.chatOutput.removeChild(LT.chatBottom);
  LT.chatOutput.appendChild(LT.chatBottom);
  LT.chatBottom.scrollIntoView(true);
};

LT.createChatPanel = function () {
  LT.chatPanel = new LT.Panel( 'Chat', 'Chat', 6, 49, 355, 130);
  LT.chatForm = LT.element('form', { id : 'chatForm' , style : "" 
    }, LT.chatPanel.footer);
  LT.chatOutput = LT.element('div', { id : 'chatOutput' }, LT.chatPanel.content);
  LT.chatBottom = LT.element('a', {}, LT.chatOutput, " ");
  LT.chatInput = LT.element('input', { id : 'chatInput', size : 24, 
    style : 'border: 1px solid #CCC;'}, LT.chatForm, '-- Write a message. --', 1 );
  LT.chatSubmit = LT.element('input', { type : 'button', style : 'cursor: pointer', 
    id : 'chatSubmit', size : 8 }, LT.chatForm, 'Send');
  LT.chatSubmit.onclick = function() { LT.createMessage(); };
  LT.chatForm.onsubmit = function() { LT.createMessage(); return false; };
}

LT.createMessage = function () {
  var tempMessage = LT.chatInput.value;
  LT.chatInput.value = "";
  var createMessageAjax = LT.ajaxRequest("POST", "php/create_message.php",
    { table_id : LT.tableID, text : tempMessage });
  LT.chatInput.focus();
  LT.refreshMessageList();
}
