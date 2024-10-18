import { Product } from "./Product";

const serverUrl = "http://localhost:5000";
let products: Product[] = [];
let visibleProductsCount = window.innerWidth <= 1024 ? 4 : 9;

function renderProducts(productsToRender: Product[]) {
  const productContainer = document.getElementById('product-container');
  if (!productContainer) return;

  productContainer.innerHTML = '';
  const visibleProducts = productsToRender.slice(0, visibleProductsCount);

  visibleProducts.forEach(createProductCard(productContainer));

  toggleSeeMoreButton(productsToRender.length);
}

const createProductCard = (container: HTMLElement) => (product: Product) => {
  const productCard = document.createElement('div');
  productCard.classList.add('product-card');
  productCard.innerHTML = `
    <img src="${product.image}" alt="${product.name}" class="product-card__image">
    <p class="product-card__title">${product.name}</p>
    <p class="product-card__price">R$ ${product.price.toFixed(2)}</p>
    <p class="product-card__discount">Até ${product.parcelamento[0]}x de R$${product.parcelamento[1].toFixed(2)}</p>
    <button class="product-card__button">Comprar</button>
  `;
  container.appendChild(productCard);
};

function toggleSeeMoreButton(totalProducts: number) {
  const seeMoreButton = document.getElementById('see-more-button');
  if (seeMoreButton) {
    seeMoreButton.style.display = visibleProductsCount >= totalProducts ? 'none' : 'block';
  }
}

async function loadProducts() {
  try {
    const response = await fetch(`${serverUrl}/products`);
    products = await response.json();
    renderProducts(products);
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
  }
}

function showMoreProducts() {
  visibleProductsCount += 9;
  renderProducts(products);
}

function sortProducts(event: Event) {
  const selectedValue = (event.target as HTMLSelectElement).value;

  const sortStrategies: { [key: string]: (a: Product, b: Product) => number } = {
    'recent': (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    'lowest-price': (a, b) => a.price - b.price,
    'highest-price': (a, b) => b.price - a.price,
  };

  if (sortStrategies[selectedValue]) {
    products.sort(sortStrategies[selectedValue]);
  }

  visibleProductsCount = window.innerWidth <= 1024 ? 4 : 9;
  renderProducts(products);
}

function toggleColorFilters() {
  const colorCheckboxes = document.querySelectorAll('.product-list__color-checkboxes .hidden');
  colorCheckboxes.forEach(checkbox => checkbox.classList.toggle('hidden'));

  const toggleButton = document.getElementById('toggle-color-filters');
  if (toggleButton) {
    toggleButton.style.display = 'none';
  }
}

function filterProductsByColor() {
  const selectedColors = Array.from(document.querySelectorAll('.product-list__color-checkboxes .checkbox__input:checked'))
    .map((checkbox: HTMLInputElement) => checkbox.value);

  const filteredProducts = selectedColors.length
    ? products.filter(product => selectedColors.includes(product.color))
    : products;

  visibleProductsCount = window.innerWidth <= 1024 ? 4 : 9;
  renderProducts(filteredProducts);
}

function filterProductsByPrice() {
  const selectedPrices = Array.from(document.querySelectorAll('.product-list__price-checkboxes .checkbox__input:checked'))
    .map((checkbox: HTMLInputElement) => checkbox.value);

  const filteredProducts = selectedPrices.length
    ? products.filter(product => selectedPrices.some(priceRange => {
        const [min, max] = priceRange.split('-').map(Number);
        return max ? product.price >= min && product.price <= max : product.price >= min;
      }))
    : products;

  visibleProductsCount = window.innerWidth <= 1024 ? 4 : 9;
  renderProducts(filteredProducts);
}

function filterProductsBySize() {
  const selectedSize = this.getAttribute('data-size');

  document.querySelectorAll('.size-item').forEach(button => button.classList.remove('active'));
  this.classList.add('active');

  const filteredProducts = products.filter(product => product.size.includes(selectedSize));
  
  renderProducts(filteredProducts);
}

function updateCartCount() {
  const cartCountElement = document.querySelector('.span-count');

  if (cartCountElement) {
    let currentCount = parseInt(cartCountElement.textContent, 10);
    cartCountElement.textContent = (currentCount + 1).toString();
  }
}

function addBuyButtonListeners() {
  document.querySelectorAll('.product-card__button').forEach(button => {
    button.addEventListener('click', updateCartCount);
  });
}

const observer = new MutationObserver(() => {
  addBuyButtonListeners();
});

function main() {
  document.getElementById('see-more-button')?.addEventListener('click', showMoreProducts);
  document.getElementById('toggle-color-filters')?.addEventListener('click', toggleColorFilters);
  document.getElementById('sort-select')?.addEventListener('change', sortProducts);
  
  document.querySelectorAll('.product-list__color-checkboxes .checkbox__input').forEach(checkbox => {
    checkbox.addEventListener('change', filterProductsByColor);
  });

  document.querySelectorAll('.product-list__price-checkboxes .checkbox__input').forEach(checkbox => {
    checkbox.addEventListener('change', filterProductsByPrice);
  });

  document.querySelectorAll('.size-item').forEach(button => {
    button.addEventListener('click', filterProductsBySize);
  });

  const productContainer = document.getElementById('product-container');
  if (productContainer) {
    observer.observe(productContainer, {
      childList: true,
      subtree: true,
    });
  }

  loadProducts();
}

document.addEventListener("DOMContentLoaded", main);
