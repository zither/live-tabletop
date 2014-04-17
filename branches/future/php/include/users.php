<?php

// generate a random salt
function LT_random_salt() {

	// 26 capital letters + 26 lowercase letters + 10 numerals = 62 characters
	// base 2 log of 62 possible characters = 5.95 bits of entropy per character
	$salt_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	// 5.95 bits/character x 22 characters = 131 bits of entropy
	$salt_length = 22;

	$salt = "";
	for ($i = 0; $i < $salt_length; $i++)
		$salt .= $salt_chars[rand(0, strlen($salt_chars) - 1)];

	return $salt;
}

// hash a password using a salt
function LT_hash_password($password, $salt) {
	return md5($salt . $password);
}

function LT_write_users($rows) {
	$output = array();
	foreach ($rows as $user)
		$output[] = array(
			'id' => intval($user['id']),
			'name' => $user['name'],
			'color' => $user['color'],
			'permissions' => $user['permissions']);
	include('include/json_headers.php');
	echo json_encode($output);
}

?>
