document.addEventListener("DOMContentLoaded", () => {
  const allProductCards = document.querySelectorAll(".produtos__cartao");
  const searchBox = document.getElementById("searchBox");
  const noResultsMessage = document.getElementById("noResultsMessage");
  const ordenarSelect = document.querySelector(".ordenador");

  let searchQuery = "";

  function normalizeText(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function filterProducts() {
    let visibleCount = 0;

    allProductCards.forEach(card => {
      const title = normalizeText(card.querySelector(".cartao__titulo")?.textContent.toLowerCase() || "");
      const searchMatch = title.includes(searchQuery);

      const show = searchMatch;

      card.style.display = show ? "block" : "none";
      if (show) visibleCount++;
    });

    if (noResultsMessage) {
      noResultsMessage.style.display = visibleCount === 0 ? "block" : "none";
    }
  }

  // Initial filtering
  filterProducts();

  // Search handlers
  const updateSearch = () => {
    searchQuery = normalizeText(searchBox.value.toLowerCase().trim());
    filterProducts();
  };

  if (searchBox) {
    searchBox.addEventListener("input", updateSearch);
    searchBox.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        updateSearch();
      }
    });
  }

  // Optional: Handle sorting dropdown
  if (ordenarSelect) {
    ordenarSelect.addEventListener("change", () => {
      const value = ordenarSelect.value;
      const container = document.querySelector(".produtos__cartoes");

      if (!container) return;

      const cards = Array.from(allProductCards);
      cards.sort((a, b) => {
        const aTitle = a.querySelector(".cartao__titulo")?.textContent.trim().toLowerCase() || "";
        const bTitle = b.querySelector(".cartao__titulo")?.textContent.trim().toLowerCase() || "";

        if (value === "asc") return aTitle.localeCompare(bTitle);
        if (value === "desc") return bTitle.localeCompare(aTitle);
        return 0;
      });

      // Re-render cards
      cards.forEach(card => container.appendChild(card));
    });
  }
});
