// ======================================
// 1. Базовая инициализация
// ======================================

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
    const detailTitle = journey.querySelector(".studio-journey-detail-title");
    const detailText = journey.querySelector(".studio-journey-detail-text");

    function setActiveStep(step) {
      if (!step || !detailTitle || !detailText) {
        return;
      }

      steps.forEach((item) => {
        item.classList.toggle("is-active", item === step);
      });

      const title = step.getAttribute("data-title") || "";
      const text = step.getAttribute("data-text") || "";

      detailTitle.textContent = title;
      detailText.textContent = text;
    }

    const initiallyActive =
      journey.querySelector(".studio-journey-step.is-active") || steps[0];

    if (initiallyActive) {
      setActiveStep(initiallyActive);
    }

    journey.addEventListener("click", (event) => {
      const targetStep = event.target.closest(".studio-journey-step");
      if (!targetStep || !journey.contains(targetStep)) {
        return;
      }

      setActiveStep(targetStep);
    });

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
                ${visibleAwards
                  .map(
                    (a) => `
                  <span class="films-card-award-pill">
                    ${[a.status, a.festival].filter(Boolean).join(" ")}
                  </span>
                `
                  )
                  .join("")}
                ${
                  extraCount > 0
                    ? `<span class="films-card-award-pill films-card-award-pill--more">+${extraCount} фестиваля</span>`
                    : ""
                }
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

  // Рендерим первую «дорожку»
  container.innerHTML = badgesHtml;

  // Если у родителя стоит класс автоленты — дублируем содержимое,
  // чтобы CSS-анимация по -50% крутила бесконечную ленту без дыр
  var autoStripParent = container.closest(".awards-strip--auto");
  if (autoStripParent) {
    container.innerHTML += badgesHtml;
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

function renderFestivalCards(container, festivals) {
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

  sorted.forEach(function (festival) {
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
  renderFestivalCards(festivalsRoot, festivals);
}

// Подключаем блок к жизненному циклу страницы
document.addEventListener("DOMContentLoaded", function () {
  initAwardsBlock(awardsFestivalsData);
});
