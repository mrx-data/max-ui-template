export const body = document.body;
export const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const toast = document.querySelector<HTMLElement>(".toast");
let toastTimer = 0;

export function cssValue(name: string, fallback: string): string {
  return getComputedStyle(body).getPropertyValue(name).trim() || fallback;
}

export function random(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function showToast(message: string): void {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1800);
}
