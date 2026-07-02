import { initCanvasScenes } from "./canvas";
import {
  initAccordions,
  initCarousels,
  initCopyButtons,
  initDemoForms,
  initModals,
  initPriceToggles,
  initTabs,
  initTemplateLinks
} from "./interactions/common";
import { initPortfolioMotion } from "./interactions/portfolio-motion";
import {
  initCyberDemo,
  initDragCards,
  initModernTheme,
  initPortfolioDemo,
  initTrendDemo,
  initVariantSelectors
} from "./interactions/templates";

initCanvasScenes();
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
initPortfolioDemo();
initPortfolioMotion();
