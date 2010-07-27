<?php

session_start();

function done($result) {
  echo '<script language="javascript" type="text/javascript">'
    . "\n   window.top.window.LT.stopUpload(" . json_encode($result)
    . ");\n</script>";
  die();
}

if (!isset($_SESSION['user_id'])) done("You are not logged in.");

include('db_config.php');

// Interpret the Request

$user = $LT_SQL->real_escape_string($_SESSION['user_id']);

$type = $LT_SQL->real_escape_string($_REQUEST['type']);
if ($type != 'background' && $type != 'tile' && $type != 'piece')
  done("Unsupported category: " . $type);

$name = $LT_SQL->real_escape_string(basename( $_FILES['file']['name']));

move_uploaded_file($_FILES['file']['tmp_name'], getcwd() . DIRECTORY_SEPARATOR
  . '..' . DIRECTORY_SEPARATOR . 'images' . DIRECTORY_SEPARATOR . 'upload'
  . DIRECTORY_SEPARATOR . $type . DIRECTORY_SEPARATOR . $name)
  or done("Failed to move file.");

// Query the Database

$LT_SQL->query("CALL create_image($user, '$name', '$type', 0)")
  or done("Query failed: " . $LT_SQL->error);

// Generate Output

done(array(user => $user, name => $name, type => $type));
?>

