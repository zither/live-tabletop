LT.installer = function () {
  var installBox = LT.element(document.body, 'div', {id : 'installBox'});

  var location = LT.text({size: 12});
  var username = LT.text({size: 12});
  var password = LT.password({size: 12});
  var database = LT.text({size: 12});
  var adminName = LT.text({size: 12});
  var adminPW = LT.password({size: 12});
  var adminRePW = LT.password({size: 12});

  var submit = LT.button('Install', function () {
    if (adminPW.value != adminRePW.value) {
      alert("Admin passwords do not match.");
      return false;
    }
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
      LT.ajaxRequest("POST", "php/login.php", 
        {username : adminName.value, password : adminPW.value});
      LT.processImages();
      document.body.removeChild(installBox);
      LT.load();
      LT.tablesPanel.show();
    } else {
      alert('Database was not properly installed. Try again.');
    }
  });

  LT.element(installBox, 'form', [
    [['Database Location: ', location]],
    [['Database Name: ', database]],
    [['Database Username: ', username]],
    [['Database Password: ', password]],
    [['Admin Name: ', adminName]],
    [['Admin Password: ', adminPW]],
    [['Re-type Password: ', adminRePW]],
    [[submit]],
  ]);
};

