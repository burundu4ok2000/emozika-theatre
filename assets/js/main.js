// ======================================
// 1. Базовая инициализация
// ======================================

const ABONEMENTS_DATA_URL = 'assets/data/abonements.json';

document.addEventListener("DOMContentLoaded", () => {
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
  // 4. Общая обработка data-scroll-to
  // ======================================

  const scrollLinks = document.querySelectorAll("[data-scroll-to]");

  if (scrollLinks.length) {
    scrollLinks.forEach((link) => {
      const targetId = link.getAttribute("data-scroll-to");
      if (!targetId) return;

      link.addEventListener("click", (event) => {
        const target = document.getElementById(targetId);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  // ======================================
  // 5. Путь ученика в студии
  // ======================================

  const journey = document.querySelector(".studio-journey");

  if (journey) {
    const steps = Array.from(
      journey.querySelectorAll(".studio-journey-step[data-title][data-text]")
    );
    const journeyTrack = journey.querySelector(".studio-journey-track");
    const detailTitle = journey.querySelector(".studio-journey-detail-title");
    const detailText = journey.querySelector(".studio-journey-detail-text");

    function setActiveStep(step) {
      if (!step || !detailTitle || !detailText) {
        return;
      }

      const activeIndex = steps.indexOf(step);

      // подсвечиваем активный шаг и все пройденные
      steps.forEach((item, index) => {
        item.classList.toggle("is-active", item === step);
        item.classList.toggle(
          "is-past",
          activeIndex !== -1 && index < activeIndex
        );
      });

      const title = step.getAttribute("data-title") || "";
      const text = step.getAttribute("data-text") || "";

      detailTitle.textContent = title;
      detailText.textContent = text;

      // прогресс-линия в треке
      if (journeyTrack && steps.length > 1 && activeIndex !== -1) {
        const progress = (activeIndex / (steps.length - 1)) * 100;
        journeyTrack.style.setProperty("--journey-progress", progress + "%");
      }
    }

    // стартовое состояние
    let initiallyActive = journey.querySelector(
      ".studio-journey-step.is-active"
    );

    if (!initiallyActive && steps.length) {
      initiallyActive = steps[0];
    }

    if (initiallyActive) {
      setActiveStep(initiallyActive);
    }

    // --- авто-перелистывание шагов ---

    let autoRotateId = null;
    const AUTO_ROTATE_INTERVAL = 8000; // 8 секунд на шаг

    function stopAutoRotate() {
      if (autoRotateId !== null) {
        window.clearInterval(autoRotateId);
        autoRotateId = null;
      }
    }

    function startAutoRotate() {
      // уважаем prefers-reduced-motion и защищаемся от пустого списка шагов
      if (prefersReducedMotion || steps.length <= 1) {
        return;
      }

      stopAutoRotate();

      autoRotateId = window.setInterval(() => {
        const current =
          journey.querySelector(".studio-journey-step.is-active") || steps[0];
        const currentIndex = steps.indexOf(current);
        const nextIndex = (currentIndex + 1) % steps.length;
        const nextStep = steps[nextIndex];

        setActiveStep(nextStep);
      }, AUTO_ROTATE_INTERVAL);
    }

    // запускаем автопрокрутку только если пользователь не просил "меньше движухи"
    if (!prefersReducedMotion) {
      startAutoRotate();
    }

    // клики по шагам
    journey.addEventListener("click", (event) => {
      const targetStep = event.target.closest(".studio-journey-step");
      if (!targetStep || !journey.contains(targetStep)) {
        return;
      }

      setActiveStep(targetStep);
      startAutoRotate(); // перезапускаем таймер с текущего шага
    });

    // навигация клавишами Enter / Space
    journey.addEventListener("keydown", (event) => {
      const key = event.key;

      if (key !== "Enter" && key !== " " && key !== "Spacebar") {
        return;
      }

      const targetStep = event.target.closest(".studio-journey-step");
      if (!targetStep || !journey.contains(targetStep)) {
        return;
      }

      event.preventDefault();
      setActiveStep(targetStep);
      startAutoRotate();
    });

    // при наведении мыши — ставим авто-перелистывание на паузу
    journey.addEventListener("mouseenter", stopAutoRotate);
    journey.addEventListener("mouseleave", startAutoRotate);
  }

  // Путь в студии: новые вертикальные таймлайны в колонках
  const timelineBlocks = document.querySelectorAll(
    ".section-studio .studio-track-path[data-timeline]"
  );

  if (timelineBlocks.length) {
    timelineBlocks.forEach((block) => {
      const steps = Array.from(
        block.querySelectorAll(".timeline-step")
      );

      if (!steps.length) return;

      let activeIndex = steps.findIndex((step) =>
        step.classList.contains("timeline-step--active")
      );

      if (activeIndex < 0) {
        activeIndex = 0;
        steps[0].classList.add("timeline-step--active");
      }

      function setActive(index) {
        steps.forEach((step, i) => {
          step.classList.toggle("timeline-step--active", i === index);
        });
      }

      setActive(activeIndex);

      const autoplay =
        block.dataset.autoplay === "true" && !prefersReducedMotion;
      let intervalId = null;
      const STEP_INTERVAL = 6000; // 6 секунд на шаг

      function startAutoplay() {
        if (!autoplay || intervalId !== null || steps.length <= 1) return;
        intervalId = window.setInterval(() => {
          activeIndex = (activeIndex + 1) % steps.length;
          setActive(activeIndex);
        }, STEP_INTERVAL);
      }

      function stopAutoplay() {
        if (intervalId === null) return;
        window.clearInterval(intervalId);
        intervalId = null;
      }

      steps.forEach((step, index) => {
        step.addEventListener("click", () => {
          activeIndex = index;
          setActive(activeIndex);
          stopAutoplay();
        });
      });

      block.addEventListener("mouseenter", stopAutoplay);
      block.addEventListener("mouseleave", startAutoplay);

      startAutoplay();
    });
  }

  // ======================================
  // 5. Афиша спектаклей (киноряд + модальное окно)
  // ======================================

  const afishaSection = document.querySelector("#afisha");

  if (afishaSection) {
    const stripEl = afishaSection.querySelector("[data-afisha-strip]");
    const prevBtn = afishaSection.querySelector(".afisha-strip-arrow--prev");
    const nextBtn = afishaSection.querySelector(".afisha-strip-arrow--next");

    const modalEl = document.querySelector("[data-play-modal]");
    const modalCloseEls = modalEl
      ? modalEl.querySelectorAll("[data-play-modal-close]")
      : [];
    const badgeEl = modalEl ? modalEl.querySelector("[data-play-badge]") : null;
    const titleEl = modalEl ? modalEl.querySelector("[data-play-title]") : null;
    const metaEl = modalEl ? modalEl.querySelector("[data-play-meta]") : null;
    const taglineEl = modalEl
      ? modalEl.querySelector("[data-play-tagline]")
      : null;
    const descEl = modalEl
      ? modalEl.querySelector("[data-play-description]")
      : null;
    const whyListEl = modalEl ? modalEl.querySelector("[data-play-why]") : null;
    const whyBlockEl = modalEl
      ? modalEl.querySelector("[data-play-why-container]")
      : null;
    const authorEl = modalEl
      ? modalEl.querySelector("[data-play-author]")
      : null;
    const directorEl = modalEl
      ? modalEl.querySelector("[data-play-director]")
      : null;
    const castTitleEl = modalEl
      ? modalEl.querySelector("[data-play-cast-title]")
      : null;
    const castListEl = modalEl
      ? modalEl.querySelector("[data-play-cast]")
      : null;
    const castBlockEl = modalEl
      ? modalEl.querySelector("[data-play-cast-container]")
      : null;
    const mediaPhotosEl = modalEl
      ? modalEl.querySelector("[data-play-photos]")
      : null;
    const mediaVideoEl = modalEl
      ? modalEl.querySelector("[data-play-video]")
      : null;
    const ticketEl = modalEl
      ? modalEl.querySelector("[data-play-ticket]")
      : null;

    let playsData = [];

    function getAfishaPlays() {
      return playsData
        .filter(function (play) {
          return play.showInAfisha;
        })
        .sort(function (a, b) {
          const orderA =
            typeof a.afishaOrder === "number" ? a.afishaOrder : 999;
          const orderB =
            typeof b.afishaOrder === "number" ? b.afishaOrder : 999;
          return orderA - orderB;
        });
    }

    function buildMetaLine(play) {
      const parts = [];
      if (play.age) parts.push(play.age);
      if (play.genre) parts.push(play.genre);
      if (play.duration) parts.push(play.duration);
      if (play.hall) parts.push(play.hall);
      if (play.city) parts.push(play.city);
      return parts.join(" • ");
    }

    function buildAfishaSubline(play) {
      const parts = [];
      if (play.genre) parts.push(play.genre);
      if (play.age) parts.push(play.age);
      return parts.join(" • ");
    }

    function renderAfishaStrip() {
      if (!stripEl) return;

      const afishaPlays = getAfishaPlays();
      if (!afishaPlays.length) {
        stripEl.innerHTML =
          '<p class="afisha-empty">Скоро здесь появятся спектакли театра «Эмоцика».</p>';
        return;
      }

      const html = afishaPlays
        .map(function (play) {
          const posterDesktop =
            play.poster && play.poster.desktop ? play.poster.desktop : "";
          const subline = buildAfishaSubline(play);

          let badgeHtml = "";
          if (play.badge) {
            let badgeClass = "afisha-card-badge badge badge--glass";
            if (play.badgeType) {
              badgeClass += " afisha-card-badge--" + play.badgeType;
            }
            badgeHtml =
              '<span class="' + badgeClass + '">' + play.badge + "</span>";
          }

          return (
            '<article class="afisha-card afisha-card--strip card-luxe" data-play-id="' +
            play.id +
            '">' +
            '<div class="afisha-card-poster-wrapper">' +
            (posterDesktop
              ? '<img class="afisha-card-poster-image" src="' +
                posterDesktop +
                '" alt="Постер спектакля ' +
                play.title +
                '">' +
                (badgeHtml
                  ? '<div class="afisha-card-badge-wrap">' +
                    badgeHtml +
                  "</div>"
                : "")
            : "") +
            "</div>" +
            '<div class="afisha-card-footer">' +
            (subline
              ? '<p class="afisha-card-subline">' + subline + "</p>"
              : "") +
            '<h3 class="afisha-title">' +
            play.title +
            "</h3>" +
            '<div class="afisha-buttons afisha-buttons--strip">' +
            (play.ticketUrl
              ? '<a class="btn btn-primary btn-lg" href="' +
                play.ticketUrl +
                '" target="_blank" rel="noopener">Купить билет</a>'
              : "") +
            '<button type="button" class="btn btn-outline btn-lg" data-play-open="' +
            play.id +
            '">Подробнее о спектакле</button>' +
            "</div>" +
            "</div>" +
            "</article>"
          );
        })
        .join("");

      stripEl.innerHTML = html;
    }

    function openPlayModal(playId) {
      if (!modalEl || !playsData.length) return;

      const play = playsData.find(function (item) {
        return item.id === playId;
      });
      if (!play) return;

      const metaLine = buildMetaLine(play);

      if (badgeEl) {
        if (play.badge) {
          badgeEl.textContent = play.badge;
          badgeEl.classList.remove("is-hidden");
        } else {
          badgeEl.textContent = "";
          badgeEl.classList.add("is-hidden");
        }
      }

      if (titleEl) {
        titleEl.textContent = play.title || "";
      }

      if (metaEl) {
        metaEl.textContent = metaLine || "";
        metaEl.classList.toggle("is-hidden", !metaLine);
      }

      if (taglineEl) {
        taglineEl.textContent = play.tagline || "";
        taglineEl.classList.toggle("is-hidden", !play.tagline);
      }

      if (descEl) {
        descEl.innerHTML = "";
        if (Array.isArray(play.description) && play.description.length) {
          play.description.forEach(function (paragraph) {
            const p = document.createElement("p");
            p.textContent = paragraph;
            descEl.appendChild(p);
          });
        }
      }

      if (whyListEl && whyBlockEl) {
        whyListEl.innerHTML = "";
        if (Array.isArray(play.whyToWatch) && play.whyToWatch.length) {
          play.whyToWatch.forEach(function (item) {
            const li = document.createElement("li");
            li.textContent = item;
            whyListEl.appendChild(li);
          });
          whyBlockEl.classList.remove("is-hidden");
        } else {
          whyBlockEl.classList.add("is-hidden");
        }
      }

      if (authorEl) {
        const hasAuthor = play.credits && play.credits.author;
        authorEl.textContent = hasAuthor ? "Автор: " + play.credits.author : "";
        authorEl.classList.toggle("is-hidden", !hasAuthor);
      }

      if (directorEl) {
        const hasDirector = play.credits && play.credits.director;
        directorEl.textContent = hasDirector
          ? "Режиссёр: " + play.credits.director
          : "";
        directorEl.classList.toggle("is-hidden", !hasDirector);
      }

      if (castListEl && castTitleEl && castBlockEl) {
        castListEl.innerHTML = "";
        const cast =
          play.credits && Array.isArray(play.credits.cast)
            ? play.credits.cast
            : [];
        if (cast.length) {
          const castTitle = play.credits.castTitle || "В ролях";
          castTitleEl.textContent = castTitle;
          cast.forEach(function (name) {
            const li = document.createElement("li");
            li.textContent = name;
            castListEl.appendChild(li);
          });
          castBlockEl.classList.remove("is-hidden");
        } else {
          castBlockEl.classList.add("is-hidden");
        }
      }

      if (mediaPhotosEl) {
        mediaPhotosEl.innerHTML = "";
        if (
          play.media &&
          Array.isArray(play.media.photos) &&
          play.media.photos.length
        ) {
          play.media.photos.forEach(function (src) {
            const img = document.createElement("img");
            img.src = src;
            img.alt = "Фотография спектакля " + play.title;
            img.className = "play-modal-photo";
            mediaPhotosEl.appendChild(img);
          });
        }
      }

      if (mediaVideoEl) {
        mediaVideoEl.innerHTML = "";
        if (play.media && play.media.video) {
          const videoPlaceholder = document.createElement("div");
          videoPlaceholder.className = "play-modal-video-placeholder";
          videoPlaceholder.textContent =
            "Видео спектакля скоро появится на сайте.";
          mediaVideoEl.appendChild(videoPlaceholder);
        }
      }

      if (ticketEl) {
        if (play.ticketUrl) {
          ticketEl.href = play.ticketUrl;
          ticketEl.classList.remove("is-hidden");
        } else {
          ticketEl.removeAttribute("href");
          ticketEl.classList.add("is-hidden");
        }
      }

      modalEl.removeAttribute("hidden");
      document.body.classList.add("has-modal-open");
    }

    function closePlayModal() {
      if (!modalEl) return;
      modalEl.setAttribute("hidden", "true");
      document.body.classList.remove("has-modal-open");
    }

    function bindAfishaEvents() {
      if (!stripEl) return;

      // Кнопки «Подробнее о спектакле»
      stripEl.addEventListener("click", function (event) {
        const moreBtn = event.target.closest("[data-play-open]");
        if (!moreBtn) {
          return;
        }
        const playId = moreBtn.getAttribute("data-play-open");
        if (playId) {
          openPlayModal(playId);
        }
      });

      // Стрелки киноряда
      function scrollStrip(direction) {
        if (!stripEl) return;
        const firstCard = stripEl.querySelector(".afisha-card--strip");
        const cardWidth = firstCard
          ? firstCard.getBoundingClientRect().width
          : 320;
        const gap = 20;
        const delta =
          direction === "next" ? cardWidth + gap : -(cardWidth + gap);

        stripEl.scrollBy({
          left: delta,
          behavior: "smooth"
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          scrollStrip("prev");
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          scrollStrip("next");
        });
      }

      // Закрытие модалки
      if (modalEl) {
        modalCloseEls.forEach(function (btn) {
          btn.addEventListener("click", closePlayModal);
        });

        modalEl.addEventListener("click", function (event) {
          if (event.target === modalEl) {
            closePlayModal();
          }
        });

        document.addEventListener("keydown", function (event) {
          if (
            event.key === "Escape" &&
            modalEl &&
            !modalEl.hasAttribute("hidden")
          ) {
            closePlayModal();
          }
        });
      }
    }

    // Загружаем данные спектаклей из JSON
    fetch("assets/data/plays.json")
      .then(function (response) {
        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        if (!data || !Array.isArray(data.plays)) {
          return;
        }
        playsData = data.plays.slice();
        renderAfishaStrip();
        bindAfishaEvents();
      })
      .catch(function (error) {
        console.error("Не удалось загрузить данные спектаклей:", error);
      });
  }

  // ======================================
  // 6. Блок «Фильмы и награды»
  // ======================================

  const filmsSection = document.querySelector("#films");

  if (filmsSection) {
    const carouselEl = filmsSection.querySelector("[data-films-carousel]");
    const detailEl = filmsSection.querySelector("[data-film-detail]");

    if (carouselEl && detailEl) {
      let filmsData = [];
      let activeFilmId = null;

      function renderCarousel() {
        carouselEl.innerHTML = "";

        filmsData.forEach((film) => {
          const card = document.createElement("button");
          card.type = "button";
          card.className =
            "films-card" + (film.id === activeFilmId ? " films-card--active" : "");
          card.setAttribute("data-film-id", film.id);

          const yearLabel = film.year || "Добавить данные";
          const cityLabel = film.city || "Добавить данные";

          const awards = film.awards || [];
          const visibleAwards = awards.slice(0, 2);
          const extraCount = awards.length > 2 ? awards.length - 2 : 0;

          const awardsHtml = visibleAwards
            .map((a) => {
              let pillClass = "films-card-award-pill badge badge--soft";

              if (a.status && /гран[- ]?при/i.test(a.status)) {
                pillClass = "films-card-award-pill badge badge--gold";
              }

              const text = [a.status, a.festival].filter(Boolean).join(" ");
              return `<span class="${pillClass}">${text}</span>`;
            })
            .join("");

          const extraHtml =
            extraCount > 0
              ? `<span class="films-card-award-pill films-card-award-pill--more badge badge--outline">+${extraCount} фестиваля</span>`
              : "";

          card.innerHTML = `
            <div class="films-card-poster">
              <div class="films-card-poster-inner">
                ${film.title.charAt(0) || "Ф"}
              </div>
            </div>
            <div class="films-card-main">
              <h4 class="films-card-title">${film.title}</h4>
              <p class="films-card-meta">${yearLabel} · ${cityLabel}</p>
              <p class="films-card-logline">${film.logline || ""}</p>
              <div class="films-card-awards">
                ${awardsHtml}${extraHtml}
              </div>
            </div>
          `;

          card.addEventListener("click", () => {
            if (activeFilmId === film.id) return;
            activeFilmId = film.id;
            renderCarousel();
            renderDetail(film);
          });

          carouselEl.appendChild(card);
        });
      }

      function renderDetail(film) {
        const titleEl = detailEl.querySelector("[data-film-title]");
        const metaEl = detailEl.querySelector("[data-film-meta]");
        const authorsEl = detailEl.querySelector("[data-film-authors]");
        const synopsisEl = detailEl.querySelector("[data-film-synopsis]");
        const awardsEl = detailEl.querySelector("[data-film-awards]");
        const embedEl = detailEl.querySelector("[data-film-embed]");
        const vkLinkEl = detailEl.querySelector("[data-film-vk-link]");

        if (titleEl) {
          titleEl.textContent = film.title;
        }

        if (metaEl) {
          const yearLabel = film.year || "Добавить данные";
          const cityLabel = film.city || "Добавить данные";
          metaEl.textContent = `${yearLabel} · ${cityLabel}`;
        }

        if (authorsEl) {
          const pieces = [
            `Сценарий: ${film.writer || "Добавить данные"}`,
            `Режиссура: ${
              film.directors && film.directors.length
                ? film.directors.join(", ")
                : "Добавить данные"
            }`,
            `Оператор: ${film.dop || "Добавить данные"}`,
          ];

          if (film.editor) {
            pieces.push(`Редактор: ${film.editor}`);
          }

          authorsEl.innerHTML = pieces
            .map((text) => `<span class="films-detail-author">${text}</span>`)
            .join("");
        }

        if (synopsisEl) {
          synopsisEl.textContent = film.synopsis || "";
        }

        if (awardsEl) {
          awardsEl.innerHTML = "";

          const awards = film.awards || [];

          if (!awards.length) {
            const li = document.createElement("li");
            li.className = "films-detail-award films-detail-award--empty";
            li.textContent = "Награды будут добавлены позже.";
            awardsEl.appendChild(li);
          } else {
            awards.forEach((award) => {
              const li = document.createElement("li");
              li.className = "films-detail-award";
              const parts = [
                award.status,
                award.festival,
                award.city && `(${award.city})`,
                award.year,
              ].filter(Boolean);
              li.textContent = parts.join(", ");
              awardsEl.appendChild(li);
            });
          }
        }

        if (embedEl) {
          if (film.vkEmbedUrl) {
            embedEl.innerHTML = `
              <iframe
                src="${film.vkEmbedUrl}"
                frameborder="0"
                allowfullscreen
                loading="lazy"
              ></iframe>
            `;
          } else {
            embedEl.innerHTML =
              '<div class="films-video-placeholder">Видео появится позже</div>';
          }
        }

        if (vkLinkEl) {
          const url = film.vkPageUrl || film.vkEmbedUrl;
          if (url) {
            vkLinkEl.href = url;
            vkLinkEl.style.display = "";
          } else {
            vkLinkEl.style.display = "none";
          }
        }
      }

      function initFilms(data) {
        filmsData = Array.isArray(data) ? data : [];
        if (!filmsData.length) return;

        activeFilmId = filmsData[0].id;
        renderCarousel();
        renderDetail(filmsData[0]);
      }

      fetch("assets/data/films.json")
        .then(function (response) {
          if (!response.ok) {
            throw new Error("HTTP " + response.status);
          }
          return response.json();
        })
        .then(function (data) {
          initFilms(data);
        })
        .catch(function (error) {
          console.error("Не удалось загрузить данные фильмов:", error);
        });
    }
  }

  // ======================================
  // 7. Галерея: карусель + лайтбокс + вкладки
  // ======================================

  const gallerySection = document.querySelector("#gallery");

  if (gallerySection) {
    const scroller = gallerySection.querySelector("[data-gallery-scroller]");
    const tabs = gallerySection.querySelectorAll("[data-gallery-filter]");
    const lightbox = document.querySelector("#gallery-lightbox");
    const lightboxImage = lightbox ? lightbox.querySelector(".lightbox__image") : null;
    const lightboxCaption = lightbox ? lightbox.querySelector(".lightbox__caption") : null;
    const prevBtn = lightbox ? lightbox.querySelector("[data-lightbox-prev]") : null;
    const nextBtn = lightbox ? lightbox.querySelector("[data-lightbox-next]") : null;
    const closeEls = lightbox
      ? lightbox.querySelectorAll("[data-lightbox-close]")
      : [];

    // один массив объектов — его потом легко вынести в JSON
    const galleryItems = [
      {
        id: "rehearsal-1",
        category: "rehearsal",
        categoryLabel: "Репетиции",
        src: "assets/gallery/rehearsal-1.jpg",
        full: "assets/gallery/rehearsal-1.jpg",
        alt: "Репетиция в студии «Эмоция»",
        caption: "Репетиция в студии «Эмоция»",
      },
      {
        id: "show-1",
        category: "stage",
        categoryLabel: "Сцена",
        src: "assets/gallery/show-1.jpg",
        full: "assets/gallery/show-1.jpg",
        alt: "Юные актёры на сцене",
        caption: "Юные актёры на сцене",
      },
      {
        id: "backstage-1",
        category: "backstage",
        categoryLabel: "Закулисье",
        src: "assets/gallery/backstage-1.jpg",
        full: "assets/gallery/backstage-1.jpg",
        alt: "Закулисье перед спектаклем",
        caption: "Закулисье перед спектаклем",
      },
      {
        id: "rehearsal-2",
        category: "rehearsal",
        categoryLabel: "Репетиции",
        src: "assets/gallery/rehearsal-2.jpg",
        full: "assets/gallery/rehearsal-2.jpg",
        alt: "Работа над сценой",
        caption: "Работа над сценой",
      },
      // сюда потом просто добавляешь новые кадры
    ];

    let currentFilter = "all";
    let visibleItems = [];
    let currentIndex = 0;

    function getFilteredItems() {
      if (currentFilter === "all") {
        return galleryItems;
      }

      return galleryItems.filter((item) => item.category === currentFilter);
    }

    function renderGallery() {
      if (!scroller) return;

      const items = getFilteredItems();
      visibleItems = items;
      scroller.innerHTML = "";

      if (!items.length) {
        const empty = document.createElement("p");
        empty.className = "gallery__empty";
        empty.textContent = "Скоро здесь появятся новые фотографии.";
        scroller.appendChild(empty);
        return;
      }

      items.forEach((item, index) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "gallery-card";
        card.setAttribute("data-gallery-id", item.id);
        card.setAttribute("data-gallery-index", String(index));

        card.innerHTML = `
          <div class="gallery-card__image-wrapper">
            <img
              src="${item.src}"
              alt="${item.alt}"
              class="gallery-card__image"
              loading="lazy"
            >
            <div class="gallery-card__frame"></div>
          </div>
          <div class="gallery-card__meta">
            <div class="gallery-card__title"></div>
            <div class="gallery-card__tag">
              <span class="gallery-card__tag-dot"></span>
              <span class="gallery-card__tag-label"></span>
            </div>
          </div>
        `;

        const titleEl = card.querySelector(".gallery-card__title");
        const tagLabelEl = card.querySelector(".gallery-card__tag-label");
        const tagEl = card.querySelector(".gallery-card__tag");

        if (titleEl) {
          titleEl.textContent = item.caption || "";
        }

        if (tagLabelEl && tagEl) {
          if (item.categoryLabel) {
            tagLabelEl.textContent = item.categoryLabel;
          } else {
            tagEl.style.display = "none";
          }
        }

        card.addEventListener("click", () => {
          openLightbox(index);
        });

        scroller.appendChild(card);
      });
    }

    function updateLightbox() {
      if (!lightboxImage || !lightboxCaption) return;
      const item = visibleItems[currentIndex];

      if (!item) return;

      const src = item.full || item.src;

      lightboxImage.src = src;
      lightboxImage.alt = item.alt || "";
      lightboxCaption.textContent = item.caption || "";
    }

    function openLightbox(index) {
      if (!lightbox || !lightboxImage || !visibleItems.length) return;

      currentIndex = index;
      updateLightbox();

      lightbox.hidden = false;
      document.body.classList.add("is-lightbox-open");
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.hidden = true;
      document.body.classList.remove("is-lightbox-open");
    }

    function goTo(delta) {
      if (!visibleItems.length) return;
      const length = visibleItems.length;
      currentIndex = (currentIndex + delta + length) % length;
      updateLightbox();
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        goTo(-1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        goTo(1);
      });
    }

    closeEls.forEach((el) => {
      el.addEventListener("click", () => {
        closeLightbox();
      });
    });

    document.addEventListener("keydown", (event) => {
      if (!lightbox || lightbox.hidden) return;

      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowRight") {
        goTo(1);
      } else if (event.key === "ArrowLeft") {
        goTo(-1);
      }
    });

    if (tabs.length) {
      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          const value = tab.getAttribute("data-gallery-filter") || "all";
          currentFilter = value;

          tabs.forEach((btn) => {
            btn.classList.toggle("is-active", btn === tab);
          });

          renderGallery();
        });
      });
    }

    renderGallery();
  }

  // ======================================
  // 8. FAQ toggle
  // ======================================

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".faq-question");
    if (!btn) return;

    const item = btn.parentElement;
    const answer = item.querySelector(".faq-answer");
    if (!answer) return;

    const expanded = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", (!expanded).toString());
    answer.classList.toggle("open");
  });
});

