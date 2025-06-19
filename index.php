
<?php
$config = json_decode(file_get_contents("config.json"), true);
$logo = $config["logo"] ?? "";
$background = $config["background"] ?? "";
?>
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Главная</title>
  <link rel="stylesheet" href="style.css" />
  <script src="script.js" defer></script>
  <style>
    body {
      background-image: url('<?= $background ?>');
      background-size: cover;
      background-attachment: fixed;
    }
  </style>
</head>
<body>
<header>
  <div class="logo">
    <?php if ($logo): ?>
      <img src="<?= $logo ?>" alt="Логотип" style="height: 50px;" />
    <?php else: ?>
      OstIndia & Minoria
    <?php endif; ?>
  </div>
  <nav>
    <a href="index.html" class="nav-btn active">Главная</a>
    <a href="radio.html" class="nav-btn">Радио</a>
    <a href="contact.html" class="nav-btn">Регистрация</a>
  </nav>
</header>
<main>
  <h1>Добро пожаловать</h1>
  <p>Здесь радио, чат и админка. Всё работает.</p>
</main>
</body>
</html>
