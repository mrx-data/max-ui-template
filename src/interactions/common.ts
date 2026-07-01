import { body, reducedMotion, showToast } from "../dom";

function fallbackCopy(text: string): boolean {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  const result = document.execCommand("copy");
  document.body.removeChild(area);
  return result;
}

export function initCopyButtons(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => {
    const originalText = button.textContent?.trim() || "";
    button.addEventListener("click", async () => {
      const targetId = button.dataset.copy;
      const target = targetId ? document.getElementById(targetId) : null;
      const text = target ? target.innerText.trim() : "";
      if (!text) {
        showToast("没有找到提示词");
        return;
      }
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else if (!fallbackCopy(text)) {
          throw new Error("copy failed");
        }
        button.textContent = "已复制";
        button.classList.add("is-copied");
        showToast("提示词已复制");
        window.setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove("is-copied");
        }, 1500);
      } catch {
        showToast("复制失败，请手动选择提示词");
      }
    });
  });
}

export function initTemplateLinks(): void {
  document.querySelectorAll<HTMLAnchorElement>("[data-template-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || reducedMotion.matches) return;
      event.preventDefault();
      const rect = link.getBoundingClientRect();
      body.style.setProperty("--tx", `${rect.left + rect.width / 2}px`);
      body.style.setProperty("--ty", `${rect.top + rect.height / 2}px`);
      body.classList.add("is-transitioning");
      window.setTimeout(() => {
        window.location.href = href;
      }, 430);
    });
  });
}

export function initTabs(): void {
  document.querySelectorAll<HTMLElement>("[data-tab-group]").forEach((group) => {
    const tabs = [...group.querySelectorAll<HTMLButtonElement>("[role='tab'][data-tab]")];
    const panels = [...group.querySelectorAll<HTMLElement>("[role='tabpanel'][data-tab-panel]")];
    if (!tabs.length || !panels.length) return;

    function activateTab(tab: HTMLButtonElement, shouldFocus: boolean): void {
      const value = tab.dataset.tab;
      tabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
        item.setAttribute("tabindex", active ? "0" : "-1");
      });
      panels.forEach((panel) => {
        const active = panel.dataset.tabPanel === value;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });
      if (shouldFocus) tab.focus();
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activateTab(tab, false));
      tab.addEventListener("keydown", (event) => {
        const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
        if (!direction) return;
        event.preventDefault();
        activateTab(tabs[(index + direction + tabs.length) % tabs.length], true);
      });
    });

    activateTab(tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0], false);
  });
}

export function initAccordions(): void {
  document.querySelectorAll<HTMLElement>("[data-accordion]").forEach((accordion) => {
    const triggers = [...accordion.querySelectorAll<HTMLButtonElement>("[data-accordion-trigger]")];
    function setOpen(trigger: HTMLButtonElement, open: boolean): void {
      const panelId = trigger.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      trigger.setAttribute("aria-expanded", String(open));
      trigger.classList.toggle("is-open", open);
      if (panel) {
        panel.hidden = !open;
        panel.classList.toggle("is-open", open);
      }
    }
    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const willOpen = trigger.getAttribute("aria-expanded") !== "true";
        triggers.forEach((item) => setOpen(item, false));
        setOpen(trigger, willOpen);
      });
      setOpen(trigger, trigger.getAttribute("aria-expanded") === "true");
    });
  });
}

export function initModals(): void {
  let activeModal: HTMLElement | null = null;
  let lastTrigger: HTMLElement | null = null;

  function closeModal(modal: HTMLElement | null): void {
    if (!modal) return;
    modal.classList.remove("is-open");
    body.classList.remove("has-modal");
    window.setTimeout(() => {
      modal.hidden = true;
    }, reducedMotion.matches ? 0 : 180);
    if (lastTrigger) lastTrigger.focus();
    activeModal = null;
  }

  function openModal(name: string | undefined, trigger: HTMLElement): void {
    if (!name) return;
    const modal = document.querySelector<HTMLElement>(`[data-modal="${name}"]`);
    if (!modal) return;
    activeModal = modal;
    lastTrigger = trigger;
    modal.hidden = false;
    body.classList.add("has-modal");
    window.requestAnimationFrame(() => {
      modal.classList.add("is-open");
      const dialog = modal.querySelector<HTMLElement>("[role='dialog']");
      if (dialog) dialog.focus();
    });
  }

  document.querySelectorAll<HTMLElement>("[data-modal-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => openModal(trigger.dataset.modalTrigger, trigger));
  });

  document.querySelectorAll<HTMLElement>("[data-modal]").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      const target = event.target as Element | null;
      if (event.target === modal || target?.closest("[data-modal-close]")) {
        closeModal(modal);
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeModal) closeModal(activeModal);
  });
}

