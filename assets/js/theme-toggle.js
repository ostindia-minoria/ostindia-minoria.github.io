
document.getElementById('theme-toggle').addEventListener('click', () => {
  const body = document.body;
  body.classList.toggle('dark');
  body.classList.toggle('light');
  localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
});

window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('theme');
  if (saved) {
    document.body.classList.remove('dark', 'light');
    document.body.classList.add(saved);
  }
});
