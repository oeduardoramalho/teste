document.addEventListener("DOMContentLoaded", () => {
  const searchBox = document.getElementById("searchBox");
  const searchButton = document.getElementById("searchButton");
  const clearSearch = document.getElementById("clearSearch");
  const productCards = document.querySelectorAll(".produtos__cartao");
  const categoryButtons = document.querySelectorAll(".categorias__botao");
  const subcategoriesContainer = document.querySelector(".categorias__subcategorias");
  const subcategoryGroups = document.querySelectorAll(".subcategorias__grupo");
  const typeButtons = document.querySelectorAll(".tipos__botao");
  const breadcrum = document.querySelector(".breadcrum");

  let activeCategory = "todos";
  let activeSubcategories = new Set(); // support multiple subcategories
  let activeType = "todos";
  let activeCategoryButton = null;
  let searchQuery = "";

  // Utility: remove accents/diacritics
  function normalizeText(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // Collect categories and subcategories from products
  const availableCategories = new Set();
  const availableSubcategories = new Set();

  productCards.forEach(card => {
    // Categories
    card.dataset.productCategories
      .split(",")
      .map(c => c.trim())
      .forEach(cat => availableCategories.add(cat));

    // Subcategories
    card.dataset.productSubcategories
      .split(",")
      .map(s => s.trim())
      .forEach(sub => availableSubcategories.add(sub));
  });

  // Hide unused category buttons
  categoryButtons.forEach(btn => {
    const value = btn.dataset.category;
    if (value !== "todos" && !availableCategories.has(value)) {
      btn.classList.add("hidden");
    }
  });

  // Hide unused subcategory buttons + groups
  subcategoryGroups.forEach(group => {
    let hasVisibleSub = false;
    group.querySelectorAll(".subcategorias__botao").forEach(subBtn => {
      const parentCat = group.dataset.parent;
      const value = subBtn.dataset.subcategory;
      if (value !== "todos") {
        const formatted = `${parentCat}:${value}`;
        if (!availableSubcategories.has(formatted)) {
          subBtn.classList.add("hidden");
        } else {
          hasVisibleSub = true;
        }
      }
    });
    if (!hasVisibleSub) {
      group.classList.add("hidden");
    }
  });

  // Attach subcategory button listeners once
  document.querySelectorAll(".subcategorias__botao").forEach(subBtn => {
    subBtn.addEventListener("click", () => {
      const group = subBtn.closest(".subcategorias__grupo");
      const subBtns = group.querySelectorAll(".subcategorias__botao:not(.hidden)");
      const realSubs = [...subBtns].filter(b => b.dataset.subcategory !== "todos");
      const isSingleSubcategory = realSubs.length === 1;

      const subVal = `${activeCategory}:${subBtn.dataset.subcategory}`;
      const breadcrumSubcategories = breadcrum.querySelectorAll(".breadcrum__crum-subcategoria");
      const breadcrumSeparators = breadcrum.querySelectorAll(".breadcrum__separator");

      if (subBtn.dataset.subcategory === "todos") {
        group.querySelectorAll(".subcategorias__botao").forEach(b => b.classList.remove("active"));
        activeSubcategories.clear();
        breadcrumSubcategories.forEach(e => e.remove());
        breadcrumSeparators.forEach(e => e.remove());
        filterProducts();
        return;
      }

      if (isSingleSubcategory) {
        subBtn.classList.add("active");
        activeSubcategories.clear();
        activeSubcategories.add(subVal);

        breadcrumSubcategories.forEach(e => e.remove());
        breadcrumSeparators.forEach(e => e.remove());

        const separator = document.createElement("p");
        separator.classList.add("breadcrum__separator");
        separator.textContent = ">";
        breadcrum.appendChild(separator);

        const subClone = subBtn.cloneNode(true);
        subClone.classList.add("breadcrum__crum-subcategoria");
        breadcrum.appendChild(subClone);

        filterProducts();
        return;
      }

      if (subBtn.classList.contains("active")) {
        subBtn.classList.remove("active");
        activeSubcategories.delete(subVal);
      } else {
        subBtn.classList.add("active");
        activeSubcategories.add(subVal);
      }

      // Clear existing subcategories and separators
      breadcrum.querySelectorAll(".breadcrum__crum-subcategoria").forEach(e => e.remove());
      breadcrum.querySelectorAll(".breadcrum__separator").forEach(e => {
        if (e.textContent === ">" || e.textContent === "+") e.remove();
      });

      const subsArray = [...activeSubcategories];
      if (subsArray.length > 0) {
        const separator = document.createElement("p");
        separator.classList.add("breadcrum__separator");
        separator.textContent = ">";
        breadcrum.appendChild(separator);

        subsArray.forEach((val, idx) => {
          if (idx > 0) {
            const plus = document.createElement("p");
            plus.classList.add("breadcrum__separator");
            plus.textContent = "+";
            breadcrum.appendChild(plus);
          }

          const [, subValue] = val.split(":");
          const btn = [...subBtns].find(b => b.dataset.subcategory === subValue);
          if (btn) {
            const clone = btn.cloneNode(true);
            clone.classList.add("breadcrum__crum-subcategoria");
            breadcrum.appendChild(clone);
          }
        });
      }

      filterProducts();
    });
  });

  function filterProducts() {
    productCards.forEach(card => {
      const categories = card.dataset.productCategories.split(",").map(c => c.trim());
      const subcategories = card.dataset.productSubcategories.split(",").map(s => s.trim());
      const types = card.dataset.productTypes.split(",").map(t => t.trim());
      const title = normalizeText((card.dataset.productTitle || "").toLowerCase());
      const description = normalizeText((card.dataset.productDescription || "").toLowerCase());

      let visible = true;

      if (activeCategory !== "todos" && !categories.includes(activeCategory)) {
        visible = false;
      }

      // Multiple subcategories allowed (match any)
      if (activeSubcategories.size > 0) {
        const hasMatch = [...activeSubcategories].some(sub => subcategories.includes(sub));
        if (!hasMatch) visible = false;
      }

      if (activeType !== "todos" && !types.includes(activeType)) {
        visible = false;
      }

      // Search filter
      if (searchQuery) {
        const matchesSearch = title.includes(searchQuery) || description.includes(searchQuery);
        if (!matchesSearch) visible = false;
      }

      card.style.display = visible ? "flex" : "none";
    });

    // Show/hide no results message + hide .ordenador
    const visibleCards = [...productCards].filter(card => card.style.display !== "none");
    const noResultsMessage = document.getElementById("noResultsMessage");
    const ordenadorSection = document.querySelector(".ordenador");

    if (visibleCards.length === 0) {
      if (noResultsMessage) noResultsMessage.style.display = "block";
      if (ordenadorSection) ordenadorSection.style.display = "none";
    } else {
      if (noResultsMessage) noResultsMessage.style.display = "none";
      if (ordenadorSection) ordenadorSection.style.display = "";
    }
  }

  // Category buttons
  categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const isTodos = btn.dataset.category === "todos";

      // If clicking the same active category → do nothing
      if (activeCategoryButton === btn) {
        return;
      }

      // Reset active state on categories
      categoryButtons.forEach(b => b.classList.remove("active"));

      // New category selection
      activeCategory = btn.dataset.category;
      activeSubcategories.clear(); // reset subcategories
      activeCategoryButton = btn;

      // Mark clicked one as active (including "todos")
      btn.classList.add("active");

      // Clone categories into breadcrum
      const breadcrumCategory = breadcrum.querySelectorAll(".breadcrum__crum-categoria");
      const breadcrumSubcategories = breadcrum.querySelectorAll(".breadcrum__crum-subcategoria");
      const breadcrumSeparators = breadcrum.querySelectorAll(".breadcrum__separator");

      if (btn.dataset.category != "todos") {
        breadcrumCategory.forEach(e => e.remove());
        breadcrumSubcategories.forEach(e => e.remove());
        breadcrumSeparators.forEach(e => e.remove());
        breadcrum.style.display = "flex";
        const categoryClone = btn.cloneNode(true);
        categoryClone.classList.add("breadcrum__crum-categoria");
        breadcrum.appendChild(categoryClone);
      }

      subcategoryGroups.forEach(group => group.classList.add("hidden"));

      if (isTodos) {
        subcategoriesContainer.classList.add("hidden");
        breadcrumCategory.forEach(e => e.remove());
        breadcrumSubcategories.forEach(e => e.remove());
        breadcrumSeparators.forEach(e => e.remove());
        breadcrum.style.display = "none";
      } else {
        subcategoriesContainer.classList.remove("hidden");
        const group = document.querySelector(`.subcategorias__grupo[data-parent="${activeCategory}"]`);
        if (group) {
          group.classList.remove("hidden");

          // Reset subcategory active state
          group.querySelectorAll(".subcategorias__botao").forEach(subBtn => subBtn.classList.remove("active"));

          const subBtns = group.querySelectorAll(".subcategorias__botao:not(.hidden)");
          const realSubs = [...subBtns].filter(b => b.dataset.subcategory !== "todos");
          const isSingleSubcategory = realSubs.length === 1;

          const newSeparator = document.createElement("p");
          newSeparator.classList.add("breadcrum__separator");
          newSeparator.textContent = ">";

          if (isSingleSubcategory) {
            realSubs[0].classList.add("active");
            activeSubcategories.add(`${activeCategory}:${realSubs[0].dataset.subcategory}`);
            breadcrum.appendChild(newSeparator);

            const subClone = realSubs[0].cloneNode(true);
            subClone.classList.add("breadcrum__crum-subcategoria");
            breadcrum.appendChild(subClone);
          }
        }
      }

      filterProducts();
    });
  });

  // Type buttons
  typeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      activeType = btn.dataset.type;
      filterProducts();
    });
  });

  // Search button + Enter key
  if (searchButton && searchBox) {
    const runSearch = () => {
      searchQuery = normalizeText(searchBox.value.toLowerCase().trim());
      filterProducts();
    };

    searchButton.addEventListener("click", runSearch);
    searchBox.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        runSearch();
      }
    });

    // Show/hide clear button on typing
    searchBox.addEventListener("input", () => {
      if (clearSearch) {
        clearSearch.style.display = searchBox.value.trim() ? "block" : "none";
      }
    });

    // Clear search input and re-run search
    if (clearSearch) {
      clearSearch.addEventListener("click", () => {
        searchBox.value = "";
        clearSearch.style.display = "none";
        runSearch();
      });
    }
  }

  // Default: mark "Todos" active
  const defaultTodos = document.querySelector('.categorias__botao[data-category="todos"]');
  if (defaultTodos) {
    defaultTodos.classList.add("active");
    activeCategoryButton = defaultTodos;
  }

  filterProducts();

  // Hover searchBox
  searchBox.addEventListener('mouseenter', () => {
    if (document.activeElement !== searchBox && document.activeElement !== searchButton) {
      searchBox.style.borderColor = 'var(--cinza-claro-7)';
      searchBox.style.boxShadow = '0 0 5px rgba(0,0,0,0.05)';
      searchButton.style.borderColor = 'var(--cinza-claro-7)';
      searchButton.style.boxShadow = '0 0 5px rgba(0,0,0,0.05)';
    }
  });

  searchBox.addEventListener('mouseleave', () => {
    if (document.activeElement !== searchBox && document.activeElement !== searchButton) {
      searchBox.style.borderColor = '';
      searchBox.style.boxShadow = '';
      searchButton.style.borderColor = '';
      searchButton.style.boxShadow = '';
    }
  });

  // Hover searchButton
  searchButton.addEventListener('mouseenter', () => {
    if (document.activeElement !== searchBox && document.activeElement !== searchButton) {
      searchBox.style.borderColor = 'var(--cinza-claro-7)';
      searchBox.style.boxShadow = '0 0 5px rgba(0,0,0,0.05)';
      searchButton.style.borderColor = 'var(--cinza-claro-7)';
      searchButton.style.boxShadow = '0 0 5px rgba(0,0,0,0.05)';
    }
  });

  searchButton.addEventListener('mouseleave', () => {
    if (document.activeElement !== searchBox && document.activeElement !== searchButton) {
      searchButton.style.borderColor = '';
      searchButton.style.boxShadow = '';
      searchBox.style.borderColor = '';
      searchBox.style.boxShadow = '';
    }
  });

  // searchBox and search Button focus
  [searchBox, searchButton].forEach(el => {
    el.addEventListener('focus', () => {
      searchBox.style.borderColor = 'var(--preto-claro-3)';
      searchBox.style.boxShadow = '0 0 5px rgba(0,0,0,0.15)';
      searchButton.style.borderColor = 'var(--preto-claro-3)';
      searchButton.style.boxShadow = '0 0 5px rgba(0,0,0,0.15)';
    });

    el.addEventListener('blur', () => {
      searchButton.style.borderColor = '';
      searchButton.style.boxShadow = '';
      searchBox.style.borderColor = '';
      searchBox.style.boxShadow = '';
    });
  });

  // Breadcrum click behavior
  breadcrum.addEventListener("click", e => {
    const target = e.target;

    if (target.classList.contains("breadcrum__crum-categoria")) {
      const catValue = target.dataset.category;
      const btn = [...categoryButtons].find(b => b.dataset.category === catValue);
      if (!btn) return;

      const group = document.querySelector(`.subcategorias__grupo[data-parent="${catValue}"]`);
      const subBtns = group
        ? [...group.querySelectorAll(".subcategorias__botao:not(.hidden)")].filter(b => b.dataset.subcategory !== "todos")
        : [];

      const isSingleSub = subBtns.length === 1;
      if (isSingleSub) return;

      btn.click();

      activeSubcategories.clear();
      if (group) {
        group.querySelectorAll(".subcategorias__botao").forEach(b => b.classList.remove("active"));
      }

      breadcrum.querySelectorAll(".breadcrum__crum-subcategoria").forEach(e => e.remove());
      breadcrum.querySelectorAll(".breadcrum__separator").forEach(e => {
        if (e.textContent === ">" || e.textContent === "+") e.remove();
      });

      filterProducts();
    }

    if (target.classList.contains("breadcrum__crum-subcategoria")) {
      const catValue = activeCategory;
      const group = document.querySelector(`.subcategorias__grupo[data-parent="${catValue}"]`);
      const subBtns = [...group.querySelectorAll(".subcategorias__botao:not(.hidden)")];
      const realSubs = subBtns.filter(b => b.dataset.subcategory !== "todos");
      if (realSubs.length === 1) return;

      const subVal = `${catValue}:${target.dataset.subcategory}`;
      activeSubcategories.clear();
      activeSubcategories.add(subVal);

      group.querySelectorAll(".subcategorias__botao").forEach(b => {
        b.classList.toggle("active", `${catValue}:${b.dataset.subcategory}` === subVal);
      });

      breadcrum.querySelectorAll(".breadcrum__crum-subcategoria").forEach(e => e.remove());
      breadcrum.querySelectorAll(".breadcrum__separator").forEach(e => {
        if (e.textContent === ">" || e.textContent === "+") e.remove();
      });

      const separator = document.createElement("p");
      separator.classList.add("breadcrum__separator");
      separator.textContent = ">";
      breadcrum.appendChild(separator);

      const subClone = target.cloneNode(true);
      breadcrum.appendChild(subClone);

      filterProducts();
    }

    if (target.textContent === "Catálogo") {
      activeCategory = "todos";
      activeSubcategories.clear();

      categoryButtons.forEach(b => b.classList.remove("active"));
      const todosBtn = document.querySelector('.categorias__botao[data-category="todos"]');
      if (todosBtn) {
        todosBtn.classList.add("active");
        activeCategoryButton = todosBtn;
      }

      subcategoriesContainer.classList.add("hidden");
      subcategoryGroups.forEach(g => g.classList.add("hidden"));

      breadcrum.querySelectorAll(".breadcrum__crum-categoria, .breadcrum__crum-subcategoria, .breadcrum__separator").forEach(e => e.remove());
      breadcrum.style.display = "none";

      filterProducts();
    }
  });
});
