<?

function LT_image_path($type, $file) {
  return getcwd()
    . DIRECTORY_SEPARATOR . '..'
    . DIRECTORY_SEPARATOR . 'images'
    . DIRECTORY_SEPARATOR . 'upload'
    . DIRECTORY_SEPARATOR . $type
    . DIRECTORY_SEPARATOR . $file;
}

function LT_image_type($type) {
  return $type == 'background' or $type == 'tile' or $type == 'piece';
}

?>
