import { API_BASE_URL, getAuthHeaders } from "../config.js";

let currentUser = null;
let categories = [];
let products = [];
let categoryToDelete = null;

// Verificar autenticación al cargar
document.addEventListener("DOMContentLoaded", async () => {
  await checkAuth();
  await loadDashboardData();
  await loadCategories();
  await loadProducts();
  setupEventListeners();
});

// Toast System
function showToast(message, type = "info") {
  const container =
    document.getElementById("toast-container") || createToastContainer();

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="close" onclick="this.parentElement.remove()">&times;</button>
  `;

  container.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = "slideOut 0.3s ease-out";
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}

function createToastContainer() {
  const container = document.createElement("div");
  container.id = "toast-container";
  container.className = "toast-container";
  document.body.appendChild(container);
  return container;
}

// Gestión de imágenes en modal separado
async function openImageManagementModal(productId) {
  showLoading();
  try {
    const response = await fetch(`${API_BASE_URL}/api/productos/${productId}`);
    if (response.ok) {
      const product = await response.json();

      // Inicializar gestión de imágenes
      initImageManagement(product.id, product.imagenes || []);

      // Mostrar modal
      document
        .getElementById("imageManagementModal")
        .classList.remove("hidden");
      document.getElementById("imageManagementModal").classList.add("flex");
    } else {
      showToast("Error al cargar imágenes del producto", "error");
    }
  } catch (error) {
    console.error("Error loading product images:", error);
    showToast("Error de conexión al cargar imágenes", "error");
  } finally {
    hideLoading();
  }
}

function closeImageManagementModal() {
  document.getElementById("imageManagementModal").classList.add("hidden");
  document.getElementById("imageManagementModal").classList.remove("flex");
}

function initImageManagement(productId, images) {
  const container = document.getElementById("product-images-container");
  container.innerHTML = "";

  images.forEach((image, index) => {
    const imageElement = `
      <div class="flex items-center justify-between p-3 bg-gray-100 rounded-lg mb-2 image-item">
        <div class="flex items-center">
          <img src="${image.url}" alt="Imagen ${index + 1}" 
               class="w-12 h-12 object-cover rounded mr-3">
          <span class="text-sm text-gray-600 truncate max-w-xs">${
            image.url
          }</span>
        </div>
        <button 
          onclick="deleteProductImage(${image.id}, ${productId})" 
          class="text-red-600 hover:text-red-800 ml-3"
          ${
            images.length <= 1
              ? 'disabled title="Debe tener al menos una imagen"'
              : ""
          }
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    container.innerHTML += imageElement;
  });

  // Configurar formulario de agregar imagen
  const form = document.getElementById("add-image-form");
  form.onsubmit = async (e) => {
    e.preventDefault();
    await addProductImage(productId);
  };

  // Actualizar estado del botón de agregar
  const addButton = document.getElementById("add-image-btn");
  if (addButton) {
    addButton.disabled = images.length >= 3;
    if (images.length >= 3) {
      addButton.title = "Máximo 3 imágenes permitidas";
    } else {
      addButton.title = "";
    }
  }
}

async function addProductImage(productId) {
  const urlInput = document.getElementById("new-image-url");
  const url = urlInput.value.trim();

  if (!url) {
    showToast("Por favor ingresa una URL válida", "error");
    return;
  }

  showLoading();
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/productos/${productId}/images`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ url }),
      }
    );

    if (response.ok) {
      // Recargar la gestión de imágenes
      await openImageManagementModal(productId);
      urlInput.value = "";
      showToast("Imagen agregada exitosamente", "success");

      // Recargar productos para actualizar la vista principal
      await loadProducts();
    } else {
      const error = await response.json();
      showToast(error.error || "Error al agregar imagen", "error");
    }
  } catch (error) {
    console.error("Error adding image:", error);
    showToast("Error de conexión al agregar imagen", "error");
  } finally {
    hideLoading();
  }
}

async function deleteProductImage(imageId, productId) {
  if (!confirm("¿Estás seguro de que quieres eliminar esta imagen?")) return;

  showLoading();
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/productos/images/${imageId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    if (response.ok) {
      // Recargar la gestión de imágenes
      await openImageManagementModal(productId);
      showToast("Imagen eliminada exitosamente", "success");

      // Recargar productos para actualizar la vista principal
      await loadProducts();
    } else {
      const error = await response.json();
      showToast(error.error || "Error al eliminar imagen", "error");
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    showToast("Error de conexión al eliminar imagen", "error");
  } finally {
    hideLoading();
  }
}

async function checkAuth() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user || user.rol !== "admin") {
    window.location.href = "/login";
    return;
  }

  currentUser = user;
  document.getElementById("userName").textContent = `Hola, ${user.nombre}`;
}

async function loadDashboardData() {
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/productos`),
      fetch(`${API_BASE_URL}/api/categorias`),
    ]);

    if (productsRes.ok) {
      const productsData = await productsRes.json();
      document.getElementById("totalProducts").textContent =
        productsData.length;
    }

    if (categoriesRes.ok) {
      const categoriesData = await categoriesRes.json();
      document.getElementById("totalCategories").textContent =
        categoriesData.length;
    }
  } catch (error) {
    console.error("Error loading dashboard:", error);
    showToast("Error al cargar el dashboard", "error");
  }
}

