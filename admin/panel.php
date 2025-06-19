
<?php
session_start();
if ($_POST["pass"] ?? null) {
  if ($_POST["pass"] === "admin123") {
    $_SESSION["admin"] = true;
  }
}
if (!$_SESSION["admin"]) {
  echo '<form method="post"><input type="password" name="pass" placeholder="Пароль"/><button>Вход</button></form>';
  exit;
}
function upload($input, $folder, $exts, $cfg=null) {
  if ($_FILES[$input]["name"]) {
    $name = basename($_FILES[$input]["name"]);
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    if (in_array($ext, $exts)) {
      move_uploaded_file($_FILES[$input]["tmp_name"], "$folder/$name");
      if ($cfg) {
        $c = json_decode(file_get_contents("../config.json"), true);
        $c[$cfg] = $name;
        file_put_contents("../config.json", json_encode($c, JSON_PRETTY_PRINT));
      }
    }
  }
}
upload("track", "../music", ["mp3"]);
upload("logo", "../", ["jpg","png","jpeg"], "logo");
upload("background", "../", ["jpg","png","jpeg"], "background");
$tracks = array_filter(scandir("../music"), fn($f) => pathinfo($f, PATHINFO_EXTENSION)==="mp3");
?>
<h1>Админка</h1>
<form method="post" enctype="multipart/form-data">
  Загрузить трек: <input type="file" name="track"><button>OK</button><br><br>
  Логотип: <input type="file" name="logo"><br>
  Фон: <input type="file" name="background"><br>
  <button>Загрузить медиа</button>
</form>
<ul>
<?php foreach($tracks as $t) echo "<li>$t</li>"; ?>
</ul>
