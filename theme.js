const root = document.documentElement;
const toggle = document.getElementById("theme-toggle");
const wave = document.getElementById("theme-wave");
const form = document.getElementById("element-form");
const select = document.getElementById("element-select");

const THEME_KEY = "ui-gallery-theme";
const THEME_BG = {
  light: "#f5f1e8",
  dark: "#191511",
};

const savedTheme = localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
root.setAttribute("data-theme", savedTheme);
if (toggle) toggle.checked = savedTheme === "dark";

function launchThemeWave(nextTheme) {
  if (!toggle || !wave) return;

  const rect = toggle.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  const farthestDistance = Math.hypot(originX, window.innerHeight - originY);
  const scale = (farthestDistance * 2) / 10;

  wave.style.setProperty("--wave-origin-left", `${originX}px`);
  wave.style.setProperty("--wave-origin-top", `${originY}px`);
  wave.style.setProperty("--wave-scale", scale.toString());
  wave.style.setProperty("--wave-color", THEME_BG[nextTheme]);

  wave.classList.remove("is-active");
  void wave.offsetWidth;
  wave.classList.add("is-active");

  window.setTimeout(() => {
    root.setAttribute("data-theme", nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
  }, 250);

  window.setTimeout(() => {
    wave.classList.remove("is-active");
  }, 500);
}

if (toggle) {
  toggle.addEventListener("change", () => {
    const nextTheme = toggle.checked ? "dark" : "light";
    launchThemeWave(nextTheme);
  });
}

if (form && select) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!select.value) return;
    window.location.href = select.value;
  });
}
