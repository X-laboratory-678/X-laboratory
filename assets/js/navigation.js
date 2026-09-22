document.documentElement.classList.add("js");

const menuControl = document.querySelector("#menu-control");
const languageControl = document.querySelector("#languages");
const menuToggle = document.querySelector(".book-menu-toggle");
const languageToggle = document.querySelector(".book-language-toggle");
const searchInput = document.querySelector("[data-search-input]");
const searchResults = document.querySelector("#book-search-results");
const searchData = document.querySelector("#book-search-data");

const syncMenuState = () => {
  menuToggle?.setAttribute("aria-expanded", String(Boolean(menuControl?.checked)));
};

const syncLanguageState = () => {
  languageToggle?.setAttribute("aria-expanded", String(Boolean(languageControl?.checked)));
};

const toggleCheckboxFromKeyboard = (event, control, sync) => {
  if (!control || !["Enter", " "].includes(event.key)) return;
  event.preventDefault();
  control.checked = !control.checked;
  sync();
};

const closeMenu = () => {
  if (menuControl) menuControl.checked = false;
  syncMenuState();
};

document.querySelectorAll(".book-menu a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

menuToggle?.addEventListener("keydown", (event) => toggleCheckboxFromKeyboard(event, menuControl, syncMenuState));
languageToggle?.addEventListener("keydown", (event) => toggleCheckboxFromKeyboard(event, languageControl, syncLanguageState));
menuControl?.addEventListener("change", syncMenuState);
languageControl?.addEventListener("change", syncLanguageState);
syncMenuState();
syncLanguageState();

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    if (languageControl) languageControl.checked = false;
    syncLanguageState();
    if (searchInput) {
      searchInput.value = "";
      searchResults?.replaceChildren();
    }
  }

  if ((event.key === "s" || event.key === "/") && !event.metaKey && !event.ctrlKey && !event.altKey) {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable) return;
    event.preventDefault();
    searchInput?.focus();
  }
});

if (searchInput && searchResults && searchData) {
  let entries = [];

  try {
    entries = JSON.parse(searchData.textContent || "[]");
  } catch {
    entries = [];
  }

  const renderResults = (query) => {
    searchResults.replaceChildren();
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return;

    const matches = entries
      .filter((entry) => `${entry.title} ${entry.content}`.toLocaleLowerCase().includes(normalizedQuery))
      .slice(0, 12);

    matches.forEach((entry) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = entry.href;
      link.textContent = entry.title;
      item.append(link);
      searchResults.append(item);
    });
  };

  searchInput.addEventListener("input", () => renderResults(searchInput.value));
}
