export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

export const CART_KEY = 'cart';

export function getCart(): CartItem[] {
  const saved = localStorage.getItem(CART_KEY);
  if (!saved) return [];

  try {
    return JSON.parse(saved) as CartItem[];
  } catch {
    return [];
  }
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function updateCartCounter(): void {
  const counter = document.querySelector('.header__cart-count');
  if (!counter) return;

  const count = getCartCount();
  counter.textContent = String(count);
  counter.classList.toggle('header__cart-count--hidden', count === 0);
}

export function saveCart(cart: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCounter();
}

function isSameItem(a: CartItem, b: CartItem): boolean {
  return a.name === b.name && a.size === b.size && a.color === b.color;
}

export function addToCart(product: CartItem): void {
  const cart = getCart();
  const existing = cart.find((item) => isSameItem(item, product));

  if (existing) {
    existing.quantity += product.quantity;
  } else {
    cart.push(product);
  }

  saveCart(cart);
}

export function updateQuantity(index: number, quantity: number): void {
  const cart = getCart();
  if (!cart[index]) return;

  cart[index].quantity = Math.max(1, quantity);
  saveCart(cart);
}

export function removeFromCart(index: number): void {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
}

export function clearCart(): void {
  saveCart([]);
}
