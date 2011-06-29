<?php

// this should do nothing if these scripts have already been included.
include_once('db_config.php');
include_once('include/query.php');

// Returns TRUE if this user has permission to modify the image.
// Returns FALSE if this user does not have permission to modify the image.
// A FALSE result could also mean an SQL error or bad image id.
function LT_can_modify_image($image_id) {
  
  global $LT_SQL;
  
  // you must be logged in to modify images
  if (!isset($_SESSION['user_id'])) return FALSE;

  // admins may update other user's images
  if (strcmp($_SESSION['permissions'], 'administrator') == 0) return TRUE;

  // other users can only update images they own
  $user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);
  if ($rows = LT_call_silent('read_image', $image_id)) {
    return $user_id == $rows[0]['user_id'];
  }
  // a FALSE result could also mean an SQL error or bad image id
  return FALSE;
}

// Returns TRUE if this user has permission to modify the table.
// Returns FALSE if this user does not have permission to modify the table.
// A FALSE result could also mean an SQL error or bad table id.
function LT_can_modify_table($table_id) {
  
  global $LT_SQL;
  
  // you must be logged in to modify tables
  if (!isset($_SESSION['user_id'])) return FALSE;

  // admins may update other user's tables
  if (strcmp($_SESSION['permissions'], 'administrator') == 0) return TRUE;

  // other users can only update tables they own
  $user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);
  if ($rows = LT_call_silent('read_table', $table_id)) {
    return $user_id == $rows[0]['user_id'];
  }
  // a FALSE result could also mean an SQL error or bad table id
  return FALSE;
}

// Returns TRUE if this user has permission to modify the piece.
// Returns FALSE if this user does not have permission to modify the piece.
// A FALSE result could also mean an SQL error or bad piece id.
function LT_can_modify_piece($piece_id) {
  
  global $LT_SQL;
  
  // you must be logged in to modify pieces
  if (!isset($_SESSION['user_id'])) return FALSE;

  // admins may update other user's pieces
  if (strcmp($_SESSION['permissions'], 'administrator') == 0) return TRUE;

  // users can update pieces they own and pieces belonging to tables they own
  if ($rows = LT_call_silent('read_piece', $piece_id)) {
    $user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);
    if ($rows[0]['user_id'] == $user_id) return TRUE;
    $table_id = $rows[0]['table_id'];
    if ($rows = LT_call_silent('read_table', $table_id)) {
      return $user_id == $rows[0]['user_id'];
    }
  }
  // a FALSE result could also mean an SQL error or bad piece id
  return FALSE;
}

?>
