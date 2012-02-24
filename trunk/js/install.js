LT.installer = function () {
  // TODO: use password input type for password fields
  var location = LT.textInput('Database Location', {id: 'DBLocation', size: 24});
  var username = LT.textInput('Database Username', {id: 'DBLocation', size: 24});
  var password = LT.textInput('Database Password', {id: 'DBLocation', size: 24});
  var database = LT.textInput('Database Name', {id: 'DBName', size: 24});
  var adminName = LT.textInput('Admin Name', {id: 'DBAdminName', size: 24});
  var adminPW = LT.textInput('Admin Password', {id: 'DBAdminPW', size: 24});
  var adminRePW = LT.textInput('Re-enter Password', {id: 'DBAdminRePW', size: 24});
  var submit = LT.createElement('input',  ['Install'], {type: 'button', style: 'cursor: pointer', id: 'DBSubmit', size: 8});
  var installBox = LT.createElement(document.body, 'div', {id : 'installBox'}, 
    [['form', [location, username, password, database, adminName, adminPW, adminRePW, submit]]]);
  submit.onclick = function() {
    // TODO: confirm that the passwords match
    LT.ajaxRequest("POST", "php/logout.php", {});
    LT.ajaxRequest("POST", "php/install.php", {
      location: location.value,
      username: username.value,
      password: password.value,
      database: database.value,
      admin_username: adminName.value,
      admin_password: adminPW.value,
    });
    var checkInstall = LT.ajaxRequest("POST", 'php/db_config.php', {});
    if (checkInstall.status == 200) {
      //LT.ajaxRequest("POST", "php/create_images.php", {}); // won't work, not logged in
      //LT.sendLogin(DBAdminName.value, DBAdminPW.value ); // won't work, LT.load() has not been called
      //LT.load(); // too soon, we haven't processed the uploaded images yet.
      LT.ajaxRequest("POST", "php/login.php", 
        {username : adminName.value, password : adminPW.value});
      LT.processImages();
      document.body.removeChild(installBox);
      LT.load();
      LT.tablesPanel.show();
    } else {
      alert('Database was not properly installed. Try again.');
    }
  };
}
