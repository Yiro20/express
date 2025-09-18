import { API_BASE_URL, getAuthHeaders } from "../config.js";

let currentProductId = null;
let productImages = [];

export function initProductImages(productId, images = []) {
  currentProductId = productId;
  productImages = images;
  renderImages();
  setupImageEventListeners();
}

function renderImages() {
  const container = document.getElementById("product-images-container");
  container.innerHTML = "";

  productImages.forEach((image, index) => {
    const imageElement = `
      <div class="flex items-center justify-between p-3 bg-gray-100 rounded-lg mb-2">
        <div class="flex items-center">
          <img src="${image.url}" alt="Imagen ${
      index + 1
    }" class="w-12 h-12 object-cover rounded mr-3">
          <span class="text-sm text-gray-600 truncate max-w-xs">${
            image.url
          }</span>
        </div>
        <button 
          onclick="deleteImage(${image.id})" 
          class="text-red-600 hover:text-red-800 ml-3"
          ${
            productImages.length <= 1
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

  // Mostrar/u ocultar botón de agregar según el límite
  const addButton = document.getElementById("add-image-btn");
  if (addButton) {
    addButton.disabled = productImages.length >= 3;
    if (productImages.length >= 3) {
      addButton.title = "Máximo 3 imágenes permitidas";
    }
  }
}

function setupImageEventListeners() {
  document
    .getElementById("add-image-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const urlInput = document.getElementById("new-image-url");
      const url = urlInput.value.trim();

      if (!url) {
        showToast("Por favor ingresa una URL válida", "error");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/productos/${currentProductId}/images`,
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
          const data = await response.json();
          productImages.push(data.image);
          renderImages();
          urlInput.value = "";
          showToast("Imagen agregada exitosamente", "success");
        } else {
          const error = await response.json();
          showToast(error.error || "Error al agregar imagen", "error");
        }
      } catch (error) {
        console.error("Error adding image:", error);
        showToast("Error de conexión al agregar imagen", "error");
      }
    });
}

export async function deleteImage(imageId) {
  if (!confirm("¿Estás seguro de que quieres eliminar esta imagen?")) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/productos/images/${imageId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    if (response.ok) {
      productImages = productImages.filter((img) => img.id !== imageId);
      renderImages();
      showToast("Imagen eliminada exitosamente", "success");
    } else {
      const error = await response.json();
      showToast(error.error || "Error al eliminar imagen", "error");
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    showToast("Error de conexión al eliminar imagen", "error");
  }
}

// Hacer funciones globales
window.deleteImage = deleteImage;
