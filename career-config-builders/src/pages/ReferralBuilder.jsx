// ─── IMPORTS ────────────────────────────────────────────────────────────────
// Herramientas de React para manejar estado, efectos y optimizaciones
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// La plantilla base con todos los campos vacíos (punto de partida para cualquier cliente)
import walmartTemplate from "../data/walmart.json";
// El componente que dibuja la vista previa del referral (panel derecho)
import ReferralV2 from "../components/ReferralV2Preview";
// Logo de Emi que aparece en el encabezado de la vista previa
import emiLogoFooter from "../assets/emi_logo_footer.svg";
// Estilos visuales
import "../styles/headerPreview.css";
import "../styles/ReferralBuilder.css";

// ─── CONSTANTES GLOBALES ─────────────────────────────────────────────────────

// Color blanco fijo para textos que siempre van en blanco (no se muestra para no confundir)
const FIXED_TEXT_WHITE = "#FFFFFF";

// Los dos colores que se pueden personalizar en el configurador de referral:
// el fondo de la franja del logo y el fondo de la franja del título
const COLOR_FIELDS = [
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

// Relaciona el id interno de cada imagen con su clave en el estado de URLs temporales.
// Ejemplo: cuando se sube un "logo", la URL temporal se guarda en assetPreviewUrls.logo
const ASSET_PREVIEW_KEYS = {
  logo: "logo",
  banner_desktop: "bannerDesktop",
  banner_mobile: "bannerMobile",
};

// Define las tres imágenes que se pueden subir y en qué campos del JSON se guardan.
// El banner va en dos lugares porque tanto la landing como el referral lo usan.
const ASSET_UPLOADS = [
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

// Lista fija de todos los campos posibles para el formulario de referido.
// Cada uno tiene: nombre interno (name), etiqueta visible (label) e ícono (emoji = URL de imagen).
const FIELD_CATALOG = [
  { name: "employee_referrer_full_name",     label: "Nombre completo del empleado que refiere",        emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/face.png" },
  { name: "full_name",                       label: "Nombre completo",                                  emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/face.png" },
  { name: "employee_referrer_employee_id",   label: "ID / número de empleado del referente",            emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/space.png" },
  { name: "employee_id",                     label: "Número de empleado",                               emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/space.png" },
  { name: "employee_referrer_phone_number",  label: "Teléfono del referente",                           emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/space.png" },
  { name: "phone",                           label: "Teléfono",                                         emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/space.png" },
  { name: "employee_referrer_rfc",           label: "RFC del referente",                                emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/space.png" },
  { name: "employee_referrer_store_id",      label: "Número de tienda o CEDIS",                         emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/space.png" },
  { name: "employee_rewards_id",             label: "ID de programa de recompensas",                    emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/space.png" },
  { name: "store_number",                    label: "Número de tienda",                                 emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/space.png" },
  { name: "employee_referrer_brand",         label: "Marca o unidad de negocio",                        emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/business_center.svg" },
  { name: "employee_referrer_format",        label: "Formato / gerencia / tipo de sitio",               emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/business_center.svg" },
  { name: "employee_referrer_position",      label: "Puesto actual",                                    emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/business_center.svg" },
  { name: "employee_referrer_company_time",  label: "Antigüedad en la empresa",                         emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/business_center.svg" },
  { name: "employee_referrer_department",    label: "Departamento o planta",                            emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/disabled-pin.svg" },
  { name: "employee_referrer_determinant",   label: "Determinante / nombre del sitio",                  emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/disabled-pin.svg" },
  { name: "employee_referrer_state",         label: "Estado (ubicación)",                               emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/disabled-pin.svg" },
  { name: "employee_referrer_cedi",          label: "CEDIS",                                            emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/disabled-pin.svg" },
  { name: "employee_referrer_employee_store",label: "Restaurante / tienda donde trabaja",               emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/disabled-pin.svg" },
  { name: "employee_referrer_facility",      label: "Planta o instalación",                             emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/disabled-pin.svg" },
  { name: "employee_referrer_store",         label: "Centro o sucursal de trabajo",                     emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/disabled-pin.svg" },
  { name: "employee_referrer_working_place", label: "Sitio de trabajo",                                 emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/disabled-pin.svg" },
  { name: "employee_referrer_working_place_id", label: "ID del sitio (sucursal, tienda, determinante, etc.)", emoji: "https://emi-public.s3.amazonaws.com/static/walmart/Logos/disabled-pin.svg" },
];

// ─── FUNCIONES  ───────────────────────────────────────────

// Crea una copia completamente independiente de un objeto.
// En JavaScript, si hacés `const b = a` y modificás b, también modificás a
// porque ambos apuntan al mismo objeto en memoria.
// Para evitar eso, esta función convierte el objeto a texto (stringify) y lo vuelve a convertir a objeto (parse): el resultado es un objeto nuevo, sin
// ninguna conexión con el original.
// Se usa antes de cada cambio en el draft para que React pueda comparar el estado anterior con el nuevo y así actualizar la vista previa correctamente.
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

// Extrae solo el nombre del archivo de una URL larga.
// Ej: "https://s3.amazonaws.com/mock/logo/logo-walmart.png" → "logo-walmart.png"
function mockUrlFilename(url) {
  if (!url || typeof url !== "string") return "";
  try {
    const path = url.split("?")[0];
    const seg = path.split("/").filter(Boolean).pop();
    return seg || url;
  } catch {
    return url;
  }
}

// Lee un valor dentro de un objeto anidado siguiendo una ruta (array de claves).
// Ej: getAtPath(draft, ["style", "clientLogoBackgroundColor"]) → "#142D82"
function getAtPath(obj, path) {
  return path.reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

// Escribe un valor en un objeto anidado siguiendo una ruta.
// Siempre clona primero para no modificar el original.
// Ej: setAtPath(draft, ["company_name"], "Walmart") → nuevo objeto con company_name: "Walmart"
function setAtPath(obj, path, value) {
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

// ─── SISTEMA DE INSPECT (SINCRONIZACIÓN FORMULARIO ↔ VISTA PREVIA) ───────────

// Excepción de mapeo: el botón "¿Dudas?" en la preview corresponde
// a la sección "referral-help" en el panel izquierdo (no a "referral-help-trigger")
const INSPECT_SCROLL_KEY = {
  "referral-help-trigger": "referral-help",
};

// Genera el id HTML de un bloque del formulario a partir de su nombre de región.
// Ej: "chrome-logo" → "rb-focus-chrome-logo"
// Se usa para hacer scroll automático cuando se hace clic en la vista previa.
function regionDomId(regionId) {
  if (!regionId) return "";
  const safe = String(regionId).replace(/[^a-zA-Z0-9-_]/g, "-");
  return `rb-focus-${safe}`;
}

// Resuelve a qué sección del formulario corresponde una región de la vista previa.
// En la mayoría de casos es 1 a 1, excepto las excepciones en INSPECT_SCROLL_KEY.
function scrollInspectTarget(regionId) {
  if (!regionId) return null;
  return INSPECT_SCROLL_KEY[regionId] || regionId;
}

// Agrega los atributos necesarios a un elemento de la vista previa para que
// sea "clickeable" como parte del sistema de inspect.
// Cuando el usuario hace clic en esa zona, se activa la región correspondiente
// y el formulario izquierdo hace scroll hacia el campo que la controla.
function mergeInspectChrome(builderInspect, regionId, className = "") {
  const base = className || "";
  if (!builderInspect) {
    return { className: base };
  }
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

// Devuelve la clase CSS de una sección del formulario.
// Si está activa (el usuario la está editando o hizo clic en la preview), agrega "rb-section-active"
// para resaltarla visualmente con un borde azul.
function focusSectionClass(activeLeftKey, regionId) {
  return `referral-builder-focus-section${activeLeftKey === regionId ? " rb-section-active" : ""}`;
}

// ─── FUNCIONES DE TRANSFORMACIÓN DE DATOS ────────────────────────────────────

// Completa los campos del empleado con datos del catálogo si les falta etiqueta o ícono.
// Se ejecuta al cargar el JSON inicial y al importar un JSON externo.
function normalizeEmployeeFields(config, fieldCatalogMap) {
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

// Aplica ajustes finales al JSON antes de exportarlo a TIM.
// Estos valores se fuerzan automáticamente sin que el CS los tenga que configurar:
// - Fija los colores de texto en blanco
// - Establece redrectListingType en "JOB"
// - Genera el disclaimer con el nombre de la empresa
// - Ajusta la URL de redirect de WhatsApp con el texto de bienvenida
function applyExportTweaks(config) {
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
      url.searchParams.set(
        "text",
        `Hola Emi! Te escribo para postularme a ${name} tengo el código:`
      );
      out.referral.redirect = url.toString().replace(/%20/g, "+");
    } catch {
      // Si redirect no es una URL válida, se deja como está.
    }
  }
  return out;
}

// Forza colores de texto en blanco en el style.
// Se aplica tanto al exportar como a la vista previa,
// para que el CS no vea opciones de color que no puede cambiar.
function ensureStyleFixedTextColors(style) {
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

// Convierte el objeto de redes sociales (que tiene claves como "linkedin", "tikTok")
// en texto plano para mostrar en el textarea del formulario.
// Ej: { linkedin: "https://..." } → "LinkedIn: https://..."
function socialNetworkLinksToText(links) {
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

// Convierte el texto del textarea de redes sociales de vuelta al objeto JSON.
// Ej: "LinkedIn: https://..." → { linkedin: "https://..." }
function parseSocialNetworkLinksText(value) {
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

// Prepara una versión del draft adaptada para la vista previa.
// Las diferencias con el JSON real de exportación son:
// - Los dropdowns que vendrían de un API se reemplazan por opciones de ejemplo
// - Las imágenes subidas localmente se muestran con su URL temporal (blob:)
//   en vez de la URL de S3 (que aún no existe realmente)
function buildPreviewCompany(draft, localAssetUrls = {}) {
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

  // Reemplaza las URLs de S3 (mock) por las URLs temporales del navegador
  // para que las imágenes subidas se vean en la preview
  if (localAssetUrls.logo) {
    c.company_logo = localAssetUrls.logo;
  }
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

// ─── COMPONENTE: VISTA PREVIA DEL REFERRAL ───────────────────────────────────
// Dibuja el panel derecho: el encabezado de Emi + logo + banner + el referral completo.
// Recibe `builderInspect` para saber qué zona iluminar cuando el CS hace clic.
function ReferralLivePreview({ company, device, builderInspect }) {
  const style = company.style || {};
  // Elige el banner correcto según si se está viendo en desktop o mobile
  const bannerSrc = device === "mobile"
    ? company.referral?.company_banner_mobile || company.company_banner_mobile
    : company.referral?.company_banner || company.company_banner;

  return (
    <div className="referral-live-preview-root">
      {/* Barra superior "Career Page · Powered by Emi" */}
      <div className="emi-header-container">
        <div className="text-emi-header">Career Page</div>
        <div
          className="text-emi-header"
          style={{ display: "flex", alignItems: "center" }}
        >
          Powered by
          <a
            href="https://emilabs.ai/"
            target="_blank"
            rel="noreferrer"
            style={{ display: "flex", marginLeft: "4px" }}
          >
            <img
              className="emi-logo-header"
              src={emiLogoFooter}
              alt="Emi"
              width={30}
            />
          </a>
        </div>
      </div>

      {/* Franja de color con el logo del cliente. Al hacer clic se activa la sección "Logo" */}
      <div
        style={
          style.clientLogoBackgroundColor
            ? { background: style.clientLogoBackgroundColor }
            : undefined
        }
        {...mergeInspectChrome(
          builderInspect,
          "chrome-logo",
          "client-logo-container-single-position"
        )}
      >
        <div className="client-logo-single-position">
          <img
            className="client-logo-image"
            src={company.company_logo || ""}
            alt=""
          />
        </div>
      </div>

      {/* Banner del cliente. Al hacer clic se activa la sección "Banners" */}
      <div
        {...mergeInspectChrome(
          builderInspect,
          "chrome-banner",
          "client-banner-container referral-live-preview-banner-wrap"
        )}
      >
        <img className="client-banner" src={bannerSrc || ""} alt="" />
      </div>

      {/* El formulario de referido completo (título, preguntas, instrucciones, ayuda, etc.) */}
      <ReferralV2
        company={company}
        style={style}
        onGenerateLink={() => {}}
        code=""
        query={{ referral: "true" }}
        isLoading={false}
        builderInspect={builderInspect}
      />
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL: REFERRAL BUILDER ───────────────────────────────────
// Este es el configurador completo. Maneja todo el estado y renderiza los dos paneles.
const ReferralBuilder = () => {

  // ── CATÁLOGO DE CAMPOS ──────────────────────────────────────────────────────
  // Lista de campos disponibles para el formulario del referido
  const fieldCatalog = useMemo(() => FIELD_CATALOG, []);
  // Versión del catálogo indexada por nombre para búsqueda rápida
  const fieldCatalogMap = useMemo(
    () => fieldCatalog.reduce((acc, item) => ({ ...acc, [item.name]: item }), {}),
    [fieldCatalog]
  );

  // ── ESTADO DEL CONFIGURADOR ─────────────────────────────────────────────────

  // `draft`: el JSON completo que se está editando. Arranca con la plantilla de Walmart.
  const [draft, setDraft] = useState(() =>
    normalizeEmployeeFields(clone(walmartTemplate), fieldCatalogMap)
  );
  // Controla si se muestra el mensaje "Listo: JSON copiado" después de copiar
  const [copied, setCopied] = useState(false);
  // El texto del textarea de JSON (sincronizado con el draft)
  const [jsonInput, setJsonInput] = useState("");
  // Mensaje de error si el JSON editado manualmente no es válido
  const [jsonError, setJsonError] = useState("");
  // Qué dispositivo se muestra en la vista previa: "desktop" o "mobile"
  const [previewDevice, setPreviewDevice] = useState("desktop");
  // URLs temporales (blob:) de las imágenes subidas, para mostrarlas en la preview
  const [assetPreviewUrls, setAssetPreviewUrls] = useState({
    logo: null,
    bannerDesktop: null,
    bannerMobile: null,
  });
  // Referencia para acceder a las URLs temporales en el cleanup sin re-renderizar
  const assetPreviewUrlsRef = useRef(assetPreviewUrls);

  // ── EFECTOS ─────────────────────────────────────────────────────────────────

  // Mantiene la referencia sincronizada con el estado de URLs temporales
  useEffect(() => {
    assetPreviewUrlsRef.current = assetPreviewUrls;
  }, [assetPreviewUrls]);

  // Limpia las URLs temporales al cerrar la pestaña o desmontar el componente
  // (libera memoria del navegador)
  useEffect(
    () => () => {
      Object.values(assetPreviewUrlsRef.current).forEach((u) => {
        if (u) URL.revokeObjectURL(u);
      });
    },
    []
  );

  // ── VALORES DERIVADOS (se recalculan solo cuando cambia el draft) ───────────

  // La versión del draft lista para mostrar en la vista previa
  // (con dropdowns de ejemplo y URLs temporales de imágenes)
  const previewCompany = useMemo(
    () => buildPreviewCompany(draft, assetPreviewUrls),
    [draft, assetPreviewUrls]
  );

  // El JSON final listo para copiar y enviar a TIM (con todos los ajustes aplicados)
  const exportJson = useMemo(
    () => JSON.stringify(applyExportTweaks(draft), null, 2),
    [draft]
  );

  // Cuando cambia el draft, sincroniza el textarea del JSON
  useEffect(() => {
    setJsonInput(exportJson);
  }, [exportJson]);

  // ── FUNCIONES DE EDICIÓN ────────────────────────────────────────────────────

  // Función principal de actualización: modifica un campo del draft siguiendo una ruta.
  // Es la que se llama desde todos los inputs del formulario.
  const update = useCallback((path, value) => {
    setDraft((prev) => setAtPath(prev, path, value));
  }, []);

  // Abre el selector de color del navegador (EyeDropper) para elegir
  // un color tomándolo directamente de cualquier parte de la pantalla
  const pickColorWithEyedropper = useCallback(async (path) => {
    if (typeof window === "undefined" || !("EyeDropper" in window)) {
      window.alert("Tu navegador no soporta el selector de color en pantalla.");
      return;
    }
    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      if (result?.sRGBHex) {
        update(path, result.sRGBHex);
      }
    } catch {
      // El usuario puede cancelar el selector; no hacemos nada.
    }
  }, [update]);

  // Modifica el título o texto de un paso de instrucciones específico
  const updateInstruction = useCallback((index, key, value) => {
    setDraft((prev) => {
      const next = clone(prev);
      if (!next.referral?.instructions?.[index]) return prev;
      next.referral.instructions[index][key] = value;
      return next;
    });
  }, []);

  // Agrega un nuevo paso vacío a la sección de instrucciones
  const addInstruction = useCallback(() => {
    setDraft((prev) => {
      const next = clone(prev);
      next.referral = next.referral || {};
      next.referral.instructions = next.referral.instructions || [];
      const nextNumber = next.referral.instructions.length + 1;
      next.referral.instructions.push({
        title: `Paso ${nextNumber}`,
        text: "",
      });
      return next;
    });
  }, []);

  // Elimina un paso de instrucciones por su posición
  const removeInstruction = useCallback((index) => {
    setDraft((prev) => {
      const next = clone(prev);
      next.referral = next.referral || {};
      next.referral.instructions = (next.referral.instructions || []).filter((_, i) => i !== index);
      return next;
    });
  }, []);

  // Modifica un campo del formulario de empleado (tipo, etiqueta o ícono).
  // Cuando se cambia el "tipo" (name), actualiza automáticamente la etiqueta y el ícono
  // con los valores del catálogo correspondiente.
  const updateEmployeeField = useCallback(
    (index, key, value) => {
      setDraft((prev) => {
        const next = clone(prev);
        if (!next.referral?.employeeFields?.[index]) return prev;
        next.referral.employeeFields[index][key] = value;
        if (key === "name") {
          const selected = fieldCatalogMap[value];
          if (selected) {
            next.referral.employeeFields[index].label = selected.label;
            if (selected.emoji) next.referral.employeeFields[index].emoji = selected.emoji;
          }
          // El campo de ubicación tiene comportamiento especial: usa dropdown de API
          if (value === "employee_referrer_working_place_id") {
            next.referral.employeeFields[index].dropdown = "stateSubsidiaryLocations";
            next.referral.employeeFields[index].inputText = true;
          } else {
            delete next.referral.employeeFields[index].dropdown;
            delete next.referral.employeeFields[index].inputText;
          }
        }
        return next;
      });
    },
    [fieldCatalogMap]
  );

  // Agrega un nuevo campo al formulario del empleado (con el primer tipo del catálogo por defecto)
  const addEmployeeField = useCallback(() => {
    setDraft((prev) => {
      const next = clone(prev);
      const defaultOption = fieldCatalog[0] || {
        name: "employee_referrer_custom",
        label: "Campo personalizado",
        emoji: "",
      };
      next.referral.employeeFields.push({
        name: defaultOption.name,
        label: defaultOption.label,
        emoji: defaultOption.emoji,
      });
      return next;
    });
  }, [fieldCatalog]);

  // Elimina un campo del formulario del empleado por su posición
  const removeEmployeeField = useCallback((index) => {
    setDraft((prev) => {
      const next = clone(prev);
      next.referral.employeeFields = next.referral.employeeFields.filter((_, i) => i !== index);
      return next;
    });
  }, [exportJson]);

  // Copia el JSON exportado al portapapeles y muestra "Listo" por 2.5 segundos
  const copyJson = useCallback(() => {
    navigator.clipboard.writeText(exportJson).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [exportJson]);

  // Limpia todas las URLs temporales de imágenes (libera memoria)
  // Se usa cuando se importa un JSON nuevo para empezar desde cero
  const clearPreviewAssetUrls = useCallback(() => {
    setAssetPreviewUrls((prev) => {
      Object.values(prev).forEach((u) => {
        if (u) URL.revokeObjectURL(u);
      });
      return { logo: null, bannerDesktop: null, bannerMobile: null };
    });
  }, []);

  // Importa un JSON externo pegado en el textarea.
  // Si el JSON es válido, reemplaza el draft completo.
  // Si tiene errores de formato, muestra un mensaje de error.
  const applyJson = useCallback((rawJson) => {
    try {
      const parsed = JSON.parse(rawJson);
      const normalized = normalizeEmployeeFields(parsed, fieldCatalogMap);
      setJsonError("");
      clearPreviewAssetUrls();
      setDraft(normalized);
      return true;
    } catch {
      setJsonError("JSON invalido. Revisa formato y comas.");
      return false;
    }
  }, [clearPreviewAssetUrls, fieldCatalogMap]);

  // ── SISTEMA DE INSPECT ──────────────────────────────────────────────────────

  // `inspectFocus`: qué región está actualmente seleccionada (por clic en la preview o en el formulario)
  const [inspectFocus, setInspectFocus] = useState(null);

  // La clave de la sección izquierda que debe resaltarse
  const activeLeftKey = useMemo(
    () => (inspectFocus ? scrollInspectTarget(inspectFocus) : null),
    [inspectFocus]
  );

  // Se ejecuta cuando el usuario hace clic en una zona de la vista previa.
  // Activa esa región, abre su acordeón y hace scroll hasta el campo correspondiente.
  const handleInspectActivate = useCallback((regionId) => {
    setInspectFocus(regionId);
    requestAnimationFrame(() => {
      const key = scrollInspectTarget(regionId);
      const section = document.getElementById(regionDomId(key));
      const accordion = section?.closest("details.rb-accordion");
      if (accordion && !accordion.open) {
        accordionRef.current?.querySelectorAll("details.rb-accordion[open]").forEach((d) => d.removeAttribute("open"));
        accordion.open = true;
      }
      section?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
      // Mueve el foco al primer campo editable dentro de la sección
      requestAnimationFrame(() => {
        const focusable = section?.querySelector(
          'input:not([type="file"]):not([readonly]), textarea:not([readonly]), select, button:not([disabled])'
        );
        focusable?.focus({ preventScroll: true });
      });
    });
  }, []);

  // Objeto que se pasa a la vista previa con la información del estado de inspect
  const builderInspect = useMemo(() => {
    const isRegionActive = (regionId) => {
      if (inspectFocus == null) return false;
      return scrollInspectTarget(inspectFocus) === scrollInspectTarget(regionId);
    };
    return {
      activeId: inspectFocus,
      onActivate: handleInspectActivate,
      isRegionActive,
    };
  }, [inspectFocus, handleInspectActivate]);

  // Referencias a elementos del DOM para scroll y acordeones
  const previewPanelRef = useRef(null);
  const accordionRef = useRef(null);

  // Cuando se abre un acordeón del formulario: cierra los demás y activa esa región
  const handleAccordionToggle = useCallback((e, regionId) => {
    const opened = e.currentTarget;
    if (opened.open) {
      accordionRef.current?.querySelectorAll("details.rb-accordion[open]").forEach((d) => {
        if (d !== opened) d.removeAttribute("open");
      });
      if (regionId) setInspectFocus(regionId);
    } else {
      setInspectFocus(null);
    }
  }, []);

  // Cuando cambia la región activa, hace scroll en la vista previa
  // para que la zona iluminada quede visible
  useEffect(() => {
    if (inspectFocus == null) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const root = previewPanelRef.current;
        if (!root) return;
        const mark = root.querySelector(".rb-inspect-active");
        mark?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      });
    });
    return () => cancelAnimationFrame(id);
  }, [inspectFocus]);

  // Cuando el usuario escribe en un campo del formulario, detecta qué sección
  // está editando y la marca como activa (para iluminar la zona correspondiente en la preview)
  const onLeftPanelFocusCapture = useCallback((e) => {
    const el = e.target;
    if (!(el instanceof Element)) return;
    const block = el.closest("[data-rb-focus]");
    if (!block) return;
    const id = block.getAttribute("data-rb-focus");
    if (id) setInspectFocus(id);
  }, []);

  // ── FUNCIONES DE RENDER ─────────────────────────────────────────────────────

  // Renderiza la tarjeta de una imagen (logo o banner): zona de drag&drop, miniatura, URL
  const renderAssetField = (field) => {
    const previewKey = ASSET_PREVIEW_KEYS[field.id];
    const mockUrl = getAtPath(draft, field.paths[0]) || "";
    const localPreview = assetPreviewUrls[previewKey];
    // Prioriza la URL temporal local (imagen recién subida) sobre la URL de S3
    const displayUrl = localPreview || mockUrl;
    const doneName = mockUrlFilename(mockUrl);

    // Elimina la imagen: borra la URL temporal y limpia el campo en el draft
    const handleClear = () => {
      setAssetPreviewUrls((prev) => {
        const next = { ...prev };
        const old = next[previewKey];
        if (old) URL.revokeObjectURL(old);
        next[previewKey] = null;
        return next;
      });
      setDraft((prev) => {
        let next = clone(prev);
        field.paths.forEach((path) => {
          next = setAtPath(next, path, "");
        });
        return next;
      });
    };

    return (
      <div className="rb-asset-card" key={field.id}>
        <div className="rb-asset-card-label">{field.label}</div>
        {displayUrl ? (
          // Si ya hay imagen: muestra miniatura + nombre + botón de quitar
          <div className="rb-asset-preview-row">
            <img src={displayUrl} className="rb-asset-thumb" alt={field.label} />
            <div className="rb-asset-preview-meta">
              <span className="rb-asset-preview-name" title={mockUrl}>
                {doneName || "URL personalizada"}
              </span>
              <button
                type="button"
                className="rb-asset-clear-btn"
                onClick={handleClear}
                aria-label="Quitar imagen"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          // Si no hay imagen: muestra la zona de drag&drop para subir archivo
          <label className="rb-asset-dropzone" htmlFor={`rb-file-${field.id}`}>
            <svg className="rb-asset-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12M8 8l4-4 4 4" />
            </svg>
            <span className="rb-asset-dropzone-text">Subir archivo</span>
            <span className="rb-asset-dropzone-hint">PNG · JPG · SVG · WEBP</span>
            <input
              id={`rb-file-${field.id}`}
              type="file"
              accept="image/*"
              className="rb-asset-file-input-hidden"
              onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                // Crea una URL temporal local para mostrar la imagen en la preview.
                // El campo del JSON queda vacío: el CS debe pegar la URL real una vez subida a S3.
                setAssetPreviewUrls((prev) => {
                  const next = { ...prev };
                  const old = next[previewKey];
                  if (old) URL.revokeObjectURL(old);
                  next[previewKey] = URL.createObjectURL(file);
                  return next;
                });
                e.target.value = "";
              }}
            />
          </label>
        )}
        {/* Alternativa: pegar la URL de la imagen directamente */}
        <div className="rb-asset-url-row">
          <span className="rb-asset-url-or">o pegá una URL</span>
          <input
            type="text"
            className="rb-asset-url-input"
            value={mockUrl}
            placeholder="https://..."
            onChange={(e) => {
              const value = e.target.value;
              // Si se pega una URL, limpia la preview local y usa la URL directamente
              setAssetPreviewUrls((prev) => {
                const next = { ...prev };
                const old = next[previewKey];
                if (old) URL.revokeObjectURL(old);
                next[previewKey] = null;
                return next;
              });
              setDraft((prev) => {
                let next = clone(prev);
                field.paths.forEach((path) => {
                  next = setAtPath(next, path, value);
                });
                return next;
              });
            }}
          />
        </div>
      </div>
    );
  };

  // Renderiza una fila de selector de color: muestra el color actual con
  // su picker visual, su código hexadecimal y el botón de EyeDropper (🖌)
  const renderColorRow = (field, colorKey) => {
    const value = getAtPath(draft, field.path) || field.fallback;
    return (
      <div className="referral-builder-color-row" key={colorKey}>
        <span className="referral-builder-color-label">{field.label}</span>
        <div className="referral-builder-color-inputs">
          <input
            type="color"
            value={value}
            onChange={(e) => update(field.path, e.target.value)}
            aria-label={field.label}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => update(field.path, e.target.value)}
            aria-label={`${field.label}, código hexadecimal`}
          />
          <button
            type="button"
            className="secondary referral-builder-btn-ghost"
            onClick={() => pickColorWithEyedropper(field.path)}
            title="Tomar color de la pantalla"
            aria-label={`Tomar color de la pantalla para ${field.label}`}
          >
            🖌
          </button>
        </div>
      </div>
    );
  };

  // ── ATAJOS PARA DATOS DE USO FRECUENTE ─────────────────────────────────────
  const r = draft.referral;
  const colorLogoField = COLOR_FIELDS[0];
  const colorReferralField = COLOR_FIELDS[1];
  const assetLogo = ASSET_UPLOADS[0];
  const assetBanners = ASSET_UPLOADS.slice(1);

  // ── RENDER PRINCIPAL ────────────────────────────────────────────────────────
  return (
    <div className="referral-builder-page">

      {/* ── Barra de navegación superior ── */}
      <header className="referral-builder-topbar">
        <div className="referral-builder-topbar-title">
          <h1>Configurador de referral</h1>
          <span className="referral-builder-topbar-sub">Misma estructura que Walmart · revisá todo con la vista previa</span>
        </div>
        <div className="referral-builder-topbar-links">
          <a className="referral-builder-topbar-link" href="/landing-builder">
            Configurador landing
          </a>
          <a
            className="referral-builder-topbar-link"
            href="https://www.notion.so/emilabs/Career-Pages-Implementation-with-job-postings-e8bfe30ebe7641cbb91509170b13e949"
            target="_blank"
            rel="noreferrer"
          >
            Guía
          </a>
        </div>
      </header>

      <div className="referral-builder-layout">

        {/* ══════════════════════════════════════════════════════════════════
            PANEL IZQUIERDO: formulario de configuración con acordeones
        ══════════════════════════════════════════════════════════════════ */}
        <div
          className="referral-builder-panel referral-builder-config-panel"
          ref={accordionRef}
          onFocusCapture={onLeftPanelFocusCapture}
        >

          {/* ── Sección: Datos de la empresa ── */}
          <details className="rb-accordion" open onToggle={(e) => handleAccordionToggle(e, "general")}>
            <summary className="rb-accordion-summary">
              <span className="rb-summary-content">Datos de la Empresa</span>
            </summary>
            <div className="rb-accordion-body">
          <div
            id={regionDomId("general")}
            data-rb-focus="general"
            className={focusSectionClass(activeLeftKey, "general")}
          >
            <div className="referral-builder-field">
              <label htmlFor="rb-subsidiaryId">Subsidiary ID</label>
              <input
                id="rb-subsidiaryId"
                type="number"
                min={1}
                value={draft.subsidiaryId}
                onChange={(e) => update(["subsidiaryId"], Number(e.target.value) || 0)}
              />
            </div>

            <div className="referral-builder-field">
              <label htmlFor="rb-listing">Listing ID</label>
              <input
                id="rb-listing"
                type="text"
                value={r.redirectListing || ""}
                onChange={(e) => update(["referral", "redirectListing"], e.target.value)}
              />
            </div>

            <div className="referral-builder-field">
              <label htmlFor="rb-company">Nombre de la empresa</label>
              <input
                id="rb-company"
                type="text"
                value={draft.company_name || ""}
                onChange={(e) => update(["company_name"], e.target.value)}
                placeholder="Ej. Walmart"
              />

            </div>
          </div>
            </div>
          </details>

          {/* ── Sección: Canales de contacto (WhatsApp / Facebook Messenger) ── */}
          <details className="rb-accordion" onToggle={(e) => handleAccordionToggle(e, null)}>
            <summary className="rb-accordion-summary">
              <span className="rb-summary-content">Canales de contacto</span>
            </summary>
            <div className="rb-accordion-body">
              <p className="referral-builder-hint">Canales por los que los candidatos pueden aplicar o contactar a la empresa.</p>
              <div className="referral-builder-field">
                <label htmlFor="rb-wa">WhatsApp</label>
                <input
                  id="rb-wa"
                  type="text"
                  value={draft.channelConfig?.whatsapp?.phoneNumber || ""}
                  onChange={(e) => update(["channelConfig", "whatsapp", "phoneNumber"], e.target.value)}
                  placeholder="525588817796"
                />
                <small>Solo el número, con código de país (ej. 5255…)</small>
              </div>
              <div className="referral-builder-field">
                <label htmlFor="rb-fb-page">Facebook (Messenger)</label>
                <input
                  id="rb-fb-page"
                  type="text"
                  value={draft.channelConfig?.facebook?.page || ""}
                  onChange={(e) => update(["channelConfig", "facebook", "page"], e.target.value)}
                  placeholder="TrabajaEnWalmartMX"
                />
                <small>Nombre de la página de Facebook (sin URL)</small>
              </div>
            </div>
          </details>

          {/* ── Sección: Logo (color de fondo + imagen) ── */}
          <details className="rb-accordion" onToggle={(e) => handleAccordionToggle(e, "chrome-logo")}>
            <summary className="rb-accordion-summary">
              <span className="rb-summary-content">Logo</span>
            </summary>
            <div className="rb-accordion-body">
          <div
            id={regionDomId("chrome-logo")}
            data-rb-focus="chrome-logo"
            className={focusSectionClass(activeLeftKey, "chrome-logo")}
          >
            {renderColorRow(colorLogoField, "logo-bg")}
            {renderAssetField(assetLogo)}
          </div>
            </div>
          </details>

          {/* ── Sección: Banners (desktop y mobile) ── */}
          <details className="rb-accordion" onToggle={(e) => handleAccordionToggle(e, "chrome-banner")}>
            <summary className="rb-accordion-summary">
              <span className="rb-summary-content">Banners</span>
            </summary>
            <div className="rb-accordion-body">
          <div
            id={regionDomId("chrome-banner")}
            data-rb-focus="chrome-banner"
            className={focusSectionClass(activeLeftKey, "chrome-banner")}
          >
            {assetBanners.map((field) => renderAssetField(field))}
          </div>
            </div>
          </details>

          {/* ── Sección: Título principal (franja de color + título + subtítulo) ── */}
          <details className="rb-accordion" onToggle={(e) => handleAccordionToggle(e, "referral-hero")}>
            <summary className="rb-accordion-summary">
              <span className="rb-summary-content">Título principal</span>
            </summary>
            <div className="rb-accordion-body">
          <div
            id={regionDomId("referral-hero")}
            data-rb-focus="referral-hero"
            className={focusSectionClass(activeLeftKey, "referral-hero")}
          >
            {renderColorRow(colorReferralField, "referral-bg")}
            <div className="referral-builder-field">
              <label htmlFor="rb-ref-title">Título</label>
              <input
                id="rb-ref-title"
                type="text"
                value={r.title || ""}
                onChange={(e) => update(["referral", "title"], e.target.value)}
              />
            </div>
            <div className="referral-builder-field">
              <label htmlFor="rb-ref-sub">Subtítulo</label>
              <textarea
                id="rb-ref-sub"
                value={r.subTitle || ""}
                onChange={(e) => update(["referral", "subTitle"], e.target.value)}
              />
            </div>
          </div>
            </div>
          </details>

          {/* ── Sección: Formulario (título + campos del empleado) ── */}
          <details className="rb-accordion" onToggle={(e) => handleAccordionToggle(e, "referral-form-title")}>
            <summary className="rb-accordion-summary">
              <span className="rb-summary-content">Formulario</span>
            </summary>
            <div className="rb-accordion-body">
          <div
            id={regionDomId("referral-form-title")}
            data-rb-focus="referral-form-title"
            className={focusSectionClass(activeLeftKey, "referral-form-title")}
          >
            <div className="referral-builder-field">
              <label htmlFor="rb-form-title">Título Formulario</label>
              <input
                id="rb-form-title"
                type="text"
                value={r.formTitle || ""}
                onChange={(e) => update(["referral", "formTitle"], e.target.value)}
              />
            </div>
          </div>

          {/* Lista de campos del formulario. Cada uno permite elegir tipo, etiqueta e ícono */}
          {(r.employeeFields || []).map((field, i) => (
            <div
              key={`${field.name}-${i}`}
              id={regionDomId(`referral-field-${i}`)}
              data-rb-focus={`referral-field-${i}`}
              className={`referral-builder-field-card ${focusSectionClass(activeLeftKey, `referral-field-${i}`)}`}
            >
              <div className="referral-builder-field-card-head">
                <span className="referral-builder-field-card-title">Pregunta {i + 1}</span>
                <button
                  type="button"
                  className="secondary referral-builder-btn-ghost"
                  onClick={() => removeEmployeeField(i)}
                >
                  Quitar
                </button>
              </div>
              <div>
                <div className="referral-builder-field">
                  <label htmlFor={`rb-emp-type-${i}`}>Tipo de campo</label>
                  <select
                    id={`rb-emp-type-${i}`}
                    value={field.name || ""}
                    onChange={(e) => updateEmployeeField(i, "name", e.target.value)}
                  >
                    {fieldCatalog.map((option) => (
                      <option key={option.name} value={option.name}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {/* Muestra el nombre interno del campo (en gris, para referencia técnica) */}
                  {field.name && (
                    <span style={{ display: "block", marginTop: 4, fontSize: "0.72rem", color: "#8a93a8", fontFamily: "ui-monospace, monospace" }}>
                      {field.name}
                    </span>
                  )}
                </div>
                <div className="referral-builder-field-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <div className="referral-builder-field">
                    <label htmlFor={`rb-emp-label-${i}`}>Etiqueta visible</label>
                    <input
                      id={`rb-emp-label-${i}`}
                      type="text"
                      value={field.label || ""}
                      onChange={(e) => updateEmployeeField(i, "label", e.target.value)}
                    />
                  </div>
                  <div className="referral-builder-field">
                    <label htmlFor={`rb-emp-icon-${i}`}>Icono (URL)</label>
                    <input
                      id={`rb-emp-icon-${i}`}
                      type="text"
                      value={field.emoji || ""}
                      onChange={(e) => updateEmployeeField(i, "emoji", e.target.value)}
                      placeholder="URL del icono"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="referral-builder-actions">
            <button type="button" className="secondary" onClick={addEmployeeField}>
              Agregar pregunta
            </button>
            <button
              type="button"
              className="secondary referral-builder-btn-ghost"
              onClick={() => update(["referral", "employeeFields"], [])}
            >
              Eliminar seccion de preguntas
            </button>
          </div>
            </div>
          </details>

          {/* ── Sección: Mensaje de advertencia (texto opcional debajo del formulario) ── */}
          <details className="rb-accordion" onToggle={(e) => handleAccordionToggle(e, "referral-warning")}>
            <summary className="rb-accordion-summary">
              <span className="rb-summary-content">Mensaje de advertencia</span>
            </summary>
            <div className="rb-accordion-body">
          <div
            id={regionDomId("referral-warning")}
            data-rb-focus="referral-warning"
            className={focusSectionClass(activeLeftKey, "referral-warning")}
          >
            <div className="referral-builder-field">
              <label htmlFor="rb-warning">Mensaje de advertencia</label>
              <textarea
                id="rb-warning"
                value={r.warning || ""}
                onChange={(e) => update(["referral", "warning"], e.target.value)}
                placeholder="Texto opcional debajo del formulario"
              />
            </div>
            <button
              type="button"
              className="secondary referral-builder-btn-ghost"
              onClick={() => update(["referral", "warning"], "")}
            >
              Eliminar seccion de advertencia
            </button>
          </div>
            </div>
          </details>

          {/* ── Sección: Instrucciones (pasos para el referidor) ── */}
          <details className="rb-accordion" onToggle={(e) => handleAccordionToggle(e, "referral-instructions-header")}>
            <summary className="rb-accordion-summary">
              <span className="rb-summary-content">Instrucciones para el referidor</span>
            </summary>
            <div className="rb-accordion-body">
          <div
            id={regionDomId("referral-instructions-header")}
            data-rb-focus="referral-instructions-header"
            className={focusSectionClass(activeLeftKey, "referral-instructions-header")}
          >
            <div className="referral-builder-field">
              <label htmlFor="rb-inst-title">Título de la sección</label>
              <input
                id="rb-inst-title"
                type="text"
                value={r.instructionsTitle || ""}
                onChange={(e) => update(["referral", "instructionsTitle"], e.target.value)}
              />
            </div>
            <div className="referral-builder-field">
              <label htmlFor="rb-inst-sub">Subtítulo</label>
              <input
                id="rb-inst-sub"
                type="text"
                value={r.instructionsSubTitle || ""}
                onChange={(e) => update(["referral", "instructionsSubTitle"], e.target.value)}
              />
            </div>
          </div>

          {/* Lista de pasos: cada uno tiene título y texto */}
          {(r.instructions || []).map((step, i) => {
            const stepRegion = `referral-instructions-step-${i}`;
            return (
              <div
                key={i}
                id={regionDomId(stepRegion)}
                data-rb-focus={stepRegion}
                className={focusSectionClass(activeLeftKey, stepRegion)}
              >
                <h3 className="referral-builder-h3">Paso {i + 1}</h3>
                <div className="referral-builder-field">
                  <label htmlFor={`rb-step-title-${i}`}>Encabezado del paso</label>
                  <input
                    id={`rb-step-title-${i}`}
                    type="text"
                    value={step.title || ""}
                    onChange={(e) => updateInstruction(i, "title", e.target.value)}
                  />
                </div>
                <div className="referral-builder-field">
                  <label htmlFor={`rb-step-text-${i}`}>Texto del paso</label>
                  <textarea
                    id={`rb-step-text-${i}`}
                    value={step.text || ""}
                    onChange={(e) => updateInstruction(i, "text", e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="secondary referral-builder-btn-ghost"
                  onClick={() => removeInstruction(i)}
                >
                  Eliminar paso
                </button>
              </div>
            );
          })}
          <div className="referral-builder-actions">
            <button type="button" className="secondary" onClick={addInstruction}>
              Agregar paso
            </button>
            <button
              type="button"
              className="secondary referral-builder-btn-ghost"
              onClick={() => {
                update(["referral", "instructionsTitle"], "");
                update(["referral", "instructionsSubTitle"], "");
                update(["referral", "instructions"], []);
              }}
            >
              Eliminar seccion de pasos
            </button>
          </div>
            </div>
          </details>

          {/* ── Sección: Aviso (caja destacada al pie de las instrucciones) ── */}
          <details className="rb-accordion" onToggle={(e) => handleAccordionToggle(e, "referral-attention")}>
            <summary className="rb-accordion-summary">
              <span className="rb-summary-content">Aviso</span>
            </summary>
            <div className="rb-accordion-body">
          <p className="referral-builder-hint">Caja destacada al pie de las instrucciones.</p>
          <div
            id={regionDomId("referral-attention")}
            data-rb-focus="referral-attention"
            className={focusSectionClass(activeLeftKey, "referral-attention")}
          >
            <div className="referral-builder-field">
              <label htmlFor="rb-att-title">Título del aviso</label>
              <input
                id="rb-att-title"
                type="text"
                value={r.attention?.title || ""}
                onChange={(e) => update(["referral", "attention", "title"], e.target.value)}
              />
            </div>
            <div className="referral-builder-field">
              <label htmlFor="rb-att-p1">Primer párrafo</label>
              <textarea
                id="rb-att-p1"
                value={r.attention?.texts?.[0]?.text || ""}
                onChange={(e) => update(["referral", "attention", "texts", 0, "text"], e.target.value)}
              />
            </div>
            <div className="referral-builder-field">
              <label htmlFor="rb-att-p2">Segundo párrafo</label>
              <textarea
                id="rb-att-p2"
                value={r.attention?.texts?.[1]?.text || ""}
                onChange={(e) => update(["referral", "attention", "texts", 1, "text"], e.target.value)}
              />
            </div>
            <div className="referral-builder-field">
              <label htmlFor="rb-att-link">Enlace (URL)</label>
              <input
                id="rb-att-link"
                type="text"
                value={r.attention?.texts?.[1]?.link?.href || ""}
                onChange={(e) => update(["referral", "attention", "texts", 1, "link", "href"], e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div className="referral-builder-field">
              <label htmlFor="rb-att-linktext">Texto del enlace</label>
              <input
                id="rb-att-linktext"
                type="text"
                value={r.attention?.texts?.[1]?.link?.label || ""}
                onChange={(e) => update(["referral", "attention", "texts", 1, "link", "label"], e.target.value)}
              />
            </div>
            <button
              type="button"
              className="secondary referral-builder-btn-ghost"
              onClick={() => update(["referral", "attention"], null)}
            >
              Eliminar seccion de aviso
            </button>
          </div>
            </div>
          </details>

          {/* ── Sección: Ayuda (botón de duda frecuente + respuesta) ── */}
          <details className="rb-accordion" onToggle={(e) => handleAccordionToggle(e, "referral-help")}>
            <summary className="rb-accordion-summary">
              <span className="rb-summary-content">Ayuda</span>
            </summary>
            <div className="rb-accordion-body">
          <div
            id={regionDomId("referral-help")}
            data-rb-focus="referral-help"
            className={focusSectionClass(activeLeftKey, "referral-help")}
          >
            <div className="referral-builder-field">
              <label htmlFor="rb-help-btn">Duda frecuente</label>
              <input
                id="rb-help-btn"
                type="text"
                value={r.help?.title || ""}
                onChange={(e) => update(["referral", "help", "title"], e.target.value)}
              />
            </div>
            <div className="referral-builder-field">
              <label htmlFor="rb-help-sub">Respuesta duda</label>
              <input
                id="rb-help-sub"
                type="text"
                value={r.help?.subTitle || ""}
                onChange={(e) => update(["referral", "help", "subTitle"], e.target.value)}
              />
            </div>
            <div className="referral-builder-field">
              <label htmlFor="rb-help-body">Texto completo de ayuda</label>
              <textarea
                id="rb-help-body"
                value={r.help?.instructions || ""}
                onChange={(e) => update(["referral", "help", "instructions"], e.target.value)}
              />
            </div>
          </div>
          <button
            type="button"
            className="secondary referral-builder-btn-ghost"
            onClick={() => update(["referral", "help"], null)}
          >
            Eliminar sección de ayuda
          </button>
            </div>
          </details>

          {/* ── Sección: Redes sociales ── */}
          <details className="rb-accordion" onToggle={(e) => handleAccordionToggle(e, "social-links")}>
            <summary className="rb-accordion-summary">
              <span className="rb-summary-content">Redes sociales</span>
            </summary>
            <div className="rb-accordion-body">
          <div className="referral-builder-field" id={regionDomId("social-links")} data-rb-focus="social-links">
            <label htmlFor="rb-social-links">Formato: Nombre: URL (una por linea)</label>
            {/* El textarea muestra las redes como texto plano; al cambiar se convierte de vuelta a objeto */}
            <textarea
              id="rb-social-links"
              value={socialNetworkLinksToText(draft.socialNetworkLinks)}
              onChange={(e) => update(["socialNetworkLinks"], parseSocialNetworkLinksText(e.target.value))}
              placeholder={"LinkedIn: https://www.linkedin.com/company/campomarmx/\nFacebook: https://www.facebook.com/campomarmx/\nInstagram: https://www.instagram.com/campomarmx/"}
              style={{ minHeight: 110 }}
            />
          </div>
            </div>
          </details>

          {/* ── Botón de exportación + mensaje de confirmación ── */}
          <div style={{ marginTop: 16 }}>
            <button type="button" className="primary" onClick={copyJson} style={{ padding: "10px 18px", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: "0.9rem", background: "#2f6db3", color: "#fff" }}>
              Copiar JSON para TIM
            </button>
            {copied ? (
              <span className="referral-builder-toast" style={{ display: "inline-block", marginLeft: 12 }}>Listo: JSON copiado al portapapeles.</span>
            ) : null}
          </div>

          {/* ── Textarea del JSON: se puede editar manualmente o importar uno externo ── */}
          <details className="referral-builder-json-details" open>
            <summary className="referral-builder-json-summary">Ver JSON para TIM</summary>
            <textarea
              value={jsonInput}
              spellCheck={false}
              className="referral-builder-json-textarea"
              onChange={(e) => {
                const raw = e.target.value;
                setJsonInput(raw);
                // Intenta aplicar el JSON editado manualmente al draft
                applyJson(raw);
              }}
            />
            {jsonError ? <p className="referral-builder-hint" style={{ color: "#d11a2a" }}>{jsonError}</p> : null}
          </details>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            PANEL DERECHO: vista previa en tiempo real
        ══════════════════════════════════════════════════════════════════ */}
        <div
          className="referral-builder-panel referral-builder-preview"
          ref={previewPanelRef}
          onFocusCapture={(e) => {
            // Cuando el usuario hace clic en una zona de la preview,
            // activa la región correspondiente en el formulario
            const el = e.target;
            if (!(el instanceof Element)) return;
            const hit = el.closest("[data-rb-preview-region]");
            const id = hit?.getAttribute("data-rb-preview-region");
            if (id) setInspectFocus(id);
          }}
        >
          <h2>Vista previa</h2>
          <p className="referral-builder-preview-intro">
            Es la misma pantalla que verá el referidor. Tocá una zona para ver qué campo la edita.
            Las listas desplegables muestran datos de ejemplo.
          </p>

          {/* Tabs para alternar entre vista desktop y mobile */}
          <div className="referral-builder-device-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={previewDevice === "desktop"}
              className={previewDevice === "desktop" ? "active" : ""}
              onClick={() => setPreviewDevice("desktop")}
            >
              Pantalla grande
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={previewDevice === "mobile"}
              className={previewDevice === "mobile" ? "active" : ""}
              onClick={() => setPreviewDevice("mobile")}
            >
              Celular
            </button>
          </div>

          {/* Marco del dispositivo que contiene la vista previa real */}
          <div
            className={`referral-builder-device-frame referral-builder-device-${previewDevice}`}
          >
            <ReferralLivePreview
              company={previewCompany}
              device={previewDevice}
              builderInspect={builderInspect}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralBuilder;
