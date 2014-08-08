<?php // User changes his password

include('db_config.php');
include('include/query.php');
include('include/password.php');

$email = $LT_SQL->real_escape_string($_REQUEST['email']);
$reset_code = LT_random_salt();
if ($rows = LT_call('update_user_reset_password', $email, $reset_code)) {
	// compose and send the confirmation e-mail
	$subject = "Live Tabletop password reset";
	$message =
		wordwrap("Your Live Tabletop password has been reset.\r\nClick on this link to enter a new password:", 70)
		. "\r\nhttp://{$_SERVER['HTTP_HOST']}"
		. str_replace("/php/User.resetPassword.php", "", $_SERVER['REQUEST_URI'])
		. "?resetCode=$reset_code&email=$email";
	mail($email, $subject, $message);
}

?>
