import { Product } from "./Product";

const serverUrl = "http://localhost:5000";
let products: Product[] = [];
let visibleProductsCount = window.innerWidth <= 1024 ? 4 : 9;

function renderProducts(productsToRender: Product[]) {
  const productContainer = document.getElementById('product-container');
  if (!productContainer) return;

  productContainer.innerHTML = '';
  const visibleProducts = productsToRender.slice(0, visibleProductsCount);

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
  if (visibleProductsCount >= productsToRender.length && seeMoreButton) {
    seeMoreButton.style.display = 'none';
  } else {
    seeMoreButton.style.display = 'block';
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
  visibleProductsCount += 9; // Adiciona 9 produtos a mais
  renderProducts(products);
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
  renderProducts(products);
}

function toggleColorFilters() {
  const colorCheckboxes = document.querySelectorAll('.product-list__color-checkboxes .hidden');
  colorCheckboxes.forEach(checkbox => {
    checkbox.classList.toggle('hidden');
  });
  const toggleButton = document.getElementById('toggle-color-filters');
  if (toggleButton) {
    toggleButton.style.display = 'none';
  }
}

function filterProductsByColor() {
  const selectedColors = Array.from(document.querySelectorAll('.product-list__color-checkboxes .checkbox__input:checked'))
    .map((checkbox: HTMLInputElement) => checkbox.value); // Obtemos o value diretamente

  const filteredProducts = selectedColors.length
    ? products.filter(product => selectedColors.includes(product.color))
    : products;

  visibleProductsCount = window.innerWidth <= 1024 ? 4 : 9;
  renderProducts(filteredProducts);
}

function filterProductsByPrice() {
  const selectedPrices = Array.from(document.querySelectorAll('.product-list__price-checkboxes .checkbox__input:checked'))
    .map((checkbox: HTMLInputElement) => checkbox.value); // Obtemos o value de cada checkbox selecionado

  const filteredProducts = selectedPrices.length
    ? products.filter(product => {
        return selectedPrices.some(priceRange => {
          const [min, max] = priceRange.split('-').map(Number); // Dividimos o valor em um intervalo (ex: "0-50")
          if (max) {
            return product.price >= min && product.price <= max; // Comparar dentro do intervalo
          } else {
            return product.price >= min; // Para valores como "500+", comparar apenas o mínimo
          }
        });
      })
    : products;

  visibleProductsCount = window.innerWidth <= 1024 ? 4 : 9; // Resetar o contador ao filtrar
  renderProducts(filteredProducts);
}


function filterProductsBySize() {
  const selectedSize = this.getAttribute('data-size');

  document.querySelectorAll('.size-item').forEach(button => {
    button.classList.remove('active');
  });

  this.classList.add('active');

  const seeMoreButton = document.getElementById('see-more-button');
  if (seeMoreButton) {
    seeMoreButton.style.display = 'none';
  }

  const filteredProducts = products.filter(product => product.size.includes(selectedSize));
  
  renderProducts(filteredProducts);
}


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
  loadProducts();
}

document.addEventListener("DOMContentLoaded", main);