// ======================================
// Люди театра — рендер из JSON
// ======================================

function initPeopleBlock(data) {
  const section = document.querySelector("#people");
  if (!section || !data) return;

  const filtersRoot = section.querySelector("[data-people-filters]");
  const peopleRoot = section.querySelector("[data-people-root]");
  if (!filtersRoot || !peopleRoot) return;

  const groups = Array.isArray(data.groups) ? data.groups : [];
  if (!groups.length) return;

  let activeGroupId = groups[0].id;
  let expanded = false;

  function getMaxVisible() {
    return window.innerWidth <= 768 ? 3 : 6;
  }

  function getActiveGroup() {
    return groups.find(function (group) {
      return group.id === activeGroupId;
    });
  }

  function renderFilters() {
    filtersRoot.innerHTML = "";

    groups.forEach(function (group) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "people-filter" + (group.id === activeGroupId ? " is-active" : "");
      btn.textContent = group.title || "";
      btn.setAttribute("data-group-id", group.id);
      btn.setAttribute("role", "tab");
      btn.setAttribute(
        "aria-selected",
        group.id === activeGroupId ? "true" : "false"
      );

      filtersRoot.appendChild(btn);
    });
  }

  function renderGroup() {
    peopleRoot.innerHTML = "";

    const group = getActiveGroup();
    if (!group) return;

    const grid = document.createElement("div");
    grid.className = "people-grid";

    const people = Array.isArray(group.people) ? group.people.slice() : [];

    people.sort(function (a, b) {
      const orderA = typeof a.order === "number" ? a.order : 0;
      const orderB = typeof b.order === "number" ? b.order : 0;
      return orderA - orderB;
    });

    const maxVisible = getMaxVisible();
    const limit = expanded ? people.length : maxVisible;

    people.forEach(function (person, index) {
      const card = document.createElement("article");
      card.className = "person-card card-luxe";

      const figure = document.createElement("figure");
      figure.className = "person-photo";

      if (person.photoUrl) {
        const photoWrapper = document.createElement("div");
        photoWrapper.className = "people-card-photo";

        const img = document.createElement("img");
        img.src = person.photoUrl;
        img.alt = person.name || "";

        photoWrapper.appendChild(img);
        figure.appendChild(photoWrapper);
      }

      const content = document.createElement("div");
      content.className = "person-content";

      const nameEl = document.createElement("h4");
      nameEl.className = "person-name";
      nameEl.textContent = person.name || "";
      content.appendChild(nameEl);

      if (person.role) {
        const roleEl = document.createElement("p");
        roleEl.className = "person-role";
        roleEl.textContent = person.role;
        content.appendChild(roleEl);
      }

      if (Array.isArray(person.tags) && person.tags.length) {
        const tagsWrapper = document.createElement("div");
        tagsWrapper.className = "person-tags";

        person.tags.forEach(function (tag) {
          const tagEl = document.createElement("span");
          tagEl.className = "person-tag";
          tagEl.textContent = tag;
          tagsWrapper.appendChild(tagEl);
        });

        content.appendChild(tagsWrapper);
      }

      if (person.bio) {
        const bioEl = document.createElement("p");
        bioEl.className = "person-bio";
        bioEl.textContent = person.bio;
        content.appendChild(bioEl);
      }

      card.appendChild(figure);
      card.appendChild(content);

      if (!expanded && index >= maxVisible) {
        card.classList.add("person-card--collapsed");
      }

      grid.appendChild(card);
    });

    peopleRoot.appendChild(grid);

    if (group.note) {
      const noteEl = document.createElement("p");
      noteEl.className = "people-note text-muted";
      noteEl.textContent = group.note;
      peopleRoot.appendChild(noteEl);
    }

    if (people.length > getMaxVisible()) {
      const toggleBtn = document.createElement("button");
      toggleBtn.type = "button";
      toggleBtn.className = "people-toggle";
      toggleBtn.textContent = expanded
        ? "Свернуть раздел"
        : "Показать ещё людей";

      toggleBtn.addEventListener("click", function () {
        expanded = !expanded;
        renderGroup();
      });

      peopleRoot.appendChild(toggleBtn);
    }
  }

  filtersRoot.addEventListener("click", function (event) {
    const btn = event.target.closest(".people-filter");
    if (!btn) return;

    const groupId = btn.getAttribute("data-group-id");
    if (!groupId || groupId === activeGroupId) return;

    activeGroupId = groupId;
    expanded = false;
    renderFilters();
    renderGroup();
  });

  renderFilters();
  renderGroup();

  let isMobile = window.innerWidth <= 768;
  window.addEventListener("resize", function () {
    const nowMobile = window.innerWidth <= 768;
    if (nowMobile !== isMobile && !expanded) {
      isMobile = nowMobile;
      renderGroup();
    }
  });
}

