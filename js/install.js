LT.installer = function () {
  var DBLocation = LT.element({tag: 'input', clears: true, text: 'Database Location', attributes: {id: 'DBLocation', size: 24}});
  var DBUsername = LT.element({tag: 'input', clears: true, text: 'Database Username', attributes: {id: 'DBLocation', size: 24}});
  var DBPassword = LT.element({tag: 'input', clears: true, text: 'Database Password', attributes: {id: 'DBLocation', size: 24}});
  var DBName = LT.element({tag: 'input', clears: true, text: 'Database Name', attributes: {id: 'DBName', size: 24}});
  var DBAdminName = LT.element({tag: 'input', clears: true, text: 'Admin Name', attributes: {id: 'DBAdminName', size: 24}});
  var DBAdminPW = LT.element({tag: 'input', clears: true, text: 'Admin Password', attributes: {id: 'DBAdminPW', size: 24}});
  var DBAdminRePW = LT.element({tag: 'input', clears: true, text: 'Re-enter Password', attributes: {id: 'DBAdminRePW', size: 24}});
  var DBSubmit = LT.element({tag: 'input',  text: 'Install', attributes: {type: 'button', style: 'cursor: pointer', id: 'DBSubmit', size: 8}});
  var installBox = LT.element({tag: 'div', attributes: {id : 'installBox'}, parent: document.body});
  var installForm = LT.element({
    tag: 'form',
    parent: installBox,
    children: [DBLocation, DBUsername, DBPassword, DBName, DBAdminName, DBAdminPW, DBAdminRePW, DBSubmit],
  });
  DBSubmit.onclick = function() {
    LT.ajaxRequest("POST", "php/logout.php", {});
    var installRoutine = LT.ajaxRequest("POST", "php/install.php", {
      location: DBLocation.value,
      username: DBUsername.value,
      password: DBPassword.value,
      database: DBName.value,
      admin_username: DBAdminName.value,
      admin_password: DBAdminPW.value,
    });
    var checkInstall = LT.ajaxRequest("POST", 'php/db_config.php', {});
    if (checkInstall.status == 200) {
      LT.ajaxRequest("POST", "php/create_images.php", {}); // <<< broken FIXME
      document.body.removeChild(installBox);
      LT.load();
      LT.sendLogin(DBAdminName.value, DBAdminPW.value );
      LT.tablesPanel.show();
    } else {
      alert('Database was not properly installed. Try again.');
    }
  };
}
