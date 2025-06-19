
<?php
$code = $_GET['code'] ?? '';
if ($code !== '284717') {
    die('Доступ запрещён.');
}

include 'config.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
    if ($_POST['username'] === 'Maydesk' && $_POST['password'] === $admin_password) {
        $_SESSION['admin'] = true;
    } else {
        echo "Неверный логин или пароль.";
    }
}

if (!isset($_SESSION['admin'])) {
?>
<form method="POST">
  <input type="text" name="username" placeholder="Логин" value="Maydesk" readonly><br>
  <input type="password" name="password" placeholder="Пароль"><br>
  <button type="submit">Войти</button>
</form>
<?php exit; } ?>

<h1>Панель администратора</h1>

<h2>Логи посещений</h2>
<pre>
<?php
$ip = $_SERVER['REMOTE_ADDR'];
$log = "[" . date("Y-m-d H:i:s") . "] IP: $ip\n";
file_put_contents("visits.log", $log, FILE_APPEND);
echo htmlspecialchars(file_get_contents("visits.log"));
?>
</pre>

<h2>Управление пользователями</h2>
<form method="POST" action="?code=284717&add_user=1">
  <input type="text" name="name" placeholder="Имя">
  <input type="text" name="id" placeholder="ID">
  <button type="submit">Добавить</button>
</form>
<?php
if (isset($_GET['add_user']) && $_POST['name'] && $_POST['id']) {
    $users = file_exists("users.json") ? json_decode(file_get_contents("users.json"), true) : [];
    $users[] = ["name" => $_POST['name'], "id" => $_POST['id']];
    file_put_contents("users.json", json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}
?>

<h2>Загрузка</h2>
<form method="POST" enctype="multipart/form-data">
  Фон (главная): <input type="file" name="bg-main"><br>
  Фон (радио): <input type="file" name="bg-radio"><br>
  Трек: <input type="file" name="track"><br>
  <button type="submit">Загрузить</button>
</form>

<?php
if ($_FILES) {
  if ($_FILES['bg-main']['tmp_name']) move_uploaded_file($_FILES['bg-main']['tmp_name'], "../assets/images/bg-main.jpg");
  if ($_FILES['bg-radio']['tmp_name']) move_uploaded_file($_FILES['bg-radio']['tmp_name'], "../assets/images/bg-radio.jpg");
  if ($_FILES['track']['tmp_name']) move_uploaded_file($_FILES['track']['tmp_name'], "../assets/music/" . basename($_FILES['track']['name']));
  echo "Файлы загружены.";
}
?>
