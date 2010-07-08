<?php

// generate a random salt
function LT_random_salt() {

  // 26 capital letters + 26 lowercase letters + 10 numerals = 62 characters
  // base 2 log of 62 possible characters = 5.95 bits of entropy per character
  $salt_chars = array('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
    'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
    'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9');

  // 5.95 bits/character x 22 characters = 131 bits of entropy
  $salt_length = 22;

  $salt = "";
  for ($i = 0; $i < $salt_length; $i++) {
    $salt .= $salt_chars[rand(0, count($salt_chars))];
  }

  return $salt;
}

// hash a password using a salt
function LT_hash_password($password, $salt) {
  return md5($salt . $password);
}

// create a new user
function LT_create_user($username, $password, $permissions) {
  $salt = LT_random_salt();
  $hash = LT_hash_password($salt . $password);
  $query = "CALL create_user('$admin_username', '$hash', '$salt', NULL, '$permissions')";
  return mysqli_query($query);
}

?>
