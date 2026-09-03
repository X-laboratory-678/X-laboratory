const copyWithFallback = async (value) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.append(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();

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
