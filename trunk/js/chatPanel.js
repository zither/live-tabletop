function populateChatPanel() {
  var chatForm = LT.element('form', { id : 'chatForm' }, LT.chatPanel.innerPanel);
  LT.chatInput = LT.element('input', { id : 'chatInput', size : 24, 
    style : 'border: 1px solid #CCC;', value : '<< Write a message. >>' }, chatForm);
  LT.chatInput.onfocus = function(){ emptyMe(this, '<< Write a message. >>') };
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