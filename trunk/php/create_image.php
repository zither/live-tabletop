<?php

session_start();

function done($result) {
  echo '<script language="javascript" type="text/javascript">'
    . "\n   window.top.window.LT.finishUpload({$_REQUEST['uploader']}, "
    . json_encode($result) . ");\n</script>";
  die();
}

if (!isset($_SESSION['user_id'])) done("You are not logged in.");

include('db_config.php');
include('include/images.php');

// Interpret the Request

$user = $LT_SQL->real_escape_string($_SESSION['user_id']);
$type = $LT_SQL->real_escape_string($_REQUEST['type']);
if (!LT_image_type($type)) done("Unsupported category: " . $type);
$file = $LT_SQL->real_escape_string(basename( $_FILES['file']['name']));

// Store the Uploaded Image

move_uploaded_file($_FILES['file']['tmp_name'], LT_image_path($type, $file))
  or done("Failed to move file.");

// Query the Database

$LT_SQL->query("CALL create_image($user, '$file', '$type', 0)")
  or done("Query failed: " . $LT_SQL->error);

// Generate Output

done(array(user => $user, file => $file, type => $type));
?>

