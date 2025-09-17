// === CONFIG ===
const API_BASE_URL = "http://localhost:3000"; // ajusta si es necesario

// === NAVEGACIÓN DE PÁGINAS/FORMULARIOS ===
function showPage(id) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  // si volvemos a productos, recargamos
  if (id === 'products-page') {
    loadProducts(); 
  }
}
function showCreateForm(id) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'product-form') loadCategoriesIntoForm();
}

// === CATEGORÍAS ===
async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/categorias`);
    const categories = await res.json();
    const nav = document.getElementById('categories-nav');
    nav.innerHTML = '';

    // botón TODOS
    const allBtn = document.createElement('button');
    allBtn.className = "px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200";
    allBtn.textContent = "Todos";
    allBtn.onclick = () => loadProducts(null, "Todos nuestros productos");
    nav.appendChild(allBtn);

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = "px-3 py-1 bg-gray-200 rounded hover:bg-gray-300";
      btn.textContent = cat.nombre;
      // filtraremos en frontend por nombre de categoría
      btn.onclick = () => loadProducts(cat.nombre, `Categoría: ${cat.nombre}`);
      nav.appendChild(btn);
    });
  } catch (e) {
    console.error('Error cargando categorías', e);
  }
}

async function loadCategoriesIntoForm() {
  try {
    const res = await fetch(`${API_BASE_URL}/categorias`);
    const categories = await res.json();
    const select = document.getElementById('product-category');
    select.innerHTML = categories.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
  } catch (e) {
    console.error('Error cargando categorías en form', e);
  }
}

// === PRODUCTOS (LISTA + DETALLE) ===
async function loadProducts(categoryName = null, title = "Todos nuestros productos") {
  try {
    const res = await fetch(`${API_BASE_URL}/productos`);
    let products = await res.json();

    // filtro por nombre de categoría (frontend) si se seleccionó alguna
    if (categoryName) {
      products = products.filter(p => (p.categoria || '').toLowerCase() === categoryName.toLowerCase());
    }

    document.getElementById('products-title').textContent = title;

    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';

    if (!products.length) {
      grid.innerHTML = `<div class="col-span-full text-gray-500">No hay productos para mostrar.</div>`;
      return;
    }

    products.forEach(prod => {
      const card = document.createElement('div');
      card.className = "bg-white rounded-lg shadow p-4 hover:shadow-lg cursor-pointer transition";
      card.onclick = () => showProductDetail(prod.id);

      card.innerHTML = `
        <img src="${prod.imagen_principal || 'https://placehold.co/300x200'}"
             alt="${prod.nombre}" class="product-image w-full mb-3">
        <h3 class="text-lg font-semibold text-gray-800">${prod.nombre}</h3>
        <p class="text-blue-600 font-bold">$${Number(prod.precio).toFixed(2)}</p>
        <p class="text-sm text-gray-500">${prod.categoria || 'Sin categoría'}</p>
      `;
      grid.appendChild(card);
    });
  } catch (e) {
    console.error('Error cargando productos', e);
  }
}

async function showProductDetail(productId) {
  try {
    const res = await fetch(`${API_BASE_URL}/productos/${productId}`);
    const product = await res.json();

    showPage('product-detail-page');

    document.getElementById('product-detail-name').textContent = product.nombre;
    document.getElementById('product-detail-category').textContent = product.categoria || 'Sin categoría';
    document.getElementById('product-detail-price').textContent = `$${Number(product.precio).toFixed(2)}`;
    document.getElementById('product-detail-description').textContent = product.descripcion || '';

    // Imagen principal
    const mainImg = document.getElementById('main-product-image');
    mainImg.src = product.imagenes?.[0]?.url || 'https://placehold.co/600x400';

    // Thumbnails
    const thumbs = document.getElementById('product-thumbnails');
    thumbs.innerHTML = '';
    (product.imagenes || []).forEach((img, idx) => {
      const t = document.createElement('img');
      t.src = img.url;
      t.className = "thumbnail";
      t.onclick = () => { mainImg.src = img.url; };
      thumbs.appendChild(t);
      if (idx === 0) t.classList.add('active-thumbnail');
    });
  } catch (e) {
    console.error('Error cargando detalle', e);
  }
}

// === FORM: CATEGORÍA ===
async function registerCategory(event) {
  event.preventDefault();
  const nombre = document.getElementById('category-name').value.trim();
  if (!nombre) return;

  const res = await fetch(`${API_BASE_URL}/categorias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre })
  });

  if (res.ok) {
    alert('Categoría registrada con éxito');
    document.getElementById('category-name').value = '';
    loadCategories();
    showPage('products-page');
  } else {
    alert('Error al registrar la categoría');
  }
}

// === FORM: PRODUCTO (usa URLs de imágenes, separadas por coma) ===
async function registerProduct(event) {
  event.preventDefault();
  const nombre = document.getElementById('product-name').value.trim();
  const precio = document.getElementById('product-price').value;
  const descripcion = document.getElementById('product-description').value.trim();
  const categoria_id = document.getElementById('product-category').value;
  const rawImgs = document.getElementById('product-images').value.trim();
  const imagenes = rawImgs ? rawImgs.split(',').map(s => s.trim()).filter(Boolean) : [];

  const res = await fetch(`${API_BASE_URL}/productos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, precio, categoria_id, descripcion, imagenes })
  });

  if (res.ok) {
    alert('Producto registrado con éxito');
    event.target.reset();
    showPage('products-page');
    loadProducts();
  } else {
    alert('Error al registrar el producto');
  }
}

// === FORM: AGREGAR IMAGEN A PRODUCTO ===
async function registerImage(event) {
  event.preventDefault();
  const producto_id = Number(document.getElementById('image-product-id').value);
  const url = document.getElementById('image-url').value.trim();

  if (!producto_id || !url) return;

  const res = await fetch(`${API_BASE_URL}/imagenes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, producto_id })
  });

  if (res.ok) {
    alert('Imagen agregada con éxito');
    event.target.reset();
    showPage('products-page');
    loadProducts();
  } else {
    alert('Error al agregar la imagen');
  }
}

// === INICIO ===
document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
  loadProducts(); // al ingresar, mostrar todos los productos
});
