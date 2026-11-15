import { createProductCard, createStars, getPath, loadProducts, Product, shuffle } from './products.js';

const PRODUCTS_PER_PAGE = 12;
const BEST_SETS_COUNT = 5;

const filters = {
  size: '',
  color: '',
  category: '',
  sales: false,
};

let allProducts: Product[] = [];
let sortBy = 'default';
let currentPage = 1;

const filtersForm = document.querySelector<HTMLFormElement>('.filters');
const productList = document.querySelector('.catalog__products .product-grid');
const pagination = document.querySelector('.pagination');
const countText = document.querySelector('.catalog__count');
const sortSelect = document.querySelector<HTMLSelectElement>('.catalog__sort');
const salesToggle = document.querySelector<HTMLInputElement>('#filter-sales');
const hideButton = document.querySelector('.filters__button[type="button"]');
const searchForm = document.querySelector<HTMLFormElement>('.search');
const searchInput = document.querySelector<HTMLInputElement>('.search__input');
const searchPopup = document.querySelector<HTMLDialogElement>('#search-popup');
const bestSetsList = document.querySelector('.best-sets__list');

function matchesSize(product: Product, size: string): boolean {
  if (!size) return true;
  if (size === 'S-L') return ['S', 'M', 'L'].includes(product.size);
  return product.size === size;
}

function getFilteredProducts(): Product[] {
  const result = allProducts.filter((product) => {
    if (!matchesSize(product, filters.size)) return false;
    if (filters.color && product.color !== filters.color) return false;
    if (filters.category && product.category !== filters.category) return false;
    if (filters.sales && !product.salesStatus) return false;
    return true;
  });

  if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
  if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
  if (sortBy === 'popularity') result.sort((a, b) => b.popularity - a.popularity);
  if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);

  return result;
}

function createPageButton(page: number): HTMLLIElement {
  const item = document.createElement('li');
  const button = document.createElement('button');

  button.type = 'button';
  button.className = 'pagination__page';
  button.textContent = String(page);
  if (page === currentPage) button.classList.add('pagination__page--active');
  button.addEventListener('click', () => goToPage(page));

  item.append(button);
  return item;
}

function createArrowButton(type: 'prev' | 'next', disabled: boolean): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `pagination__${type}`;
  button.disabled = disabled;
  button.innerHTML =
    type === 'prev'
      ? `<img src="${getPath('assets/icons/chevron-right.svg')}" alt="" /> Prev`
      : `Next <img src="${getPath('assets/icons/chevron-right.svg')}" alt="" />`;
  button.addEventListener('click', () => goToPage(type === 'prev' ? currentPage - 1 : currentPage + 1));
  return button;
}

function renderPagination(totalPages: number): void {
  if (!pagination) return;
  pagination.innerHTML = '';
  if (totalPages <= 1) return;

  const pages = document.createElement('ul');
  pages.className = 'pagination__pages';
  for (let page = 1; page <= totalPages; page++) {
    pages.append(createPageButton(page));
  }

  pagination.append(createArrowButton('prev', currentPage === 1), pages, createArrowButton('next', currentPage === totalPages));
}

function renderProducts(): void {
  if (!productList) return;

  const products = getFilteredProducts();
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  if (currentPage > totalPages) currentPage = Math.max(totalPages, 1);

  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const pageProducts = products.slice(start, start + PRODUCTS_PER_PAGE);

  productList.innerHTML = '';
  pageProducts.forEach((product) => productList.append(createProductCard(product)));

  if (products.length === 0) {
    productList.innerHTML = '<li class="catalog__empty">No products match the selected filters.</li>';
  }

  if (countText) {
    countText.textContent =
      products.length === 0
        ? 'Showing 0 results'
        : `Showing ${start + 1}–${start + pageProducts.length} of ${products.length} results`;
  }

  renderPagination(totalPages);
}

