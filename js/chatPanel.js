LT.readChat = function(){
  if (!LT.currentTable) return;
  var readChat = LT.ajaxRequest("POST", "php/read_messages.php",{ 
    table_id : LT.currentTable.id, last_message : LT.lastMessage });
  if (readChat.responseXML) {
    var chatElements = readChat.responseXML.getElementsByTagName('message');
    LT.messages = [];
    for (var i = 0 ; i < chatElements.length; i++) {
      var message = new LT.Message(chatElements[i]);
      LT.messages.push(message);
	  for (var n = 0; n < LT.users.length; n++) {
        if (LT.users[n].id == LT.messages[i].user_id) {
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
    var time = LT.element(LT.chatOutput, 'span', {title: then.toString()});
    if (then.toDateString() == now.toDateString()) {
      // if the message is from today, then only show hours and minutes
      time.textContent = "[" + then.getHours() + ":" + then.getMinutes() + "]";
    } else {
      // if the message is not from today, show year, month, day, hours and minutes
      time.textContent = "[" + then.getFullYear() + "." + (then.getMonth() + 1) + "."
        + then.getDate() + " " + then.getHours() + ":" + then.getMinutes() + "]";
    }
    // show the user who sent the message
    LT.element(LT.chatOutput, 'span', [" " + LT.messages[i].userName + ": "]);
    // show the content of the message
    LT.chatOutput.appendChild(LT.messages[i].element);
    // start a new line after the message
    LT.element(LT.chatOutput, 'br');
  }
  
  LT.chatOutput.removeChild(LT.chatBottom);
  LT.chatOutput.appendChild(LT.chatBottom);
  LT.chatBottom.scrollIntoView(true);
};

LT.createChatPanel = function () {
  LT.chatPanel = new LT.Panel('Chat', 'Chat', 6, 95, 355, 130);
  LT.chatOutput = LT.element(LT.chatPanel.content, {id: 'chatOutput'});
  LT.chatBottom = LT.element(LT.chatOutput, 'a', [" "]);
  var chatInput = LT.text('-- Write a message. --',
    {id: 'chatInput', size: 20, style: {border: '1px solid #CCC'}});
  var createMessage = function () {
    chatInput.value = "";
    LT.ajaxRequest("POST", "php/create_message.php", 
      {table_id: LT.currentTable.id, text: chatInput.value});
    chatInput.focus();
    LT.refreshMessageList();
  }
  var form = LT.element(LT.chatPanel.footer, 'form', {id:'chatForm'}, [
    chatInput,
    LT.button('Send', function () {createMessage();}),
    [{'class': 'clearBoth'}],
  ]);
  form.onsubmit = function() {createMessage(); return false;};
};

LT.chatAlert = function (text) {
  if (text) 
    LT.element(LT.chatOutput, {'class' : 'chat_alert'}, [text]);
  else
    LT.element(LT.chatOutput, 'br');
  LT.chatOutput.removeChild(LT.chatBottom);
  LT.chatOutput.appendChild(LT.chatBottom);
  LT.chatBottom.scrollIntoView(true);
};

