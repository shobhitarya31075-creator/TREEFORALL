// High-contrast mode toggle.
document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("contrast-toggle");
  button?.addEventListener("click", () => {
    const active = document.body.classList.toggle("high-contrast");
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute("aria-label", active ? "Turn off high contrast" : "Turn on high contrast");
  });
});
