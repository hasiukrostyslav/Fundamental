export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  color: string;
  size: string;
  salesStatus: boolean;
  rating: number;
  popularity: number;
  blocks: string[];
}

const BASE_PATH = window.location.pathname.includes('/html/') ? '../' : '';

export function getPath(path: string): string {
  return BASE_PATH + path;
}

export async function loadProducts(): Promise<Product[]> {
  const response = await fetch(getPath('assets/data.json'));

  if (!response.ok) {
    throw new Error('Could not load products');
  }

  const json = (await response.json()) as { data: Product[] };
  return json.data;
}

export function shuffle<T>(list: T[]): T[] {
  return [...list].sort(() => Math.random() - 0.5);
}

export function createStars(rating: number): string {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    const filled = i <= Math.round(rating) ? ' rating__star--filled' : '';
    stars += `<span class="rating__star${filled}"></span>`;
  }
  return stars;
}

export function createProductCard(product: Product): HTMLLIElement {
  const productLink = getPath(`html/product.html?id=${product.id}`);
  const image = getPath(product.imageUrl);
  const badge = product.salesStatus ? '<span class="product-card__badge">Sale</span>' : '';

  const item = document.createElement('li');
  item.innerHTML = `
    <article
      class="product-card"
      data-id="${product.id}"
      data-name="${product.name}"
      data-price="${product.price}"
      data-size="${product.size}"
      data-color="${product.color}"
      data-image="${image}"
    >
      <a class="product-card__media" href="${productLink}">
        ${badge}
        <img class="product-card__image" src="${image}" alt="${product.name}" width="296" height="400" />
      </a>
      <h3 class="product-card__title">
        <a class="product-card__link" href="${productLink}">${product.name}</a>
      </h3>
      <p class="product-card__price">$${product.price}</p>
      <button class="button button--small product-card__button" type="button">Add To Cart</button>
    </article>
  `;

  return item;
}
