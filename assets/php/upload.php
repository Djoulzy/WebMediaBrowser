<?php
// $file = $_POST['file'];
// $name = $_POST['name'];
//
// $path = 'images/affiches/'.$name;
// // echo $path;
// $fd = fopen("./upload.log", "a");
// fwrite($fd, $path."\n");
// fclose($fd);
//
// $encodedData = str_replace(' ','+',$file);
// $decodedData = base64_decode($encodedData);
//
// file_put_contents($path, $decodedData) ;
//
// echo var_export($_POST, true);

$uploaddir = '/var/www/html/assets/php/images/affiches/';
// $uploadfile = $uploaddir . basename($_FILES['userfile']['name']);
//
// $fd = fopen("./upload.log", "a");
// fwrite($fd, var_export($_FILES, true)."\n");
// fclose($fd);
//
// echo '<pre>';
// if (move_uploaded_file($_FILES['userfile']['tmp_name'], $uploadfile)) {
//     echo "Le fichier est valide, et a été téléchargé
//            avec succès. Voici plus d'informations :\n";
// } else {
//     echo "Attaque potentielle par téléchargement de fichiers.
//           Voici plus d'informations :\n";
// }
//
// echo 'Voici quelques informations de débogage :';
// print_r($_FILES);
//
// echo '</pre>';

// $fd = fopen("./upload.log", "a");
// fwrite($fd, "POST: ".var_export($_POST, true)."\n");
// fwrite($fd, "FILES: ".var_export($_FILES, true)."\n");
// fclose($fd);
//
// if (empty($_FILES) || $_FILES["file"]["error"]) {
//   die('{"OK": 0}');
// }
//
// $fileName = $_FILES["file"]["name"];
// move_uploaded_file($_FILES["file"]["tmp_name"], $uploaddir.$fileName);
//
// die('{"OK": 1}');

if (empty($_FILES) || $_FILES['file']['error']) {
  die('{"OK": 0, "info": "Failed to move uploaded file."}');
}

$fd = fopen("./upload.log", "a");
fwrite($fd, "RCPT: ".$_FILES['file']['name'].", ".$_FILES['file']['size'].", errors: ".$_FILES['file']['error']."\n");
fclose($fd);

$chunk = isset($_REQUEST["chunk"]) ? intval($_REQUEST["chunk"]) : 0;
$chunks = isset($_REQUEST["chunks"]) ? intval($_REQUEST["chunks"]) : 0;

$fileName = isset($_REQUEST["name"]) ? $_REQUEST["name"] : $_FILES["file"]["name"];
$filePath = $uploaddir.$fileName;


// Open temp file
$out = @fopen("{$filePath}.part", $chunk == 0 ? "wb" : "ab");
if ($out) {
  // Read binary input stream and append it to temp file
  $in = @fopen($_FILES['file']['tmp_name'], "rb");

  if ($in) {
    while ($buff = fread($in, 4096))
      fwrite($out, $buff);
  } else
    die('{"OK": 0, "info": "Failed to open input stream."}');

  @fclose($in);
  @fclose($out);

  @unlink($_FILES['file']['tmp_name']);
} else
  die('{"OK": 0, "info": "Failed to open output stream."}');


// Check if file has been uploaded
if (!$chunks || $chunk == $chunks - 1) {
  // Strip the temp .part suffix off
  rename("{$filePath}.part", $filePath);
}

die('{"OK": 1, "info": "Upload successful."}');
?>
