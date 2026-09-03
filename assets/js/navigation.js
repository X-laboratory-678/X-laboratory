document.documentElement.classList.add("js");

const toggle = document.querySelector("[data-nav-toggle]");
const navigation = document.querySelector("[data-nav]");
const label = document.querySelector("[data-nav-label]");
const groups = [...document.querySelectorAll("[data-nav-group]")];

const closeGroup = (group, returnFocus = false) => {
  const disclosure = group.querySelector(":scope > .site-nav__item-row [data-nav-disclosure]");
  group.dataset.open = "false";
  disclosure?.setAttribute("aria-expanded", "false");
  if (returnFocus) disclosure?.focus();
};

const closeGroups = (except = null) => {
  groups.forEach((group) => {
    if (group !== except) closeGroup(group);
  });
};

groups.forEach((group) => {
  const disclosure = group.querySelector(":scope > .site-nav__item-row [data-nav-disclosure]");
  const submenu = group.querySelector(":scope > .site-nav__submenu");
  if (!disclosure || !submenu) return;

  disclosure.addEventListener("click", (event) => {
    const open = disclosure.getAttribute("aria-expanded") !== "true";
    closeGroups(open ? group : null);
    group.dataset.open = String(open);
    disclosure.setAttribute("aria-expanded", String(open));
    if (open && event.detail === 0) submenu.querySelector("a")?.focus();
  });
});

if (toggle && navigation && label) {
  const openLabel = label.textContent;
  const closeLabel = toggle.dataset.closeLabel || openLabel;

  const setOpen = (open, returnFocus = false) => {
    toggle.setAttribute("aria-expanded", String(open));
    navigation.dataset.open = String(open);
    label.textContent = open ? closeLabel : openLabel;

    if (open) {
      navigation.querySelector("a")?.focus();
    } else if (returnFocus) {
      closeGroups();
      toggle.focus();
    }
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const openGroup = groups.find((group) => group.dataset.open === "true");
    if (openGroup) closeGroup(openGroup, true);
    else if (toggle.getAttribute("aria-expanded") === "true") setOpen(false, true);
  });

  document.addEventListener("click", (event) => {
    if (!navigation.contains(event.target)) closeGroups();
  });

  const desktop = window.matchMedia("(min-width: 48rem)");
  desktop.addEventListener("change", (event) => {
    if (event.matches) {
      setOpen(false);
      closeGroups();
    }
  });
}
