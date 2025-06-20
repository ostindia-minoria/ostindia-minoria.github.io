<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Вход в админку | Ost-India / Minoria</title>
    <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
    <div class="overlay"></div>
    <main class="login-container">
        <h2>Административная панель</h2>
        
        <?php if (isset($error)): ?>
            <div class="alert error"><?php echo $error; ?></div>
        <?php endif; ?>
        
        <form method="post">
            <div class="form-group">
                <label for="username">Логин:</label>
                <input type="text" name="username" id="username" required autofocus>
            </div>
            
            <div class="form-group">
                <label for="password">Пароль:</label>
                <input type="password" name="password" id="password" required>
            </div>
            
            <button type="submit">Войти</button>
        </form>
    </main>
</body>
</html>