document.querySelectorAll("[data-bibtex]").forEach((bibtex) => {
  const button = bibtex.querySelector("[data-bibtex-copy]");
  const code = bibtex.querySelector("code");
  const status = bibtex.querySelector("[data-bibtex-status]");

  if (!button || !code || !status) return;

  button.hidden = false;
  button.addEventListener("click", async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code.textContent);
      } else {
        const selection = window.getSelection();
        const range = document.createRange();
        const textarea = document.createElement("textarea");
        textarea.value = code.textContent;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.append(textarea);
        textarea.select();
        if (!document.execCommand("copy")) throw new Error("copy failed");
        selection?.removeAllRanges();
        range.selectNodeContents(code);
        selection?.addRange(range);
        textarea.remove();
      }
      status.textContent = button.dataset.copiedLabel;
    } catch {
      status.textContent = button.dataset.copyErrorLabel;
    }
  });
});
