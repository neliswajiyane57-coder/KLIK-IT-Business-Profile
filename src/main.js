import { slideMarkup } from './slides.js';

const main = document.querySelector('#main');
main.innerHTML = `<div class="slide-deck" aria-label="KLIK I.T. proposal presentation">${slideMarkup.join('')}</div>`;
const deck = main.querySelector('.slide-deck');
const slides = [...deck.querySelectorAll('.slide')];
const total = slides.length;
let current = 0;

const currentLabel = document.querySelector('[data-current]');
const totalLabel = document.querySelector('[data-total]');
const progress = document.querySelector('[data-progress]');
const progressTrack = document.querySelector('.progress-track');
const previousButton = document.querySelector('[data-previous]');
const nextButton = document.querySelector('[data-next]');
const overview = document.querySelector('.overview-dialog');
const overviewList = document.querySelector('[data-overview-list]');
const pad = (number) => String(number).padStart(2, '0');

totalLabel.textContent = pad(total);
progressTrack.setAttribute('aria-valuemax', total);

function slideTitle(slide, index) {
  if (index === 0) return 'Cover';
  return slide.querySelector('.eyebrow')?.textContent.trim() || `Slide ${pad(index + 1)}`;
}

slides.forEach((slide, index) => {
  slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
  slide.inert = index !== 0;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'overview-card';
  button.innerHTML = `<span class="overview-number">${pad(index + 1)}</span><span class="overview-label"></span><span class="overview-arrow" aria-hidden="true">↗</span>`;
  button.querySelector('.overview-label').textContent = slideTitle(slide, index);
  button.addEventListener('click', () => {
    goTo(index);
    overview.close();
  });
  overviewList.append(button);
});

function goTo(index) {
  const nextIndex = Math.max(0, Math.min(total - 1, index));
  if (nextIndex !== current) {
    slides[current].classList.remove('is-active');
    slides[current].setAttribute('aria-hidden', 'true');
    slides[current].inert = true;
    current = nextIndex;
    slides[current].classList.add('is-active');
    slides[current].setAttribute('aria-hidden', 'false');
    slides[current].inert = false;
  }
  currentLabel.textContent = pad(current + 1);
  progress.style.transform = `scaleX(${(current + 1) / total})`;
  progressTrack.setAttribute('aria-valuenow', current + 1);
  previousButton.disabled = current === 0;
  nextButton.disabled = current === total - 1;
  overviewList.querySelectorAll('.overview-card').forEach((card, cardIndex) => {
    if (cardIndex === current) card.setAttribute('aria-current', 'step');
    else card.removeAttribute('aria-current');
  });
}

goTo(0);
previousButton.addEventListener('click', () => goTo(current - 1));
nextButton.addEventListener('click', () => goTo(current + 1));
document.querySelector('[data-overview-open]').addEventListener('click', () => overview.showModal());
document.querySelector('[data-overview-close]').addEventListener('click', () => overview.close());
overview.addEventListener('click', (event) => {
  if (event.target === overview) overview.close();
});
document.querySelector('[data-print]').addEventListener('click', () => window.print());

document.addEventListener('keydown', (event) => {
  if (overview.open || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === 'ArrowRight' || event.key === 'PageDown') {
    event.preventDefault();
    goTo(current + 1);
  } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
    event.preventDefault();
    goTo(current - 1);
  } else if (event.key === 'Home') {
    event.preventDefault();
    goTo(0);
  } else if (event.key === 'End') {
    event.preventDefault();
    goTo(total - 1);
  }
});

let touchStartX = 0;
let touchStartY = 0;
deck.addEventListener('touchstart', (event) => {
  const touch = event.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive: true });
deck.addEventListener('touchend', (event) => {
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.25) goTo(current + (dx < 0 ? 1 : -1));
}, { passive: true });
