import { Product } from "./Product";

const serverUrl = "http://localhost:5000";

function toggleColorFilters() {
  const hiddenCheckboxes = document.querySelectorAll('.hidden');
  const toggleButton = document.getElementById('toggle-color-filters');

  hiddenCheckboxes.forEach(checkbox => {
    checkbox.classList.toggle('hidden');
  });
  if (toggleButton) {
    toggleButton.style.display = 'none';
  }
}

function main() {
  console.log(serverUrl);
  document.getElementById('toggle-color-filters')?.addEventListener('click', toggleColorFilters);
}

document.addEventListener("DOMContentLoaded", main);
