document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("productModal");
  const modalContent = modal.querySelector(".modal__content--product");
  const modalTitle = document.getElementById("productModalTitle");
  const modalPriceValue = document.getElementById("productModalPriceValue");
  const modalPriceIndication = document.getElementById("productModalPriceIndication");
  const modalDescription = document.getElementById("productModalDescription");
  const modalSpecs = document.getElementById("productModalSpecs");
  const specDimensions = document.getElementById("specDimensions");
  const specMaterial = document.getElementById("specMaterial");
  const specCode = document.getElementById("specCode");
  const specIncluded = document.getElementById("specIncluded");
  const specTime = document.getElementById("specTime");
  const specOther = document.getElementById("specOther");
  const specOptions = document.getElementById("specOptions");
  const modalMainImage = document.getElementById("productModalMainImage");
  const modalThumbs = document.getElementById("productModalThumbs");
  const productModalGalleryButtons = document.querySelector(".modal__gallery-buttons--product");
  const productModalGalleryButtonPrev = document.getElementById("productModalGalleryButtonPrev");
  const productModalGalleryButtonNext = document.getElementById("productModalGalleryButtonNext");
  const modalOverlay = modal.querySelector(".modal__overlay");
  const tabs = document.querySelectorAll(".modal__tab");

  let lastFocusedElement = null;
  let currentImages = [];
  let currentImageIndex = 0;

  // Show modal when a product card is clicked
  document.querySelectorAll(".produtos__cartao").forEach(card => {
    card.addEventListener("click", () => {
      lastFocusedElement = card;

      const title = card.dataset.productTitle;
      const price = card.dataset.productPrice;
      const indication = card.dataset.productIndicacao || "";
      const description = card.dataset.productDescription;
      const images = card.dataset.productImages.split(",");
      const dimensions = card.dataset.productDimensions || "-";
      const material = card.dataset.productMaterial || "-";
      const code = card.dataset.productCode || "-";
      const included = card.dataset.productIncluded || "-";
      const time = card.dataset.productTime || "-";
      const other = card.dataset.productOther || "-";
      const options = card.dataset.productOptions || "-";

      modalTitle.textContent = title;
      if (modalPriceValue) modalPriceValue.textContent = price;
      if (modalPriceIndication) modalPriceIndication.textContent = indication;
      modalDescription.innerHTML = description
        .split('\n')
        .map(line => `<p class="modal__description-text">${line}</p>`)
        .join('');
      if (specDimensions) specDimensions.textContent = dimensions;
      if (specMaterial) specMaterial.textContent = material;
      if (specCode) specCode.textContent = code;
      if (specIncluded) specIncluded.textContent = included;
      if (specTime) specTime.textContent = time;
      if (specOther) specOther.textContent = other;
      if (specOptions) specOptions.textContent = options;

      currentImages = images.map(img => img.trim());
      currentImageIndex = 0;
      updateMainImage(currentImageIndex);

      modalThumbs.innerHTML = "";
      currentImages.forEach((img, index) => {
        const thumb = document.createElement("img");
        thumb.src = img;
        thumb.loading = "lazy";
        thumb.alt = title;
        thumb.tabIndex = 0;
        if (index === currentImageIndex) {
          thumb.classList.add("active");
        }
        thumb.addEventListener("click", () => {
          updateMainImage(index);
        });
        modalThumbs.appendChild(thumb);
      });

      // Reset tabs
      tabs.forEach(t => t.classList.remove("active"));
      if (tabs.length) tabs[0].classList.add("active");
      modalDescription.classList.remove("hidden");
      if (modalSpecs) modalSpecs.classList.add("hidden");

      modal.classList.add("show");
      modal.setAttribute("aria-hidden", "false");

      // Prevent background scrolling
      document.body.style.overflow = "hidden";

      const focusable = getFocusableElements(modalContent);
      if (focusable.length) focusable[0].focus();

      // Don't show carousel thumbs if there's only one image on phones and tablets
      if (currentImages.length == 1 && window.innerWidth < 1025) {
        modalThumbs.style.display = "none";
      } else {
        modalThumbs.style.display = "";
      }

      // Don't show arrow navigation buttons if there's only one image
      if (currentImages.length == 1) {
        productModalGalleryButtonPrev.style.display = "none";
        productModalGalleryButtonNext.style.display = "none";
      } else {
        productModalGalleryButtonPrev.style.display = "";
        productModalGalleryButtonNext.style.display = "";
      }
    });
  });

  // Function to update main image with fade effect
  function updateMainImage(index) {
    if (index < 0 || index >= currentImages.length) return;
    currentImageIndex = index;
    const newSrc = currentImages[currentImageIndex];
    modalMainImage.classList.add("fade-out");
    setTimeout(() => {
      modalMainImage.src = newSrc;
      modalThumbs.querySelectorAll("img").forEach((thumb, i) => {
        thumb.classList.toggle("active", i === currentImageIndex);
      });
      modalMainImage.classList.remove("fade-out");
    }, 200);
  }

  // Swipe detection for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  modalMainImage.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  modalMainImage.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture();
  });

  function handleSwipeGesture() {
    const deltaX = touchEndX - touchStartX;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        if (currentImageIndex == 0) {
          updateMainImage(currentImages.length - 1); // Swipe right (prev)
        } else {
          updateMainImage(currentImageIndex - 1); // Swipe right (prev)
        }
      } else {
        if (currentImageIndex == currentImages.length - 1) {
          updateMainImage(0); // Swipe left (next)
        } else {
          updateMainImage(currentImageIndex + 1); // Swipe left (next)
        }
      }
    }
  }

  // Close modal
  function closeModal() {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = ""; // restore scroll
    if (lastFocusedElement) lastFocusedElement.focus();
    modalMainImage.classList.remove("zoomed");
    modalContent.classList.remove("zoomed");
    modalOverlay.classList.remove("zoomed");
  }

  // Click to close or remove zoom
  modal.addEventListener("click", e => {
    if (modalMainImage.classList.contains("zoomed")) {
      modalMainImage.classList.remove("zoomed");
      modalContent.classList.remove("zoomed");
      modalOverlay.classList.remove("zoomed");
    } else if (e.target.dataset.close !== undefined || e.target.classList.contains("modal__overlay")) {
      closeModal();
    }
  });

  // Escape or tab key handling
  document.addEventListener("keydown", e => {
    if (!modal.classList.contains("show")) return;

    if (e.key === "Escape") {
      e.preventDefault();
      if (modalMainImage.classList.contains("zoomed")) {
        modalMainImage.classList.remove("zoomed");
        modalContent.classList.remove("zoomed");
        modalOverlay.classList.remove("zoomed");
      } else {
        closeModal();
      }
    }

    if (e.key === "Tab") {
      const focusable = getFocusableElements(modalContent);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Zoom toggle
  modalMainImage.addEventListener("click", (e) => {
    modalMainImage.classList.toggle("zoomed");
    modalContent.classList.toggle("zoomed", modalMainImage.classList.contains("zoomed"));
    modalOverlay.classList.toggle("zoomed", modalMainImage.classList.contains("zoomed"));
    productModalGalleryButtons.classList.toggle("hidden", modalMainImage.classList.contains("zoomed"));
    e.stopPropagation();
  });

  productModalGalleryButtons.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    modalMainImage.classList.toggle("zoomed");
    modalContent.classList.toggle("zoomed", modalMainImage.classList.contains("zoomed"));
    modalOverlay.classList.toggle("zoomed", modalMainImage.classList.contains("zoomed"));
    e.stopPropagation();
  });

  // Arrow navigation carousel
  productModalGalleryButtonPrev.addEventListener("click", (e) => {
    if (currentImageIndex == 0) {
      updateMainImage(currentImages.length - 1);
    } else {
      updateMainImage(currentImageIndex - 1);
    }
  });

  productModalGalleryButtonNext.addEventListener("click", () => {
    if (currentImageIndex == currentImages.length - 1) {
      updateMainImage(0);
    } else {
      updateMainImage(currentImageIndex + 1);
    }
  });

  // Tabs switching
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      if (tab.dataset.tab === "description") {
        modalDescription.classList.remove("hidden");
        if (modalSpecs) modalSpecs.classList.add("hidden");
      } else {
        modalDescription.classList.add("hidden");
        if (modalSpecs) modalSpecs.classList.remove("hidden");
      }
    });
  });

  function getFocusableElements(container) {
    return Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    );
  }
});
