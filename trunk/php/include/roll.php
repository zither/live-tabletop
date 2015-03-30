<?php

/*

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
	$string = "";
  $addends = explode('+', $roll);
  for ($i = 0; $i < count($addends); $i++) {
    $subtractends = explode('-', $addends[$i]);
    for ($j = 0; $j < count($subtractends); $j++) {
      $difference = 0;
      $operands = explode('d', $subtractends[$j], 2);
      if (count($operands) == 1) $difference = intval($operands[0]);
      if (count($operands) == 2) {
				$dice = is_numeric($operands[0]) ? intval($operands[0]) : 1;
				$sides = trim($operands[1]);
				if ($sides == "f") $sides = "+ -"; // Fudge dice
				if ($sides == "h") $sides = "SSSWWB"; // Hero Quest combat dice
				if ($sides == "%") $sides = "100";
				$length = strlen($sides);
				if ($length == 0 or is_numeric($sides)) {
					// numbered dice, six sided by default
					$sides = length == 0 ? 6 : intval($sides);
					for ($k = 0; $k < $dice; $k++)
						$difference += rand(1, $sides);
				} else {
					// dice with symbols, represented as characters in a string
					for ($k = 0; $k < $dice; $k++)
						$string .= $sides[rand(0, $length - 1)];
				}
      }
      $total += ($j == 0) ? $difference : -$difference;
    }
  }
	if (strlen($string) == 0) return $total;
	if ($total == 0) return $string;
	return "$total|$string";
}

// replace text in square brackets with corresponding dice rolls
function LT_expand_rolls($message) {
  $left = explode('[', htmlspecialchars($string));
  $output = $left[0];
  for ($i = 1; $i < count($left); $i++) {
    $right = explode(']', $left[$i]);
    $output .= (count($right) == 2) ? "<span class=\"roll\">{$right[0]} = "
      . LT_roll($right[0]) . "</span>{$right[1]}" : $left[$i];
  }
  return $output;

}
*/

// replace die roll notation with spans containing results
// TODO: do we need to escape HTML markup in the message input?
function LT_expand_rolls($message) {

	// break message into parts after spaces and at + or -
	$parts = array();
	foreach (explode(" ", $message) as $spacedPart) {
		if ($spacedPart == "") continue; // we don't bother to preserve whitespace
		foreach(explode("+", $spacedPart) as $plussedPart) {
			if ($plussedPart != "") {
				foreach(explode("-", $plussedPart) as $minusedPart) {
					if ($minusedPart != "") $parts[] = $minusedPart;
					$parts[] = "-"; // restore the minuses we removed when exploding
				}
				array_pop($parts); // remove the extra minus we added for the last item
			}
			$parts[] = "+"; // restore the plusses we removed when exploding
		}
		array_pop($parts); // remove the extra plus we added for the last item
	}

	$parts[] = ""; // dummy string for the final iteration of the output loop

	// put message back together while calculating die rolls
	$out = ""; $text = ""; $sum = 0; $oldMode = "a";
	foreach ($parts as $part) {

		// determine the type of this part
		$value = trim($part);
		if (is_numeric($value)) {$value = floatval($value); $newMode = "#";}
		elseif ($value == "+" || $value == "-") $newMode = $value;
		elseif (preg_match('/[0-9]d|d[0-9%]/', $value)) { // dice notation
			// break down dice notation into number and type of dice
			list($dice, $sides) = explode("d", $value, 2);
			if ($dice == "") $dice = 1; else $dice = intval($dice);
			if ($dice > 100) $dice = 100;
			if ($sides == "") {$sides = 6; $newMode = "#";}
			elseif (is_numeric($sides)) {$sides = intval($sides); $newMode = "#";}
			elseif ($sides == "%") {$sides = 100; $newMode = "#";}
			elseif ($sides == "h") {$sides = "SSSWWB"; $newMode = "a";}
			elseif ($sides == "f") {$sides = "+ -"; $newMode = "a";}
			else $newMode = "a";
			// roll dice and add up values
			if ($newMode == "#") {
				// for numbered dice we need a sum that can be added to other numbers
				$value = 0;
				for ($i = 0; $i < $dice; $i++) $value += rand(1, $sides);
			} else {
				// for dice with non-numeric symbols, we replace the text with HTML
				$part = "<span class=\"roll\">$value = ";
				$length = strlen($sides);
				for ($i = 0; $i < $dice; $i++) $part .= $sides[rand(0, $length - 1)];
				$part .= "</span>"; // this can insert a new space before a + or -
			}
		} else $newMode = "a";

		// add this part to our text output
		if ($oldMode == "a" || (($oldMode == "+" || $oldMode == "-") && $newMode != "#")) {
			$out .= "$text ";
			$text = $part;
		} elseif ($oldMode == "#" && ($newMode == "#" || $newMode == "a")) {
			if (trim($text) == "$sum") $out .= "$text ";
			else $out .= "<span class=\"roll\">$text = $sum</span> ";
			$text = $part;
		} else $text .= " $part"; // part of running total not ready for output yet

		// add numeric values to our running total
		if ($newMode == "#") {
			if ($oldMode == "+") $sum += $value;
			if ($oldMode == "-") $sum -= $value;
			if ($oldMode == "#" || $oldMode == "a") $sum = $value;
		} elseif (($newMode == "+" || $newMode == "-") && $oldMode != "#") $sum = 0;

		// remember this part's type for next time
		$oldMode = $newMode;

	} // foreach ($parts as $part) {

	return $out;

} // function LT_expand_rolls($message) {

