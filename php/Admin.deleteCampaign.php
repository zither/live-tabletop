<?php // Admin deletes the campaign

session_start();
if (!isset($_SESSION['admin'])) die ('You are not logged in.');

include('db_config.php');
include('include/query.php');

$campaign = $LT_SQL->real_escape_string($_REQUEST['campaign']);
LT_call('delete_campaign', $campaign);

?>
