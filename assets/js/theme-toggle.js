document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');
    
    // Применение сохраненной темы
    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.textContent = "🌞";
    } else {
        themeToggle.textContent = "🌙";
    }
    
    // Переключение темы
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        
        if (document.body.classList.contains('light-theme')) {
            localStorage.setItem('theme', 'light');
            themeToggle.textContent = "🌞";
        } else {
            localStorage.setItem('theme', 'dark');
            themeToggle.textContent = "🌙";
        }
    });
});