function goToPage(page: number): void {
  currentPage = page;
  renderProducts();

  const header = document.querySelector<HTMLElement>('.header');
  const toolbar = document.querySelector('.catalog__toolbar');
  if (toolbar) {
    const top = toolbar.getBoundingClientRect().top + window.scrollY - (header?.offsetHeight ?? 0) - 20;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

function selectOption(dropdown: HTMLElement, option: HTMLButtonElement): void {
  const value = option.dataset.value ?? '';
  const button = dropdown.querySelector('.dropdown__button');

  dropdown.querySelectorAll('.dropdown__option').forEach((item) => {
    item.classList.toggle('dropdown__option--active', item === option);
  });
  dropdown.classList.toggle('dropdown--selected', value !== '');
  if (button) button.textContent = value || 'Choose option';
}

function initFilters(): void {
  document.querySelectorAll<HTMLElement>('.dropdown[data-filter]').forEach((dropdown) => {
    const name = dropdown.dataset.filter as 'size' | 'color' | 'category';

    dropdown.querySelectorAll<HTMLButtonElement>('.dropdown__option').forEach((option) => {
      option.addEventListener('click', () => {
        selectOption(dropdown, option);
        filters[name] = option.dataset.value ?? '';
        option.blur();
        currentPage = 1;
        renderProducts();
      });
    });
  });

  salesToggle?.addEventListener('change', () => {
    filters.sales = salesToggle.checked;
    currentPage = 1;
    renderProducts();
  });

  filtersForm?.addEventListener('reset', () => {
    filters.size = '';
    filters.color = '';
    filters.category = '';
    filters.sales = false;

    document.querySelectorAll<HTMLElement>('.dropdown[data-filter]').forEach((dropdown) => {
      const allOption = dropdown.querySelector<HTMLButtonElement>('.dropdown__option[data-value=""]');
      if (allOption) selectOption(dropdown, allOption);
    });

    if (sortSelect) sortSelect.value = 'default';
    sortBy = 'default';
    currentPage = 1;
    renderProducts();
  });

  hideButton?.addEventListener('click', () => {
    const hidden = filtersForm?.classList.toggle('filters--hidden');
    hideButton.textContent = hidden ? 'Show Filters' : 'Hide Filters';
  });

  sortSelect?.addEventListener('change', () => {
    sortBy = sortSelect.value;
    currentPage = 1;
    renderProducts();
  });
}

function initSearch(): void {
  searchPopup?.querySelector('.popup__button')?.addEventListener('click', () => searchPopup.close());

  searchForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    const query = searchInput?.value.trim().toLowerCase() ?? '';
    if (!query) return;

    const found = allProducts.find((product) => product.name.toLowerCase().includes(query));

    if (found) {
      window.location.href = getPath(`html/product.html?id=${found.id}`);
    } else {
      searchPopup?.showModal();
    }
  });
}

function renderBestSets(): void {
  if (!bestSetsList) return;

  const sets = allProducts.filter((product) => product.category === 'luggage sets');
  const others = allProducts.filter((product) => product.category !== 'luggage sets');
  const randomItems = [...shuffle(sets), ...shuffle(others)].slice(0, BEST_SETS_COUNT);

  bestSetsList.innerHTML = '';
  randomItems.forEach((product) => {
    const link = getPath(`html/product.html?id=${product.id}`);
    const item = document.createElement('li');
    item.className = 'best-set';
    item.innerHTML = `
      <a class="best-set__link" href="${link}">
        <img class="best-set__image" src="${getPath(product.imageUrl)}" alt="${product.name}" width="87" height="87" />
      </a>
      <div>
        <p class="best-set__name"><a href="${link}">${product.name}</a></p>
        <div class="rating rating--small" aria-label="Rating ${product.rating} of 5">${createStars(product.rating)}</div>
        <p class="best-set__price">$${product.price}</p>
      </div>
    `;
    bestSetsList.append(item);
  });
}

async function initCatalog(): Promise<void> {
  initFilters();
  initSearch();

  try {
    allProducts = await loadProducts();
    renderProducts();
    renderBestSets();
  } catch {
    if (productList) productList.innerHTML = '<li class="catalog__empty">Products could not be loaded. Please try again later.</li>';
    if (countText) countText.textContent = 'Showing 0 results';
  }
}

initCatalog();
