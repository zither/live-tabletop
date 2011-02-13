LT.installLT = function () {
  var installRoutine = LT.ajaxRequest("POST", "php/install.php",
    {
      /*location: "localhost",
      username: "root",
      password: "password",
      database: "livetabletop01",
      admin_username: "admin",
      admin_password: "password"*/
    }
  );
}

LT.loadInstaller = function() {
  LT.installBox = LT.element('div', { id : 'installBox', style : 'margin: 0px auto 0px auto;'
    }, document.body);
  LT.installForm = LT.element('form', { id : 'installForm' , style : "" 
  }, LT.installBox);
  LT.DBLocation = LT.element('input', { id : 'DBLocation', size : 24, 
    style : 'border: 1px solid #CCC;'}, LT.installForm, 'Database Location', 1 );
  LT.element('br', {}, LT.installForm);
  LT.DBusername = LT.element('input', { id : 'DBLocation', size : 24, 
    style : 'border: 1px solid #CCC;'}, LT.installForm, 'Database Username', 1 );
  LT.element('br', {}, LT.installForm);
  LT.DBpassword = LT.element('input', { id : 'DBLocation', size : 24, 
    style : 'border: 1px solid #CCC;'}, LT.installForm, 'Database Password', 1 );
  LT.element('br', {}, LT.installForm);
  LT.DBName = LT.element('input', { id : 'DBName', size : 24, 
    style : 'border: 1px solid #CCC;'}, LT.installForm, 'Database Name', 1 );
  LT.element('br', {}, LT.installForm);
  LT.DBAdminName = LT.element('input', { id : 'DBAdminName', size : 24, 
    style : 'border: 1px solid #CCC;'}, LT.installForm, 'Admin Name', 1 );
  LT.element('br', {}, LT.installForm);
  LT.DBAdminPW = LT.element('input', { id : 'DBAdminPW', size : 24, 
    style : 'border: 1px solid #CCC;'}, LT.installForm, 'Admin Password', 1 );
  LT.element('br', {}, LT.installForm);
  LT.DBAdminRePW = LT.element('input', { id : 'DBAdminRePW', size : 24, 
    style : 'border: 1px solid #CCC;'}, LT.installForm, 'Re-enter Password', 1 );
  LT.element('br', {}, LT.installForm);
  LT.DBSubmit = LT.element('input', { type : 'button', style : 'cursor: pointer', 
    id : 'DBSubmit', size : 8 }, LT.installForm, 'Install');
  LT.DBSubmit.onclick = function() {
  //LT.installForm.onsubmit = function() {
    var installRoutine = LT.ajaxRequest("POST", "php/install.php",
    {
      location: LT.DBLocation.value,
      username: LT.DBusername.value,
      password: LT.DBpassword.value,
      database: LT.DBName.value,
      admin_username: LT.DBAdminName.value,
      admin_password: LT.DBAdminPW.value
    }
    );
    var checkInstall = LT.ajaxRequest("POST", 'php/db_config.php', {});
	if (checkInstall.status == 200) {
	  document.body.removeChild(LT.installBox);
	  LT.loadLT();
	}else{
	  alert('Database was not properly installed. Try again.');
	}
  };
  //LT.installLT();
  //LT.loadLT();
}