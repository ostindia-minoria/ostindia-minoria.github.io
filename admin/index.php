<?php
session_start();
include 'config.php';

function deny() {
    http_response_code(403);
    echo "Access denied.";
    exit;
}

// Проверка на код доступа
if (!isset($_GET['code']) || $_GET['code'] !== '284717') {
    deny();
}

// Логин форма
if (!isset($_SESSION['loggedin'])) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';
        if ($username === 'Maydesk' && $password === $admin_password) {
            $_SESSION['loggedin'] = true;
        } else {
            echo "Неверный логин или пароль.";
        }
    }
    if (!isset($_SESSION['loggedin'])) {
        echo '<form method="post">
            Логин: <input type="text" name="username" value="Maydesk" readonly><br>
            Пароль: <input type="password" name="password"><br>
            <button type="submit">Войти</button>
        </form>';
        exit;
    }
}

// Лог IP
$ip = $_SERVER['REMOTE_ADDR'];
file_put_contents("visits.log", date("Y-m-d H:i:s") . " - $ip\n", FILE_APPEND);

// Обработка добавления пользователя
if (isset($_POST['userid'], $_POST['username'])) {
    $users = file_exists('users.json') ? json_decode(file_get_contents('users.json'), true) : [];
    $users[] = ['id' => htmlspecialchars($_POST['userid']), 'name' => htmlspecialchars($_POST['username'])];
    file_put_contents('users.json', json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo "<p>Пользователь добавлен!</p>";
}

// Обработка загрузки файлов
if (isset($_FILES['bg_main'])) {
    move_uploaded_file($_FILES['bg_main']['tmp_name'], "../assets/images/bg-main.jpg");
}
if (isset($_FILES['bg_radio'])) {
    move_uploaded_file($_FILES['bg_radio']['tmp_name'], "../assets/images/bg-radio.jpg");
}
if (isset($_FILES['track'])) {
    move_uploaded_file($_FILES['track']['tmp_name'], "../assets/music/" . basename($_FILES['track']['name']));
}

// Интерфейс админки
echo "<h2>Админка</h2>";
echo "<h3>Последние посещения:</h3><pre>";
if (file_exists('visits.log')) {
    $lines = array_slice(file('visits.log'), -20);
    echo htmlspecialchars(implode('', $lines));
}
echo "</pre>";

echo '<h3>Добавить пользователя</h3>
<form method="post">
  ID: <input name="userid" required>
  Имя: <input name="username" required>
  <button type="submit">Добавить</button>
</form>';

echo '<h3>Загрузить фон и треки</h3>
<form method="post" enctype="multipart/form-data">
  Фон Главной: <input type="file" name="bg_main"><br>
  Фон Радио: <input type="file" name="bg_radio"><br>
  Трек MP3: <input type="file" name="track"><br>
  <button type="submit">Загрузить</button>
</form>';
?>
