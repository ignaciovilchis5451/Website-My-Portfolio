/* ── Menu toggle ── */
const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav');
const navigationLinks = document.querySelectorAll('.nav a');

toggle.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
});

navigationLinks.forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
  });
});

/* ── Game details toggle ── */
const gameMoreButton = document.querySelector('.game-more-button');
const gameDetails = document.querySelector('#game-details');

gameMoreButton.addEventListener('click', () => {
  const isHidden = gameDetails.hidden;
  gameDetails.hidden = !isHidden;
  gameMoreButton.setAttribute('aria-expanded', String(isHidden));

  if (isHidden) {
    gameMoreButton.innerHTML = currentLang === 'en'
      ? 'Hide file <span>↑</span>'
      : 'Ocultar archivo <span>↑</span>';
    requestAnimationFrame(() => gameDetails.classList.add('is-visible'));
  } else {
    gameMoreButton.innerHTML = currentLang === 'en'
      ? 'Discover the project <span>↓</span>'
      : 'Descubrir el proyecto <span>↓</span>';
    gameDetails.classList.remove('is-visible');
  }
});

/* ── Scroll reveal ── */
const revealElements = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealElements.forEach((element) => observer.observe(element));

/* ── Translation + Cyberpunk glitch ── */
let currentLang = 'es';
let glitching = false;

const translateBtn = document.getElementById('translate-btn');
const translateLabel = document.getElementById('translate-label');
const glitchOverlay = document.getElementById('glitch-overlay');

const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#@$%░▒▓█▄▀■□▣◈⟨⟩⌬⌖';

function randomChar() {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
}

/**
 * Scramble plain text, then resolve to final string.
 * Returns a cleanup function to cancel early if needed.
 */
function scrambleText(el, finalText, duration) {
  const chars = finalText.split('');
  const total = chars.length;
  const stepMs = 30;
  const steps = Math.floor(duration / stepMs);
  let frame = 0;

  const id = setInterval(() => {
    frame++;
    const progress = frame / steps;
    // Resolve characters left-to-right as progress increases
    const resolved = Math.floor(progress * total);
    const display = chars
      .map((ch, i) => {
        if (i < resolved) return ch;
        // Spaces and punctuation-only chars stay as-is to preserve layout
        if (ch === ' ') return ' ';
        return randomChar();
      })
      .join('');
    el.textContent = display;

    if (frame >= steps) {
      clearInterval(id);
      el.textContent = finalText;
    }
  }, stepMs);

  return () => {
    clearInterval(id);
    el.textContent = finalText;
  };
}

function applyTranslation(lang) {
  const elements = document.querySelectorAll('[data-es][data-en]');

  elements.forEach((el) => {
    const text = lang === 'en' ? el.dataset.en : el.dataset.es;

    // HTML content (contains markup like <br>, <em>) — set directly, no scramble
    if (text.includes('<')) {
      el.innerHTML = text;
      el.classList.add('glitch-text');
      el.addEventListener('animationend', () => el.classList.remove('glitch-text'), { once: true });
      return;
    }

    // Nav contact link: preserve arrow
    if (el.classList.contains('nav-contact')) {
      el.innerHTML = text + ' <span>↗</span>';
      return;
    }

    // Buttons/links with child arrow span
    if ((el.tagName === 'A' || el.tagName === 'BUTTON') && el.querySelector('span')) {
      const arrow = el.querySelector('span').outerHTML;
      el.innerHTML = text + ' ' + arrow;
      return;
    }

    // Plain text — scramble it
    scrambleText(el, text, 1400);
  });

  document.documentElement.lang = lang;
  document.title = lang === 'en'
    ? 'Ignacio Vilchis | Portfolio'
    : 'Ignacio Vilchis | Portafolio';

  translateLabel.textContent = lang === 'en' ? 'ES' : 'EN';
  translateBtn.setAttribute('aria-label', lang === 'en' ? 'Traducir al español' : 'Translate to English');

  const isExpanded = gameMoreButton.getAttribute('aria-expanded') === 'true';
  gameMoreButton.innerHTML = isExpanded
    ? (lang === 'en' ? 'Hide file <span>↑</span>' : 'Ocultar archivo <span>↑</span>')
    : (lang === 'en' ? 'Discover the project <span>↓</span>' : 'Descubrir el proyecto <span>↓</span>');
}

function triggerGlitch(callback) {
  if (glitching) return;
  glitching = true;

  // Visual overlay flash
  glitchOverlay.classList.add('active');
  document.body.classList.add('glitching');

  // Swap content mid-flash at peak opacity (~300ms in)
  setTimeout(callback, 300);

  // Clean up after animation finishes
  setTimeout(() => {
    glitchOverlay.classList.remove('active');
    document.body.classList.remove('glitching');
    glitching = false;
  }, 2100);
}

translateBtn.addEventListener('click', () => {
  triggerGlitch(() => {
    currentLang = currentLang === 'es' ? 'en' : 'es';
    applyTranslation(currentLang);
  });
});