// ======================================
// Видеоотзывы: данные для ленты "Видеоистории родителей"
// ======================================

function buildVideoEmbedUrl(platform, videoId) {
  if (!videoId) return "";

  if (platform === "youtube") {
    return "https://www.youtube.com/embed/" + videoId;
  }

  if (platform === "vk") {
    return "https://vk.com/video/" + videoId;
  }

  return "";
}

const videoReviews = [
  {
    id: "review-masha-9",
    kind: "video",

    title: "Маша, 9 лет — перестала бояться сцены",
    quote:
      "После первого спектакля мы увидели совсем другого ребёнка — уверенного и светящегося.",
    authorLabel: "Мама Маши, 9 лет",

    thumbUrl: "assets/img/reviews/masha-9-thumb.jpg", // TODO: подставь реальный путь
    thumbAlt: "Кадр из видеоотзыва: мама Маши после спектакля",

    videoEmbedUrl: "https://www.youtube.com/embed/XXXXXXXX", // TODO: сюда embed-ссылку
    platform: "youtube",
    videoId: "XXXXXXXX",

    persona: "parent",
    childName: "Маша",
    childAge: 9,
    yearsInStudio: 3,
    yearsInStudioLabel: "3 года в студии",
    branch: "филиал у Комендантского",

    event: "Спектакль «Любовь у сливного бачка»",

    topics: ["уверенность", "первый_спектакль", "атмосфера"],

    isFeatured: true,
    order: 10,
    isActive: true,

    durationSeconds: 75,
    durationLabel: "01:15",
    recordedAt: "2024-12-15",
  },
  {
    id: "review-kirill-12",
    kind: "video",

    title: "Кирилл, 12 лет — научился говорить вслух",
    quote:
      "Учителя в школе заметили, что Кирилл стал спокойно выходить к доске и не мямлить. Для нас это огромный шаг.",
    authorLabel: "Папа Кирилла, 12 лет",

    thumbUrl: "assets/img/reviews/kirill-12-thumb.jpg",
    thumbAlt: "Кирилл с папой после спектакля",

    videoEmbedUrl: "https://vk.com/video-0000000_0000000", // TODO: embed VK
    platform: "vk",
    videoId: "0000000_0000000",

    persona: "parent",
    childName: "Кирилл",
    childAge: 12,
    yearsInStudio: 2,
    yearsInStudioLabel: "2 года в студии",
    branch: "филиал на Пионерской",

    event: "Фестиваль «На берегах Невы»",

    topics: ["речь", "уверенность", "фестивали"],

    isFeatured: false,
    order: 20,
    isActive: true,

    durationSeconds: 90,
    durationLabel: "01:30",
    recordedAt: "2024-03-10",
  },
  {
    id: "review-montage-camp",
    kind: "video",

    title: "Лагерь «Эмоция» — как вторая семья",
    quote:
      "Дети возвращаются из лагеря с ощущением, что у них появилась новая семья. Это не просто отдых, а глубокий опыт.",
    authorLabel: "Монтаж отзывов родителей",

    thumbUrl: "assets/img/reviews/camp-montage-thumb.jpg",
    thumbAlt: "Кадры из смены лагеря студии «Эмоция»",

    videoEmbedUrl: buildVideoEmbedUrl("youtube", "YYYYYYYY"),
    platform: "youtube",
    videoId: "YYYYYYYY",

    persona: "montage",
    childName: "",
    childAge: null,
    yearsInStudio: null,
    yearsInStudioLabel: "",
    branch: "",

    event: "Лагерь «Эмоция»",

    topics: ["лагерь", "атмосфера", "команда"],

    isFeatured: false,
    order: 30,
    isActive: true,

    durationSeconds: 120,
    durationLabel: "02:00",
    recordedAt: "2023-08-20",
  },
];

