document.addEventListener("DOMContentLoaded", () => {
  const productCards = document.querySelectorAll(".produtos__cartao");
  const sortSelect = document.getElementById("sortProducts");

  window.onload = sortProducts(sortSelect.value);

  // Sorting function
  function sortProducts(sortOption) {
    const productCardsArray = Array.from(productCards);

    if (sortOption === "alfabetico") {
      productCardsArray.sort((a, b) =>
        a.dataset.productTitle.localeCompare(b.dataset.productTitle)
      );
    } else if (sortOption === "menor-preco") {
      productCardsArray.sort((a, b) =>
        parseFloat(a.dataset.productPrice.replace("R$", "").replace(",", ".")) -
        parseFloat(b.dataset.productPrice.replace("R$", "").replace(",", "."))
      );
    } else if (sortOption === "maior-preco") {
      productCardsArray.sort((a, b) =>
        parseFloat(b.dataset.productPrice.replace("R$", "").replace(",", ".")) -
        parseFloat(a.dataset.productPrice.replace("R$", "").replace(",", "."))
      );
    }

    const parent = document.querySelector(".produtos");
    productCardsArray.forEach(card => parent.appendChild(card));
  }

  // Sort select
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      sortProducts(sortSelect.value);
    });
  }
});
