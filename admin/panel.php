
<?php
if ($_COOKIE["admin"] !== "1") {
    header("Location: login.php");
    exit;
}

function handle_upload($input_name, $target_dir, $allowed_types, $config_key = null) {
    if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_FILES[$input_name])) {
        $filename = basename($_FILES[$input_name]["name"]);
        $filetype = pathinfo($filename, PATHINFO_EXTENSION);
        if (in_array(strtolower($filetype), $allowed_types)) {
            $target_file = "$target_dir/$filename";
            move_uploaded_file($_FILES[$input_name]["tmp_name"], $target_file);
            if ($config_key) {
                $config = json_decode(file_get_contents("../config.json"), true);
                $config[$config_key] = $filename;
                file_put_contents("../config.json", json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            }
            echo "<p>Файл $filename успешно загружен</p>";
        } else {
            echo "<p>Формат файла $filename не поддерживается.</p>";
        }
    }
}

if (!file_exists("../config.json")) {
    file_put_contents("../config.json", json_encode(["logo" => "", "background" => ""], JSON_PRETTY_PRINT));
}

handle_upload("track", "../music", ["mp3"]);
handle_upload("logo", "../", ["jpg", "png", "jpeg"], "logo");
handle_upload("background", "../", ["jpg", "png", "jpeg"], "background");

$visits = file_exists("../visits.log") ? file_get_contents("../visits.log") : "0";
$tracks = array_filter(scandir("../music"), fn($f) => pathinfo($f, PATHINFO_EXTENSION) === "mp3");
$config = json_decode(file_get_contents("../config.json"), true);
?>

<h1>Админ-панель</h1>
<p>Всего визитов: <?= $visits ?></p>

<h2>Загрузить трек:</h2>
<form method="post" enctype="multipart/form-data">
    <input type="file" name="track" required />
    <button type="submit">Загрузить</button>
</form>

<h2>Загрузить логотип (<?= $config['logo'] ?>):</h2>
<form method="post" enctype="multipart/form-data">
    <input type="file" name="logo" required />
    <button type="submit">Загрузить логотип</button>
</form>

<h2>Загрузить фон (<?= $config['background'] ?>):</h2>
<form method="post" enctype="multipart/form-data">
    <input type="file" name="background" required />
    <button type="submit">Загрузить фон</button>
</form>

<h2>Треки на радио:</h2>
<ul>
<?php foreach ($tracks as $track): ?>
    <li><?= htmlspecialchars($track) ?></li>
<?php endforeach; ?>
</ul>
