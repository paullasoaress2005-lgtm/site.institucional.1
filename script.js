const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const header = document.querySelector("[data-header]");
const scrollProgress = document.querySelector(".scroll-progress");
const ambientCanvas = document.querySelector("[data-ambient-canvas]");

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

if (ambientCanvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const canvas = ambientCanvas;
  const context = canvas.getContext("2d");
  const particles = [];
  const particleCount = window.matchMedia("(max-width: 740px)").matches ? 34 : 72;
  let width = 0;
  let height = 0;
  let animationFrame = 0;

  const resetParticle = (particle, initial = false) => {
    particle.x = Math.random() * width;
    particle.y = initial ? Math.random() * height : -24;
    particle.length = 44 + Math.random() * 120;
    particle.speed = 0.22 + Math.random() * 0.7;
    particle.alpha = 0.08 + Math.random() * 0.22;
    particle.drift = -0.16 + Math.random() * 0.32;
  };

  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles.forEach((particle) => resetParticle(particle, true));
  };

  for (let index = 0; index < particleCount; index += 1) {
    const particle = {};
    particles.push(particle);
  }

  resizeCanvas();
  particles.forEach((particle) => resetParticle(particle, true));

  const draw = () => {
    context.clearRect(0, 0, width, height);

    const gradient = context.createRadialGradient(width * 0.72, height * 0.18, 0, width * 0.72, height * 0.18, Math.max(width, height) * 0.72);
    gradient.addColorStop(0, "rgba(216, 154, 0, 0.16)");
    gradient.addColorStop(1, "rgba(216, 154, 0, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    particles.forEach((particle) => {
      particle.x += particle.drift;
      particle.y += particle.speed;

      if (particle.y - particle.length > height || particle.x < -80 || particle.x > width + 80) {
        resetParticle(particle);
      }

      const line = context.createLinearGradient(particle.x, particle.y - particle.length, particle.x, particle.y);
      line.addColorStop(0, "rgba(255, 178, 26, 0)");
      line.addColorStop(0.55, `rgba(255, 178, 26, ${particle.alpha})`);
      line.addColorStop(1, "rgba(255, 255, 255, 0)");
      context.strokeStyle = line;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(particle.x, particle.y - particle.length);
      context.lineTo(particle.x + particle.drift * 24, particle.y);
      context.stroke();
    });

    animationFrame = window.requestAnimationFrame(draw);
  };

  draw();
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("pagehide", () => window.cancelAnimationFrame(animationFrame), { once: true });
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
