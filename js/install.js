LT.installer = function () {
  var installBox = LT.element('div', { id : 'installBox', style : 'margin: 0px auto 0px auto;'
    }, document.body);
  var installForm = LT.element('form', { id : 'installForm' , style : "" 
  }, LT.installBox);
  var DBLocation = LT.element('input', { id : 'DBLocation', size : 24, 
    style : 'border: 1px solid #CCC;'}, LT.installForm, 'Database Location', 1 );
  LT.element('br', {}, LT.installForm);
  var DBusername = LT.element('input', { id : 'DBLocation', size : 24, 
    style : 'border: 1px solid #CCC;'}, LT.installForm, 'Database Username', 1 );
  LT.element('br', {}, LT.installForm);
  var DBpassword = LT.element('input', { id : 'DBLocation', size : 24, 
    style : 'border: 1px solid #CCC;'}, LT.installForm, 'Database Password', 1 );
  LT.element('br', {}, LT.installForm);
  var DBName = LT.element('input', { id : 'DBName', size : 24, 
    style : 'border: 1px solid #CCC;'}, LT.installForm, 'Database Name', 1 );
  LT.element('br', {}, LT.installForm);
  var DBAdminName = LT.element('input', { id : 'DBAdminName', size : 24, 
    style : 'border: 1px solid #CCC;'}, LT.installForm, 'Admin Name', 1 );
  LT.element('br', {}, LT.installForm);
  var DBAdminPW = LT.element('input', { id : 'DBAdminPW', size : 24, 
    style : 'border: 1px solid #CCC;'}, LT.installForm, 'Admin Password', 1 );
  LT.element('br', {}, LT.installForm);
  var DBAdminRePW = LT.element('input', { id : 'DBAdminRePW', size : 24, 
    style : 'border: 1px solid #CCC;'}, LT.installForm, 'Re-enter Password', 1 );
  LT.element('br', {}, LT.installForm);
  var DBSubmit = LT.element('input', { type : 'button', style : 'cursor: pointer', 
    id : 'DBSubmit', size : 8 }, LT.installForm, 'Install');
  DBSubmit.onclick = function() {
    LT.ajaxRequest("POST", "php/logout.php", {});
    var installRoutine = LT.ajaxRequest("POST", "php/install.php", {
      location: DBLocation.value,
      username: DBusername.value,
      password: DBpassword.value,
      database: DBName.value,
      admin_username: DBAdminName.value,
      admin_password: DBAdminPW.value,
    });
    var checkInstall = LT.ajaxRequest("POST", 'php/db_config.php', {});
    if (checkInstall.status == 200) {
      LT.ajaxRequest("POST", "php/create_images.php", {}); // <<< broken FIXME
      document.body.removeChild(LT.installBox);
      LT.load();
      LT.sendLogin( LT.DBAdminName.value, LT.DBAdminPW.value );
      LT.tablesPanel.show();
    } else {
      alert('Database was not properly installed. Try again.');
    }
  };
}
