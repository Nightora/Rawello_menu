document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("menu.json");
    const menuData = await response.json();
    renderMenu(menuData);
    initAccordions();
  } catch (error) {
    console.error("Ошибка загрузки меню:", error);
  }
});

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
      // Группировка напитков по объему
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
                ${sub.name.includes("Дополните") ? "dish-card--addon" : ""}">
              <div class="dish-card__info">
                <h4 class="dish-card__name">${item.name}</h4>
                ${
                  item.description
                    ? `<p class="dish-card__description">${item.description}</p>`
                    : ""
                }
              </div>
              <span class="dish-card__price">${item.price} ₽</span>
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
      grouped[item.name] = {
        name: item.name,
        prices: [],
      };
    }
    grouped[item.name].prices.push({
      price: item.price,
      volume: item.volume,
    });
  });
  return Object.values(grouped);
}

function initAccordions() {
  document.querySelectorAll(".menu-category__header").forEach((header) => {
    header.addEventListener("click", () => {
      const content = header.nextElementSibling;
      const isOpen = header.classList.toggle("active");

      content.style.display = isOpen ? "block" : "none";
      header.querySelector(".menu-category__toggle").textContent = isOpen
        ? "-"
        : "+";
    });
  });
}
