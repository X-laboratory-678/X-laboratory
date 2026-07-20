document.documentElement.classList.add("js");

const toggle = document.querySelector("[data-nav-toggle]");
const navigation = document.querySelector("[data-nav]");
const label = document.querySelector("[data-nav-label]");

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
      toggle.focus();
    }
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false, true);
    }
  });

  const desktop = window.matchMedia("(min-width: 48rem)");
  desktop.addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });
}
