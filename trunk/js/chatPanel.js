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
    var time = LT.element('span', {title: then.toString()}, LT.chatPanel.output);
    if (then.toDateString() == now.toDateString()) {
      // if the message is from today, then only show hours and minutes
      time.textContent = "[" + then.getHours() + ":" + then.getMinutes() + "]";
    } else {
      // if the message is not from today, show year, month, day, hours and minutes
      time.textContent = "[" + then.getFullYear() + "." + (then.getMonth() + 1) + "."
        + then.getDate() + " " + then.getHours() + ":" + then.getMinutes() + "]";
    }
    // show the user who sent the message
    LT.element('span', {}, LT.chatPanel.output, " " + LT.messages[i].userName + ": ");
    // show the content of the message
    LT.chatPanel.output.appendChild(LT.messages[i].element);
    // start a new line after the message
	LT.element('br', {}, LT.chatPanel.output);
  }
  
  LT.chatPanel.output.removeChild(LT.chatBottom);
  LT.chatPanel.output.appendChild(LT.chatBottom);
  LT.chatBottom.scrollIntoView(true);
};

LT.createChatPanel = function () {
  LT.chatPanel = new LT.Panel( 'Chat', 'Chat', 6, 95, 355, 130);
  LT.chatPanel.form = LT.element('form', {id:'chatForm'}, LT.chatPanel.footer);
  LT.chatPanel.output = LT.element('div', { id : 'chatOutput' }, LT.chatPanel.content);
  LT.chatBottom = LT.element('a', {}, LT.chatPanel.output, " ");
  LT.chatInput = LT.element('input', { id : 'chatInput', size : 20, 
    style : 'border: 1px solid #CCC;'}, LT.chatPanel.form, '-- Write a message. --', 1 );
  LT.chatPanel.form.chatSubmit = LT.element('input', { type : 'button', style : 'cursor: pointer', 
    id : 'chatSubmit', size : 8 }, LT.chatPanel.form, 'Send');
  LT.chatPanel.form.chatSubmit.onclick = function() { LT.createMessage(); };
  LT.chatPanel.form.onsubmit = function() { LT.createMessage(); return false; };
  LT.element('div', {'class':'clearBoth'}, LT.chatPanel.form);
}

LT.createMessage = function () {
  var tempMessage = LT.chatInput.value;
  LT.chatInput.value = "";
  var createMessageAjax = LT.ajaxRequest("POST", "php/create_message.php",
    { table_id : LT.tableID, text : tempMessage });
  LT.chatInput.focus();
  LT.refreshMessageList();
}
