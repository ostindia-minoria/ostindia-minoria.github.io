document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('mouseenter', () => link.classList.add('active'));
  link.addEventListener('mouseleave', () => link.classList.remove('active'));
});