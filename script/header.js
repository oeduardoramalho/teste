const toggleBtn = document.querySelector('.cabecalho__menu-burger');
const nav = document.querySelector('.cabecalho__nav');

toggleBtn.addEventListener('click', () => {
  nav.classList.toggle('active');
  
  if (nav.classList.contains('active')) {
    toggleBtn.innerHTML = `&times;`;
    toggleBtn.style.fontSize = "2.15rem";
  } else {
    toggleBtn.innerHTML = `☰`;
    toggleBtn.style.fontSize = "";
  }
});
