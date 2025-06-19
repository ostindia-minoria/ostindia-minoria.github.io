
<?php
$tracks = array_filter(scandir("music"), fn($f) => pathinfo($f, PATHINFO_EXTENSION) === "mp3");
?>
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <title>Радио</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
<header>
  <nav>
    <a class="nav-btn" href="index.php">Главная</a>
    <a class="nav-btn active" href="radio.php">Радио</a>
    <a class="nav-btn" href="contact.php">Регистрация</a>
  </nav>
</header>
<main style="text-align:center; padding:40px;">
  <h1>Радио от участников</h1>
  <p>Вы можете предложить свой трек через админ-панель</p>
  <?php foreach ($tracks as $t): ?>
    <div style="margin:20px;">
      <strong><?= htmlspecialchars($t) ?></strong><br>
      <audio controls src="music/<?= urlencode($t) ?>"></audio>
    </div>
  <?php endforeach; ?>
</main>
<footer>Made by @Maydesk</footer>
</body>
</html>
