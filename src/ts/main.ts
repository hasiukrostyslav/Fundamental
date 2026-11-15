import { addToCart, CART_KEY, updateCartCounter } from './cart-storage.js';
import { initLogin } from './login.js';

const header = document.querySelector('.header');
const menuToggle = document.querySelector('.header__menu-toggle');

if (header && menuToggle) {
  menuToggle.addEventListener('click', () => {
    header.classList.toggle('header--menu-open');
  });
}

initLogin();
updateCartCounter();

window.addEventListener('storage', (event) => {
  if (event.key === CART_KEY || event.key === null) updateCartCounter();
});

window.addEventListener('pageshow', () => {
  updateCartCounter();
});

document.addEventListener('click', (event) => {
  const target = event.target as Element;
  const button = target.closest('.product-card__button');
  if (!button) return;

  const card = button.closest<HTMLElement>('.product-card');
  if (!card) return;

  const name = card.dataset.name ?? card.querySelector('.product-card__title')?.textContent?.trim() ?? '';
  const price = Number(card.dataset.price ?? card.querySelector('.product-card__price')?.textContent?.replace(/[^\d.]/g, ''));
  const image = card.querySelector<HTMLImageElement>('.product-card__image')?.src ?? '';
  const id = card.dataset.id ?? name;
  const size = card.dataset.size ?? '';
  const color = card.dataset.color ?? '';

  addToCart({ id, name, price, image, size, color, quantity: 1 });
});
