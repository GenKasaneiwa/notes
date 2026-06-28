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

function readNoteFromElement(element) {
  return {
    element,
    title: element.dataset.title || "",
    description: element.dataset.description || "",
    category: element.dataset.category || "",
  };
}

export function initDashboard(root = document) {
  const noteElements = [...root.querySelectorAll("[data-note-card]")];
  if (noteElements.length === 0) return;

  const notes = noteElements.map(readNoteFromElement);
  const searchInput = root.querySelector("[data-note-search]");
  const categoryButtons = [...root.querySelectorAll("[data-category-filter]")];
  const categories = categoryButtons.map((button) => button.dataset.categoryFilter || "all");
  const swipeTarget = root.querySelector("[data-note-swipe]") || root.querySelector(".note-list");
  const resultCount = root.querySelector("[data-result-count]");
  const emptyState = root.querySelector("[data-empty-state]");
  let selectedCategory = "all";
  let suppressNextClick = false;

  const update = () => {
    const visibleNotes = filterNotes(notes, {
      query: searchInput?.value || "",
      category: selectedCategory,
    });
    const visibleElements = new Set(visibleNotes.map((note) => note.element));

    for (const note of notes) {
      note.element.hidden = !visibleElements.has(note.element);
    }

    for (const button of categoryButtons) {
      const isActive = button.dataset.categoryFilter === selectedCategory;
      button.setAttribute("aria-pressed", String(isActive));
    }

    if (resultCount) resultCount.textContent = `${visibleNotes.length} items`;
    if (emptyState) emptyState.hidden = visibleNotes.length !== 0;
  };

  const setSelectedCategory = (category) => {
    selectedCategory = category || "all";
    update();
    const selectedButton = categoryButtons.find((button) => button.dataset.categoryFilter === selectedCategory);
    selectedButton?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  searchInput?.addEventListener("input", update);
  for (const button of categoryButtons) {
    button.addEventListener("click", () => {
      setSelectedCategory(button.dataset.categoryFilter || "all");
    });
  }

  if (swipeTarget) {
    let startX = 0;
    let startY = 0;
    let tracking = false;

    swipeTarget.addEventListener("touchstart", (event) => {
      if (event.touches.length !== 1) return;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      tracking = true;
    }, { passive: true });

    swipeTarget.addEventListener("touchmove", (event) => {
      if (!tracking || event.touches.length !== 1) return;
      const deltaX = event.touches[0].clientX - startX;
      const deltaY = event.touches[0].clientY - startY;
      if (Math.abs(deltaX) > 18 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35) {
        event.preventDefault();
      }
    }, { passive: false });

    swipeTarget.addEventListener("touchend", (event) => {
      if (!tracking) return;
      tracking = false;
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      if (Math.abs(deltaX) < 58 || Math.abs(deltaX) < Math.abs(deltaY) * 1.35) return;

      const direction = deltaX < 0 ? "next" : "previous";
      setSelectedCategory(getAdjacentCategory(categories, selectedCategory, direction));
      suppressNextClick = true;
      setTimeout(() => {
        suppressNextClick = false;
      }, 350);
    });

    swipeTarget.addEventListener("touchcancel", () => {
      tracking = false;
    });

    swipeTarget.addEventListener("click", (event) => {
      if (!suppressNextClick) return;
      event.preventDefault();
      event.stopPropagation();
      suppressNextClick = false;
    }, true);
  }

  update();
}

if (typeof document !== "undefined") {
  initDashboard();
}
