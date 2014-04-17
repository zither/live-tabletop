<?php

function LT_write_tables($rows) {
	$string_fields = array('name', 'grid_color', 'wall_color', 'tile_mode');
	foreach ($rows as $i => $table)
		foreach ($table as $key => $value)
			if (!in_array($key, $string_fields))
				$rows[$i][$key] = intval($value);
	include('json_headers.php');
	echo json_encode($rows);
}


?>
