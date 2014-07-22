<?php // User clicks on an unsubscribe link from an e-mail announcement

include('db_config.php');
include('include/query.php');

$unsubscribe_code = $LT_SQL->real_escape_string($_REQUEST['unsubscribeCode']);
$email = $LT_SQL->real_escape_string($_REQUEST['email']);
if ($rows = LT_call('update_user_unsubscribe', $email, $unsubscribe_code))
	LT_output_object($rows[0], array('integer' => array('success')));

?>
