import { CART_KEY, CartItem, clearCart, getCart, removeFromCart, updateQuantity } from './cart-storage.js';
import { getPath, loadProducts } from './products.js';

const SHIPPING_COST = 30;
const DISCOUNT_LIMIT = 3000;
const DISCOUNT_RATE = 0.1;

const EMPTY_MESSAGE = 'Your cart is empty. Use the <a href="catalog.html">catalog</a> to add new items.';
const THANK_YOU_MESSAGE = 'Thank you for your purchase.';

const cartSection = document.querySelector('.cart');
const cartBody = document.querySelector('.cart__body');
const message = document.querySelector('.cart__message');
const subtotalText = document.querySelector('.cart-summary__subtotal');
const discountText = document.querySelector('.cart-summary__discount');
const discountRow = discountText?.closest('.cart-summary__row');
const shippingText = document.querySelector('.cart-summary__shipping');
const totalText = document.querySelector('.cart-summary__total');

let jsonPrices: Record<string, number> = {};

function getPrice(item: CartItem): number {
  return jsonPrices[item.id] ?? item.price;
}

function formatPrice(value: number): string {
  return `$${Number.isInteger(value) ? value : value.toFixed(2)}`;
}

function createRow(item: CartItem, index: number): HTMLTableRowElement {
  const price = getPrice(item);
  const options = [item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(', ');

  const row = document.createElement('tr');
  row.className = 'cart__row';
  row.innerHTML = `
    <td class="cart__cell cart__cell--image">
      <img class="cart__image" src="${item.image}" alt="" />
    </td>
    <td class="cart__cell cart__cell--name">
      <a href="${getPath(`html/product.html?id=${item.id}`)}">${item.name}</a>
      ${options ? `<span class="cart__options">${options}</span>` : ''}
    </td>
    <td class="cart__cell cart__cell--price">${formatPrice(price)}</td>
    <td class="cart__cell cart__cell--quantity">
      <div class="quantity quantity--plain">
        <button class="quantity__button cart__minus" type="button" aria-label="Decrease quantity">-</button>
        <input class="quantity__input" type="number" value="${item.quantity}" min="1" aria-label="Quantity" />
        <button class="quantity__button cart__plus" type="button" aria-label="Increase quantity">+</button>
      </div>
    </td>
    <td class="cart__cell cart__cell--total">${formatPrice(price * item.quantity)}</td>
    <td class="cart__cell cart__cell--delete">
      <button class="cart__delete" type="button">
        <img src="${getPath('assets/icons/trash.svg')}" alt="Remove ${item.name}" />
      </button>
    </td>
  `;

  const input = row.querySelector<HTMLInputElement>('.quantity__input');
  row.querySelector('.cart__minus')?.addEventListener('click', () => changeQuantity(index, item.quantity - 1));
  row.querySelector('.cart__plus')?.addEventListener('click', () => changeQuantity(index, item.quantity + 1));
  input?.addEventListener('change', () => changeQuantity(index, Math.floor(Number(input.value)) || 1));
  row.querySelector('.cart__delete')?.addEventListener('click', () => {
    removeFromCart(index);
    renderCart();
  });

  return row;
}

function changeQuantity(index: number, quantity: number): void {
  updateQuantity(index, quantity);
  renderCart();
}

function renderSummary(cart: CartItem[]): void {
  const subtotal = cart.reduce((sum, item) => sum + getPrice(item) * item.quantity, 0);
  const discount = subtotal > DISCOUNT_LIMIT ? subtotal * DISCOUNT_RATE : 0;
  const shipping = cart.length > 0 ? SHIPPING_COST : 0;
  const total = subtotal - discount + shipping;

  if (subtotalText) subtotalText.textContent = formatPrice(subtotal);
  if (discountText) discountText.textContent = `-${formatPrice(discount)}`;
  discountRow?.classList.toggle('cart-summary__row--hidden', discount === 0);
  if (shippingText) shippingText.textContent = formatPrice(shipping);
  if (totalText) totalText.textContent = formatPrice(total);
}

function showMessage(text: string): void {
  if (message) message.innerHTML = text;
  cartSection?.classList.add('cart--empty');
}

function renderCart(): void {
  if (!cartBody) return;

  const cart = getCart();
  cartBody.innerHTML = '';
  cart.forEach((item, index) => cartBody.append(createRow(item, index)));
  renderSummary(cart);

  if (cart.length === 0) {
    showMessage(EMPTY_MESSAGE);
  } else {
    cartSection?.classList.remove('cart--empty');
  }
}

function initCartPage(): void {
  document.querySelector('.cart__clear')?.addEventListener('click', () => {
    clearCart();
    renderCart();
  });

  document.querySelector('.cart-summary__checkout')?.addEventListener('click', () => {
    if (getCart().length === 0) return;
    clearCart();
    renderCart();
    showMessage(THANK_YOU_MESSAGE);
  });

  window.addEventListener('storage', (event) => {
    if (event.key === CART_KEY || event.key === null) renderCart();
  });

  renderCart();

  loadProducts()
    .then((products) => {
      products.forEach((product) => {
        jsonPrices[product.id] = product.price;
      });
      renderCart();
    })
    .catch(() => {
      jsonPrices = {};
    });
}

initCartPage();
