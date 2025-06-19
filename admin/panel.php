<?php
session_start();
if (!isset($_SESSION['user'])) {
    header("Location: login.php");
    exit;
}
?>
<!DOCTYPE html>
<html>
<head><title>Админка</title><link rel="stylesheet" href="../style.css"></head>
<body>
<div class="register-container fade-in">
    <h2>Добро пожаловать, <?= $_SESSION['user'] ?></h2>
    <a class="btn glow" href="logout.php">Выйти</a>
    <p>Статистика: пользователей 1, радио играет √</p>
</div>
</body>
</html>