export function initDemoForms(): void {
  document.querySelectorAll<HTMLFormElement>("[data-form-demo]").forEach((form) => {
    form.setAttribute("novalidate", "");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const fields = [...form.querySelectorAll<HTMLInputElement>("input[required]")];
      let firstInvalid: HTMLInputElement | null = null;

      fields.forEach((field) => {
        const message = field.closest("label")?.querySelector<HTMLElement>("[data-field-error]");
        const empty = !field.value.trim();
        const badEmail = field.type === "email" && field.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
        const error = empty ? "请填写这一项" : badEmail ? "请输入有效邮箱" : "";
        field.classList.toggle("is-invalid", Boolean(error));
        field.setAttribute("aria-invalid", String(Boolean(error)));
        if (message) message.textContent = error;
        if (error && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid !== null) {
        (firstInvalid as HTMLInputElement).focus();
        return;
      }

      const submit = form.querySelector<HTMLButtonElement>("[type='submit']");
      const originalText = submit?.textContent || "";
      if (submit) {
        submit.disabled = true;
        submit.classList.add("is-loading");
        submit.textContent = "提交中...";
      }
      window.setTimeout(() => {
        showToast(form.dataset.successMessage || "已提交");
        form.reset();
        fields.forEach((field) => field.setAttribute("aria-invalid", "false"));
        if (submit) {
          submit.disabled = false;
          submit.classList.remove("is-loading");
          submit.textContent = originalText;
        }
      }, reducedMotion.matches ? 120 : 520);
    });
  });
}

export function initCarousels(): void {
  document.querySelectorAll<HTMLElement>("[data-carousel]").forEach((carousel) => {
    const slides = [...carousel.querySelectorAll<HTMLElement>("[data-carousel-slide]")];
    const dots = [...carousel.querySelectorAll<HTMLButtonElement>("[data-carousel-dot]")];
    const previous = carousel.querySelector<HTMLButtonElement>("[data-carousel-prev]");
    const next = carousel.querySelector<HTMLButtonElement>("[data-carousel-next]");
    if (!slides.length) return;
    let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));

    function activateSlide(nextIndex: number): void {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === index;
        slide.classList.toggle("is-active", active);
        slide.hidden = !active;
        if (active && slide.dataset.trendVariantValue) {
          body.dataset.trendVariant = slide.dataset.trendVariantValue;
        }
      });
      dots.forEach((dot, dotIndex) => {
        const active = dotIndex === index;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-current", active ? "true" : "false");
      });
    }

    previous?.addEventListener("click", () => activateSlide(index - 1));
    next?.addEventListener("click", () => activateSlide(index + 1));
    dots.forEach((dot) => {
      dot.addEventListener("click", () => activateSlide(Number(dot.dataset.carouselDot) || 0));
    });
    activateSlide(index);
  });
}

export function initPriceToggles(): void {
  document.querySelectorAll<HTMLElement>("[data-price-toggle]").forEach((card) => {
    const buttons = [...card.querySelectorAll<HTMLButtonElement>("[data-price-period]")];
    const value = card.querySelector<HTMLElement>("[data-price-value]");
    const note = card.querySelector<HTMLElement>("[data-price-note]");
    function setPeriod(period: string | undefined): void {
      if (!period) return;
      buttons.forEach((button) => {
        const active = button.dataset.pricePeriod === period;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      if (value) value.textContent = value.dataset[period] || value.textContent;
      if (note) {
        note.textContent =
          period === "yearly" ? "Yearly billing saves 20% for growing teams." : "Monthly billing for fast experiments.";
      }
    }
    buttons.forEach((button) => button.addEventListener("click", () => setPeriod(button.dataset.pricePeriod)));
    setPeriod("monthly");
  });
}
