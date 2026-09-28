const copyWithFallback = async (value) => {
  const text = String(value || "").trim();
  if (!text) throw new Error("Nothing to copy");

  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Some browsers expose Clipboard API but reject the permission. Try the
      // synchronous fallback before reporting an error to the visitor.
    }
  }

  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.setAttribute("aria-hidden", "true");
  input.style.cssText = "position: fixed; inset: -9999px auto auto -9999px; width: 1px; height: 1px; opacity: 0;";
  document.body.append(input);
  input.focus({ preventScroll: true });
  input.select();
  input.setSelectionRange(0, text.length);

  let copied = false;
  try {
    copied = document.queryCommandSupported?.("copy") !== false && document.execCommand("copy");
  } finally {
    input.remove();
  }

  if (!copied) throw new Error("Copy command failed");
};

document.querySelectorAll("[data-contact-copy]").forEach((button) => {
  const action = button.closest(".contact-action");
  const status = action?.querySelector("[data-contact-status]");
  if (!status) return;

  button.hidden = false;
  button.addEventListener("click", async () => {
    try {
      await copyWithFallback(button.dataset.copyValue || "");
      status.textContent = button.dataset.copiedLabel;
    } catch {
      status.textContent = button.dataset.copyErrorLabel;
    }
  });
});
