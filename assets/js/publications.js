const directory = document.querySelector("[data-publication-directory]");

if (directory) {
  const filters = directory.querySelector("[data-publication-filters]");
  const items = [...directory.querySelectorAll("[data-publication-item]")];
  const groups = [...directory.querySelectorAll("[data-publication-group]")];
  const controls = [...directory.querySelectorAll("[data-publication-filter]")];
  const reset = directory.querySelector("[data-publication-reset]");
  const count = directory.querySelector("[data-publication-count]");
  const empty = directory.querySelector("[data-publication-empty]");

  if (filters && items.length) {
    const update = () => {
      const values = Object.fromEntries(controls.map((control) => [control.dataset.publicationFilter, control.value]));
      let visibleCount = 0;

      items.forEach((item) => {
        const areas = item.dataset.researchAreas.split(" ").filter(Boolean);
        const visible = (!values.year || item.dataset.year === values.year)
          && (!values.type || item.dataset.type === values.type)
          && (!values.research || areas.includes(values.research));
        item.hidden = !visible;
        if (visible) visibleCount += 1;
      });

      groups.forEach((group) => {
        group.hidden = !group.querySelector("[data-publication-item]:not([hidden])");
      });

      const template = visibleCount === 1 ? directory.dataset.countOne : directory.dataset.countMany;
      if (count && template) count.textContent = template.replace("{count}", visibleCount);
      if (empty) empty.hidden = visibleCount !== 0;
    };

    filters.hidden = false;
    controls.forEach((control) => control.addEventListener("change", update));
    reset?.addEventListener("click", () => {
      filters.reset();
      update();
      controls[0]?.focus();
    });
    update();
  }
}
