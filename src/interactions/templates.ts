import { addTrailPoint } from "../canvas";
import { body, showToast } from "../dom";

export function initModernTheme(): void {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>("[data-theme-option]")];
  if (!buttons.length) return;
  const stored = window.localStorage.getItem("ui-template-modern-theme") || "light";
  function setTheme(theme: string | undefined): void {
    if (!theme) return;
    body.dataset.modernTheme = theme;
    window.localStorage.setItem("ui-template-modern-theme", theme);
    buttons.forEach((button) => {
      const active = button.dataset.themeOption === theme;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }
  buttons.forEach((button) => {
    button.addEventListener("click", () => setTheme(button.dataset.themeOption));
  });
  setTheme(stored);
}

export function initCyberDemo(): void {
  const range = document.querySelector<HTMLInputElement>("[data-signal-range]");
  const status = document.querySelector<HTMLElement>("[data-cyber-status]");
  const demo = document.querySelector<HTMLElement>(".cyber-demo");
  const nodes = [...document.querySelectorAll<HTMLButtonElement>("[data-cyber-node]")];
  const presets = [...document.querySelectorAll<HTMLButtonElement>("[data-signal-preset]")];
  if (!range || !status || !demo) return;
  const statusElement = status;
  const demoElement = demo;
  function updateSignal(value: string): void {
    body.style.setProperty("--signal", value);
    statusElement.textContent = `SYNC ${value}%`;
    presets.forEach((button) => {
      const active = button.dataset.signalPreset === String(value);
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }
  range.addEventListener("input", () => updateSignal(range.value));
  presets.forEach((button) => {
    button.addEventListener("click", () => {
      if (!button.dataset.signalPreset) return;
      range.value = button.dataset.signalPreset;
      updateSignal(button.dataset.signalPreset);
      demoElement.classList.remove("is-glitch");
      void demoElement.offsetWidth;
      demoElement.classList.add("is-glitch");
    });
  });
  nodes.forEach((node, index) => {
    node.addEventListener("click", () => {
      nodes.forEach((item) => item.classList.remove("is-active"));
      node.classList.add("is-active");
      updateSignal(String(42 + index * 13));
      range.value = String(42 + index * 13);
      demoElement.classList.remove("is-glitch");
      void demoElement.offsetWidth;
      demoElement.classList.add("is-glitch");
    });
  });
  updateSignal(range.value);
}

export function initVariantSelectors(): void {
  document.querySelectorAll<HTMLElement>("[data-variant-selector]").forEach((selector) => {
    const title = selector.querySelector<HTMLElement>("[data-variant-title]");
    const copy = selector.querySelector<HTMLElement>("[data-variant-copy]");
    const buttons = [...selector.querySelectorAll<HTMLButtonElement>("[data-variant-option]")];
    buttons.forEach((button, index) => {
      button.addEventListener("click", () => {
        buttons.forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        if (title && button.dataset.variantOption) title.textContent = button.dataset.variantOption;
        if (copy) copy.textContent = ["酸性色适合高能首屏。", "蓝色适合冷感作品集。", "粉色适合限量 drop。"][index] || copy.textContent;
      });
    });
  });
}

export function initDragCards(): void {
  document.querySelectorAll<HTMLElement>("[data-drag-card]").forEach((card) => {
    let origin: { x: number; y: number } | null = null;
    function release(): void {
      origin = null;
      card.classList.remove("is-dragging");
      card.style.transform = "";
    }
    card.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      origin = { x: event.clientX, y: event.clientY };
      card.classList.add("is-dragging");
      card.setPointerCapture(event.pointerId);
    });
    card.addEventListener("pointermove", (event) => {
      if (!origin) return;
      const dx = event.clientX - origin.x;
      const dy = event.clientY - origin.y;
      card.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 24}deg)`;
    });
    card.addEventListener("pointerup", release);
    card.addEventListener("pointercancel", release);
    card.addEventListener("lostpointercapture", release);
  });
}

export function initTrendDemo(): void {
  const button = document.querySelector<HTMLButtonElement>("[data-trend-cycle]");
  if (!button) return;
  const variants = ["yellow", "blue", "pink"];
  let index = 0;
  body.dataset.trendVariant = variants[index];
  button.addEventListener("click", () => {
    index = (index + 1) % variants.length;
    body.dataset.trendVariant = variants[index];
    showToast(`视觉片段：${variants[index]}`);
  });
  window.addEventListener("pointermove", (event) => {
    addTrailPoint(event.clientX, event.clientY);
  });
}

export function initPortfolioDemo(): void {
  const reel = document.querySelector<HTMLElement>("[data-portfolio-reel]");
  const reelToggle = document.querySelector<HTMLButtonElement>("[data-portfolio-reel-toggle]");
  if (reel && reelToggle) {
    reelToggle.addEventListener("click", () => {
      const paused = reel.classList.toggle("is-paused");
      reelToggle.setAttribute("aria-pressed", String(!paused));
      reelToggle.textContent = paused ? "Play reel" : "Pause reel";
    });
  }

  const filters = [...document.querySelectorAll<HTMLButtonElement>("[data-portfolio-filter]")];
  const cards = [...document.querySelectorAll<HTMLElement>("[data-portfolio-card]")];
  if (!filters.length || !cards.length) return;

  function setFilter(filter: string): void {
    filters.forEach((button) => {
      const active = button.dataset.portfolioFilter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    cards.forEach((card) => {
      const categories = (card.dataset.category || "").split(/\s+/);
      const visible = filter === "all" || categories.includes(filter);
      card.hidden = !visible;
      card.classList.toggle("is-filtered-out", !visible);
    });
    showToast(filter === "all" ? "显示全部作品" : `筛选：${filter}`);
  }

  filters.forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.portfolioFilter || "all"));
  });
}
