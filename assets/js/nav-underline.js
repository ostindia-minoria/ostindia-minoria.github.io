document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav a');
    const navUl = document.querySelector('nav ul');
    
    // Создаем элемент подчеркивания с закругленными краями
    const underline = document.createElement('div');
    underline.classList.add('nav-underline');
    navUl.appendChild(underline);
    
    // Инициализация подчеркивания для активной ссылки
    function initUnderline() {
        const activeLink = document.querySelector('nav a.active');
        if (!activeLink) return;
        
        updateUnderline(activeLink);
    }
    
    // Обновление позиции и размера подчеркивания с анимацией
    function updateUnderline(element) {
        const { width, left } = element.getBoundingClientRect();
        const navLeft = navUl.getBoundingClientRect().left;
        
        // Плавное изменение позиции и размера
        underline.style.transition = 'all 0.3s ease';
        underline.style.width = `${width}px`;
        underline.style.left = `${left - navLeft}px`;
        underline.style.opacity = '1';
    }
    
    // Обработчики событий для ссылок
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            // Убираем переход при наведении для мгновенного появления
            underline.style.transition = 'none';
            updateUnderline(link);
        });
        
        link.addEventListener('mouseleave', () => {
            // Возвращаем плавный переход
            underline.style.transition = 'all 0.3s ease';
            
            const activeLink = document.querySelector('nav a.active');
            if (activeLink) {
                updateUnderline(activeLink);
            } else {
                underline.style.opacity = '0';
            }
        });
        
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            updateUnderline(link);
        });
    });
    
    // Инициализация при загрузке и ресайзе
    window.addEventListener('resize', initUnderline);
    initUnderline();
});