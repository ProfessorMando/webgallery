const root = document.documentElement;
const toggle = document.getElementById("theme-toggle");
const wave = document.getElementById("theme-wave");
const form = document.getElementById("element-form");
const select = document.getElementById("element-select");
const headerTitle = document.querySelector(".page-header h1");
const slider = document.querySelector(".slider");

const THEME_KEY = "ui-gallery-theme";
const WAVE_DURATION_MS = 1250;
const WAVE_BAND = 170;

const THEMES = {
  light: {
    bg: "#ffffff",
    surface: "#b3b3b3",
    text: "#000000",
    accent: "#000000",
    accentContrast: "#ffffff",
    outline: "#7a7a7a",
    shadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
  },
  dark: {
    bg: "#000000",
    surface: "#666666",
    text: "#ffffff",
    accent: "#ffffff",
    accentContrast: "#000000",
    outline: "#9a9a9a",
    shadow: "0 10px 24px rgba(0, 0, 0, 0.5)",
  },
};

let animationFrame = null;
let activeAnimationId = 0;

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToCss({ r, g, b }) {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function mixColor(from, to, t) {
  const c1 = hexToRgb(from);
  const c2 = hexToRgb(to);
  return rgbToCss({
    r: lerp(c1.r, c2.r, t),
    g: lerp(c1.g, c2.g, t),
    b: lerp(c1.b, c2.b, t),
  });
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function easeInCloth(t) {
  return t ** 2.2;
}

function pointDistance(point, origin) {
  return Math.hypot(point.x - origin.x, point.y - origin.y);
}

function splitHeadingToLetters() {
  if (!headerTitle || headerTitle.dataset.waveSplit === "true") return;

  const text = headerTitle.textContent || "";
  const fragment = document.createDocumentFragment();

  for (const char of text) {
    const letter = document.createElement("span");
    letter.className = "wave-letter";

    if (char === " ") {
      letter.textContent = " ";
      fragment.appendChild(letter);
      continue;
    }

    const top = document.createElement("span");
    top.className = "wave-letter-half wave-letter-top";
    top.textContent = char;

    const bottom = document.createElement("span");
    bottom.className = "wave-letter-half wave-letter-bottom";
    bottom.textContent = char;

    letter.appendChild(top);
    letter.appendChild(bottom);
    fragment.appendChild(letter);
  }

  headerTitle.textContent = "";
  headerTitle.appendChild(fragment);
  headerTitle.dataset.waveSplit = "true";
}

function getCenterFromRect(rect) {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function getRectDistanceRange(rect, origin) {
  const corners = [
    { x: rect.left, y: rect.top },
    { x: rect.right, y: rect.top },
    { x: rect.left, y: rect.bottom },
    { x: rect.right, y: rect.bottom },
  ];

  const distances = corners.map((corner) => pointDistance(corner, origin));
  return {
    min: Math.min(...distances),
    max: Math.max(...distances),
  };
}

function rangeProgress(radius, minDistance, maxDistance, band = WAVE_BAND) {
  const start = minDistance - band / 2;
  const end = maxDistance + band / 2;
  if (end <= start) return radius >= end ? 1 : 0;
  return clamp01((radius - start) / (end - start));
}

function setThemeStatic(themeName) {
  const theme = THEMES[themeName];
  if (!theme) return;

  document.body.style.backgroundColor = theme.bg;
  document.body.style.color = theme.text;

  if (headerTitle) {
    headerTitle.querySelectorAll(".wave-letter-half").forEach((letterHalf) => {
      letterHalf.style.color = theme.text;
    });
  }

  const card = document.querySelector(".selector-card");
  if (card) {
    card.style.backgroundColor = theme.surface;
    card.style.borderColor = theme.outline;
    card.style.color = theme.text;
    card.style.boxShadow = theme.shadow;
  }

  if (slider) {
    slider.style.backgroundColor = theme.surface;
    slider.style.borderColor = theme.outline;
  }

  const knobStyles = document.documentElement.style;
  knobStyles.setProperty("--knob-color", theme.accent);

  if (select) {
    select.style.backgroundColor = theme.bg;
    select.style.color = theme.text;
    select.style.borderColor = theme.outline;
  }

  const button = document.querySelector("button");
  if (button) {
    button.style.backgroundColor = theme.accent;
    button.style.color = theme.accentContrast;
    button.style.borderColor = theme.outline;
  }
}

function launchThemeWave(nextTheme) {
  if (!toggle || !wave) return;

  splitHeadingToLetters();

  const previousTheme = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  if (previousTheme === nextTheme) return;

  const from = THEMES[previousTheme];
  const to = THEMES[nextTheme];

  const toggleRect = toggle.getBoundingClientRect();
  const origin = getCenterFromRect(toggleRect);

  const corners = [
    { x: 0, y: 0 },
    { x: window.innerWidth, y: 0 },
    { x: 0, y: window.innerHeight },
    { x: window.innerWidth, y: window.innerHeight },
  ];

  const maxRadius = Math.max(...corners.map((corner) => pointDistance(corner, origin)));

  const card = document.querySelector(".selector-card");
  const button = document.querySelector("button");
  const letters = Array.from(headerTitle?.querySelectorAll(".wave-letter") || []);

  const elements = [
    {
      minDistance: 0,
      maxDistance: maxRadius,
      paint: (p) => {
        document.body.style.backgroundColor = mixColor(from.bg, to.bg, p);
        document.body.style.color = mixColor(from.text, to.text, p);
      },
    },
    card && {
      ...getRectDistanceRange(card.getBoundingClientRect(), origin),
      paint: (p) => {
        card.style.backgroundColor = mixColor(from.surface, to.surface, p);
        card.style.borderColor = mixColor(from.outline, to.outline, p);
        card.style.color = mixColor(from.text, to.text, p);
      },
    },
    slider && {
      ...getRectDistanceRange(slider.getBoundingClientRect(), origin),
      paint: (p) => {
        slider.style.backgroundColor = mixColor(from.surface, to.surface, p);
        slider.style.borderColor = mixColor(from.outline, to.outline, p);
        root.style.setProperty("--knob-color", mixColor(from.accent, to.accent, p));
      },
    },
    select && {
      ...getRectDistanceRange(select.getBoundingClientRect(), origin),
      paint: (p) => {
        select.style.backgroundColor = mixColor(from.bg, to.bg, p);
        select.style.color = mixColor(from.text, to.text, p);
        select.style.borderColor = mixColor(from.outline, to.outline, p);
      },
    },
    button && {
      ...getRectDistanceRange(button.getBoundingClientRect(), origin),
      paint: (p) => {
        button.style.backgroundColor = mixColor(from.accent, to.accent, p);
        button.style.color = mixColor(from.accentContrast, to.accentContrast, p);
        button.style.borderColor = mixColor(from.outline, to.outline, p);
      },
    },
    ...letters.flatMap((letter) => {
      const topHalf = letter.querySelector(".wave-letter-top");
      const bottomHalf = letter.querySelector(".wave-letter-bottom");

      if (!topHalf || !bottomHalf) {
        return [{
          ...getRectDistanceRange(letter.getBoundingClientRect(), origin),
          paint: (p) => {
            letter.style.color = mixColor(from.text, to.text, p);
          },
        }];
      }

      return [
        {
          ...getRectDistanceRange(topHalf.getBoundingClientRect(), origin),
          paint: (p) => {
            topHalf.style.color = mixColor(from.text, to.text, p);
          },
        },
        {
          ...getRectDistanceRange(bottomHalf.getBoundingClientRect(), origin),
          paint: (p) => {
            bottomHalf.style.color = mixColor(from.text, to.text, p);
          },
        },
      ];
    }),
  ].filter(Boolean);

  const thisAnimation = ++activeAnimationId;
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  wave.classList.add("is-active");
  wave.style.setProperty("--wave-tone", nextTheme === "dark" ? "255,255,255" : "0,0,0");
  wave.style.setProperty("--wave-origin-left", `${origin.x}px`);
  wave.style.setProperty("--wave-origin-top", `${origin.y}px`);
  wave.style.setProperty("--wave-radius", "0px");

  const start = performance.now();

  const tick = (now) => {
    if (thisAnimation !== activeAnimationId) return;

    const rawT = clamp01((now - start) / WAVE_DURATION_MS);
    const waveT = easeInCloth(rawT);
    const radius = maxRadius * waveT;

    wave.style.setProperty("--wave-radius", `${radius}px`);

    for (const entry of elements) {
      const p = rangeProgress(radius, entry.minDistance, entry.maxDistance);
      entry.paint(p);
    }

    if (rawT < 1) {
      animationFrame = requestAnimationFrame(tick);
      return;
    }

    root.setAttribute("data-theme", nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    setThemeStatic(nextTheme);
    wave.classList.remove("is-active");
    animationFrame = null;
  };

  animationFrame = requestAnimationFrame(tick);
}

splitHeadingToLetters();

const savedTheme = localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
root.setAttribute("data-theme", savedTheme);
if (toggle) toggle.checked = savedTheme === "dark";
setThemeStatic(savedTheme);

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
