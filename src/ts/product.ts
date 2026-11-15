import { addToCart } from './cart-storage.js';
import { createProductCard, createStars, getPath, loadProducts, Product, shuffle } from './products.js';
import { clearFormMessage, isValidEmail, showFormMessage } from './validation.js';

const ALSO_LIKE_COUNT = 4;

let currentProduct: Product | undefined;

const form = document.querySelector<HTMLFormElement>('.product__form');
const quantityInput = document.querySelector<HTMLInputElement>('.product__form .quantity__input');

function showProduct(product: Product): void {
  const title = document.querySelector('.product__title');
  const price = document.querySelector('.product__price');
  const image = document.querySelector<HTMLImageElement>('.product__image');
  const rating = document.querySelector('.product__rating .rating');
  const reviewsTitle = document.querySelector('.reviews__title');

  document.title = product.name;
  if (title) title.textContent = product.name;
  if (price) price.textContent = `$${product.price}`;
  if (rating) {
    rating.innerHTML = createStars(product.rating);
    rating.setAttribute('aria-label', `Rating ${product.rating} of 5`);
  }
  if (image) {
    image.src = getPath(product.imageUrl);
    image.alt = product.name;
  }
  if (reviewsTitle) reviewsTitle.textContent = `1 review for ${product.name}`;

  const firstThumb = document.querySelector<HTMLImageElement>('.product__thumb img');
  if (firstThumb) {
    firstThumb.src = getPath(product.imageUrl);
    firstThumb.alt = product.name;
  }
}

function initGallery(): void {
  const image = document.querySelector<HTMLImageElement>('.product__image');
  const thumbs = document.querySelectorAll<HTMLButtonElement>('.product__thumb');

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const thumbImage = thumb.querySelector('img');
      if (!image || !thumbImage) return;

      image.src = thumbImage.src;
      image.alt = thumbImage.alt;

      thumbs.forEach((item) => item.classList.toggle('product__thumb--active', item === thumb));
    });
  });
}

function showNotFound(): void {
  const title = document.querySelector('.product__title');
  if (title) title.textContent = 'Product not found';
  form?.querySelector<HTMLButtonElement>('.product__add')?.setAttribute('disabled', '');
}

function renderAlsoLike(products: Product[]): void {
  const list = document.querySelector('.also-like');
  if (!list) return;

  const others = products.filter((product) => product.id !== currentProduct?.id);
  list.innerHTML = '';
  shuffle(others)
    .slice(0, ALSO_LIKE_COUNT)
    .forEach((product) => list.append(createProductCard(product)));
}

function getQuantity(): number {
  return Math.max(1, Math.floor(Number(quantityInput?.value)) || 1);
}

function initQuantity(): void {
  if (!quantityInput) return;
  const [minusButton, plusButton] = document.querySelectorAll('.product__form .quantity__button');

  minusButton?.addEventListener('click', () => {
    quantityInput.value = String(Math.max(1, getQuantity() - 1));
  });

  plusButton?.addEventListener('click', () => {
    quantityInput.value = String(getQuantity() + 1);
  });

  quantityInput.addEventListener('change', () => {
    quantityInput.value = String(getQuantity());
  });
}

function initAddToCart(): void {
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!currentProduct) return;

    const sizeValue = form.querySelector<HTMLSelectElement>('#size')?.value ?? '';
    const colorValue = form.querySelector<HTMLSelectElement>('#color')?.value ?? '';
    const size = sizeValue === '' ? currentProduct.size : sizeValue;
    const color = colorValue === '' ? currentProduct.color : colorValue;

    addToCart({
      id: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.price,
      image: getPath(currentProduct.imageUrl),
      size,
      color,
      quantity: getQuantity(),
    });
  });
}

function openTab(index: number): void {
  document.querySelectorAll('.tabs__tab').forEach((tab, i) => {
    tab.classList.toggle('tabs__tab--active', i === index);
  });
  document.querySelectorAll('.tabs__panel').forEach((panel, i) => {
    panel.classList.toggle('tabs__panel--hidden', i !== index);
  });
}

function initTabs(): void {
  document.querySelectorAll('.tabs__tab').forEach((tab, index) => {
    tab.addEventListener('click', () => openTab(index));
  });

  document.querySelector('.product__reviews-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    openTab(1);
    document.querySelector('.tabs')?.scrollIntoView({ behavior: 'smooth' });
  });
}

function initReviewForm(): void {
  const reviewForm = document.querySelector<HTMLFormElement>('.review-form');
  if (!reviewForm) return;

  reviewForm.noValidate = true;
  const fields = reviewForm.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('textarea, input[type="text"], input[type="email"]');

  fields.forEach((field) => {
    field.addEventListener('input', () => field.classList.remove('form-control--error'));
  });

  reviewForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearFormMessage(reviewForm);

    let isValid = true;
    fields.forEach((field) => {
      const empty = field.value.trim() === '';
      const badEmail = field.type === 'email' && !isValidEmail(field.value);
      const hasError = empty || badEmail;
      field.classList.toggle('form-control--error', hasError);
      if (hasError) isValid = false;
    });

    const rated = reviewForm.querySelector('.star-input__radio:checked');

    if (!isValid || !rated) {
      showFormMessage(reviewForm, 'Please rate the product, fill in all required fields and enter a valid email.', 'error');
      return;
    }

    reviewForm.reset();
    showFormMessage(reviewForm, 'Thank you! Your review has been submitted.', 'success');
  });
}

async function initProductPage(): Promise<void> {
  initGallery();
  initQuantity();
  initAddToCart();
  initTabs();
  initReviewForm();

  try {
    const products = await loadProducts();
    const id = new URLSearchParams(window.location.search).get('id');
    currentProduct = id ? products.find((product) => product.id === id) : products[0];

    if (currentProduct) {
      showProduct(currentProduct);
    } else {
      showNotFound();
    }

    renderAlsoLike(products);
  } catch {
    showNotFound();
  }
}

initProductPage();
