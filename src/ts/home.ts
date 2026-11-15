import { createProductCard, loadProducts } from './products.js';

async function renderProductBlocks(): Promise<void> {
  const lists = document.querySelectorAll<HTMLElement>('[data-block]');
  if (lists.length === 0) return;

  try {
    const products = await loadProducts();

    lists.forEach((list) => {
      const block = list.dataset.block ?? '';
      const blockProducts = products.filter((product) => product.blocks.includes(block));

      list.innerHTML = '';
      blockProducts.forEach((product) => {
        list.append(createProductCard(product));
      });
    });
  } catch {
    lists.forEach((list) => {
      list.innerHTML = '<li>Products could not be loaded. Please try again later.</li>';
    });
  }
}

const travelTexts = [
  { title: 'Pack light, travel far.', text: 'A good suitcase is the first step of every great trip.' },
  { title: 'Weekend in the mountains.', text: 'Fresh air, long walks and everything you need in one bag.' },
  { title: 'City break ready.', text: 'Compact, light and easy to roll through busy streets.' },
  { title: 'Sun, sea and sand.', text: 'Room for swimwear, sunscreen and a good book.' },
  { title: 'Business trip done right.', text: 'Keep your shirts neat and your laptop safe on the go.' },
  { title: 'Family holiday time.', text: 'Space for the whole family and a few souvenirs too.' },
  { title: 'Road trip adventure.', text: 'Throw it in the car boot and follow the open road.' },
  { title: 'First time abroad.', text: 'Travel with confidence and a suitcase you can trust.' },
];

function setRandomTexts(cards: NodeListOf<Element>): void {
  const shuffled = [...travelTexts].sort(() => Math.random() - 0.5);

  cards.forEach((card, index) => {
    const title = card.querySelector('.travel-card__title');
    const text = card.querySelector('.travel-card__text');
    const item = shuffled[index % shuffled.length];

    if (title) title.textContent = item.title;
    if (text) text.textContent = item.text;
  });
}

function initTravelSlider(): void {
  const list = document.querySelector('.travel__list');
  const prevButton = document.querySelector('.travel__arrow--prev');
  const nextButton = document.querySelector('.travel__arrow--next');
  if (!list) return;

  setRandomTexts(list.querySelectorAll('.travel-card'));

  nextButton?.addEventListener('click', () => {
    const first = list.firstElementChild;
    if (first) list.append(first);
  });

  prevButton?.addEventListener('click', () => {
    const last = list.lastElementChild;
    if (last) list.prepend(last);
  });
}

renderProductBlocks();
initTravelSlider();
