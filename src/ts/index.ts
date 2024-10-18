import { Product } from "./Product";

const serverUrl = "http://localhost:5000";
let products: Product[] = [];
let visibleProductsCount = window.innerWidth <= 1024 ? 4 : 9;

function renderProducts() {
  const productContainer = document.getElementById('product-container');
  if (!productContainer) return;

  productContainer.innerHTML = '';
  const visibleProducts = products.slice(0, visibleProductsCount);

  visibleProducts.forEach(product => {
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');
    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-card__image">
      <p class="product-card__title">${product.name}</p>
      <p class="product-card__price">R$ ${product.price.toFixed(2)}</p>
      <p class="product-card__discount">Até ${product.parcelamento[0]}x de R$${product.parcelamento[1].toFixed(2)}</p>
      <button class="product-card__button">Comprar</button>
    `;
    productContainer.appendChild(productCard);
  });

  const seeMoreButton = document.getElementById('see-more-button');
  if (visibleProductsCount >= products.length && seeMoreButton) {
    seeMoreButton.style.display = 'none';
  }
}

async function loadProducts() {
  try {
    const response = await fetch(`${serverUrl}/products`);
    products = await response.json();
    renderProducts();
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
  }
}

function showMoreProducts() {
  visibleProductsCount += 9;
  renderProducts();
}

function sortProducts(event: Event) {
  const selectedValue = (event.target as HTMLSelectElement).value;

  if (selectedValue === 'recent') {
    products.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } else if (selectedValue === 'lowest-price') {
    products.sort((a, b) => a.price - b.price);
  } else if (selectedValue === 'highest-price') {
    products.sort((a, b) => b.price - a.price);
  }

  visibleProductsCount = window.innerWidth <= 1024 ? 4 : 9;
  renderProducts();
}

function toggleColorFilters() {
  const colorCheckboxes = document.querySelectorAll('.product-list__color-checkbox.hidden');
  colorCheckboxes.forEach(checkbox => {
    checkbox.classList.toggle('hidden');
  });
  if (document.getElementById('toggle-color-filters')) {
    this.style.display = 'none';
  }
}

function filterByColor() {
  const selectedColors = Array.from(document.querySelectorAll('.color-checkbox:checked'))
    .map((checkbox: HTMLInputElement) => checkbox.value);

  const filteredProducts = selectedColors.length
    ? products.filter(product => selectedColors.includes(product.color))
    : products;

  visibleProductsCount = filteredProducts.length;
  renderFilteredProducts(filteredProducts);
}

function renderFilteredProducts(filteredProducts: Product[]) {
  const productContainer = document.getElementById('product-container');
  if (!productContainer) return;

  productContainer.innerHTML = '';
  filteredProducts.forEach(product => {
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');
    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-card__image">
      <p class="product-card__title">${product.name}</p>
      <p class="product-card__price">R$ ${product.price.toFixed(2)}</p>
      <p class="product-card__discount">Até ${product.parcelamento[0]}x de R$${product.parcelamento[1].toFixed(2)}</p>
      <button class="product-card__button">Comprar</button>
    `;
    productContainer.appendChild(productCard);
  });

  const seeMoreButton = document.getElementById('see-more-button');
  if (visibleProductsCount >= filteredProducts.length && seeMoreButton) {
    seeMoreButton.style.display = 'none';
  }
}

function main() {
  document.getElementById('see-more-button')?.addEventListener('click', showMoreProducts);
  document.getElementById('toggle-color-filters')?.addEventListener('click', toggleColorFilters);
  document.getElementById('sort-select')?.addEventListener('change', sortProducts);
  document.querySelectorAll('.color-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', filterByColor);
  });
  loadProducts();
}

document.addEventListener("DOMContentLoaded", main);
