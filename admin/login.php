<?php
session_start();
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $login = $_POST['login'];
    $pass = $_POST['password'];

    $stmt = $db->prepare("SELECT * FROM users WHERE login = ?");
    $stmt->execute([$login]);
    $user = $stmt->fetch();

    if ($user && password_verify($pass, $user['password'])) {
        $_SESSION['user'] = $user['login'];
        header("Location: panel.php");
        exit;
    } else {
        $error = "Неверный логин или пароль";
    }
}
?>
<!DOCTYPE html>
<html>
<head><title>Вход</title><link rel="stylesheet" href="../style.css"></head>
<body>
<div class="register-container fade-in">
    <h2>Вход</h2>
    <?php if (!empty($error)) echo "<p style='color:red;'>$error</p>"; ?>
    <form method="post">
        <input name="login" placeholder="логин" required><br><br>
        <input name="password" type="password" placeholder="пароль" required><br><br>
        <button class="btn glow" type="submit">Войти</button>
    </form>
</div>
</body>
</html>
