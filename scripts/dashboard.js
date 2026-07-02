function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

export function filterNotes(notes, { query = "", category = "all" } = {}) {
  const normalizedQuery = normalize(query);
  const normalizedCategory = normalize(category || "all");

  return notes.filter((note) => {
    const categoryMatches = normalizedCategory === "all" || normalize(note.category) === normalizedCategory;
    const searchable = `${note.title} ${note.description} ${note.category}`.toLowerCase();
    const queryMatches = normalizedQuery === "" || searchable.includes(normalizedQuery);
    return categoryMatches && queryMatches;
  });
}

export function getAdjacentCategory(categories, currentCategory, direction) {
  if (categories.length === 0) return "all";
  const currentIndex = categories.indexOf(currentCategory);
  if (currentIndex === -1) return categories[0];
  const offset = direction === "previous" ? -1 : 1;
  return categories[(currentIndex + offset + categories.length) % categories.length];
}

export function getSwipeDirection(deltaX, deltaY, threshold = 58) {
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  if (absX < threshold || absX < absY * 1.35) return null;
  return deltaX < 0 ? "next" : "previous";
}

function readNoteFromElement(element) {
  return {
    element,
    title: element.dataset.title || "",
    description: element.dataset.description || "",
    category: element.dataset.category || "",
  };
}

function createSlide(category, notes) {
  const slide = document.createElement("section");
  slide.className = "swiper-slide note-slide";
  slide.dataset.noteSlide = category;

  const heading = document.createElement("div");
  heading.className = "panel-heading";

  const count = document.createElement("span");
  count.dataset.resultCount = "";
  heading.append(count);

  const list = document.createElement("div");
  list.className = "note-list";

  for (const note of filterNotes(notes, { category })) {
    const clone = note.element.cloneNode(true);
    clone.removeAttribute("data-note-card");
    list.append(clone);
  }

  const empty = document.createElement("p");
  empty.className = "empty-state";
  empty.dataset.emptyState = "";
  empty.hidden = true;
  empty.textContent = "該当するノートはありません。";

  slide.append(heading, list, empty);
  return slide;
}

function readSlideState(slide) {
  const cards = [...slide.querySelectorAll(".note-card")].map(readNoteFromElement);
  return {
    category: slide.dataset.noteSlide || "all",
    cards,
    count: slide.querySelector("[data-result-count]"),
    empty: slide.querySelector("[data-empty-state]"),
  };
}

export function initDashboard(root = document) {
  const noteElements = [...root.querySelectorAll("[data-note-card]")];
  if (noteElements.length === 0) return;

  const sourceNotes = noteElements.map(readNoteFromElement);
  const searchInput = root.querySelector("[data-note-search]");
  const categoryButtons = [...root.querySelectorAll("[data-category-filter]")];
  const categories = categoryButtons.map((button) => button.dataset.categoryFilter || "all");
  const swiperContainer = root.querySelector("[data-note-swiper]");
  const swiperWrapper = root.querySelector("[data-swiper-wrapper]");
  let selectedCategory = "all";
  let swiper = null;

  if (swiperContainer && swiperWrapper && typeof globalThis.Swiper === "function") {
    for (const category of categories.slice(1)) {
      const hasSlide = [...swiperWrapper.querySelectorAll("[data-note-slide]")]
        .some((slide) => slide.dataset.noteSlide === category);
      if (!hasSlide) {
        swiperWrapper.append(createSlide(category, sourceNotes));
      }
    }
  }

  const slideStates = [...root.querySelectorAll("[data-note-slide]")].map(readSlideState);

  const scrollSelectedCategoryIntoView = () => {
    const selectedButton = categoryButtons.find((button) => button.dataset.categoryFilter === selectedCategory);
    selectedButton?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const update = ({ syncSwiper = false, scrollTab = false } = {}) => {
    const query = searchInput?.value || "";
    const activeIndex = Math.max(0, categories.indexOf(selectedCategory));

    for (const button of categoryButtons) {
      const isActive = button.dataset.categoryFilter === selectedCategory;
      button.setAttribute("aria-pressed", String(isActive));
    }

    for (const state of slideStates) {
      const category = swiper ? "all" : selectedCategory;
      const visibleCards = filterNotes(state.cards, { query, category });
      const visibleElements = new Set(visibleCards.map((note) => note.element));

      for (const note of state.cards) {
        note.element.hidden = !visibleElements.has(note.element);
      }

      if (state.count) state.count.textContent = `${visibleCards.length} items`;
      if (state.empty) state.empty.hidden = visibleCards.length !== 0;
    }

    if (syncSwiper && swiper && swiper.activeIndex !== activeIndex) {
      swiper.slideTo(activeIndex);
    }

    if (swiper) swiper.updateAutoHeight(0);
    if (scrollTab) scrollSelectedCategoryIntoView();
  };

  const setSelectedCategory = (category, options = {}) => {
    selectedCategory = category || "all";
    update(options);
  };

  searchInput?.addEventListener("input", () => update());
  for (const button of categoryButtons) {
    button.addEventListener("click", () => {
      setSelectedCategory(button.dataset.categoryFilter || "all", {
        syncSwiper: true,
        scrollTab: true,
      });
    });
  }

  if (swiperContainer && typeof globalThis.Swiper === "function") {
    swiper = new globalThis.Swiper(swiperContainer, {
      autoHeight: true,
      resistanceRatio: 0.58,
      slidesPerView: 1,
      spaceBetween: 10,
      speed: 240,
      threshold: 4,
      on: {
        slideChange() {
          selectedCategory = categories[this.activeIndex] || "all";
          update({ scrollTab: true });
        },
      },
    });
  }

  update();
}

if (typeof document !== "undefined") {
  initDashboard();
}