// ======================================
// Видеоотзывы: инициализация ленты и лайтбокса
// ======================================

function buildReviewMetaLine(review) {
  var parts = [];

  if (review.authorLabel) {
    parts.push(review.authorLabel);
  } else if (review.childName || review.childAge) {
    var childBits = [];
    if (review.childName) {
      childBits.push(review.childName);
    }
    if (typeof review.childAge === "number") {
      childBits.push(review.childAge + " лет");
    }
    if (childBits.length) {
      parts.push(childBits.join(", "));
    }
  }

  if (review.yearsInStudioLabel) {
    parts.push(review.yearsInStudioLabel);
  }

  if (review.branch) {
    parts.push(review.branch);
  }

  return parts.join(" • ");
}

function createReviewVideoCard(review) {
  var card = document.createElement("article");
  card.className = "review-video-card card card-hover";
  card.setAttribute("data-review-id", review.id);

  var poster = document.createElement("div");
  poster.className = "review-video-card__poster";
  if (review.thumbUrl) {
    poster.style.backgroundImage = "url(" + review.thumbUrl + ")";
  }

  if (review.durationLabel) {
    var duration = document.createElement("span");
    duration.className = "review-video-card__duration";
    duration.textContent = review.durationLabel;
    poster.appendChild(duration);
  }

  var badge = document.createElement("span");
  badge.className = "review-video-card__badge";
  badge.textContent = "Видеоотзыв";

  var title = document.createElement("h3");
  title.className = "review-video-card__title";
  title.textContent = review.title || "";

  var meta = document.createElement("p");
  meta.className = "review-video-card__meta";
  meta.textContent = buildReviewMetaLine(review);

  card.appendChild(poster);
  card.appendChild(badge);
  card.appendChild(title);
  card.appendChild(meta);

  return card;
}

