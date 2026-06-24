const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const header = document.querySelector("[data-header]");
const scrollProgress = document.querySelector(".scroll-progress");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLAnchorElement) {
      nav.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

if (header) {
  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

if (scrollProgress) {
  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    document.documentElement.style.setProperty("--scroll-progress", Math.min(Math.max(progress, 0), 1).toFixed(4));
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
}

const gridLockedSections = document.querySelectorAll(".hero, .team-section, .section-dark, .cta-section");

if (gridLockedSections.length) {
  let gridFrame = null;

  const updateGridLock = () => {
    gridFrame = null;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    gridLockedSections.forEach((section) => {
      const offset = scrollY - section.offsetTop;
      section.style.setProperty("--grid-lock-y", `${offset.toFixed(2)}px`);
    });
  };

  const requestGridLock = () => {
    if (gridFrame === null) {
      gridFrame = window.requestAnimationFrame(updateGridLock);
    }
  };

  updateGridLock();
  window.addEventListener("scroll", requestGridLock, { passive: true });
  window.addEventListener("resize", requestGridLock);
}

if (window.matchMedia("(pointer: fine)").matches) {
  const spotlightTargets = document.querySelectorAll(
    ".case-window, .premium-showcase article, .area-card, .lawyer-card, .method-list li, .insight-grid article"
  );

  spotlightTargets.forEach((target) => {
    target.addEventListener("pointermove", (event) => {
      const rect = target.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      target.style.setProperty("--spotlight-x", `${x.toFixed(2)}%`);
      target.style.setProperty("--spotlight-y", `${y.toFixed(2)}%`);
    });
  });
}

const revealTargets = document.querySelectorAll(
  ".section-heading, .case-window, .premium-showcase article, .area-card, .lawyer-card, .method-list li, .insight-grid article, .cta-inner, .hero-actions, .proof-row"
);

if (revealTargets.length) {
  revealTargets.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.16,
      }
    );

    revealTargets.forEach((element) => observer.observe(element));
  } else {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
  }
}

const transitionPanels = document.querySelectorAll(".team-section > .split, .section-dark > .method-layout");

if (transitionPanels.length && !reduceMotion) {
  let panelFrame = null;

  transitionPanels.forEach((panel) => panel.classList.add("dark-flow-panel"));

  const updatePanels = () => {
    panelFrame = null;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportCenter = viewportHeight / 2;

    transitionPanels.forEach((panel) => {
      const rect = panel.getBoundingClientRect();
      const panelCenter = rect.top + rect.height / 2;
      const distance = Math.abs(panelCenter - viewportCenter);
      const progress = clampValue(1 - distance / (viewportHeight * 0.48), 0, 1);
      const direction = panelCenter < viewportCenter ? -1 : 1;
      const y = (1 - progress) * 58 * direction;
      const scale = 0.97 + progress * 0.03;

      panel.style.setProperty("--panel-opacity", progress.toFixed(3));
      panel.style.setProperty("--panel-y", `${y.toFixed(2)}px`);
      panel.style.setProperty("--panel-scale", scale.toFixed(3));
    });
  };

  const requestPanels = () => {
    if (panelFrame === null) {
      panelFrame = window.requestAnimationFrame(updatePanels);
    }
  };

  updatePanels();
  window.addEventListener("scroll", requestPanels, { passive: true });
  window.addEventListener("resize", requestPanels);
}

const flowTargets = document.querySelectorAll(".section-muted > .section-heading, #conteudo > .section-heading, .cta-inner");

if (flowTargets.length && !reduceMotion) {
  let flowFrame = null;

  flowTargets.forEach((element) => element.classList.add("scroll-flow"));

  const updateFlow = () => {
    flowFrame = null;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    flowTargets.forEach((element) => {
      if (!element.classList.contains("is-visible")) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const entering = clampValue((viewportHeight - rect.top) / (viewportHeight * 0.28), 0, 1);
      const leaving = clampValue((rect.bottom - viewportHeight * 0.14) / (viewportHeight * 0.34), 0, 1);
      const opacity = Math.min(entering, leaving);
      const yDirection = rect.top < viewportHeight * 0.18 ? -1 : 1;
      const offset = (1 - opacity) * 22 * yDirection;

      element.style.setProperty("--flow-opacity", opacity.toFixed(3));
      element.style.setProperty("--flow-y", `${offset.toFixed(2)}px`);
    });
  };

  const requestFlow = () => {
    if (flowFrame === null) {
      flowFrame = window.requestAnimationFrame(updateFlow);
    }
  };

  updateFlow();
  window.addEventListener("scroll", requestFlow, { passive: true });
  window.addEventListener("resize", requestFlow);
}
