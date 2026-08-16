// Footer year + "returned from WhatsApp" toast helpers for index.html.
document.getElementById('footer-year').textContent = new Date().getFullYear();

const WA_PENDING_KEY = 'gatoweb_wa_pending';
let waToastTimer = null;

function markWhatsAppIntent() {
  try {
    localStorage.setItem(WA_PENDING_KEY, String(Date.now()));
  } catch (e) {}
}

function hideWhatsAppToast() {
  const toast = document.getElementById('wa-return-toast');
  if (!toast) return;
  toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
  toast.setAttribute('aria-hidden', 'true');
}

function showWhatsAppToast() {
  const toast = document.getElementById('wa-return-toast');
  if (!toast) return;
  toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
  toast.setAttribute('aria-hidden', 'false');
  if (waToastTimer) clearTimeout(waToastTimer);
  waToastTimer = setTimeout(hideWhatsAppToast, 9000);
}

function maybeShowWhatsAppToast() {
  let startedAt = 0;
  try {
    startedAt = Number(localStorage.getItem(WA_PENDING_KEY) || '0');
  } catch (e) {}
  if (!startedAt) return;
  if (Date.now() - startedAt < 1500) return;
  try {
    localStorage.removeItem(WA_PENDING_KEY);
  } catch (e) {}
  showWhatsAppToast();
}

window.addEventListener('focus', maybeShowWhatsAppToast);
window.addEventListener('pageshow', maybeShowWhatsAppToast);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) maybeShowWhatsAppToast();
});

// Covers the case where the browser restores the tab after returning from the app.
setTimeout(maybeShowWhatsAppToast, 400);
