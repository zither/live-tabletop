<?php

// Users can put dice rolls into chat messages using square brackets like this:
//
//  "I cast arcane projectile: [d20 + 8] to hit, [3d-1] damage."
//
// * white space is ignored
// * numbers before and after "d" are optional: d4 = 1d4, 3d = 3d6, d = 1d6
// * you can use any number of die rolls, addition and subtraction operators
// * you cannot use parentheses, multiplication or division

// returns the result of a dice roll in dice notation
function LT_roll($roll) {
  $total = 0;
  $addends = explode('+', $roll);
  for ($i = 0; $i < count($addends); $i++) {
    $subtractends = explode('-', $addends[$i]);
    for ($j = 0; $j < count($subtractends); $j++) {
      $difference = 0;
      $operands = explode('d', $subtractends[$j]);
      if (count($operands) == 1) $difference = intval($operands[0]);
      if (count($operands) == 2) {
        $dice = is_numeric($operands[0]) ? intval($operands[0]) : 1;
        $sides = is_numeric($operands[1]) ? intval($operands[1]) : 6;
        for ($k = 0; $k < $dice; $k++) $difference += rand(1, $sides);
      }
      $total += ($j == 0) ? $difference : -$difference;
    }
  }
  return $total;
}

// replace text in square brackets with corresponding dice rolls
function LT_expand_rolls($string) {
  $left = explode('[', htmlspecialchars($string));
  $output = $left[0];
  for ($i = 1; $i < count($left); $i++) {
    $right = explode(']', $left[$i]);
/*
    $output .= (count($right) == 2) ? "<span title=\"{$right[0]}\">"
      . LT_roll($right[0]) . "</span>{$right[1]}" : $left[$i];
*/
    $output .= (count($right) == 2) ? "<span class=\"roll\">{$right[0]} = "
      . LT_roll($right[0]) . "</span>{$right[1]}" : $left[$i];
  }
  return $output;
}

