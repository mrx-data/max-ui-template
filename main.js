(function () {
  const body = document.body;
  const canvas = document.getElementById("atmosphere");
  const toast = document.querySelector(".toast");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const state = {
    width: 0,
    height: 0,
    ratio: 1,
    frameId: 0,
    time: 0,
    points: [],
    streaks: [],
    blobs: [],
    trails: []
  };

  const context = canvas ? canvas.getContext("2d", { alpha: true }) : null;

  function cssValue(name, fallback) {
    return getComputedStyle(body).getPropertyValue(name).trim() || fallback;
  }

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function resetCanvas() {
    if (!canvas || !context) return;
    state.ratio = Math.min(window.devicePixelRatio || 1, 2);
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    canvas.width = Math.floor(state.width * state.ratio);
    canvas.height = Math.floor(state.height * state.ratio);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    context.setTransform(state.ratio, 0, 0, state.ratio, 0, 0);
    seedScene();
  }

  function seedScene() {
    state.points = [];
    state.streaks = [];
    state.blobs = [];
    state.trails = [];

    const density = Math.max(32, Math.floor((state.width * state.height) / 36000));
    for (let index = 0; index < density; index += 1) {
      state.points.push({
        x: Math.random() * state.width,
        y: Math.random() * state.height,
        vx: random(-0.22, 0.22),
        vy: random(-0.22, 0.22),
        size: random(1, 2.8),
        tone: Math.random()
      });
    }

    for (let index = 0; index < 18; index += 1) {
      state.streaks.push({
        x: Math.random() * state.width,
        y: Math.random() * state.height,
        speed: random(0.8, 2.8),
        length: random(80, 220)
      });
    }

    for (let index = 0; index < 8; index += 1) {
      state.blobs.push({
        x: Math.random() * state.width,
        y: Math.random() * state.height,
        r: random(70, 190),
        vx: random(-0.32, 0.32),
        vy: random(-0.22, 0.22),
        hue: index
      });
    }
  }

  function lineBetween(a, b, color, maxDistance) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxDistance) return;
    context.strokeStyle = color((1 - distance / maxDistance) * 0.16);
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(a.x, a.y);
    context.lineTo(b.x, b.y);
    context.stroke();
  }

  function drawParticleField(colors) {
    state.points.forEach((point, index) => {
      if (!reducedMotion.matches) {
        point.x += point.vx;
        point.y += point.vy;
      }
      if (point.x < -20) point.x = state.width + 20;
      if (point.x > state.width + 20) point.x = -20;
      if (point.y < -20) point.y = state.height + 20;
      if (point.y > state.height + 20) point.y = -20;

      const color = point.tone > 0.68 ? colors[0] : point.tone > 0.36 ? colors[1] : colors[2];
      context.fillStyle = color;
      context.beginPath();
      context.arc(point.x, point.y, point.size, 0, Math.PI * 2);
      context.fill();

      for (let next = index + 1; next < Math.min(state.points.length, index + 7); next += 1) {
        lineBetween(point, state.points[next], (opacity) => `rgba(18, 20, 18, ${opacity})`, 150);
      }
    });
  }

  const scenes = {
    homeScene() {
      context.fillStyle = "rgba(79, 156, 131, 0.025)";
      context.fillRect(0, 0, state.width, state.height);
      drawParticleField(["rgba(79, 156, 131, 0.18)", "rgba(233, 98, 76, 0.16)", "rgba(18, 20, 18, 0.12)"]);
    },
    modernScene() {
      const theme = body.dataset.modernTheme || "light";
      const accent = cssValue("--accent", "#4f9c83");
      const accentTwo = cssValue("--accent-2", "#7956ff");
      drawParticleField([
        `${accent}33`,
        `${accentTwo}2b`,
        theme === "dark" ? "rgba(238, 245, 240, 0.12)" : "rgba(18, 20, 18, 0.1)"
      ]);
      const gradient = context.createLinearGradient(0, 0, state.width, state.height);
      gradient.addColorStop(0, `${accent}14`);
      gradient.addColorStop(1, `${accentTwo}14`);
      context.fillStyle = gradient;
      context.fillRect(0, 0, state.width, state.height);
    },
    cyberScene() {
      const signal = Number(cssValue("--signal", "42"));
      context.strokeStyle = "rgba(66, 235, 255, 0.14)";
      context.lineWidth = 1;
      const grid = 44;
      for (let x = (state.time * 0.25) % grid; x < state.width; x += grid) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x - state.height * 0.16, state.height);
        context.stroke();
      }
      for (let y = (state.time * 0.2) % grid; y < state.height; y += grid) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(state.width, y);
        context.stroke();
      }
      state.streaks.forEach((streak) => {
        if (!reducedMotion.matches) streak.y += streak.speed + signal / 80;
        if (streak.y > state.height + streak.length) {
          streak.y = -streak.length;
          streak.x = Math.random() * state.width;
        }
        const glow = context.createLinearGradient(streak.x, streak.y - streak.length, streak.x, streak.y);
        glow.addColorStop(0, "rgba(66, 235, 255, 0)");
        glow.addColorStop(1, "rgba(66, 235, 255, 0.42)");
        context.strokeStyle = glow;
        context.beginPath();
        context.moveTo(streak.x, streak.y - streak.length);
        context.lineTo(streak.x, streak.y);
        context.stroke();
      });
    },
    trendScene() {
      const palette = ["rgba(255, 79, 154, 0.24)", "rgba(0, 184, 255, 0.22)", "rgba(110, 255, 106, 0.2)"];
      context.fillStyle = "rgba(255, 79, 154, 0.035)";
      context.fillRect(0, 0, state.width, state.height);
      state.blobs.forEach((blob) => {
        if (!reducedMotion.matches) {
          blob.x += blob.vx;
          blob.y += blob.vy;
        }
        if (blob.x < -blob.r) blob.x = state.width + blob.r;
        if (blob.x > state.width + blob.r) blob.x = -blob.r;
        if (blob.y < -blob.r) blob.y = state.height + blob.r;
        if (blob.y > state.height + blob.r) blob.y = -blob.r;
        context.fillStyle = palette[blob.hue % palette.length];
        context.beginPath();
        context.arc(blob.x, blob.y, blob.r + Math.sin(state.time / 40 + blob.hue) * 18, 0, Math.PI * 2);
        context.fill();
      });
      state.trails.forEach((trail, index) => {
        trail.life -= 1;
        context.fillStyle = `rgba(23, 19, 15, ${trail.life / 70})`;
        context.beginPath();
        context.arc(trail.x, trail.y, Math.max(2, trail.life / 8), 0, Math.PI * 2);
        context.fill();
        if (trail.life <= 0) state.trails.splice(index, 1);
      });
    },
    transitionScene() {}
  };

  function drawFrame() {
    if (!context) return;
    context.clearRect(0, 0, state.width, state.height);
    state.time += 1;
    const sceneName = `${body.dataset.scene || "home"}Scene`;
    const scene = scenes[sceneName] || scenes.homeScene;
    scene();
    if (!reducedMotion.matches) {
      state.frameId = window.requestAnimationFrame(drawFrame);
    }
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 1800);
  }

  function fallbackCopy(text) {
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

  function initCopyButtons() {
    document.querySelectorAll("[data-copy]").forEach((button) => {
      const originalText = button.textContent.trim();
      button.addEventListener("click", async () => {
        const target = document.getElementById(button.dataset.copy);
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
        } catch (error) {
          showToast("复制失败，请手动选择提示词");
        }
      });
    });
  }

  function initTemplateLinks() {
    document.querySelectorAll("[data-template-link]").forEach((link) => {
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

  function initTabs() {
    document.querySelectorAll("[data-tab-group]").forEach((group) => {
      const tabs = [...group.querySelectorAll("[role='tab'][data-tab]")];
      const panels = [...group.querySelectorAll("[role='tabpanel'][data-tab-panel]")];
      if (!tabs.length || !panels.length) return;

      function activateTab(tab, shouldFocus) {
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

  function initAccordions() {
    document.querySelectorAll("[data-accordion]").forEach((accordion) => {
      const triggers = [...accordion.querySelectorAll("[data-accordion-trigger]")];
      function setOpen(trigger, open) {
        const panel = document.getElementById(trigger.getAttribute("aria-controls"));
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

  function initModals() {
    let activeModal = null;
    let lastTrigger = null;

    function closeModal(modal) {
      if (!modal) return;
      modal.classList.remove("is-open");
      body.classList.remove("has-modal");
      window.setTimeout(() => {
        modal.hidden = true;
      }, reducedMotion.matches ? 0 : 180);
      if (lastTrigger) lastTrigger.focus();
      activeModal = null;
    }

    function openModal(name, trigger) {
      const modal = document.querySelector(`[data-modal="${name}"]`);
      if (!modal) return;
      activeModal = modal;
      lastTrigger = trigger;
      modal.hidden = false;
      body.classList.add("has-modal");
      window.requestAnimationFrame(() => {
        modal.classList.add("is-open");
        const dialog = modal.querySelector("[role='dialog']");
        if (dialog) dialog.focus();
      });
    }

    document.querySelectorAll("[data-modal-trigger]").forEach((trigger) => {
      trigger.addEventListener("click", () => openModal(trigger.dataset.modalTrigger, trigger));
    });

    document.querySelectorAll("[data-modal]").forEach((modal) => {
      modal.addEventListener("click", (event) => {
        if (event.target === modal || event.target.closest("[data-modal-close]")) {
          closeModal(modal);
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && activeModal) closeModal(activeModal);
    });
  }

  function initDemoForms() {
    document.querySelectorAll("[data-form-demo]").forEach((form) => {
      form.setAttribute("novalidate", "");
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const fields = [...form.querySelectorAll("input[required]")];
        let firstInvalid = null;

        fields.forEach((field) => {
          const message = field.closest("label")?.querySelector("[data-field-error]");
          const empty = !field.value.trim();
          const badEmail = field.type === "email" && field.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
          const error = empty ? "请填写这一项" : badEmail ? "请输入有效邮箱" : "";
          field.classList.toggle("is-invalid", Boolean(error));
          field.setAttribute("aria-invalid", String(Boolean(error)));
          if (message) message.textContent = error;
          if (error && !firstInvalid) firstInvalid = field;
        });

        if (firstInvalid) {
          firstInvalid.focus();
          return;
        }

        const submit = form.querySelector("[type='submit']");
        const originalText = submit ? submit.textContent : "";
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

  function initCarousels() {
    document.querySelectorAll("[data-carousel]").forEach((carousel) => {
      const slides = [...carousel.querySelectorAll("[data-carousel-slide]")];
      const dots = [...carousel.querySelectorAll("[data-carousel-dot]")];
      const previous = carousel.querySelector("[data-carousel-prev]");
      const next = carousel.querySelector("[data-carousel-next]");
      if (!slides.length) return;
      let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));

      function activateSlide(nextIndex) {
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

  function initPriceToggles() {
    document.querySelectorAll("[data-price-toggle]").forEach((card) => {
      const buttons = [...card.querySelectorAll("[data-price-period]")];
      const value = card.querySelector("[data-price-value]");
      const note = card.querySelector("[data-price-note]");
      function setPeriod(period) {
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

  function initModernTheme() {
    const buttons = [...document.querySelectorAll("[data-theme-option]")];
    if (!buttons.length) return;
    const stored = window.localStorage.getItem("ui-template-modern-theme") || "light";
    function setTheme(theme) {
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

  function initCyberDemo() {
    const range = document.querySelector("[data-signal-range]");
    const status = document.querySelector("[data-cyber-status]");
    const demo = document.querySelector(".cyber-demo");
    const nodes = [...document.querySelectorAll("[data-cyber-node]")];
    const presets = [...document.querySelectorAll("[data-signal-preset]")];
    if (!range || !status || !demo) return;
    function updateSignal(value) {
      body.style.setProperty("--signal", value);
      status.textContent = `SYNC ${value}%`;
      presets.forEach((button) => {
        const active = button.dataset.signalPreset === String(value);
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    }
    range.addEventListener("input", () => updateSignal(range.value));
    presets.forEach((button) => {
      button.addEventListener("click", () => {
        range.value = button.dataset.signalPreset;
        updateSignal(button.dataset.signalPreset);
        demo.classList.remove("is-glitch");
        void demo.offsetWidth;
        demo.classList.add("is-glitch");
      });
    });
    nodes.forEach((node, index) => {
      node.addEventListener("click", () => {
        nodes.forEach((item) => item.classList.remove("is-active"));
        node.classList.add("is-active");
        updateSignal(String(42 + index * 13));
        range.value = String(42 + index * 13);
        demo.classList.remove("is-glitch");
        void demo.offsetWidth;
        demo.classList.add("is-glitch");
      });
    });
    updateSignal(range.value);
  }

  function initVariantSelectors() {
    document.querySelectorAll("[data-variant-selector]").forEach((selector) => {
      const title = selector.querySelector("[data-variant-title]");
      const copy = selector.querySelector("[data-variant-copy]");
      const buttons = [...selector.querySelectorAll("[data-variant-option]")];
      buttons.forEach((button, index) => {
        button.addEventListener("click", () => {
          buttons.forEach((item) => {
            const active = item === button;
            item.classList.toggle("is-active", active);
            item.setAttribute("aria-pressed", String(active));
          });
          if (title) title.textContent = button.dataset.variantOption;
          if (copy) copy.textContent = ["酸性色适合高能首屏。", "蓝色适合冷感作品集。", "粉色适合限量 drop。"][index] || copy.textContent;
        });
      });
    });
  }

  function initDragCards() {
    document.querySelectorAll("[data-drag-card]").forEach((card) => {
      let origin = null;
      function release() {
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

  function initTrendDemo() {
    const button = document.querySelector("[data-trend-cycle]");
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
      if (state.trails.length > 90) state.trails.shift();
      state.trails.push({ x: event.clientX, y: event.clientY, life: 64 });
    });
  }

  if (canvas && context) {
    window.addEventListener("resize", () => {
      window.cancelAnimationFrame(state.frameId);
      resetCanvas();
      drawFrame();
    });
    resetCanvas();
    drawFrame();
  }

  initCopyButtons();
  initTemplateLinks();
  initTabs();
  initAccordions();
  initModals();
  initDemoForms();
  initCarousels();
  initPriceToggles();
  initModernTheme();
  initCyberDemo();
  initVariantSelectors();
  initDragCards();
  initTrendDemo();
})();
