function populateChatPanel() {
  var chatInput = element('input', { type : 'text', 
    id : 'chatInput', size : 8, value : 'Login' }, chatPanel.innerPanel);
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