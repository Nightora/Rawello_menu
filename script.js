document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("menu.json");
    const menuData = await response.json();
    renderMenu(menuData);
    initAccordions();
    initCart(); // Инициализация корзины
  } catch (error) {
    console.error("Ошибка загрузки меню:", error);
  }
});

// =======================
// Рендер меню
// =======================
function renderMenu(menuData) {
  const container = document.getElementById("menu-container");

  menuData.categories.forEach((category) => {
    const categoryHtml = `
      <div class="menu-category">
        <div class="menu-category__header" style="background-image: url('${
          category.image
        }')">
          <h3 class="menu-category__title">${category.name}</h3>
          <span class="menu-category__toggle">+</span>
        </div>
        <div class="menu-category__content">
          ${renderSubcategories(category.subcategories)}
        </div>
      </div>
    `;
    container.insertAdjacentHTML("beforeend", categoryHtml);
  });
}

function renderSubcategories(subcategories) {
  return subcategories
    .map((sub) => {
      if (sub.name === "Лимонады") {
        const grouped = groupByVolume(sub.items);
        return `
        <div class="subcategory">
          <h3 class="subcategory__title">${sub.name}</h3>
          <ul class="drink-list">
            ${grouped
              .map(
                (item) => `
              <li class="drink-card">
                <h4 class="drink-card__name">${item.name}</h4>
                <div class="drink-card__prices">
                  ${item.prices
                    .map(
                      (p) => `
                    <span class="drink-card__price">${p.price}₽ <small>${p.volume}</small></span>
                  `
                    )
                    .join("")}
                </div>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>
      `;
      }

      return `
      <div class="subcategory">
        <h3 class="subcategory__title">${sub.name}</h3>
        <ul class="dish-list ${
          sub.name.includes("Дополните") ? "dish-list--addons" : ""
        } 
            ${
              sub.items.every((i) => !i.description) ? "dish-list--compact" : ""
            }">
          ${sub.items
            .map(
              (item) => `
            <li class="dish-card ${
              !item.description ? "dish-card--compact" : ""
            } 
                ${
                  sub.name.includes("Дополните") ? "dish-card--addon" : ""
                }" data-name="${item.name}" data-price="${item.price}">
              <div class="dish-card__info">
                <h4 class="dish-card__name">${item.name}</h4>
                ${
                  item.description
                    ? `<p class="dish-card__description">${item.description}</p>`
                    : ""
                }
              </div>
              <span class="dish-card__price">${item.price} ₽</span>
              ${
                item.image
                  ? `<img class="dish-card__image" src="${item.image}" alt="${item.name}"/>`
                  : ""
              }
              <button class="dish-card__add">+</button>
            </li>
          `
            )
            .join("")}
        </ul>
      </div>
    `;
    })
    .join("");
}

function groupByVolume(items) {
  const grouped = {};
  items.forEach((item) => {
    if (!grouped[item.name]) {
      grouped[item.name] = { name: item.name, prices: [] };
    }
    grouped[item.name].prices.push({ price: item.price, volume: item.volume });
  });
  return Object.values(grouped);
}

// =======================
// Аккордеоны категорий
// =======================
function initAccordions() {
  document.querySelectorAll(".menu-category__header").forEach((header) => {
    header.addEventListener("click", () => {
      if (header.classList.contains("locked")) return;
      header.classList.add("locked");
      setTimeout(() => {
        header.classList.remove("locked");
      }, 300);
      const content = header.nextElementSibling;
      const isOpen = header.classList.toggle("active");
      content.style.display = isOpen ? "block" : "none";
      header.querySelector(".menu-category__toggle").textContent = isOpen
        ? "-"
        : "+";
    });
  });
}

// =======================
// Корзина
// =======================
function initCart() {
  let cartItems = [];
  const cart = document.createElement("div");
  cart.className = "cart";
  cart.innerHTML = `<h3>Корзина</h3><ul class="cart-items"></ul><p class="cart-total">Итого: 0 ₽</p>`;
  document.body.appendChild(cart);

  const cartToggle = document.createElement("div");
  cartToggle.className = "cart-toggle";
  cartToggle.textContent = "🛒";
  document.body.appendChild(cartToggle);

  cartToggle.addEventListener("click", () => {
    cart.classList.toggle("open");
  });

  // Добавление блюд
  document.querySelectorAll(".dish-card__add").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const li = e.target.closest(".dish-card");
      const name = li.dataset.name;
      const price = parseFloat(li.dataset.price);

      cartItems.push({ name, price });
      renderCart();
    });
  });

  function renderCart() {
    const ul = cart.querySelector(".cart-items");
    ul.innerHTML = "";
    let total = 0;
    cartItems.forEach((item, index) => {
      total += item.price;
      ul.insertAdjacentHTML(
        "beforeend",
        `<li>${item.name} — ${item.price} ₽ <button data-index="${index}">✕</button></li>`
      );
    });
    cart.querySelector(".cart-total").textContent = `Итого: ${total} ₽`;

    // Кнопка удаления
    ul.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.target.dataset.index);
        cartItems.splice(idx, 1);
        renderCart();
      });
    });
  }
}

// =======================
// Просмотр фото (модалка)
// =======================
function initImageModal() {
  const modal = document.createElement("div");
  modal.className = "image-modal";
  modal.innerHTML = `<img src="" alt="Фото блюда">`;
  document.body.appendChild(modal);

  const modalImg = modal.querySelector("img");

  // Открытие по клику на картинку блюда
  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("dish-card__image")) {
      modalImg.src = e.target.src;
      modal.classList.add("open");
    }
  });

  // Закрытие по клику на фон или картинку
  modal.addEventListener("click", () => {
    modal.classList.remove("open");
  });
}

// Вызов после загрузки
document.addEventListener("DOMContentLoaded", () => {
  initImageModal();
});
