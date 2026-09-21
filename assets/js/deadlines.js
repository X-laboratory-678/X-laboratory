const root = document.querySelector("[data-deadlines]");

if (root) {
  const items = [...root.querySelectorAll("[data-deadline-item]")];
  const filters = [...root.querySelectorAll("[data-deadline-filter]")];
  const filteredEmpty = root.querySelector("[data-deadline-filter-empty]");
  const archive = root.querySelector("[data-deadline-archive]");

  const updateCountdowns = () => {
    const now = Date.now();
    items.forEach((item) => {
      const target = item.dataset.deadlineDate;
      const output = item.querySelector("[data-deadline-countdown]");
      if (!target || !output) return;
      const days = Math.ceil((Date.parse(target) - now) / 86400000);
      output.textContent = days > 0 ? `${days}d` : "";
      output.hidden = days <= 0;
    });
  };

  const applyFilter = (value) => {
    let visible = 0;

    items.forEach((item) => {
      const availableFilters = item.dataset.deadlineFilters.split(" ").filter(Boolean);
      const matches = value === "all" || availableFilters.includes(value);
      item.hidden = !matches;
      if (matches) visible += 1;
    });

    if (filteredEmpty) filteredEmpty.hidden = visible > 0;
  };

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const value = filter.dataset.deadlineFilter;
      filters.forEach((candidate) => {
        const isActive = candidate === filter;
        candidate.classList.toggle("is-active", isActive);
        candidate.setAttribute("aria-pressed", String(isActive));
      });
      applyFilter(value);
    });
  });

  if (archive) {
    const summary = archive.querySelector("summary");
    archive.addEventListener("toggle", () => {
      if (!summary) return;
      summary.textContent = archive.open ? summary.dataset.hideLabel : summary.dataset.showLabel;
    });
  }

  updateCountdowns();
}
