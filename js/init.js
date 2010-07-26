

//var checkInstall = LT_ajax_request("POST", 'php/db_config.php', {}, function(ajax){if(ajax.status != 200){}});
var checkInstall = LT_ajax_request("POST", 'php/db_config.php', {});
if(checkInstall.status != 200){
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
}