function openReviewLightbox(lightbox, review) {
  var titleEl = lightbox.querySelector(".review-lightbox__title");
  var quoteEl = lightbox.querySelector(".review-lightbox__quote");
  var metaEl = lightbox.querySelector(".review-lightbox__meta");
  var videoContainer = lightbox.querySelector(".review-lightbox__video");

  if (!videoContainer) return;

  videoContainer.innerHTML = "";

  if (review.videoEmbedUrl) {
    var iframe = document.createElement("iframe");
    iframe.src = review.videoEmbedUrl;
    iframe.title = review.title || "Видеоотзыв";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    videoContainer.appendChild(iframe);
  }

  if (titleEl) {
    titleEl.textContent = review.title || "";
  }
  if (quoteEl) {
    quoteEl.textContent = review.quote || "";
  }
  if (metaEl) {
    metaEl.textContent =
      buildReviewMetaLine(review) +
      (review.event ? " • " + review.event : "");
  }

  lightbox.setAttribute("data-current-id", review.id);
  lightbox.hidden = false;
  lightbox.setAttribute("aria-hidden", "false");
  lightbox.classList.add("is-open");
  document.body.classList.add("is-lightbox-open");
}

function closeReviewLightbox(lightbox) {
  var videoContainer = lightbox.querySelector(".review-lightbox__video");
  if (videoContainer) {
    videoContainer.innerHTML = "";
  }
  lightbox.classList.remove("is-open");
  lightbox.hidden = true;
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-lightbox-open");
}

function initVideoReviewsSection() {
  var section = document.getElementById("reviews");
  if (!section) return;

  var strip = section.querySelector("[data-reviews-strip]");
  var lightbox = section.querySelector("[data-review-lightbox]");
  if (!strip || !lightbox) return;

  var activeReviews = videoReviews.filter(function (review) {
    return review.isActive !== false;
  });

  if (!activeReviews.length) {
    section.classList.add("section-reviews--empty");
    return;
  }

  // сортировка: сначала избранные, потом по order
  activeReviews.sort(function (a, b) {
    var aFeatured = !!a.isFeatured;
    var bFeatured = !!b.isFeatured;

    if (aFeatured !== bFeatured) {
      return aFeatured ? -1 : 1;
    }

    var orderA = typeof a.order === "number" ? a.order : 0;
    var orderB = typeof b.order === "number" ? b.order : 0;
    return orderA - orderB;
  });

  // рендер карточек
  activeReviews.forEach(function (review) {
    var card = createReviewVideoCard(review);
    strip.appendChild(card);
  });

  // клик по карточкам — открываем модалку
  strip.addEventListener("click", function (event) {
    var card = event.target.closest(".review-video-card");
    if (!card) return;

    var reviewId = card.getAttribute("data-review-id");
    var review = null;
    for (var i = 0; i < activeReviews.length; i++) {
      if (activeReviews[i].id === reviewId) {
        review = activeReviews[i];
        break;
      }
    }
    if (!review) return;

    openReviewLightbox(lightbox, review);
  });

  // стрелки прокрутки
  var leftArrow = section.querySelector("[data-reviews-arrow='left']");
  var rightArrow = section.querySelector("[data-reviews-arrow='right']");

  function scrollStrip(direction) {
    if (!strip) return;
    var firstCard = strip.querySelector(".review-video-card");
    var cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 260;
    strip.scrollBy({
      left: direction * (cardWidth * 0.9 + 16),
      behavior: "smooth",
    });
  }

  if (leftArrow) {
    leftArrow.addEventListener("click", function () {
      scrollStrip(-1);
    });
  }
  if (rightArrow) {
    rightArrow.addEventListener("click", function () {
      scrollStrip(1);
    });
  }

  // закрытие модалки
  var closeBtn = lightbox.querySelector("[data-review-lightbox-close]");
  var backdrop = lightbox.querySelector("[data-review-lightbox-backdrop]");

  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      closeReviewLightbox(lightbox);
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", function () {
      closeReviewLightbox(lightbox);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (
      event.key === "Escape" &&
      lightbox.classList.contains("is-open")
    ) {
      closeReviewLightbox(lightbox);
    }
  });
}

// ======================================
// Филиалы и площадки — сортировка, фильтр, подсветка метро, районы
// ======================================

function sortBranches(branches) {
  if (!Array.isArray(branches)) return [];

  return branches
    .slice()
    .sort(function (a, b) {
      // 1. Сначала площадки с группами 18+
      if (a.isAdults && !b.isAdults) return -1;
      if (!a.isAdults && b.isAdults) return 1;

      // 2. Потом по станции метро (по алфавиту)
      var metroA = (a.metro || "").toLowerCase();
      var metroB = (b.metro || "").toLowerCase();
      if (metroA < metroB) return -1;
      if (metroA > metroB) return 1;

      // 3. Город (на всякий случай)
      var cityA = (a.city || "").toLowerCase();
      var cityB = (b.city || "").toLowerCase();
      if (cityA < cityB) return -1;
      if (cityA > cityB) return 1;

      // 4. Название площадки
      var placeA = (a.place || "").toLowerCase();
      var placeB = (b.place || "").toLowerCase();
      if (placeA < placeB) return -1;
      if (placeA > placeB) return 1;

      return 0;
    });
}

function renderBranchesList(rootEl, branches, filter, highlightMetro) {
  if (!rootEl) return;

  rootEl.innerHTML = "";

  var filtered = Array.isArray(branches) ? branches.slice() : [];
  var highlight = (highlightMetro || "").toLowerCase();

  if (filter === "adults") {
    filtered = filtered.filter(function (branch) {
      return branch.isAdults;
    });
  }

  if (!filtered.length) {
    var empty = document.createElement("p");
    empty.className = "branches-empty";
    empty.textContent =
      filter === "adults"
        ? "Сейчас группы для взрослых проходят только на части площадок. Уточните расписание у администратора студии."
        : "Филиалы временно недоступны.";
    rootEl.appendChild(empty);
    return;
  }

  filtered.forEach(function (branch) {
    var card = document.createElement("article");
    card.className =
      "branch-card card-hover" +
      (branch.isAdults ? " branch-card--adults" : "");

    // Подсветка «моей» станции метро
    if (
      highlight &&
      (branch.metro || "").toLowerCase() === highlight
    ) {
      card.classList.add("branch-card--highlight");
    }

    // Верхняя строка: метро + название площадки
    var topRow = document.createElement("div");
    topRow.className = "branch-card-top";

    var metroBadge = document.createElement("span");
    metroBadge.className = "branch-metro";
    metroBadge.textContent = branch.metro || "";

    var placeTitle = document.createElement("h3");
    placeTitle.className = "branch-place";
    placeTitle.textContent = branch.place || "";

    topRow.appendChild(metroBadge);
    topRow.appendChild(placeTitle);

    // Адрес
    var address = document.createElement("p");
    address.className = "branch-address";
    address.textContent = branch.address || "";

    // Город / район
    var metaRow = document.createElement("div");
    metaRow.className = "branch-meta";

    if (branch.city) {
      var citySpan = document.createElement("span");
      citySpan.className = "branch-city";
      citySpan.textContent = branch.city;
      metaRow.appendChild(citySpan);
    }

    if (branch.area) {
      var areaSpan = document.createElement("span");
      areaSpan.className = "branch-area";
      areaSpan.textContent = branch.area;
      metaRow.appendChild(areaSpan);
    }

    // Комментарий (если есть)
    if (branch.comment) {
      var comment = document.createElement("p");
      comment.className = "branch-comment";
      comment.textContent = branch.comment;
      card.appendChild(comment);
    }

    // Телефоны
    if (branch.phones && branch.phones.length) {
      var phonesList = document.createElement("div");
      phonesList.className = "branch-phones";

      var phonesLabel = document.createElement("span");
      phonesLabel.className = "branch-phones-label";
      phonesLabel.textContent =
        branch.phones.length > 1
          ? "Телефоны администратора:"
          : "Телефон администратора:";
      phonesList.appendChild(phonesLabel);

      branch.phones.forEach(function (phone) {
        var link = document.createElement("a");
        link.className = "branch-phone-link";
        link.href = "tel:" + phone.replace(/\s+/g, "");
        link.textContent = phone;
        phonesList.appendChild(link);
      });

      card.appendChild(phonesList);
    }

    // Бейдж 18+
    if (branch.isAdults) {
      var badge = document.createElement("span");
      badge.className = "branch-adults-badge";
      badge.textContent = "Группы 18+";
      card.appendChild(badge);
    }

    card.appendChild(topRow);
    card.appendChild(address);

    if (metaRow.childNodes.length) {
      card.appendChild(metaRow);
    }

    rootEl.appendChild(card);
  });
}

