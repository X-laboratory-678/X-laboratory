document.querySelectorAll("[data-bibtex]").forEach((bibtex) => {
  const button = bibtex.querySelector("[data-bibtex-copy]");
  const code = bibtex.querySelector("code");
  const status = bibtex.querySelector("[data-bibtex-status]");

  if (!button || !code || !status || !navigator.clipboard) return;

  button.hidden = false;
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(code.textContent);
      status.textContent = button.dataset.copiedLabel;
    } catch {
      status.textContent = button.dataset.copyErrorLabel;
    }
  });
});
