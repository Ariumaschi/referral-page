// ─── CONSTANTES ──────────────────────────────────────────────────────────────

export const FIXED_TEXT_WHITE = "#FFFFFF";

export const COLOR_FIELDS = [
  {
    path: ["style", "clientLogoBackgroundColor"],
    fallback: "#142D82",
    label: "Color de la franja del logo",
  },
  {
    path: ["style", "referralTitleBackgroundColor"],
    fallback: "#8ab644",
    label: "Color de la franja del título",
  },
];

export const ASSET_PREVIEW_KEYS = {
  logo: "logo",
  banner_desktop: "bannerDesktop",
  banner_mobile: "bannerMobile",
};

export const ASSET_UPLOADS = [
  {
    id: "logo",
    label: "Archivo del logo",
    paths: [["company_logo"]],
  },
  {
    id: "banner_desktop",
    label: "Banner para computadora",
    paths: [["company_banner"], ["referral", "company_banner"]],
  },
  {
    id: "banner_mobile",
    label: "Banner para celular",
    paths: [["company_banner_mobile"], ["referral", "company_banner_mobile"]],
  },
];

export const FIELD_CATALOG = [
  { name: "employee_referrer_full_name",        label: "Nombre completo del empleado que refiere",             emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/face.png" },
  { name: "full_name",                          label: "Nombre completo",                                      emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/face.png" },
  { name: "employee_referrer_employee_id",      label: "ID / número de empleado del referente",                emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/space.png" },
  { name: "employee_id",                        label: "Número de empleado",                                   emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/space.png" },
  { name: "employee_referrer_phone_number",     label: "Teléfono del referente",                               emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/space.png" },
  { name: "phone",                              label: "Teléfono",                                             emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/space.png" },
  { name: "employee_referrer_rfc",              label: "RFC del referente",                                    emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/space.png" },
  { name: "employee_referrer_store_id",         label: "Número de tienda o CEDIS",                            emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/space.png" },
  { name: "employee_rewards_id",                label: "ID de programa de recompensas",                        emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/space.png" },
  { name: "store_number",                       label: "Número de tienda",                                     emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/space.png" },
  { name: "employee_referrer_brand",            label: "Marca o unidad de negocio",                            emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/business_center.svg" },
  { name: "employee_referrer_format",           label: "Formato / gerencia / tipo de sitio",                   emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/business_center.svg" },
  { name: "employee_referrer_position",         label: "Puesto actual",                                        emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/business_center.svg" },
  { name: "employee_referrer_company_time",     label: "Antigüedad en la empresa",                             emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/business_center.svg" },
  { name: "employee_referrer_department",       label: "Departamento o planta",                                emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/disabled-pin.svg" },
  { name: "employee_referrer_determinant",      label: "Determinante / nombre del sitio",                      emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/disabled-pin.svg" },
  { name: "employee_referrer_state",            label: "Estado (ubicación)",                                   emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/disabled-pin.svg" },
  { name: "employee_referrer_cedi",             label: "CEDIS",                                                emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/disabled-pin.svg" },
  { name: "employee_referrer_employee_store",   label: "Restaurante / tienda donde trabaja",                   emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/disabled-pin.svg" },
  { name: "employee_referrer_facility",         label: "Planta o instalación",                                 emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/disabled-pin.svg" },
  { name: "employee_referrer_store",            label: "Centro o sucursal de trabajo",                         emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/disabled-pin.svg" },
  { name: "employee_referrer_working_place",    label: "Sitio de trabajo",                                     emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/disabled-pin.svg" },
  { name: "employee_referrer_working_place_id", label: "ID del sitio (sucursal, tienda, determinante, etc.)",  emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/disabled-pin.svg" },
];

// ─── FUNCIONES PURAS ──────────────────────────────────────────────────────────

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function mockUrlFilename(url) {
  if (!url || typeof url !== "string") return "";
  try {
    const path = url.split("?")[0];
    const seg = path.split("/").filter(Boolean).pop();
    return seg || url;
  } catch {
    return url;
  }
}

export function getAtPath(obj, path) {
  return path.reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

export function setAtPath(obj, path, value) {
  const next = clone(obj);
  let cur = next;
  for (let i = 0; i < path.length - 1; i += 1) {
    const key = path[i];
    if (!cur[key] || typeof cur[key] !== "object") {
      cur[key] = {};
    }
    cur = cur[key];
  }
  cur[path[path.length - 1]] = value;
  return next;
}

// ─── SISTEMA DE INSPECT ───────────────────────────────────────────────────────

const INSPECT_SCROLL_KEY = {
  "referral-help-trigger": "referral-help",
};

export function regionDomId(regionId) {
  if (!regionId) return "";
  const safe = String(regionId).replace(/[^a-zA-Z0-9-_]/g, "-");
  return `rb-focus-${safe}`;
}

export function scrollInspectTarget(regionId) {
  if (!regionId) return null;
  return INSPECT_SCROLL_KEY[regionId] || regionId;
}

export function mergeInspectChrome(builderInspect, regionId, className = "") {
  const base = className || "";
  if (!builderInspect) return { className: base };
  const active = builderInspect.isRegionActive
    ? builderInspect.isRegionActive(regionId)
    : builderInspect.activeId === regionId;
  return {
    "data-rb-preview-region": regionId,
    className: `${base} rb-inspect-target${active ? " rb-inspect-active" : ""}`.trim(),
    onClick: (e) => {
      e.stopPropagation();
      builderInspect.onActivate(regionId);
    },
    role: "button",
    tabIndex: 0,
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        builderInspect.onActivate(regionId);
      }
    },
  };
}

export function focusSectionClass(activeLeftKey, regionId) {
  return `referral-builder-focus-section${activeLeftKey === regionId ? " rb-section-active" : ""}`;
}

// ─── TRANSFORMACIONES DE DATOS ────────────────────────────────────────────────

export function normalizeEmployeeFields(config, fieldCatalogMap) {
  const next = clone(config);
  next.referral = next.referral || {};
  next.referral.employeeFields = (next.referral.employeeFields || []).map((field) => {
    const base = fieldCatalogMap[field.name] || {};
    return {
      ...field,
      label: field.label || base.label || field.name,
      emoji: field.emoji || base.emoji || "",
    };
  });
  return next;
}

export function ensureStyleFixedTextColors(style) {
  const s = style && typeof style === "object" ? clone(style) : {};
  const btn = s.mainFiltersSearchButton && typeof s.mainFiltersSearchButton === "object"
    ? clone(s.mainFiltersSearchButton)
    : {};
  btn.color = FIXED_TEXT_WHITE;
  s.mainFiltersSearchButton = btn;
  s.referralTitleTextColor = FIXED_TEXT_WHITE;
  s.referralSubtitleTextColor = FIXED_TEXT_WHITE;
  return s;
}

export function applyExportTweaks(config) {
  const out = clone(config);
  out.style = ensureStyleFixedTextColors(out.style);
  if (out.referral && typeof out.referral === "object") {
    out.referral.redrectListingType = "JOB";
    out.referral.generateLinkButtonImg = "";
    if (Array.isArray(out.referral.employeeFields)) {
      out.referral.employeeFields = out.referral.employeeFields.map((f) =>
        f.name === "employee_referrer_working_place_id"
          ? { ...f, dropdown: "stateSubsidiaryLocations", inputText: true }
          : f
      );
    }
  }
  const name = (out.company_name || "").trim() || "la empresa";
  out.disclaimer = `Podrás aplicar a cualquier posición de ${name}, y en caso de que cumplas con los requisitos y hayan vacantes te estaremos contactando`;
  if (out.referral && out.referral.redirect) {
    try {
      const url = new URL(out.referral.redirect);
      url.searchParams.set("text", `Hola Emi! Te escribo para postularme a ${name} tengo el código:`);
      out.referral.redirect = url.toString().replace(/%20/g, "+");
    } catch {
      // Si redirect no es una URL válida, se deja como está.
    }
  }
  return out;
}

export function socialNetworkLinksToArray(links) {
  const obj = links && typeof links === "object" ? links : {};
  const KNOWN = [
    ["LinkedIn", obj.linkedin],
    ["Facebook", obj.facebook],
    ["Instagram", obj.instagram],
    ["TikTok", obj.tikTok || obj.tiktok],
  ];
  const result = KNOWN.filter(([, url]) => url).map(([label, url]) => ({ label, url }));
  const knownKeys = new Set(["linkedin", "facebook", "instagram", "tikTok", "tiktok"]);
  Object.entries(obj)
    .filter(([key, url]) => url && !knownKeys.has(key))
    .forEach(([key, url]) => result.push({ label: key, url }));
  return result;
}

export function socialNetworkLinksFromArray(rows) {
  const out = {};
  rows.forEach(({ label, url }) => {
    if (!label || !url) return;
    const normalized = label.toLowerCase().replace(/[\s-]/g, "");
    if (normalized === "tiktok") out.tikTok = url;
    else if (normalized === "instagram") out.instagram = url;
    else if (normalized === "facebook") out.facebook = url;
    else if (normalized === "linkedin") out.linkedin = url;
    else out[label] = url;
  });
  return out;
}

export function socialNetworkLinksToText(links) {
  const obj = links && typeof links === "object" ? links : {};
  const preferred = [
    ["LinkedIn", obj.linkedin],
    ["Facebook", obj.facebook],
    ["Instagram", obj.instagram],
    ["TikTok", obj.tikTok || obj.tiktok],
  ]
    .filter(([, value]) => value)
    .map(([name, value]) => `${name}: ${value}`);
  const extras = Object.entries(obj)
    .filter(([key, value]) => value && !["linkedin", "facebook", "instagram", "tikTok", "tiktok"].includes(key))
    .map(([name, value]) => `${name}: ${value}`);
  return preferred.concat(extras).join("\n");
}

export function parseSocialNetworkLinksText(value) {
  const out = {};
  String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const idx = line.indexOf(":");
      if (idx <= 0) return;
      const rawKey = line.slice(0, idx).trim();
      const url = line.slice(idx + 1).trim();
      if (!rawKey || !url) return;
      const normalized = rawKey.toLowerCase();
      if (normalized === "tiktok" || normalized === "tik tok" || normalized === "tik-tok") {
        out.tikTok = url;
      } else if (normalized === "instagram") {
        out.instagram = url;
      } else if (normalized === "facebook") {
        out.facebook = url;
      } else if (normalized === "linkedin" || normalized === "linked in") {
        out.linkedin = url;
      } else {
        out[rawKey] = url;
      }
    });
  return out;
}

export function buildPreviewCompany(draft, localAssetUrls = {}) {
  const c = clone(draft);
  c.linkGoBack = false;
  if (!c.referral) return c;
  c.referral = clone(draft.referral);
  c.referral.employeeFields = (draft.referral?.employeeFields || []).map((f) => {
    const field = clone(f);
    if (field.dropdown === "stateSubsidiaryLocations") {
      field.dropdown = [
        { id: "preview-1", name: "Ejemplo: ubicación / determinante" },
        { id: "preview-2", name: "Ejemplo: otra ubicación" },
      ];
      field.inputText = true;
    } else if (typeof field.dropdown === "string") {
      field.dropdown = [
        { key: "Opción ejemplo A", value: "Opción ejemplo A" },
        { key: "Opción ejemplo B", value: "Opción ejemplo B" },
      ];
    }
    return field;
  });
  c.style = ensureStyleFixedTextColors(c.style);
  if (localAssetUrls.logo) c.company_logo = localAssetUrls.logo;
  if (localAssetUrls.bannerDesktop) {
    c.company_banner = localAssetUrls.bannerDesktop;
    c.referral.company_banner = localAssetUrls.bannerDesktop;
  }
  if (localAssetUrls.bannerMobile) {
    c.company_banner_mobile = localAssetUrls.bannerMobile;
    c.referral.company_banner_mobile = localAssetUrls.bannerMobile;
  }
  return c;
}
