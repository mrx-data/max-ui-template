import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { body, reducedMotion } from "../dom";

gsap.registerPlugin(ScrollTrigger);

function all<T extends HTMLElement>(selector: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

function buildHeroTimeline(): gsap.core.Timeline {
  const nav = document.querySelector<HTMLElement>("[data-motion-nav]");
  const titleLines = all<HTMLElement>("[data-hero-title] .title-line > span");
  const heroItems = all<HTMLElement>("[data-hero-item]");
  const stage = document.querySelector<HTMLElement>("[data-motion-stage]");
  const stageItems = all<HTMLElement>("[data-motion-stage] [data-stagger-item]");
  const reelImage = document.querySelector<HTMLElement>("[data-motion-stage] [data-motion-image]");
  const timeline = gsap.timeline({ defaults: { ease: "power4.out" } });

  if (nav) timeline.to(nav, { y: 0, autoAlpha: 1, duration: 0.75 }, 0);
  if (titleLines.length) {
    timeline.to(
      titleLines,
      {
        yPercent: 0,
        scaleY: 1,
        rotate: 0,
        duration: 1.25,
        stagger: 0.14
      },
      0.1
    );
  }
  if (heroItems.length) {
    timeline.to(heroItems, { y: 0, autoAlpha: 1, duration: 0.95, stagger: 0.12 }, 0.48);
  }
  if (stage) {
    timeline.to(
      stage,
      {
        y: 0,
        scale: 1,
        autoAlpha: 1,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.15
      },
      0.55
    );
  }
  if (reelImage) {
    timeline.to(reelImage, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.05 }, 0.85);
  }
  if (stageItems.length) {
    timeline.to(stageItems, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.12 }, 0.95);
  }

  return timeline;
}

function initOpeningAnimation(): void {
  const opening = document.querySelector<HTMLElement>("[data-portfolio-opening]");
  const counter = document.querySelector<HTMLElement>("[data-opening-counter]");
  const openingWord = opening?.querySelector<HTMLElement>(".opening-word");
  const openingLabel = opening?.querySelector<HTMLElement>(".opening-label");
  const openingSlit = opening?.querySelector<HTMLElement>(".opening-slit");
  const nav = document.querySelector<HTMLElement>("[data-motion-nav]");
  const titleLines = all<HTMLElement>("[data-hero-title] .title-line > span");
  const heroItems = all<HTMLElement>("[data-hero-item]");
  const stage = document.querySelector<HTMLElement>("[data-motion-stage]");
  const stageItems = all<HTMLElement>("[data-motion-stage] [data-stagger-item]");
  const reelImage = document.querySelector<HTMLElement>("[data-motion-stage] [data-motion-image]");
  const count = { value: 0 };

  gsap.set([nav, ...heroItems, ...stageItems].filter(Boolean), { autoAlpha: 0, y: 34 });
  gsap.set(titleLines, {
    yPercent: 118,
    scaleY: 0.58,
    rotate: 2,
    transformOrigin: "50% 100%"
  });
  if (stage) {
    gsap.set(stage, {
      autoAlpha: 0,
      y: 90,
      scale: 0.96,
      clipPath: "inset(18% 0% 0% 0%)",
      transformOrigin: "50% 80%"
    });
  }
  if (nav) gsap.set(nav, { y: -30 });
  if (reelImage) gsap.set(reelImage, { clipPath: "inset(0% 100% 0% 0%)", scale: 1.08 });

  if (!opening) {
    buildHeroTimeline().play(0);
    return;
  }

  body.classList.add("has-portfolio-opening");
  const timeline = gsap.timeline({
    defaults: { ease: "expo.inOut" },
    onComplete: () => {
      body.classList.remove("has-portfolio-opening");
      opening.hidden = true;
      gsap.set(body, { clearProps: "overflow" });
    }
  });

  timeline.set(body, { overflow: "hidden" }).set(opening, { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)" });
  if (openingLabel) {
    timeline.fromTo(openingLabel, { yPercent: 120, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.75 }, 0.05);
  }
  if (openingWord) {
    timeline.fromTo(openingWord, { yPercent: 115, scaleY: 0.6 }, { yPercent: 0, scaleY: 1, duration: 0.95 }, 0.16);
  }
  if (openingSlit) {
    timeline.fromTo(openingSlit, { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 1.1 }, 0.26);
  }
  timeline
    .to(
      count,
      {
        value: 100,
        duration: 1.55,
        ease: "power3.inOut",
        onUpdate: () => {
          if (counter) counter.textContent = String(Math.round(count.value)).padStart(2, "0");
        }
      },
      0
    )
    .to(opening, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.05 }, 1.5)
    .add(buildHeroTimeline(), 1.18)
    .set(opening, { autoAlpha: 0 });
}

function initSectionTimelines(): void {
  all<HTMLElement>("[data-motion-section]").forEach((section) => {
    const displayTitle = section.querySelector<HTMLElement>("[data-motion-title]");
    const items = all<HTMLElement>("[data-stagger-item]", section);
    const images = all<HTMLElement>("[data-motion-image]", section);
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 72%",
        once: true
      },
      defaults: { ease: "power4.out" }
    });

    if (displayTitle) {
      gsap.set(displayTitle, {
        y: 130,
        scaleX: 0.74,
        autoAlpha: 0,
        filter: "blur(14px)",
        transformOrigin: "0% 50%"
      });
      timeline.to(displayTitle, {
        y: 0,
        scaleX: 1,
        autoAlpha: 1,
        filter: "blur(0px)",
        duration: 1.25
      });
    }

    if (images.length) {
      gsap.set(images, { clipPath: "inset(0% 100% 0% 0%)", scale: 1.08, transformOrigin: "50% 50%" });
      timeline.to(
        images,
        {
          clipPath: "inset(0% 0% 0% 0%)",
          scale: 1,
          duration: 1.15,
          stagger: 0.1
        },
        displayTitle ? "-=0.82" : 0
      );
    }

    if (items.length) {
      gsap.set(items, { y: 84, autoAlpha: 0, clipPath: "inset(18% 0% 0% 0%)" });
      timeline.to(
        items,
        {
          y: 0,
          autoAlpha: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1,
          stagger: 0.13
        },
        displayTitle ? "-=0.62" : 0
      );
    }
  });
}

function initPortfolioParallax(): void {
  if (!window.matchMedia("(min-width: 760px)").matches) return;
  all<HTMLElement>("[data-motion-parallax]").forEach((element) => {
    gsap.to(element, {
      yPercent: -7,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.9
      }
    });
  });
}

export function initPortfolioMotion(): void {
  if (body.dataset.scene !== "portfolio") return;
  body.classList.add("has-portfolio-motion");

  if (reducedMotion.matches) {
    document.querySelector<HTMLElement>("[data-portfolio-opening]")?.setAttribute("hidden", "");
    body.classList.add("portfolio-motion-reduced");
    return;
  }

  ScrollTrigger.config({ ignoreMobileResize: true });
  initOpeningAnimation();
  initSectionTimelines();
  initPortfolioParallax();
  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
}
