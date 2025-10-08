document.addEventListener("DOMContentLoaded", () => {
  const toggles = document.querySelectorAll(".rodape__toggle");
  
  const currentYear = new Date().getFullYear();
  document.querySelector(".rodape__copyright-year").textContent = currentYear;

  toggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      
      toggles.forEach(t => {
        t.setAttribute("aria-expanded", "false");
        const content = t.nextElementSibling;
        const toggleIcon = t.querySelector(".rodape__toggle-icon");
        content.classList.remove("expanded");
        toggleIcon.style.transform = "rotate(90deg)";
      });
      
      if (!expanded) {
        toggle.setAttribute("aria-expanded", "true");
        const content = toggle.nextElementSibling;
        const toggleIcon = toggle.querySelector(".rodape__toggle-icon");
        content.classList.add("expanded");
        toggleIcon.style.transform = "rotate(-90deg)";
      }
    });
  });

  const headerNavLinks = document.querySelectorAll(".cabecalho__nav__link");
  const footerNav = document.querySelector(".rodape__container-nav");

  headerNavLinks.forEach(link => {
    const clone = link.cloneNode(true);
    clone.classList.remove("cabecalho__nav__link");
    clone.classList.add("rodape__link");
    footerNav.appendChild(clone);
  });
});
