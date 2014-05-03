<?php

// Call an SQL stored procedure, returning false on failure.
// This function takes one or more arguments.
// The first argument is the name of the stored procedure.
// The other arguments are passed to the stored procedure.
// On success, this function returns an empty array or
// the first result set as an array of associative arrays.
function LT_call_silent() {
	$proc = func_get_arg(0);
	$args = array_slice(func_get_args(), 1);
	$die = FALSE;
	return LT_call($proc, $args, $die);
}

// Call an SQL stored procedure.
// This function takes one or more arguments.
// The first argument is the name of the stored procedure.
// If the second argument is not an array,
//   the other arguments are passed to the stored procedure,
//   and PHP aborts with an error message on failure.
// If the second argument is an array,
//   its contents are passed to the store procedure,
//   and the third argument determines whether PHP aborts
//   with an error message or returns FALSE on failure.
// On success, this function returns an empty array or
// the first result set as an array of associative arrays.
function LT_call($proc, $args = array(), $die = TRUE) {

	// if $args is not an array, then assume all arguments after $proc
	// are arguments to the stored procedure and $die is true.
	if (!is_array($args)) {
		$args = array_slice(func_get_args(), 1);
		$die = TRUE;
	}

	// build the query
	$query = "CALL $proc(";
	for ($i = 0; $i < count($args); $i++) {
		if ($i != 0) $query .= ", ";
		if (is_int($args[$i]) || is_float($args[$i])) $query .= "{$args[$i]}";
		else if (is_null($args[$i])) $query .= "NULL";
		else $query .= "'{$args[$i]}'";
	}
	$query .= ");";

	// query the database and return the result;
	return LT_query($query, $die);
}

// Make an SQL query, returning the result as an array of associative arrays.
// This function only returns the first result set, and it will return an empty
// array for queries that do not generate a result set.
function LT_query($query, $die = TRUE) {
	global $LT_SQL;

	// perform query
	$success = $LT_SQL->multi_query($query);
	if (!$success) {
		if ($die) {
			die('Query failed: ' . $LT_SQL->error);
		}
		else {
			return FALSE;
		}
	}

	// get the first result set as an array of associative arrays
	$rows = array();
	$result = $LT_SQL->store_result();
	if ($result) {
		while ($row = $result->fetch_assoc()) {
			$rows[] = $row;
		}
		$result->close();
	}

	// ignore subsequent result sets
	while ($LT_SQL->more_results()) {
		$LT_SQL->next_result();
	}

	// return first result set array
	return $rows;
}

// Return a request variable, escaped so it can be used safely in an SQL query,
// or a default value if the request variable has not been provided.
function LT_request($variable, $default) {
	global $LT_SQL;
	if (array_key_exists($variable, $_REQUEST)) {
		return $LT_SQL->real_escape_string($_REQUEST[$variable]);
	}
	else {
		return $LT_SQL->real_escape_string($default);
	}
}

?>
