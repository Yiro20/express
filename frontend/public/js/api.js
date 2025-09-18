import { API_BASE_URL } from "../config.js";

// === NAVEGACIÓN DE PÁGINAS/FORMULARIOS ===
function showPage(id) {
  const pages = document.querySelectorAll(".page");
  pages.forEach((p) => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  // si volvemos a productos, recargamos
  if (id === "products-page") {
    loadProducts();
  }
}

// === CATEGORÍAS ===
async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/categorias`);
    const categories = await res.json();
    const nav = document.getElementById("categories-nav");
    nav.innerHTML = "";

    // botón TODOS
    const allBtn = document.createElement("button");
    allBtn.className =
      "px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200";
    allBtn.textContent = "Todos";
    allBtn.onclick = () => loadProducts(null, "Todos nuestros productos");
    nav.appendChild(allBtn);

    categories.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "px-3 py-1 bg-gray-200 rounded hover:bg-gray-300";
      btn.textContent = cat.nombre;
      // filtraremos en frontend por nombre de categoría
      btn.onclick = () => loadProducts(cat.nombre, `Categoría: ${cat.nombre}`);
      nav.appendChild(btn);
    });
  } catch (e) {
    console.error("Error cargando categorías", e);
  }
}

// === PRODUCTOS (LISTA + DETALLE) ===
async function loadProducts(
  categoryName = null,
  title = "Todos nuestros productos"
) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/productos`);
    let products = await res.json();

    // filtro por nombre de categoría (frontend) si se seleccionó alguna
    if (categoryName) {
      products = products.filter(
        (p) => (p.categoria || "").toLowerCase() === categoryName.toLowerCase()
      );
    }

    document.getElementById("products-title").textContent = title;

    const grid = document.getElementById("products-grid");
    grid.innerHTML = "";

    if (!products.length) {
      grid.innerHTML = `<div class="col-span-full text-gray-500">No hay productos para mostrar.</div>`;
      return;
    }

    products.forEach((prod) => {
      const card = document.createElement("div");
      card.className =
        "bg-white rounded-lg shadow p-4 hover:shadow-lg cursor-pointer transition";
      card.onclick = () => showProductDetail(prod.id);

      card.innerHTML = `
        <img src="${prod.imagen_principal || "https://placehold.co/300x200"}"
             alt="${prod.nombre}" class="product-image w-full mb-3">
        <h3 class="text-lg font-semibold text-gray-800">${prod.nombre}</h3>
        <p class="text-blue-600 font-bold">S/. ${Number(prod.precio).toFixed(
          2
        )}</p>
        <p class="text-sm text-gray-500">${
          prod.categoria || "Sin categoría"
        }</p>
      `;
      grid.appendChild(card);
    });
  } catch (e) {
    console.error("Error cargando productos", e);
  }
}

async function showProductDetail(productId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/productos/${productId}`);
    const product = await res.json();

    showPage("product-detail-page");

    document.getElementById("product-detail-name").textContent = product.nombre;
    document.getElementById("product-detail-category").textContent =
      product.categoria || "Sin categoría";
    document.getElementById("product-detail-price").textContent = `S/. ${Number(
      product.precio
    ).toFixed(2)}`;
    document.getElementById("product-detail-description").textContent =
      product.descripcion || "";

    // Imagen principal
    const mainImg = document.getElementById("main-product-image");
    mainImg.src = product.imagenes?.[0]?.url || "https://placehold.co/600x400";

    // Thumbnails
    const thumbs = document.getElementById("product-thumbnails");
    thumbs.innerHTML = "";

    (product.imagenes || []).forEach((img, idx) => {
      const t = document.createElement("img");
      t.src = img.url;
      t.className = "thumbnail";

      // Función para manejar el clic en el thumbnail
      t.onclick = () => {
        mainImg.src = img.url;

        const allThumbs = document.querySelectorAll(".thumbnail");
        allThumbs.forEach((thumb) =>
          thumb.classList.remove("active-thumbnail")
        );

        t.classList.add("active-thumbnail");
      };

      thumbs.appendChild(t);

      if (idx === 0) t.classList.add("active-thumbnail");
    });
  } catch (e) {
    console.error("Error cargando detalle", e);
  }
}

// === INICIO ===
document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
  loadProducts(); // al ingresar, mostrar todos los productos

  document
    .getElementById("back-to-products")
    .addEventListener("click", () => showPage("products-page"));
});
