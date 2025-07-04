<?php
session_start();

// Подключение конфигурации
require_once 'config.php';

// Проверка авторизации
if (isset($_SESSION['admin']) && $_SESSION['admin'] === true) {
    // Логирование посещения
    $logEntry = date('Y-m-d H:i:s') . " | " . $_SERVER['REMOTE_ADDR'] . " | Админ панель открыта\n";
    file_put_contents('../visits.log', $logEntry, FILE_APPEND);
} else {
    // Обработка формы входа
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';
        
        if ($username === ADMIN_USER && $password === ADMIN_PASS) {
            $_SESSION['admin'] = true;
            
            // Логирование входа
            $logEntry = date('Y-m-d H:i:s') . " | " . $_SERVER['REMOTE_ADDR'] . " | Успешный вход\n";
            file_put_contents('../visits.log', $logEntry, FILE_APPEND);
            
            header('Location: index.php');
            exit;
        } else {
            $error = "Неверный логин или пароль";
            
            // Логирование неудачной попытки
            $logEntry = date('Y-m-d H:i:s') . " | " . $_SERVER['REMOTE_ADDR'] . " | Неудачная попытка входа\n";
            file_put_contents('../visits.log', $logEntry, FILE_APPEND);
        }
    }
    
    // Показать форму входа
    include 'login-form.php';
    exit;
}

// Обработка загрузки файлов
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['uploaded_file'])) {
    $target_dir = "../assets/";
    $file_type = $_POST['file_type'];
    
    // Определение папки для загрузки
    if ($file_type === 'audio') {
        $target_dir .= "music/";
    } elseif ($file_type === 'image') {
        $target_dir .= "images/";
    } else {
        $error = "Неверный тип файла";
    }
    
    // Проверка и сохранение файла
    if (!isset($error)) {
        $target_file = $target_dir . basename($_FILES["uploaded_file"]["name"]);
        
        if (move_uploaded_file($_FILES["uploaded_file"]["tmp_name"], $target_file)) {
            $success = "Файл ". htmlspecialchars(basename($_FILES["uploaded_file"]["name"])) . " успешно загружен.";
            
            // Логирование загрузки
            $logEntry = date('Y-m-d H:i:s') . " | " . $_SERVER['REMOTE_ADDR'] . " | Загружен файл: " . basename($_FILES["uploaded_file"]["name"]) . "\n";
            file_put_contents('../visits.log', $logEntry, FILE_APPEND);
        } else {
            $error = "Ошибка при загрузке файла.";
        }
    }
}

// Обработка добавления пользователя
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['new_user'])) {
    $new_user = $_POST['new_user'];
    $new_password = $_POST['new_password'];
    
    // Загрузка существующих пользователей
    $users = [];
    if (file_exists('../users.json')) {
        $users = json_decode(file_get_contents('../users.json'), true);
    }
    
    // Добавление нового пользователя
    $users[] = ['login' => $new_user, 'password' => $new_password];
    
    if (file_put_contents('../users.json', json_encode($users, JSON_PRETTY_PRINT))) {
        $success = "Пользователь $new_user успешно добавлен";
        
        // Логирование добавления пользователя
        $logEntry = date('Y-m-d H:i:s') . " | " . $_SERVER['REMOTE_ADDR'] . " | Добавлен пользователь: $new_user\n";
        file_put_contents('../visits.log', $logEntry, FILE_APPEND);
    } else {
        $error = "Ошибка при добавлении пользователя";
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Админ-панель | Ost-India / Minoria</title>
    <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
    <div class="overlay"></div>
    <header>
        <nav>
            <ul>
                <li><a href="../index.html">На сайт</a></li>
                <li><a href="?logout" class="logout-btn">Выйти</a></li>
            </ul>
        </nav>
    </header>

    <main class="admin-container">
        <h2>Административная панель</h2>
        
        <?php if (isset($success)): ?>
            <div class="alert success"><?php echo $success; ?></div>
        <?php endif; ?>
        
        <?php if (isset($error)): ?>
            <div class="alert error"><?php echo $error; ?></div>
        <?php endif; ?>
        
        <section class="admin-section">
            <h3>Загрузка файлов</h3>
            <form method="post" enctype="multipart/form-data">
                <div class="form-group">
                    <label for="file_type">Тип файла:</label>
                    <select name="file_type" id="file_type" required>
                        <option value="audio">Аудио (music/)</option>
                        <option value="image">Изображение (images/)</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="uploaded_file">Файл:</label>
                    <input type="file" name="uploaded_file" id="uploaded_file" required>
                </div>
                
                <button type="submit">Загрузить</button>
            </form>
        </section>
        
        <section class="admin-section">
            <h3>Управление пользователями</h3>
            <form method="post">
                <div class="form-group">
                    <label for="new_user">Логин:</label>
                    <input type="text" name="new_user" id="new_user" required>
                </div>
                
                <div class="form-group">
                    <label for="new_password">Пароль:</label>
                    <input type="password" name="new_password" id="new_password" required>
                </div>
                
                <button type="submit">Добавить пользователя</button>
            </form>
            
            <div class="user-list">
                <h4>Текущие пользователи:</h4>
                <?php
                if (file_exists('../users.json')) {
                    $users = json_decode(file_get_contents('../users.json'), true);
                    echo '<ul>';
                    foreach ($users as $user) {
                        echo '<li>' . htmlspecialchars($user['login']) . '</li>';
                    }
                    echo '</ul>';
                } else {
                    echo '<p>Нет зарегистрированных пользователей</p>';
                }
                ?>
            </div>
        </section>
        
        <section class="admin-section">
            <h3>Журнал посещений</h3>
            <pre><?php 
                if (file_exists('../visits.log')) {
                    echo htmlspecialchars(file_get_contents('../visits.log')); 
                } else {
                    echo 'Лог-файл не найден';
                }
            ?></pre>
        </section>
    </main>

    <script src="../assets/js/theme-toggle.js"></script>
</body>
</html>
<?php
// Обработка выхода
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: index.php');
    exit;
}
?>