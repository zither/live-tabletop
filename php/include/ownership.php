<?php

// this should do nothing if these scripts have already been included.
include_once('db_config.php');
include_once('include/query.php');

/*
These functions return TRUE if the user has permission, and FALSE if:
	- they don't have permission
	- they provided a bad campaign, map or character id
	- an SQL error occured
*/

// CAMPAIGN

function LT_can_view_campaign($campaign_id) {
	global $LT_SQL;
	if (!isset($_SESSION['user_id'])) return FALSE; // you must be logged in

	// anyone can view public campaigns
	$rows = LT_call_silent('read_campaign', $campaign_id);
	if ($rows[0]['private'] == '0') return TRUE;

	// only members and owners can view private campaigns
	$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);
	if ($rows = LT_call_silent('read_campaign_user_permission', $user_id, $campaign_id))
		if ($rows[0]['permission'] == 'owner' or $rows[0]['permission'] == 'member')
			return TRUE;

	return FALSE; // a FALSE result could also mean an SQL error or bad id
}

function LT_can_edit_campaign($campaign_id) {
	global $LT_SQL;
	if (!isset($_SESSION['user_id'])) return FALSE; // you must be logged in

	// only owners may edit
	$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);
	if ($rows = LT_call_silent('read_campaign_user_permission', $user_id, $campaign_id))
		if ($rows[0]['permission'] == 'owner') return TRUE;

	return FALSE; // a FALSE result could also mean an SQL error or bad id
}

// MAP

function LT_can_edit_map($map_id) {
	global $LT_SQL;
	if (!isset($_SESSION['user_id'])) return FALSE; // you must be logged in

	// only owners may edit
	$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);
	if (LT_call_silent('read_map_owner_exists', $user_id, $map_id))
		return TRUE;

	return FALSE; // a FALSE result could also mean an SQL error or bad id
}

function LT_can_edit_piece($piece_id) {
	global $LT_SQL;
	if (!isset($_SESSION['user_id'])) return FALSE; // you must be logged in

	// users can only edit pieces belonging to maps they own
	if ($rows = LT_call_silent('read_piece', $piece_id)) {
		$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);
		$map_id = $rows[0]['map'];
		if (LT_call_silent('read_map_owner_exists', $user_id, $map_id))
			return TRUE;
	}
	return FALSE; // a FALSE result could also mean an SQL error or bad id
}

function LT_can_move_piece($piece_id) {
	global $LT_SQL;
	if (!isset($_SESSION['user_id'])) return FALSE; // you must be logged in

	if ($rows = LT_call_silent('read_piece', $piece_id)) {
		$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);
		$character_id = $rows[0]['character'];
		$map_id = $rows[0]['map'];

		// map owners can move all the pieces on the map
		if (LT_call_silent('read_map_owner_exists', $user_id, $map_id))
			return TRUE;

		// users can move pieces linked to their characters
		if ($character_id !== NULL)
			if (LT_call_silent('read_character_owner_exists', $user_id, $character_id))
				return TRUE;

		// users can move unlocked pieces displayed on their campaign map
		if ($rows[0]['locked'] == '0') {
			if ($rows = LT_call_silent('read_campaigns_by_map', $map_id)) {
				foreach ($rows as $i => $campaign) {
					// anyone can move unlocked pieces in a public campaign
					if ($campaign['private'] == '0') return TRUE;
					// only owners and members can move unlocked pieces in a private campaign
					if ($rows = LT_call_silent('read_campaign_user_permission', $user_id, $campaign['id']))
						if ($rows[0]['permission'] == 'owner' or $rows[0]['permission'] == 'member')
							return TRUE;
				}
			}
		}
	}
	return FALSE; // a FALSE result could also mean an SQL error or bad id
}

// CHARACTER

function LT_can_edit_character($character_id) {
	global $LT_SQL;
	if (!isset($_SESSION['user_id'])) return FALSE; // you must be logged in

	// only owners may edit
	$user_id = $LT_SQL->real_escape_string($_SESSION['user_id']);
	if (LT_call_silent('read_character_owner_exists', $user_id, $character_id))
		return TRUE;

	return FALSE; // a FALSE result could also mean an SQL error or bad id
}



?>
