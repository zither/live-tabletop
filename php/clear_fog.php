<?php

session_start();

include('db_config.php');
include('ownership.php');

$table_id = mysqli_real_escape_string($_REQUEST['table_id']);

if (LT_can_modify_table($table_id)) {
  $link = mysqli_connect($DBLocation , $DBUsername , $DBPassword, $DBName)
    or die ("Connect failed: " + mysqli_error());
  $result = mysqli_query($link, "CALL update_tiles_clear_fog($table_id)")
    or die ("Query failed: " + mysqli_error());
}

?>