function getUniqueMetros(branches) {
  var seen = {};
  var metros = [];

  if (!Array.isArray(branches)) return metros;

  branches.forEach(function (branch) {
    var metro = branch.metro || "";
    if (!metro) return;
    if (seen[metro]) return;
    seen[metro] = true;
    metros.push(metro);
  });

  metros.sort(function (a, b) {
    return a.localeCompare(b, "ru");
  });

  return metros;
}

function getUniqueAreas(branches) {
  var seen = {};
  var areas = [];

  if (!Array.isArray(branches)) return areas;

  branches.forEach(function (branch) {
    var area = branch.area || "";
    if (!area) return;
    if (seen[area]) return;
    seen[area] = true;
    areas.push(area);
  });

  areas.sort(function (a, b) {
    return a.localeCompare(b, "ru");
  });

  return areas;
}

function renderBranchesAreas(rootEl, areas) {
  if (!rootEl) return;

  rootEl.innerHTML = "";

  if (!Array.isArray(areas) || !areas.length) {
    var fallback = document.createElement("li");
    fallback.className = "branches-area-item";
    fallback.textContent = "Санкт-Петербург и Кудрово";
    rootEl.appendChild(fallback);
    return;
  }

  areas.forEach(function (area) {
    var li = document.createElement("li");
    li.className = "branches-area-item";
    li.textContent = area;
    rootEl.appendChild(li);
  });
}

function getMetroFromQuery() {
  if (!window.location || !window.location.search) return "";

  try {
    var params = new URLSearchParams(window.location.search);
    var value = params.get("metro");
    return value ? value.trim() : "";
  } catch (e) {
    return "";
  }
}

function initBranchesSection(branches) {
  var section = document.querySelector("#branches");
  if (!section) return;

  var listRoot = section.querySelector("[data-branches-list]");
  var filterButtons = section.querySelectorAll("[data-branch-filter]");
  var myMetroSelect = section.querySelector("[data-branch-my-metro]");
  var areasRoot = section.querySelector("[data-branches-areas]");

  if (!listRoot) return;

  var sorted = sortBranches(branches);
  var activeFilter = "all";
  var highlightMetro = "";

  // Пробуем взять метро из параметра URL (?metro=...)
  var metroFromUrl = getMetroFromQuery();
  if (metroFromUrl) {
    highlightMetro = metroFromUrl;
  }

  function updateView() {
    renderBranchesList(listRoot, sorted, activeFilter, highlightMetro);
  }

  function setActiveFilter(value) {
    activeFilter = value;

    if (filterButtons && filterButtons.length) {
      filterButtons.forEach(function (btn) {
        var btnFilter = btn.getAttribute("data-branch-filter") || "all";
        btn.classList.toggle("is-active", btnFilter === activeFilter);
      });
    }

    updateView();
  }

  function setHighlightMetro(value) {
    highlightMetro = value || "";

    if (myMetroSelect) {
      var currentValue = myMetroSelect.value || "";
      if (currentValue !== highlightMetro) {
        myMetroSelect.value = highlightMetro;
      }
    }

    updateView();
  }

  // Наполняем селект «Моя станция метро» вариантами
  if (myMetroSelect) {
    myMetroSelect.innerHTML = "";
    var placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Не выбрано";
    myMetroSelect.appendChild(placeholder);

    var metros = getUniqueMetros(sorted);
    metros.forEach(function (metro) {
      var option = document.createElement("option");
      option.value = metro;
      option.textContent = metro;
      myMetroSelect.appendChild(option);
    });

    if (highlightMetro) {
      myMetroSelect.value = highlightMetro;
    }

    myMetroSelect.addEventListener("change", function () {
      var value = myMetroSelect.value || "";
      setHighlightMetro(value);
    });
  }

  // Наполняем легенду районов у карты
  if (areasRoot) {
    var areas = getUniqueAreas(sorted);
    renderBranchesAreas(areasRoot, areas);
  }

  if (filterButtons && filterButtons.length) {
    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var value = btn.getAttribute("data-branch-filter") || "all";
        setActiveFilter(value);
      });
    });
  }

  // Стартовое отображение
  updateView();
}

// ======================================
// Абонементы студии — рендер из JSON и CTA
// ======================================

function createAbonementCard(abonement) {
  const article = document.createElement('article');
  article.className = 'abonement-card';

  if (abonement.highlight || abonement.isHero) {
    article.classList.add('abonement-card--highlight');
  }

  article.dataset.abonementId = abonement.id;

  article.innerHTML = `
    ${abonement.tagLine ? `<p class="abonement-tagline">${abonement.tagLine}</p>` : ''}
    <h3 class="abonement-name">${abonement.name}</h3>
    ${abonement.age ? `<p class="abonement-age">${abonement.age}</p>` : ''}
    ${abonement.description ? `<p class="abonement-description">${abonement.description}</p>` : ''}
    ${
      Array.isArray(abonement.bullets) && abonement.bullets.length
        ? `<ul class="abonement-list">
            ${abonement.bullets.map((item) => `<li>${item}</li>`).join('')}
          </ul>`
        : ''
    }
    <div class="abonement-bottom">
      ${abonement.price ? `<p class="abonement-price">${abonement.price}</p>` : ''}
      ${abonement.note ? `<p class="abonement-note">${abonement.note}</p>` : ''}
    </div>
    ${abonement.badge ? `<span class="abonement-badge">${abonement.badge}</span>` : ''}
  `;

  if (abonement.isHero) {
    article.classList.add('abonement-card--hero');
    article.setAttribute(
      'aria-label',
      `${abonement.name}. Чаще всего родители выбирают именно этот формат.`
    );
  }

  return article;
}

function renderAbonementsGrid(container, abonements) {
  container.innerHTML = '';

  abonements.forEach((item) => {
    const card = createAbonementCard(item);
    container.appendChild(card);
  });
}

function loadAbonementsData() {
  return fetch(ABONEMENTS_DATA_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Не удалось загрузить данные абонементов');
      }
      return response.json();
    })
    .catch((error) => {
      console.error('[Abonements] Ошибка загрузки данных:', error);
      return [];
    });
}

