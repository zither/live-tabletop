<?php

function LT_format_object(&$data, &$fields) {
	if (isset($fields['integer'])) foreach ($fields['integer'] as $key)
		$data[$key] = $data[$key] === NULL ? NULL : intval($data[$key]);
	if (isset($fields['boolean'])) foreach ($fields['boolean'] as $key)
		$data[$key] = $data[$key] == '1' ? TRUE : FALSE;
	if (isset($fields['float'])) foreach ($fields['float'] as $key)
		$data[$key] = $data[$key] === NULL ? NULL : floatval($data[$key]);
	if (isset($fields['json'])) foreach ($fields['json'] as $key)
		$data[$key] = $data[$key] === NULL ? NULL : json_decode($data[$key]);
	if (isset($fields['blocked'])) foreach ($fields['blocked'] as $key)
		unset($data[$key]);
}

function LT_output_object(&$data, $fields) {
	LT_format_object($data, $fields);
	include('include/json_headers.php');
	echo json_encode($data);
}

function LT_output_array(&$data, $fields) {
	foreach ($data as $i => $object) LT_format_object($data[$i], $fields);
	include('include/json_headers.php');
	echo json_encode($data);
}

?>

