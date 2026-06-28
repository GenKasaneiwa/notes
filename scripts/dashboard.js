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
  const resultCount = root.querySelector("[data-result-count]");
  const emptyState = root.querySelector("[data-empty-state]");
  let selectedCategory = "all";

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

  searchInput?.addEventListener("input", update);
  for (const button of categoryButtons) {
    button.addEventListener("click", () => {
      selectedCategory = button.dataset.categoryFilter || "all";
      update();
    });
  }

  update();
}

if (typeof document !== "undefined") {
  initDashboard();
}
