// ======================================
// 1. Базовая инициализация
// ======================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("Emozika site JS loaded");

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ======================================
  // 2. Анимация появления секций при скролле
  // ======================================

  const revealEls = document.querySelectorAll(".reveal-on-scroll");

  if (revealEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach((el) => observer.observe(el));
  }

  // ======================================
  // 3. Счётчики в блоке "Цифры и факты"
  // ======================================

  const statsSection = document.querySelector("#stats");
  const statNumbers = document.querySelectorAll(".stat-number[data-target]");

  if (statsSection && statNumbers.length) {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          if (prefersReducedMotion) {
            statNumbers.forEach((el) => {
              const target = parseInt(el.dataset.target, 10);
              const suffix = el.dataset.suffix || "";
              if (!isNaN(target)) {
                el.textContent = target + suffix;
              }
            });
          } else {
            statNumbers.forEach((el) => animateCounter(el));
          }

          statsObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.3 }
    );

    statsObserver.observe(statsSection);
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;

    const suffix = el.dataset.suffix || "";
    const duration = 800;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.floor(target * progress);
      el.textContent = value + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  // ======================================
  // 4. Связка CTA → форма контактов
  // ======================================

  const ctaButtons = document.querySelectorAll('[data-scroll-to="contacts-form"]');
  const contactsForm = document.getElementById("contacts-form");
  const phoneInput = document.getElementById("contact-phone");

  if (ctaButtons.length && contactsForm) {
    ctaButtons.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        contactsForm.scrollIntoView({ behavior: "smooth", block: "start" });

        setTimeout(() => {
          if (phoneInput) {
            phoneInput.focus();
          }
        }, 600);
      });
    });
  }

  // ======================================
  // 5. Общая обработка data-scroll-to
  // ======================================

  const scrollLinks = document.querySelectorAll("[data-scroll-to]");

  if (scrollLinks.length) {
    scrollLinks.forEach((link) => {
      const targetId = link.getAttribute("data-scroll-to");
      if (!targetId || targetId === "contacts-form") return;

      link.addEventListener("click", (event) => {
        const target = document.getElementById(targetId);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }
});
