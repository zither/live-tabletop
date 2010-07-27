function populateChatPanel() {
  var chatOutput = LT.element('div', { id : 'chatOutput' }, LT.chatPanel.panelContent);
  var chatForm = LT.element('form', { id : 'chatForm' }, LT.chatPanel.panelContent);
  LT.chatInput = LT.element('input', { id : 'chatInput', size : 24, 
    style : 'border: 1px solid #CCC;', value : '<< Write a message. >>' }, chatForm);
  LT.chatInput.onfocus = function(){ emptyMe(this, '<< Write a message. >>') };
  var breakokay1 = LT.element('br', {  }, LT.chatPanel.panelContent);
  var breakokay2 = LT.element('a', {  }, LT.chatPanel.panelContent, 
    "Hello" );
}
/*
var instalRoutine = LT_ajax_request("POST", "php/install.php",
  {
    location: "localhost",
    username: "root",
    password: "password",
    database: "livetabletop01",
    admin_username: "admin",
    admin_password: "password"
  }
);
*/