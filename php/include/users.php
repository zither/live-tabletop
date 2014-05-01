<?php

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
