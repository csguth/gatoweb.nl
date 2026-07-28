// Minimal, dependency-free carousel for the "About Lígia" bio (index.html
// #about-carousel-track). Native CSS scroll-snap already gives swipe/scroll
// support for free — this script only keeps the dot indicators in sync and
// wires up the prev/next buttons + arrow-key navigation.
(function () {
  const track = document.getElementById('about-carousel-track');
  const dotsContainer = document.getElementById('about-carousel-dots');
  const prevBtn = document.getElementById('about-carousel-prev');
  const nextBtn = document.getElementById('about-carousel-next');
  if (!track || !dotsContainer) return;

  const slides = Array.from(track.children);
  if (slides.length === 0) return;

  const dots = slides.map((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', 'Slide ' + (index + 1) + ' / ' + slides.length);
    dot.className = 'rounded-full transition-all h-2 w-2 bg-sage-200';
    dot.addEventListener('click', () => scrollToSlide(index));
    dotsContainer.appendChild(dot);
    return dot;
  });

  function scrollToSlide(index) {
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    slides[clamped].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  }

  function currentActiveIndex() {
    const found = dots.findIndex((dot) => dot.getAttribute('aria-selected') === 'true');
    return found === -1 ? 0 : found;
  }

  function setActiveDot(index) {
    dots.forEach((dot, i) => {
      const active = i === index;
      dot.classList.toggle('bg-sage-600', active);
      dot.classList.toggle('w-6', active);
      dot.classList.toggle('bg-sage-200', !active);
      dot.classList.toggle('w-2', !active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  // Keeps the active dot in sync while the user swipes/drags the track
  // directly, not just when using the prev/next buttons or dots.
  const observer = new IntersectionObserver(
    (entries) => {
      const mostVisible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!mostVisible) return;
      const index = slides.indexOf(mostVisible.target);
      if (index !== -1) setActiveDot(index);
    },
    { root: track, threshold: 0.6 }
  );
  slides.forEach((slide) => observer.observe(slide));

  if (prevBtn) prevBtn.addEventListener('click', () => scrollToSlide(currentActiveIndex() - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => scrollToSlide(currentActiveIndex() + 1));

  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollToSlide(currentActiveIndex() + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollToSlide(currentActiveIndex() - 1);
    }
  });

  setActiveDot(0);
})();
