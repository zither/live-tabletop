<?php

function LT_image_type_path($type) {
  return getcwd()
    . DIRECTORY_SEPARATOR . '..'
    . DIRECTORY_SEPARATOR . 'images'
    . DIRECTORY_SEPARATOR . 'upload'
    . DIRECTORY_SEPARATOR . $type;
}

function LT_image_path($type, $file) {
  return LT_image_type_path($type) . DIRECTORY_SEPARATOR . $file;
}

$LT_IMAGE_TYPES = array('background', 'tile', 'piece');

function LT_image_type($type) {
  global $LT_IMAGE_TYPES;
  return in_array($type, $LT_IMAGE_TYPES);
}


?>
