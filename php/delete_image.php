<?php

session_start();

include('db_config.php');
include('include/images.php');
include('include/ownership.php');

// Interpret the Request

$image_id = $LT_SQL->real_escape_string($_REQUEST['image_id']);

// Query the Database

if (LT_can_modify_image($image_id)) {
  $LT_SQL->multi_query("CALL read_image($image_id)")
    or die ("Query error: " . $LT_SQL->error);
  $result = $LT_SQL->store_result();
  $row = $result->fetch_assoc();
  $type = $row['type'];
  $file = $row['file'];
  if ($LT_SQL->more_results()) {
    while($LT_SQL->next_result());
  }

  $LT_SQL->query("CALL delete_image($image_id)")
    or die ("Query error: " . $LT_SQL->error);
  unlink(LT_image_path($type, $file))
    or die ("Unlink failed.");
}

?>
