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
    const swipeDocument = swipeTarget.ownerDocument;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let pointerId = null;
    let tracking = false;
    let swiping = false;

    const clearSwipeOffset = () => {
      swipeTarget.classList.remove("is-swiping");
      swipeTarget.style.removeProperty("--swipe-offset");
    };

    const applySwipeOffset = (deltaX) => {
      const boundedOffset = Math.max(-86, Math.min(86, deltaX * 0.42));
      swipeTarget.style.setProperty("--swipe-offset", `${boundedOffset}px`);
    };

    const finishSwipe = (deltaX, deltaY) => {
      const direction = getSwipeDirection(deltaX, deltaY);
      tracking = false;
      pointerId = null;
      clearSwipeOffset();
      if (!direction) return;

      setSelectedCategory(getAdjacentCategory(categories, selectedCategory, direction));
      suppressNextClick = true;
      setTimeout(() => {
        suppressNextClick = false;
      }, 350);
    };

    const startSwipe = (clientX, clientY, id = null) => {
      pointerId = id;
      startX = clientX;
      startY = clientY;
      currentX = startX;
      currentY = startY;
      tracking = true;
      swiping = false;
    };

    const updateSwipe = (clientX, clientY, event) => {
      currentX = clientX;
      currentY = clientY;
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;
      if (Math.abs(deltaX) > 12 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        swiping = true;
        swipeTarget.classList.add("is-swiping");
        applySwipeOffset(deltaX);
        event?.preventDefault();
      }
    };

    swipeTarget.addEventListener("pointerdown", (event) => {
      if (!event.isPrimary) return;
      startSwipe(event.clientX, event.clientY, event.pointerId);
      swipeTarget.setPointerCapture?.(event.pointerId);
    });

    swipeDocument.addEventListener("pointermove", (event) => {
      if (!tracking || event.pointerId !== pointerId) return;
      updateSwipe(event.clientX, event.clientY, event);
    });

    swipeDocument.addEventListener("pointerup", (event) => {
      if (!tracking || event.pointerId !== pointerId) return;
      finishSwipe(event.clientX - startX, event.clientY - startY);
    });

    swipeDocument.addEventListener("pointercancel", (event) => {
      if (event.pointerId !== pointerId) return;
      tracking = false;
      pointerId = null;
      clearSwipeOffset();
    });

    swipeTarget.addEventListener("touchstart", (event) => {
      if (tracking || event.touches.length !== 1) return;
      const touch = event.touches[0];
      startSwipe(touch.clientX, touch.clientY, "touch");
    }, { passive: true });

    swipeDocument.addEventListener("touchmove", (event) => {
      if (!tracking || event.touches.length !== 1) return;
      const touch = event.touches[0];
      updateSwipe(touch.clientX, touch.clientY, event);
    }, { passive: false });

    swipeDocument.addEventListener("touchend", (event) => {
      if (!tracking) return;
      const touch = event.changedTouches[0];
      finishSwipe(touch.clientX - startX, touch.clientY - startY);
    });

    swipeDocument.addEventListener("touchcancel", () => {
      tracking = false;
      pointerId = null;
      clearSwipeOffset();
    });

    swipeTarget.addEventListener("click", (event) => {
      if (!suppressNextClick && !swiping) return;
      event.preventDefault();
      event.stopPropagation();
      suppressNextClick = false;
      swiping = false;
    }, true);
  }

  update();
}

if (typeof document !== "undefined") {
  initDashboard();
}