function initAbonementsSection() {
  const gridRoot = document.querySelector('[data-abonements-root]');

  if (!gridRoot) {
    return;
  }

  const contactsSection = document.getElementById('contacts');

  const scrollToContacts = (event) => {
    if (event) {
      event.preventDefault();
    }

    if (!contactsSection) {
      return;
    }

    contactsSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Рендер карточек из JSON
  loadAbonementsData().then((abonements) => {
    if (!Array.isArray(abonements) || abonements.length === 0) {
      return;
    }

    renderAbonementsGrid(gridRoot, abonements);

    // Клик по карточке героя ведёт туда же, куда и главный CTA
    const heroCard = gridRoot.querySelector('.abonement-card--hero');

    if (heroCard) {
      heroCard.addEventListener('click', scrollToContacts);
    }
  });

  // Кнопки CTA внизу блока абонементов
  const ctaButtons = document.querySelectorAll('[data-scroll-to="contacts"]');

  if (ctaButtons.length) {
    ctaButtons.forEach((button) => {
      button.addEventListener('click', scrollToContacts);
    });
  }
}

// ======================================
// Награды и фестивали — данные
// ======================================

const awardsFestivalsData = [
  {
    id: "dynasty-2023",
    title: "VIII Международный фестиваль искусств «Династия»",
    city: "Санкт-Петербург",
    country: "Россия",
    level: "международный",
    years: [2023],
    directions: ["theatre", "film"],
    headline:
      "Два Гран-при за фильмы «Твори Добро» и «Особняк потерянных шагов» плюс лауреат III степени за спектакль «Город Чудаков».",
    entries: [
      {
        work: "«Твори Добро»",
        type: "film",
        status: "Гран-при",
        category: "Короткометражный фильм / «Дорогою добра»",
        year: 2023,
        isTop: true,
        note: ""
      },
      {
        work: "«Особняк потерянных шагов»",
        type: "film",
        status: "Гран-при",
        category: "Короткометражный фильм / «Петербургские тайны»",
        year: 2023,
        isTop: true,
        note: ""
      },
      {
        work: "«Город Чудаков»",
        type: "theatre",
        status: "Лауреат III степени",
        category: "Драматический театр",
        year: 2023,
        isTop: false,
        note: ""
      }
    ]
  },
  {
    id: "na-beregah-nevy-2018-2023",
    title: "Международный фестиваль искусств «На берегах Невы»",
    city: "Санкт-Петербург",
    country: "Россия",
    level: "международный",
    years: [2018, 2019, 2023],
    directions: ["theatre"],
    headline:
      "Гран-при за спектакль «Город Чудаков» и лауреаты I степени за «Кошкин дом» и другие постановки студии.",
    entries: [
      {
        work: "«Город Чудаков»",
        type: "theatre",
        status: "Гран-при",
        category: "Драматический театр",
        year: 2023,
        isTop: true,
        note: ""
      },
      {
        work: "«Кошкин дом»",
        type: "theatre",
        status: "Лауреат I степени",
        category: "Драматический театр",
        year: 2019,
        isTop: false,
        note: ""
      },
      {
        work: "Другие спектакли студии",
        type: "theatre",
        status: "Лауреаты I степени",
        category: "",
        year: 2018,
        isTop: false,
        note: ""
      }
    ]
  },
  {
    id: "sokrovischa-vostoka-2022",
    title: "Международный фестиваль «Сокровища Востока»",
    city: "Казань",
    country: "Россия",
    level: "международный",
    years: [2022],
    directions: ["theatre", "speech"],
    headline:
      "Лауреат I степени за спектакль «Кошкин дом» и три лауреата I степени в номинации «Художественное слово».",
    entries: [
      {
        work: "«Кошкин дом»",
        type: "theatre",
        status: "Лауреат I степени",
        category: "Драматический театр",
        year: 2022,
        isTop: true,
        note: ""
      },
      {
        work: "Художественное слово — участник 1",
        type: "speech",
        status: "Лауреат I степени",
        category: "Художественное слово (младшая группа)",
        year: 2022,
        isTop: false,
        note: ""
      },
      {
        work: "Художественное слово — участник 2",
        type: "speech",
        status: "Лауреат I степени",
        category: "Художественное слово (средняя группа)",
        year: 2022,
        isTop: false,
        note: ""
      },
      {
        work: "Художественное слово — участник 3",
        type: "speech",
        status: "Лауреат I степени",
        category: "Художественное слово (старшая группа)",
        year: 2022,
        isTop: false,
        note: ""
      }
    ]
  },
  {
    id: "nesebar-2019",
    title:
      "Фестивали «Солнце – Радость – Красота» и «Звёзды Несебра»",
    city: "Несебр",
    country: "Болгария",
    level: "международный",
    years: [2019],
    directions: ["theatre"],
    headline:
      "Первое место на фестивале «Солнце – Радость – Красота» и лауреаты II степени на фестивале «Звёзды Несебра».",
    entries: [
      {
        work: "Постановка студии (театр)",
        type: "theatre",
        status: "1 место",
        category:
          "Театральное искусство — нестандартные формы",
        year: 2019,
        isTop: true,
        note: "Фестиваль «Солнце – Радость – Красота»"
      },
      {
        work: "Постановка студии (театр)",
        type: "theatre",
        status: "Лауреаты II степени",
        category: "",
        year: 2019,
        isTop: false,
        note: "Фестиваль «Звёзды Несебра»"
      }
    ]
  },
  {
    id: "nevskoe-siyanie-2023-2024",
    title: "Международный фестиваль «Невское сияние»",
    city: "Санкт-Петербург",
    country: "Россия",
    level: "международный",
    years: [2023, 2024],
    directions: ["theatre", "speech"],
    headline:
      "«Кошкин дом» — лауреат II степени, чтецы студии берут весь диапазон наград от I до III степени.",
    entries: [
      {
        work: "«Кошкин дом»",
        type: "theatre",
        status: "Лауреат II степени",
        category: "Драматический театр",
        year: 2023,
        isTop: true,
        note: ""
      },
      {
        work: "Художественное слово — участники студии",
        type: "speech",
        status: "Лауреаты I–III степеней",
        category: "Художественное слово",
        year: 2023,
        isTop: false,
        note: ""
      },
      {
        work: "Новые участники художественного слова",
        type: "speech",
        status: "Лауреаты и дипломанты",
        category: "Художественное слово",
        year: 2024,
        isTop: false,
        note: ""
      }
    ]
  },
  {
    id: "starkids-2024",
    title: "Фестиваль STARKIDS!",
    city: "Санкт-Петербург",
    country: "Россия",
    level: "фестиваль-конкурс",
    years: [2024],
    directions: ["theatre"],
    headline:
      "Спектакль «Кошкин дом» занимает 1 место в своей возрастной категории.",
    entries: [
      {
        work: "«Кошкин дом»",
        type: "theatre",
        status: "1 место",
        category: "Драматический театр (возрастная категория студии)",
        year: 2024,
        isTop: true,
        note: ""
      }
    ]
  },
  {
    id: "ltfest-zimniy-les-2025",
    title: "LT FEST «Зимний лес»",
    city: "Санкт-Петербург",
    country: "Россия",
    level: "фестиваль",
    years: [2025],
    directions: ["theatre"],
    headline:
      "«Кошкин дом» — лауреат I степени и обладатель спецприза жюри за актёрское мастерство, «Лесная царевна» — лауреат III степени.",
    entries: [
      {
        work: "«Кошкин дом»",
        type: "theatre",
        status: "Лауреат I степени",
        category: "Драматический театр",
        year: 2025,
        isTop: true,
        note: "Спецприз жюри за актёрское мастерство"
      },
      {
        work: "«Лесная царевна»",
        type: "theatre",
        status: "Лауреат III степени",
        category: "Драматический театр",
        year: 2025,
        isTop: false,
        note: ""
      }
    ]
  }
];

// ======================================
// Награды и фестивали — вспомогательные функции
// ======================================

function buildTopAwardsFromFestivals(festivals) {
  const topAwards = [];

  festivals.forEach(function (festival) {
    if (!festival.entries) return;

    festival.entries.forEach(function (entry) {
      if (!entry.isTop) return;

      topAwards.push({
        festivalId: festival.id,
        label: entry.status + " — " + festival.title,
        sublabel: entry.work,
        level: festival.level,
        city: festival.city,
        year: entry.year
      });
    });
  });

  // Можно отсортировать: сначала Гран-при и 1 места, потом остальные
  topAwards.sort(function (a, b) {
    const score = function (status) {
      if (!status) return 0;
      if (status.indexOf("Гран-при") !== -1) return 3;
      if (status.indexOf("1 место") !== -1) return 2;
      if (status.indexOf("Лауреат I") !== -1) return 1;
      return 0;
    };

    const diff = score(b.label) - score(a.label);
    if (diff !== 0) return diff;

    return (b.year || 0) - (a.year || 0);
  });

  return topAwards;
}

function buildDirectionsTagsHtml(directions) {
  if (!directions || !directions.length) return "";

  return directions
    .map(function (dir) {
      if (dir === "theatre") {
        return '<span class="festival-tag festival-tag--theatre">Театр</span>';
      }
      if (dir === "film") {
        return '<span class="festival-tag festival-tag--film">Кино</span>';
      }
      if (dir === "speech") {
        return '<span class="festival-tag festival-tag--speech">Художественное слово</span>';
      }
      return "";
    })
    .join("");
}

// ======================================
// Награды и фестивали — рендер
// ======================================

function renderTopAwardsStrip(container, topAwards) {
  if (!container) return;

  const isDesktop = window.innerWidth >= 1024;

  // Фабрика HTML для одного бейджа
  function getBadgeHtml(award) {
    var isGrandPrix = award.label.indexOf("Гран-при") !== -1;

    return (
      '<article class="award-badge' +
      (isGrandPrix ? " award-badge--grandprix" : "") +
      '" data-festival-id="' +
      award.festivalId +
      '">' +
      '<h3 class="award-badge-title">' +
      award.label +
      "</h3>" +
      (award.sublabel
        ? '<p class="award-badge-text">' + award.sublabel + "</p>"
        : "") +
      "</article>"
    );
  }

  // Базовый набор бейджей
  var badgesHtml = topAwards.map(getBadgeHtml).join("");

  // Если автолента — размножаем набор бейджей, чтобы создать бесшовный цикл.
  var autoStripParent = container.closest(".awards-strip--auto");
  var repeatCount = 1;

  if (autoStripParent) {
    repeatCount = isDesktop ? 5 : 3; // на мобильных оставляем дубль для нормального скролла

    if (isDesktop) {
      var shiftPercent = -(100 / repeatCount);
      container.style.setProperty("--awards-shift", shiftPercent + "%");
    } else {
      container.style.removeProperty("--awards-shift");
    }
  }

  container.innerHTML = "";
  for (var r = 0; r < repeatCount; r++) {
    container.innerHTML += badgesHtml;
  }

  // Подстраиваем размер круга под самый «толстый» бейдж первой партии
  var maxSize = 0;
  var badges = container.querySelectorAll(".award-badge");
  badges.forEach(function (badge, index) {
    if (repeatCount > 1 && index >= topAwards.length) return; // считаем только оригинал
    var rect = badge.getBoundingClientRect();
    maxSize = Math.max(maxSize, rect.width, rect.height);
  });
  if (maxSize > 0) {
    var targetSize = Math.ceil(maxSize + 20);
    container.style.setProperty("--award-badge-size", targetSize + "px");
  }

  // Запоминаем базовую ширину одного цикла и ставим скролл в центр,
  // чтобы было пространство для прокрутки в обе стороны.
  if (repeatCount > 1) {
    var baseWidth = container.scrollWidth / repeatCount;
    var viewport = container.parentElement;
    if (viewport) {
      viewport.scrollLeft = baseWidth * Math.floor(repeatCount / 2);
    }
    container.dataset.awardsBaseWidth = String(baseWidth);
    container.dataset.awardsRepeat = String(repeatCount);
  }

  // Один обработчик на весь контейнер (делегирование кликов)
  if (!container.__awardsClickBound) {
    container.addEventListener("click", function (event) {
      var badge = event.target.closest(".award-badge");
      if (!badge) return;

      var festivalId = badge.getAttribute("data-festival-id");
      if (!festivalId) return;

      var target = document.querySelector(
        '[data-festival-id="' + festivalId + '"]'
      );
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    container.__awardsClickBound = true;
  }
}

function initAwardsStripControls(stripEl) {
  if (!stripEl) return;

  const viewport = stripEl.querySelector(".awards-strip-viewport");
  const inner = stripEl.querySelector(".awards-strip-inner");
  if (!viewport || !inner) return;

  // Бесконечная лента: если содержимое дублировано (auto-лента),
  // то при прокрутке переставляем scrollLeft, чтобы сразу после конца шёл старт.
  const repeatCount = inner.dataset.awardsRepeat
    ? parseInt(inner.dataset.awardsRepeat, 10)
    : 1;
  const baseWidth = inner.dataset.awardsBaseWidth
    ? parseFloat(inner.dataset.awardsBaseWidth)
    : 0;
  if (repeatCount > 1 && baseWidth > 0) {
    const minEdge = baseWidth * 0.5;
    const maxEdge = baseWidth * (repeatCount - 1.5);

    viewport.addEventListener("scroll", function () {
      if (viewport.scrollLeft > maxEdge) {
        viewport.scrollLeft -= baseWidth * (repeatCount - 2);
      } else if (viewport.scrollLeft < minEdge) {
        viewport.scrollLeft += baseWidth * (repeatCount - 2);
      }
    });
  }

  // Drag/Swipe прокрутка
  let isDragging = false;
  let dragStartX = 0;
  let startScroll = 0;

  viewport.addEventListener("pointerdown", function (event) {
    isDragging = true;
    dragStartX = event.clientX;
    startScroll = viewport.scrollLeft;
    viewport.classList.add("is-dragging");
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener("pointermove", function (event) {
    if (!isDragging) return;
    const deltaX = event.clientX - dragStartX;
    viewport.scrollLeft = startScroll - deltaX;
  });

  function endDrag() {
    isDragging = false;
    viewport.classList.remove("is-dragging");
  }

  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
  viewport.addEventListener("pointerleave", endDrag);

  // Горизонтальный скролл мышью
  viewport.addEventListener(
    "wheel",
    function (event) {
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      viewport.scrollLeft += delta;
      event.preventDefault();
    },
    { passive: false }
  );
}

function renderFestivalCards(container, festivals, maxVisible) {
  if (!container) return;
  container.innerHTML = "";

  // сортируем по максимальному году: свежие фестивали выше
  const sorted = festivals.slice().sort(function (a, b) {
    const maxYearA = a.years && a.years.length
      ? Math.max.apply(null, a.years)
      : 0;
    const maxYearB = b.years && b.years.length
      ? Math.max.apply(null, b.years)
      : 0;
    return maxYearB - maxYearA;
  });

  const displayCount =
    typeof maxVisible === "number" ? maxVisible : sorted.length;

  sorted.slice(0, displayCount).forEach(function (festival) {
    const card = document.createElement("article");
    card.className = "festival-card";
    card.setAttribute("data-festival-id", festival.id);

    const yearsText = festival.years && festival.years.length
      ? festival.years.join(" / ")
      : "";
    const metaParts = [];
    if (yearsText) metaParts.push(yearsText);
    if (festival.city) metaParts.push(festival.city);
    if (festival.level) metaParts.push(festival.level);
    const metaText = metaParts.join(" · ");

    const headerEl = document.createElement("header");

    const titleEl = document.createElement("h3");
    titleEl.className = "festival-card-title";
    titleEl.textContent = festival.title;

    const metaEl = document.createElement("p");
    metaEl.className = "festival-card-meta";
    metaEl.textContent = metaText;

    headerEl.appendChild(titleEl);
    headerEl.appendChild(metaEl);

    const headlineEl = document.createElement("p");
    headlineEl.className = "festival-card-headline";
    headlineEl.textContent = festival.headline;

    const listEl = document.createElement("ul");
    listEl.className = "festival-card-list";

    (festival.entries || [])
      .slice(0, 4) // на карточке максимум 3–4 пункта
      .forEach(function (entry) {
        const parts = [];
        if (entry.status) parts.push(entry.status);
        if (entry.work) parts.push(entry.work);
        if (entry.category) parts.push(entry.category);
        if (entry.note) parts.push(entry.note);

        const li = document.createElement("li");
        li.textContent = parts.join(" — ");
        listEl.appendChild(li);
      });

    const tagsWrapper = document.createElement("div");
    tagsWrapper.className = "festival-tags";
    tagsWrapper.innerHTML = buildDirectionsTagsHtml(festival.directions);

    card.appendChild(headerEl);
    card.appendChild(headlineEl);
    card.appendChild(listEl);
    card.appendChild(tagsWrapper);

    container.appendChild(card);
  });
}

function initAwardsBlock(festivals) {
  const awardsSection = document.querySelector("#awards");
  if (!awardsSection) return;

  const stripRoot = awardsSection.querySelector("[data-top-awards-root]");
  const festivalsRoot = awardsSection.querySelector("[data-festivals-root]");
  if (!stripRoot || !festivalsRoot) return;

  const topAwards = buildTopAwardsFromFestivals(festivals);

  renderTopAwardsStrip(stripRoot, topAwards);
  initAwardsStripControls(awardsSection.querySelector("[data-awards-strip]"));

  let festivalsExpanded = false;

  function renderFestivalsList() {
    const isMobile = window.innerWidth <= 768;
    const maxVisible = isMobile ? 2 : festivals.length;
    const limit = festivalsExpanded ? festivals.length : maxVisible;

    renderFestivalCards(festivalsRoot, festivals, limit);

    if (isMobile && festivals.length > maxVisible) {
      const toggleBtn = document.createElement("button");
      toggleBtn.type = "button";
      toggleBtn.className = "people-toggle awards-toggle";
      toggleBtn.textContent = festivalsExpanded
        ? "Свернуть фестивали"
        : "Показать ещё фестивали";

      toggleBtn.addEventListener("click", function () {
        festivalsExpanded = !festivalsExpanded;
        renderFestivalsList();
      });

      festivalsRoot.appendChild(toggleBtn);
    }
  }

  renderFestivalsList();

  let wasMobile = window.innerWidth <= 768;
  window.addEventListener("resize", function () {
    const isMobile = window.innerWidth <= 768;
    if (isMobile !== wasMobile) {
      festivalsExpanded = false;
      renderFestivalsList();
      wasMobile = isMobile;
    }
  });
}

// Подключаем блоки к жизненному циклу страницы
document.addEventListener("DOMContentLoaded", function () {
  // Награды и фестивали
  initAwardsBlock(awardsFestivalsData);

  // Видеоистории родителей
  initVideoReviewsSection();

  // Загрузка филиалов из JSON и инициализация секции
  fetch("assets/data/branches.json")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      return response.json();
    })
    .then(function (json) {
      var branches = Array.isArray(json) ? json : json.branches || [];
      if (branches.length) {
        initBranchesSection(branches);
      }
    })
    .catch(function (error) {
      console.error("Не удалось загрузить филиалы:", error);
    });

  // Люди театра — загрузка JSON и рендер
  fetch("assets/data/people.json")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      initPeopleBlock(data);
    })
    .catch(function (error) {
      console.error("Не удалось загрузить данные людей театра:", error);
    });

  // Абонементы студии — рендер из JSON + CTA
  initAbonementsSection();

  // Кастинг: временно отключаем скачок страницы по кнопке подписки
  const castingNewsButton = document.querySelector(
    ".section-casting .casting-btn-secondary"
  );

  if (castingNewsButton) {
    castingNewsButton.addEventListener("click", (event) => {
      // пока нет отдельной страницы/формы — не прыгаем наверх
      event.preventDefault();
    });
  }
});

// Snow Queen: задержка появления карточек после того, как секция попала в поле зрения
document.addEventListener("DOMContentLoaded", function () {
  const snowSection = document.querySelector(".section-snow-queen");
  const snowGrid = snowSection
    ? snowSection.querySelector(".snow-queen-grid")
    : null;

  if (!snowSection || !snowGrid) return;

  // Если IntersectionObserver поддерживается — показываем карточки,
  // когда пользователь докрутил до секции.
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              snowGrid.classList.add("snow-queen-grid--visible");
            }, 3000); // 3 секунды «чистого» фона
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(snowSection);
  } else {
    // Фоллбек для старых браузеров — показываем сразу
    snowGrid.classList.add("snow-queen-grid--visible");
  }
});
