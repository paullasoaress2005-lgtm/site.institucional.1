const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const header = document.querySelector("[data-header]");
const scrollProgress = document.querySelector(".scroll-progress");

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

const flowTargets = document.querySelectorAll(".section-heading, .method-layout > div:first-child, .cta-inner");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (flowTargets.length && !reduceMotion) {
  let flowFrame = null;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  flowTargets.forEach((element) => element.classList.add("scroll-flow"));

  const updateFlow = () => {
    flowFrame = null;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    flowTargets.forEach((element) => {
      if (!element.classList.contains("is-visible")) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const entering = clamp((viewportHeight - rect.top) / (viewportHeight * 0.28), 0, 1);
      const leaving = clamp((rect.bottom - viewportHeight * 0.14) / (viewportHeight * 0.34), 0, 1);
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
