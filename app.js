import { services } from './services.js';

export const business = {
  whatsapp: '5551995153524',
  instagram: 'https://www.instagram.com/revitalizzehairtherapy/',
};

function whatsappUrl(message) {
  return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`;
}

document.querySelectorAll('[data-wa]').forEach(link => {
  link.href = whatsappUrl(link.dataset.wa);
});

const catalog = document.querySelector('#service-catalog');
const arrowSvg = '<svg aria-hidden="true"><use href="#diagonal"/></svg>';

if (catalog) {
  for (const [index, group] of services.entries()) {
    const section = document.createElement('section');
    section.className = 'service-group';
    section.dataset.category = group.filter;

    const title = document.createElement('h3');
    title.id = `service-group-${index}`;
    title.className = 'service-group-title';
    title.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span>`;
    title.append(document.createTextNode(group.group));
    section.setAttribute('aria-labelledby', title.id);
    section.append(title);

    const items = document.createElement('div');
    items.className = 'service-items';

    for (const service of group.items) {
      const row = document.createElement('article');
      row.className = 'service-row';

      const info = document.createElement('div');
      const name = document.createElement('h4');
      name.textContent = service.name;
      const description = document.createElement('p');
      description.textContent = service.description;
      info.append(name, description);

      const action = document.createElement('div');
      action.className = 'service-action';
      const price = document.createElement('strong');
      price.textContent = service.price;
      const link = document.createElement('a');
      link.className = 'service-book';
      link.href = whatsappUrl(`Olá! Tenho interesse em ${service.name} (${service.price}). Gostaria de saber mais e consultar os horários disponíveis.`);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', `Consultar horários para ${service.name} pelo WhatsApp`);
      link.innerHTML = `Reservar ${arrowSvg}`;
      action.append(price, link);

      row.append(info, action);
      items.append(row);
    }

    section.append(items);

    if (group.note) {
      const note = document.createElement('p');
      note.className = 'service-group-note';
      note.textContent = group.note;
      section.append(note);
    }

    catalog.append(section);
  }

  const serviceTotal = services.reduce((total, group) => total + group.items.length, 0);
  const serviceTotalElement = document.querySelector('#service-total');
  if (serviceTotalElement) serviceTotalElement.textContent = String(serviceTotal);

  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  for (const button of filterButtons) {
    button.addEventListener('click', () => {
      for (const item of filterButtons) {
        item.setAttribute('aria-pressed', String(item === button));
      }

      const filter = button.dataset.filter;
      let visibleCount = 0;
      for (const section of catalog.children) {
        const visible = filter === 'all' || section.dataset.category === filter;
        section.hidden = !visible;
        if (visible) visibleCount += section.querySelectorAll('.service-row').length;
      }

      const status = document.querySelector('#filter-status');
      if (status) status.textContent = `${visibleCount} serviços exibidos em ${button.textContent}.`;
    });
  }
}

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

function closeMenu() {
  if (!menuToggle || !nav) return;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu');
  nav.classList.remove('is-open');
}

menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  nav?.classList.toggle('is-open', open);
});

nav?.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuToggle.focus();
  }
});

document.addEventListener('click', event => {
  if (!event.target.closest('.header-inner')) closeMenu();
});

matchMedia('(min-width: 1001px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

const heroVideo = document.querySelector('.hero-video');
const videoToggle = document.querySelector('.video-toggle');

if (heroVideo && videoToggle) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = reducedMotion.matches;

  const syncVideoControl = () => {
    const paused = heroVideo.paused;
    videoToggle.classList.toggle('is-paused', paused);
    videoToggle.setAttribute('aria-label', paused ? 'Reproduzir vídeo' : 'Pausar vídeo');
  };

  if (reducedMotion.matches) heroVideo.pause();
  heroVideo.addEventListener('play', syncVideoControl);
  heroVideo.addEventListener('pause', syncVideoControl);
  heroVideo.addEventListener('loadeddata', syncVideoControl);
  syncVideoControl();

  videoToggle.addEventListener('click', async () => {
    if (heroVideo.paused) {
      userPaused = false;
      await heroVideo.play().catch(() => {});
    } else {
      userPaused = true;
      heroVideo.pause();
    }
    syncVideoControl();
  });

  const visibilityObserver = new IntersectionObserver(entries => {
    const visible = entries[0]?.isIntersecting;
    if (!visible) {
      heroVideo.pause();
    } else if (!userPaused) {
      heroVideo.play().catch(() => {});
    }
  }, { threshold: 0.2 });
  visibilityObserver.observe(heroVideo);

  reducedMotion.addEventListener('change', event => {
    if (event.matches) {
      userPaused = true;
      heroVideo.pause();
    }
  });
}

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();