async function loadCategories() {
  showLoading();
  try {
    const response = await fetch(`${API_BASE_URL}/api/categorias`);
    if (response.ok) {
      categories = await response.json();
      renderCategoriesTable();
    } else {
      showToast("Error al cargar categorías", "error");
    }
  } catch (error) {
    console.error("Error loading categories:", error);
    showToast("Error de conexión al cargar categorías", "error");
  } finally {
    hideLoading();
  }
}

async function loadProducts() {
  showLoading();
  try {
    const response = await fetch(`${API_BASE_URL}/api/productos`);
    if (response.ok) {
      products = await response.json();
      renderProductsTable();
    } else {
      showToast("Error al cargar productos", "error");
    }
  } catch (error) {
    console.error("Error loading products:", error);
    showToast("Error de conexión al cargar productos", "error");
  } finally {
    hideLoading();
  }
}

function renderCategoriesTable() {
  const tbody = document.getElementById("categories-table-body");
  tbody.innerHTML = "";

  if (categories.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="px-6 py-4 text-center text-gray-500">
          No hay categorías registradas
        </td>
      </tr>
    `;
    return;
  }

  categories.forEach((category) => {
    const row = `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap">${category.id}</td>
        <td class="px-6 py-4 whitespace-nowrap">${category.nombre}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <button onclick="editCategory(${category.id})" class="text-blue-600 hover:text-blue-800 mr-3">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button onclick="deleteCategory(${category.id})" class="text-red-600 hover:text-red-800">
            <i class="fas fa-trash"></i> Eliminar
          </button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

function renderProductsTable() {
  const tbody = document.getElementById("products-table-body");
  tbody.innerHTML = "";

  if (products.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-4 text-center text-gray-500">
          No hay productos registrados
        </td>
      </tr>
    `;
    return;
  }

  products.forEach((product) => {
    const row = `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap">
          <img src="${
            product.imagen_principal || "https://placehold.co/50x50"
          }" 
               alt="${product.nombre}" class="w-10 h-10 object-cover rounded">
        </td>
        <td class="px-6 py-4 whitespace-nowrap">${product.nombre}</td>
        <td class="px-6 py-4 whitespace-nowrap">S/. ${Number(
          product.precio
        ).toFixed(2)}</td>
        <td class="px-6 py-4 whitespace-nowrap">${
          product.categoria || "Sin categoría"
        }</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <button onclick="openProductDetailModal(${
            product.id
          })" class="text-green-600 hover:text-green-800 mr-2">
            <i class="fas fa-eye"></i> Ver
          </button>
          <button onclick="openImageManagementModal(${
            product.id
          })" class="text-purple-600 hover:text-purple-800 mr-2">
            <i class="fas fa-images"></i> Imágenes
          </button>
          <button onclick="editProductBasic(${
            product.id
          })" class="text-blue-600 hover:text-blue-800 mr-2">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button onclick="deleteProduct(${
            product.id
          })" class="text-red-600 hover:text-red-800">
            <i class="fas fa-trash"></i> Eliminar
          </button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// Category CRUD
