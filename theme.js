const root = document.documentElement;
const toggle = document.getElementById("theme-toggle");
const wave = document.getElementById("theme-wave");
const form = document.getElementById("element-form");
const select = document.getElementById("element-select");

const THEME_KEY = "ui-gallery-theme";
const WAVE_DURATION_MS = 1000;
const THEME_BG = {
  light: "#ffffff",
  dark: "#000000",
};

const savedTheme = localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
root.setAttribute("data-theme", savedTheme);
if (toggle) toggle.checked = savedTheme === "dark";

function launchThemeWave(nextTheme) {
  if (!toggle || !wave) return;

  const rect = toggle.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  const corners = [
    [0, 0],
    [window.innerWidth, 0],
    [0, window.innerHeight],
    [window.innerWidth, window.innerHeight],
  ];

  const farthestDistance = Math.max(
    ...corners.map(([x, y]) => Math.hypot(x - originX, y - originY)),
  );

  const scale = (farthestDistance * 2) / 10;

  wave.style.setProperty("--wave-origin-left", `${originX}px`);
  wave.style.setProperty("--wave-origin-top", `${originY}px`);
  wave.style.setProperty("--wave-scale", scale.toString());
  wave.style.setProperty("--wave-color", THEME_BG[nextTheme]);

  root.setAttribute("data-theme", nextTheme);
  localStorage.setItem(THEME_KEY, nextTheme);

  wave.classList.remove("is-active");
  void wave.offsetWidth;
  wave.classList.add("is-active");

  window.setTimeout(() => {
    wave.classList.remove("is-active");
  }, WAVE_DURATION_MS);
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
