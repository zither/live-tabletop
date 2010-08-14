LT.refreshMessageList = function () {
  var readMessages = LT.ajaxRequest("POST", "php/read_messages.php",{
    table_id : LT.tableID, time : 0 });
  if (readMessages.responseXML){
    var messageElements = readMessages.responseXML.getElementsByTagName('message');
    LT.messageList = [];
    for( var i = 0 ; i < messageElements.length; i++ ){
      var messagesArray = {
        user_id : messageElements[i].getAttribute('user_id'),
        time : messageElements[i].getAttribute('time'),
        text : decodeURIComponent(messageElements[i].textContent)
      };
      LT.messageList.push(messagesArray);
    }
    for( var i = 0 ; i < LT.messageList.length; i++ ){
      LT.element('a', {}, LT.chatOutput, LT.messageList[i].user_id +
	    ": " + LT.messageList[i].time + ": " + LT.messageList[i].text);
      LT.element('br', {}, LT.chatOutput);
    }
	timeWatch = LT.element('a', {}, LT.chatOutput, LT.chatTimeStamp.getTime() / 400000);
	LT.chatOutput.removeChild(LT.chatBottom);
	LT.chatOutput.appendChild(LT.chatBottom);
	LT.chatBottom.scrollIntoView(true);
  }
};

LT.createChatPanel = function () {
  LT.chatTimeStamp = new Date;
  LT.chatPanel = new LT.Panel( 'Chat', 'Chat', 6, 49, 355, 130);
  LT.chatForm = LT.element('form', { id : 'chatForm' , style : "" 
    }, LT.chatPanel.footer);
  LT.chatOutput = LT.element('div', { id : 'chatOutput' }, LT.chatPanel.content);
  LT.chatBottom = LT.element('a', {}, LT.chatOutput, "bottom");
  LT.chatInput = LT.element('input', { id : 'chatInput', size : 24, 
    style : 'border: 1px solid #CCC;'}, LT.chatForm, '<< Write a message. >>', 1 );
  LT.chatInput.onfocus = function(){ emptyMe(this, '<< Write a message. >>') };
  LT.chatSubmit = LT.element('input', { type : 'button', style : 'cursor: pointer', 
    id : 'chatSubmit', size : 8 }, LT.chatForm, 'Send');
  LT.tableID = 1;
  LT.chatSubmit.onclick = function() { LT.createMessage(); };
  LT.refreshMessageList();
}

LT.createMessage = function () {
  var createMessageAjax = LT.ajaxRequest("POST", "php/create_message.php",
    { table_id : LT.tableID, text : LT.chatInput.value });
  LT.refreshMessageList();
}