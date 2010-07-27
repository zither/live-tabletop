function populateChatPanel() {
  LT.chatOutput = LT.element('div', { id : 'chatOutput' }, LT.chatPanel.panelContent);
  LT.chatForm = LT.element('form', { id : 'chatForm' }, LT.chatPanel.panelContent);
  LT.chatInput = LT.element('input', { id : 'chatInput', size : 24, 
    style : 'border: 1px solid #CCC;', value : '<< Write a message. >>' }, LT.chatForm);
  LT.chatInput.onfocus = function(){ emptyMe(this, '<< Write a message. >>') };
  LT.chatSubmit = LT.element('input', { type : 'button', style : 'cursor: pointer', 
        id : 'chatSubmit', size : 8, value : 'Send' }, LT.chatForm);

		LT.tableID = 1;
      LT.chatSubmit.onclick = function(){
        var sendMessage = LT.ajaxRequest("POST", "php/create_message.php",
          { table_id : LT.tableID, text : LT.chatInput.value});
		/*var messageResult = sendMessage.responseXML.getElementsByTagName('user')[0];
		if(messageResult){
          LT.chatForm.createTextNode(messageResult.getAttribute('text'));
        }else{
		  alert('return failure')
		}
*/	  }
}