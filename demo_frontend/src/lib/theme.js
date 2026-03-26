const FALLBACK_SCHEME = {
  background: '#0f172a',
  surface: '#111827',
  primary_color: '#6366f1',
  secondary_color: '#22c55e',
};

const FALLBACK_THEME = {
  background: '#0f172a',
  surface: '#111827',
  primary_color: '#6366f1',
  secondary_color: '#22c55e',
  background_hex: '#0f172a',
  surface_hex: '#111827',
  primary_color_hex: '#6366f1',
  secondary_color_hex: '#22c55e',
  background_raw: '#0f172a',
  surface_raw: '#111827',
  primary_color_raw: '#6366f1',
  secondary_color_raw: '#22c55e',
  text: '#f8fafc',
  muted: 'rgba(248, 250, 252, 0.72)',
  border: 'rgba(255, 255, 255, 0.12)',
  cardBackground: 'rgba(15, 23, 42, 0.68)',
  tileBackground: 'rgba(255, 255, 255, 0.05)',
  inputBackground: 'rgba(255, 255, 255, 0.06)',
  inputPlaceholder: 'rgba(255, 255, 255, 0.4)',
  navBackground: 'rgba(255, 255, 255, 0.04)',
  swatchBorder: 'rgba(255, 255, 255, 0.16)',
  eyebrow: '#a5b4fc',
  shadow: '0 25px 60px rgba(15, 23, 42, 0.35)',
  colorScheme: 'dark',
  request: null,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function componentToHex(value) {
  return value.toString(16).padStart(2, '0');
}

function rgbToHex({ r, g, b }) {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function normalizeHex(value) {
  const input = value.trim().toLowerCase();
  const short = input.match(/^#([0-9a-f]{3})$/i);
  if (short) {
    return `#${short[1].split('').map((char) => char + char).join('')}`;
  }

  const long = input.match(/^#([0-9a-f]{6})$/i);
  if (long) {
    return `#${long[1]}`;
  }

  return null;
}

function parseRgbString(input) {
  const match = input.match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;

  const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()));
  if (parts.length < 3 || parts.some((part) => Number.isNaN(part))) return null;

  return {
    r: clamp(Math.round(parts[0]), 0, 255),
    g: clamp(Math.round(parts[1]), 0, 255),
    b: clamp(Math.round(parts[2]), 0, 255),
  };
}

function cssColorToRgb(value) {
  if (typeof document === 'undefined') return null;

  const probe = document.createElement('div');
  probe.style.color = '';
  probe.style.color = value;

  if (!probe.style.color) return null;

  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  document.body.appendChild(probe);

  const computed = window.getComputedStyle(probe).color;
  document.body.removeChild(probe);

  return parseRgbString(computed);
}

function normalizeColor(value, fallback) {
  const raw = typeof value === 'string' && value.trim() ? value.trim() : fallback;
  const normalizedHex = normalizeHex(raw);

  if (normalizedHex) {
    return {
      raw,
      css: normalizedHex,
      hex: normalizedHex,
      rgb: hexToRgb(normalizedHex),
    };
  }

  const rgb = parseRgbString(raw) ?? cssColorToRgb(raw);
  if (rgb) {
    return {
      raw,
      css: raw,
      hex: rgbToHex(rgb),
      rgb,
    };
  }

  return normalizeColor(fallback, '#000000');
}

function luminance({ r, g, b }) {
  const channels = [r, g, b].map((value) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function alpha(rgb, opacity) {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

function mixRgb(first, second, ratio = 0.5) {
  return {
    r: Math.round(first.r * (1 - ratio) + second.r * ratio),
    g: Math.round(first.g * (1 - ratio) + second.g * ratio),
    b: Math.round(first.b * (1 - ratio) + second.b * ratio),
  };
}

export function buildThemeFromScheme(response) {
  const scheme = response?.scheme ?? FALLBACK_SCHEME;

  const background = normalizeColor(scheme.background, FALLBACK_SCHEME.background);
  const surface = normalizeColor(scheme.surface, FALLBACK_SCHEME.surface);
  const primary = normalizeColor(scheme.primary_color, FALLBACK_SCHEME.primary_color);
  const secondary = normalizeColor(scheme.secondary_color, FALLBACK_SCHEME.secondary_color);

  const lightTheme = luminance(background.rgb) > 0.55;
  const textRgb = lightTheme ? { r: 15, g: 23, b: 42 } : { r: 248, g: 250, b: 252 };
  const text = lightTheme ? '#0f172a' : '#f8fafc';

  const cardBase = lightTheme
    ? alpha({ r: 255, g: 255, b: 255 }, 0.72)
    : alpha({ r: 15, g: 23, b: 42 }, 0.68);

  const tileBase = lightTheme
    ? alpha(mixRgb(surface.rgb, { r: 255, g: 255, b: 255 }, 0.35), 0.72)
    : alpha({ r: 255, g: 255, b: 255 }, 0.05);

  return {
    background: background.css,
    surface: surface.css,
    primary_color: primary.css,
    secondary_color: secondary.css,
    background_hex: background.hex,
    surface_hex: surface.hex,
    primary_color_hex: primary.hex,
    secondary_color_hex: secondary.hex,
    background_raw: background.raw,
    surface_raw: surface.raw,
    primary_color_raw: primary.raw,
    secondary_color_raw: secondary.raw,
    text,
    muted: alpha(textRgb, 0.72),
    border: lightTheme ? alpha(textRgb, 0.14) : alpha({ r: 255, g: 255, b: 255 }, 0.12),
    cardBackground: cardBase,
    tileBackground: tileBase,
    inputBackground: lightTheme ? alpha({ r: 255, g: 255, b: 255 }, 0.88) : alpha({ r: 255, g: 255, b: 255 }, 0.06),
    inputPlaceholder: lightTheme ? alpha(textRgb, 0.4) : alpha({ r: 255, g: 255, b: 255 }, 0.4),
    navBackground: lightTheme ? alpha(textRgb, 0.05) : alpha({ r: 255, g: 255, b: 255 }, 0.04),
    swatchBorder: lightTheme ? alpha(textRgb, 0.16) : alpha({ r: 255, g: 255, b: 255 }, 0.16),
    eyebrow: primary.hex,
    shadow: lightTheme ? '0 25px 60px rgba(15, 23, 42, 0.12)' : '0 25px 60px rgba(15, 23, 42, 0.35)',
    colorScheme: lightTheme ? 'light' : 'dark',
    request: response?.request ?? null,
  };
}

export function applyThemeToDocument(theme) {
  const root = document.documentElement;
  root.style.setProperty('--background', theme.background);
  root.style.setProperty('--surface', theme.surface);
  root.style.setProperty('--primary', theme.primary_color);
  root.style.setProperty('--secondary', theme.secondary_color);
  root.style.setProperty('--text', theme.text);
  root.style.setProperty('--muted', theme.muted);
  root.style.setProperty('--border', theme.border);
  root.style.setProperty('--card-background', theme.cardBackground);
  root.style.setProperty('--tile-background', theme.tileBackground);
  root.style.setProperty('--input-background', theme.inputBackground);
  root.style.setProperty('--input-placeholder', theme.inputPlaceholder);
  root.style.setProperty('--nav-background', theme.navBackground);
  root.style.setProperty('--swatch-border', theme.swatchBorder);
  root.style.setProperty('--eyebrow', theme.eyebrow);
  root.style.setProperty('--shadow', theme.shadow);
  root.style.colorScheme = theme.colorScheme;
}

export function getFallbackTheme() {
  return FALLBACK_THEME;
}