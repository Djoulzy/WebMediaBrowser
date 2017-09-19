<?php

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
					//"items" => scan($dir . '/' . $f) // Recursively get the contents of the folder
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

function find($dirToScan, $dirArray, &$dataTree)
{
	$dirName = array_shift($dirArray);

	if (($dataTree["type"] != "folder") || ($dataTree["name"] != $dirName))
		return false;

	if (empty($dirArray)) {
		return scan($dirToScan);
	}
	else
	{
		$sub = $dirArray[0];
		foreach($dataTree["items"] as $key => $obj)
		{
			if (($obj["type"] == "folder") && ($obj["name"] == $sub))
			{
				if ($ret = find($dirToScan, $dirArray, $dataTree["items"][$key]))
				{
					$dataTree["items"][$key]["items"] = $ret;
					return $dataTree["items"];
				}
			}
		}
		return false;
	}
}

if (file_exists("./dir.json") && !isset($_REQUEST["update"]))
{
	header('Content-type: application/json');
	readfile("./dir.json");
}
else {
	if (isset($_REQUEST["update"]) && (isset($_REQUEST["dir"]))) {
		header('Content-type: text/plain');
		$tmp_dir = json_decode(file_get_contents("./dir.json"), true);
		$searchdir = $_REQUEST["dir"];
		if ($ret = find($searchdir, explode("/", $searchdir), $tmp_dir))
		{
			$dir_list = json_encode($tmp_dir);
			file_put_contents("./dir.json", $dir_list);
			echo "OK";
		}
		else echo "KO";
	}
	else {
		// Output the directory listing as JSON
		header('Content-type: application/json');
		$response = scan($_REQUEST["dir"]);
		$dir_list = json_encode(array(
			"name" => $_REQUEST["dir"],
			"type" => "folder",
			"path" => $_REQUEST["dir"],
			"items" => $response
		));

		echo $dir_list;
		file_put_contents("./dir.json", $dir_list);
	}
}
//
