
<?php
$config = json_decode(file_get_contents("config.json"), true);
$logo = $config["logo"] ?? "";
$background = $config["background"] ?? "";
?>
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <title>Ост-Индия и Минория Радио</title>
  <link rel="stylesheet" href="style.css" />
  <style>
    body {
      background-image: url('<?= $background ?>');
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">
      <?php if ($logo): ?>
        <img src="<?= $logo ?>" alt="Логотип">
      <?php else: ?>
        <span style="font-weight: bold;">OstIndia & Minoria</span>
      <?php endif; ?>
    </div>
    <nav>
      <a class="nav-btn" href="index.php">Главная</a>
      <a class="nav-btn" href="radio.php">Радио</a>
      <a class="nav-btn" href="contact.php">Регистрация</a>
    </nav>
  </header>

  <main style="text-align:center; padding:40px;">
    <h1>Сайт, посвященный чатам Ост-Индии и Минории</h1>
    <p>Этот сайт посвящен двум чатам Ост-Индии и Минории. Здесь вы можете послушать радио от участников, а также зарегистрироваться на сайте.</p>
    <p>Проект находится в разработке, скоро будет больше страниц!</p>
  </main>

  <footer>
    Made by @Maydesk
  </footer>
</body>
</html>
