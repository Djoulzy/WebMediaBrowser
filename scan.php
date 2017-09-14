<?php

$dir = $_REQUEST["dir"];

// This function scans the files folder recursively, and builds a large array
function scan($dir)
{
	$files = array();
	// Is there actually such a folder/file?
	if(file_exists($dir)){
		foreach(scandir($dir) as $f) {
			if(!$f || $f[0] == '.' || $f[0] == '@' || $f == 'thumbs') {
				continue; // Ignore hidden files
			}
			if(is_dir($dir . '/' . $f)) {
				// The path is a folder
				$files[] = array(
					"name" => $f,
					"type" => "folder",
					"path" => $dir . '/' . $f,
					"items" => scan($dir . '/' . $f) // Recursively get the contents of the folder
				);
			}
			else {
				// It is a file
				$files[] = array(
					"name" => $f,
					"type" => "file",
					"path" => $dir . '/' . $f,
					"size" => filesize($dir . '/' . $f) // Gets the size of this file
				);
			}
		}
	}
	return $files;
}

header('Content-type: application/json');

if (file_exists("./dir.json") && !isset($_REQUEST["update"]))
	readfile("./dir.json");
else {
	if (isset($_REQUEST["update"])) {
		$tmp_dir = json_decode(file_get_contents("./dir.json"));
		var_dump($tmp_dir);
	}
	else {
		// Output the directory listing as JSON
		$response = scan($dir);
		$dir_list = json_encode(array(
			"name" => $dir,
			"type" => "folder",
			"path" => $dir,
			"items" => $response
		));

		echo $dir_list;
		file_put_contents("./dir.json", $dir_list);
	}
}
//