async function openCategoryModal(category = null) {
  const modal = document.getElementById("categoryModal");
  const title = document.getElementById("categoryModalTitle");
  const form = document.getElementById("categoryForm");

  if (category) {
    title.textContent = "Editar Categoría";
    document.getElementById("categoryId").value = category.id;
    document.getElementById("categoryName").value = category.nombre;
  } else {
    title.textContent = "Nueva Categoría";
    document.getElementById("categoryId").value = "";
    form.reset();
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeCategoryModal() {
  const modal = document.getElementById("categoryModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

async function editCategory(id) {
  const category = categories.find((c) => c.id === id);
  if (category) {
    await openCategoryModal(category);
  }
}

async function deleteCategory(id) {
  const category = categories.find((c) => c.id === id);
  if (!category) return;

  categoryToDelete = category;

  const modal = document.getElementById("deleteConfirmModal");
  const message = document.getElementById("deleteConfirmMessage");

  message.textContent = `¿Estás seguro de que quieres eliminar la categoría "${category.nombre}"? Esta acción no se puede deshacer.`;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeDeleteConfirmModal() {
  const modal = document.getElementById("deleteConfirmModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  categoryToDelete = null;
}

async function confirmDeleteCategory() {
  if (!categoryToDelete) return;

  showLoading();
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/categorias/${categoryToDelete.id}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    if (response.ok) {
      closeDeleteConfirmModal();
      await loadCategories();
      await loadDashboardData();
      showToast("Categoría eliminada exitosamente", "success");
    } else {
      const error = await response.json();
      showToast(error.error || "Error al eliminar la categoría", "error");
    }
  } catch (error) {
    console.error("Error deleting category:", error);
    showToast("Error de conexión al eliminar categoría", "error");
  } finally {
    hideLoading();
    categoryToDelete = null;
  }
}

async function deleteProduct(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;

  if (
    confirm(
      `¿Estás seguro de que quieres eliminar el producto "${product.nombre}"?`
    )
  ) {
    showLoading();
    try {
      const response = await fetch(`${API_BASE_URL}/api/productos/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        await loadProducts();
        await loadDashboardData();
        showToast("Producto eliminado exitosamente", "success");
      } else {
        const error = await response.json();
        showToast(error.error || "Error al eliminar el producto", "error");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      showToast("Error de conexión al eliminar producto", "error");
    } finally {
      hideLoading();
    }
  }
}

// Product CRUD
async function openProductModal(product = null) {
  await loadCategoriesForSelect();

  const modal = document.getElementById("productModal");
  const title = document.getElementById("productModalTitle");
  const form = document.getElementById("productForm");

  if (product) {
    title.textContent = "Editar Producto";
    document.getElementById("productId").value = product.id;
    document.getElementById("productName").value = product.nombre;
    document.getElementById("productPrice").value = product.precio;
    document.getElementById("productDescription").value =
      product.descripcion || "";
    document.getElementById("productCategory").value = product.categoria_id;
    document.getElementById("productImages").value = product.imagenes
      ? product.imagenes.map((img) => img.url).join(", ")
      : "";
  } else {
    title.textContent = "Nuevo Producto";
    document.getElementById("productId").value = "";
    form.reset();
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

// Modal para ver detalles del producto
async function openProductDetailModal(id) {
  showLoading();
  try {
    const response = await fetch(`${API_BASE_URL}/api/productos/${id}`);
    if (response.ok) {
      const product = await response.json();

      // Llenar el modal de detalles
      document.getElementById("product-detail-name").textContent =
        product.nombre;
      document.getElementById(
        "product-detail-price"
      ).textContent = `S/. ${Number(product.precio).toFixed(2)}`;
      document.getElementById("product-detail-category").textContent =
        product.categoria;
      document.getElementById("product-detail-description").textContent =
        product.descripcion || "Sin descripción";

      // Mostrar imágenes
      const imagesContainer = document.getElementById("product-detail-images");
      imagesContainer.innerHTML = "";

      if (product.imagenes && product.imagenes.length > 0) {
        product.imagenes.forEach((img, index) => {
          const imgElement = `
            <div class="flex items-center p-2 bg-gray-100 rounded-lg mb-2">
              <img src="${img.url}" alt="Imagen ${index + 1}" 
                   class="w-16 h-16 object-cover rounded mr-3">
              <span class="text-sm text-gray-600 truncate">${img.url}</span>
            </div>
          `;
          imagesContainer.innerHTML += imgElement;
        });
      } else {
        imagesContainer.innerHTML =
          '<p class="text-gray-500">No hay imágenes</p>';
      }

      // Mostrar modal
      document.getElementById("productDetailModal").classList.remove("hidden");
      document.getElementById("productDetailModal").classList.add("flex");
    } else {
      showToast("Error al cargar detalles del producto", "error");
    }
  } catch (error) {
    console.error("Error loading product details:", error);
    showToast("Error de conexión al cargar detalles", "error");
  } finally {
    hideLoading();
  }
}

function closeProductDetailModal() {
  document.getElementById("productDetailModal").classList.add("hidden");
  document.getElementById("productDetailModal").classList.remove("flex");
}

function closeProductModal() {
  const modal = document.getElementById("productModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

async function loadCategoriesForSelect() {
  const select = document.getElementById("productCategory");
  select.innerHTML = '<option value="">Seleccionar categoría</option>';

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.nombre;
    select.appendChild(option);
  });
}

async function editProduct(id) {
  showLoading();
  try {
    const response = await fetch(`${API_BASE_URL}/api/productos/${id}`);
    if (response.ok) {
      const product = await response.json();
      await openImageManagementModal(product.id); // Cambiar a modal de gestión de imágenes
    } else {
      showToast("Error al cargar el producto", "error");
    }
  } catch (error) {
    console.error("Error loading product:", error);
    showToast("Error de conexión al cargar producto", "error");
  } finally {
    hideLoading();
  }
}

// Form Handlers
function setupEventListeners() {
  // Category Form
  document
    .getElementById("categoryForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const categoryId = document.getElementById("categoryId").value;
      const categoryData = {
        nombre: document.getElementById("categoryName").value,
      };

      showLoading();
      try {
        const url = categoryId
          ? `${API_BASE_URL}/api/categorias/${categoryId}`
          : `${API_BASE_URL}/api/categorias`;

        const method = categoryId ? "PUT" : "POST";

        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(categoryData),
        });

        if (response.ok) {
          closeCategoryModal();
          await loadCategories();
          await loadDashboardData();
          showToast(
            categoryId ? "Categoría actualizada" : "Categoría creada",
            "success"
          );
        } else {
          const error = await response.json();
          showToast(error.error || "Error al guardar la categoría", "error");
        }
      } catch (error) {
        console.error("Error saving category:", error);
        showToast("Error de conexión al guardar categoría", "error");
      } finally {
        hideLoading();
      }
    });

  // Product Form
  document
    .getElementById("productForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const productId = document.getElementById("productId").value;
      const productData = {
        nombre: document.getElementById("productName").value,
        precio: document.getElementById("productPrice").value,
        descripcion: document.getElementById("productDescription").value,
        categoria_id: document.getElementById("productCategory").value,
        imagenes: document
          .getElementById("productImages")
          .value.split(",")
          .map((url) => url.trim())
          .filter((url) => url),
      };

      showLoading();
      try {
        const url = productId
          ? `${API_BASE_URL}/api/productos/${productId}`
          : `${API_BASE_URL}/api/productos`;

        const method = productId ? "PUT" : "POST";

        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(productData),
        });

        if (response.ok) {
          closeProductModal();
          await loadProducts();
          await loadDashboardData();
          showToast(
            productId ? "Producto actualizado" : "Producto creada",
            "success"
          );
        } else {
          const error = await response.json();
          showToast(error.error || "Error al guardar el producto", "error");
        }
      } catch (error) {
        console.error("Error saving product:", error);
        showToast("Error de conexión al guardar producto", "error");
      } finally {
        hideLoading();
      }
    });

  // Cerrar modal de detalles
  document
    .getElementById("closeProductDetailModal")
    .addEventListener("click", closeProductDetailModal);

  // Confirmación de eliminación
  document
    .getElementById("confirmDeleteBtn")
    .addEventListener("click", confirmDeleteCategory);
}

// Navigation
function showSection(sectionName) {
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.remove("active");
  });

  document.getElementById(`${sectionName}-section`).classList.add("active");

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });
  event.target.classList.add("active");
}

// Utilities
function showLoading() {
  document.getElementById("loading").classList.remove("hidden");
  document.getElementById("loading").classList.add("flex");
}

function hideLoading() {
  document.getElementById("loading").classList.add("hidden");
  document.getElementById("loading").classList.remove("flex");
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

async function editProductBasic(id) {
  showLoading();
  try {
    const response = await fetch(`${API_BASE_URL}/api/productos/${id}`);
    if (response.ok) {
      const product = await response.json();
      await openProductModal(product);
    } else {
      showToast("Error al cargar el producto", "error");
    }
  } catch (error) {
    console.error("Error loading product:", error);
    showToast("Error de conexión al cargar producto", "error");
  } finally {
    hideLoading();
  }
}

// Make functions global for HTML onclick
window.showSection = showSection;
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.logout = logout;
window.showToast = showToast;
window.closeDeleteConfirmModal = closeDeleteConfirmModal;
window.openProductDetailModal = openProductDetailModal;
window.closeProductDetailModal = closeProductDetailModal;
window.openImageManagementModal = openImageManagementModal;
window.closeImageManagementModal = closeImageManagementModal;
window.deleteProductImage = deleteProductImage;
window.editProductBasic = editProductBasic;
