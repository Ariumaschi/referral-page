import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import walmartTemplate from "../data/walmart.json";
import emiLogoFooter from "../assets/emi_logo_footer.svg";
import "../styles/headerPreview.css";
import "../styles/landingPreview.css";
import "../styles/ReferralBuilder.css";

const FIXED_WHITE = "#FFFFFF";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getAtPath(obj, path) {
  return path.reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

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

function slugifyCompanyName(name) {
  const s = String(name || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "company";
}

function imageExtensionFromFile(file) {
  const match = (file?.name || "").match(/\.([a-zA-Z0-9]+)$/);
  if (match) {
    const ext = match[1].toLowerCase();
    if (/^(jpe?g|png|gif|webp|svg)$/.test(ext)) {
      return ext === "jpeg" ? ".jpg" : `.${ext}`;
    }
  }
  const mime = file?.type || "";
  const byMime = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
  };
  return byMime[mime] || ".png";
}

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

function landingCanonicalFilename(assetId, companyName, file) {
  const slug = slugifyCompanyName(companyName);
  const ext = imageExtensionFromFile(file);
  const map = {
    logo: `logo-${slug}${ext}`,
    banner_desktop: `banner-desktop-${slug}${ext}`,
    banner_mobile: `banner-mobile-${slug}${ext}`,
    main_filters_btn: `landing-btn-buscar-${slug}${ext}`,
    modal_apply: `landing-modal-aplicar-${slug}${ext}`,
    goback: `landing-volver-${slug}${ext}`,
  };
  return map[assetId] || `landing-${assetId}-${slug}${ext}`;
}

function mockS3UrlLanding(file, assetId, companyName) {
  const filename = landingCanonicalFilename(assetId, companyName, file);
  const folder = assetId === "logo" ? "logo" : "landing";
  return `https://emi-public.s3.us-east-1.amazonaws.com/mock/${folder}/${filename}`;
}

function joinTextBlocks(arr) {
  return (arr || []).map((x) => (x && x.text) || "").filter(Boolean).join("\n\n");
}

function splitTextBlocks(str) {
  return str
    .split(/\n\n+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((text) => ({ text }));
}

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

function ensureLandingStyle(style) {
  const s = style && typeof style === "object" ? clone(style) : {};
  const btn = s.mainFiltersSearchButton && typeof s.mainFiltersSearchButton === "object"
    ? clone(s.mainFiltersSearchButton)
    : {};
  btn.color = FIXED_WHITE;
  s.mainFiltersSearchButton = btn;
  return s;
}

function applyLandingExportTweaks(config) {
  const out = clone(config);
  out.style = ensureLandingStyle(out.style);
  out.referral = clone(out.referral || {});
  out.referral.redrectListingType = "landing";
  return out;
}

function buildLandingPreview(draft, blobs = {}) {
  const c = clone(draft);
  c.style = ensureLandingStyle(c.style);
  if (blobs.logo) c.company_logo = blobs.logo;
  if (blobs.bannerDesktop) c.company_banner = blobs.bannerDesktop;
  if (blobs.bannerMobile) c.company_banner_mobile = blobs.bannerMobile;
  if (blobs.mainFiltersBtn) c.mainFiltersButtonImg = blobs.mainFiltersBtn;
  if (blobs.modalApply) c.modalApplyImg = blobs.modalApply;
  if (blobs.goback) c.goBackLinkImg = blobs.goback;
  return c;
}

const ASSET_KEYS = {
  logo: "logo",
  banner_desktop: "bannerDesktop",
  banner_mobile: "bannerMobile",
  main_filters_btn: "mainFiltersBtn",
  modal_apply: "modalApply",
  goback: "goback",
};

const LANDING_ASSETS = [
  { id: "logo", label: "Logo", paths: [["company_logo"]] },
  { id: "banner_desktop", label: "Banner (computadora)", paths: [["company_banner"]] },
  { id: "banner_mobile", label: "Banner (celular)", paths: [["company_banner_mobile"]] },
  { id: "main_filters_btn", label: "Ícono del botón buscar", paths: [["mainFiltersButtonImg"]] },
  { id: "modal_apply", label: "Ícono del modal aplicar", paths: [["modalApplyImg"]] },
  { id: "goback", label: "Ícono flecha volver", paths: [["goBackLinkImg"]] },
];

function LandingLivePreview({ company, device }) {
  const style = company.style || {};
  const bannerSrc = device === "mobile" ? company.company_banner_mobile : company.company_banner;
  const filterBg = style.mainFiltersContainerBackgroundColor || "#132e82";
  const searchBtn = style.mainFiltersSearchButton || {};

  return (
    <div className="referral-live-preview-root landing-builder-preview-root">
      <div className="emi-header-container">
        <div className="text-emi-header">Career Page</div>
        <div className="text-emi-header" style={{ display: "flex", alignItems: "center" }}>
          Powered by
          <a
            href="https://emilabs.ai/"
            target="_blank"
            rel="noreferrer"
            style={{ display: "flex", marginLeft: "4px" }}
          >
            <img className="emi-logo-header" src={emiLogoFooter} alt="Emi" width={30} />
          </a>
        </div>
      </div>
      <div
        className="client-logo-container-single-position"
        style={
          style.clientLogoBackgroundColor
            ? { background: style.clientLogoBackgroundColor }
            : undefined
        }
      >
        <div className="client-logo-single-position">
          <img className="client-logo-image" src={company.company_logo || ""} alt="" />
        </div>
      </div>
      <div className="client-banner-container referral-live-preview-banner-wrap">
        <img className="client-banner" src={bannerSrc || ""} alt="" />
      </div>

      <div className="section landing-builder-preview-section">
        <div
          className="main-filters-container"
          style={{ background: filterBg }}
        >
          <div className="main-title">{company.main_title || ""}</div>
          <div className="filters-description">{company.filters_description || ""}</div>
          {company.filters_description_2 ? (
            <div className="filters-description">{company.filters_description_2}</div>
          ) : null}
          <div className="main-filters-section landing-builder-filters-mock">
            <div className="main-position-filter" style={{ opacity: 0.85, pointerEvents: "none" }}>
              <span style={{ marginLeft: 8, fontSize: 13, color: "#666" }}>Vista previa</span>
            </div>
            <div className="main-position-filter-button">
              <button
                type="button"
                className="main-position-filter-button-element"
                style={searchBtn.background ? { background: searchBtn.background, color: searchBtn.color || "#fff" } : undefined}
                disabled
              >
                {company.mainFiltersButtonImg ? (
                  <img
                    className="main-position-filter-button-image"
                    src={company.mainFiltersButtonImg}
                    alt=""
                  />
                ) : null}
                Buscar posición
              </button>
            </div>
          </div>
        </div>
        <div className="section-listings" style={{ padding: "16px 12px 24px" }}>
          <div className="positions-section-title">{company.positions_container_title || ""}</div>
          <div className="positions-section-subtitle">{company.positions_container_subtitle || ""}</div>
          <p className="referral-builder-hint" style={{ marginTop: 12, textAlign: "center" }}>
            Las tarjetas de vacantes usan datos del API; aquí solo se previsualizan textos y estilos del encabezado.
          </p>
        </div>
      </div>
    </div>
  );
}

const LandingBuilder = () => {
  const [draft, setDraft] = useState(() => clone(walmartTemplate));
  const [copied, setCopied] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [blobs, setBlobs] = useState({
    logo: null,
    bannerDesktop: null,
    bannerMobile: null,
    mainFiltersBtn: null,
    modalApply: null,
    goback: null,
  });
  const blobsRef = useRef(blobs);
  useEffect(() => {
    blobsRef.current = blobs;
  }, [blobs]);
  useEffect(
    () => () => {
      Object.values(blobsRef.current).forEach((u) => {
        if (u) URL.revokeObjectURL(u);
      });
    },
    []
  );

  const update = useCallback((path, value) => {
    setDraft((prev) => setAtPath(prev, path, value));
  }, []);

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

  const exportJson = useMemo(() => JSON.stringify(applyLandingExportTweaks(draft), null, 2), [draft]);
  const previewCompany = useMemo(() => buildLandingPreview(draft, blobs), [draft, blobs]);
  useEffect(() => {
    setJsonInput(exportJson);
  }, [exportJson]);

  const copyJson = useCallback(() => {
    navigator.clipboard.writeText(exportJson).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [exportJson]);

  const clearPreviewBlobs = useCallback(() => {
    setBlobs((prev) => {
      Object.values(prev).forEach((u) => {
        if (u) URL.revokeObjectURL(u);
      });
      return {
        logo: null,
        bannerDesktop: null,
        bannerMobile: null,
        mainFiltersBtn: null,
        modalApply: null,
        goback: null,
      };
    });
  }, []);

  const applyJson = useCallback((rawJson) => {
    try {
      const parsed = JSON.parse(rawJson);
      setJsonError("");
      clearPreviewBlobs();
      setDraft(parsed);
      return true;
    } catch {
      setJsonError("JSON invalido. Revisa formato y comas.");
      return false;
    }
  }, [clearPreviewBlobs]);

  const renderAsset = (field) => {
    const key = ASSET_KEYS[field.id];
    const mockUrl = getAtPath(draft, field.paths[0]) || "";
    const doneName = mockUrlFilename(mockUrl);
    return (
      <div className="referral-builder-field" key={field.id}>
        <label htmlFor={`lb-file-${field.id}`}>{field.label}</label>
        <input
          id={`lb-file-${field.id}`}
          type="file"
          accept="image/*"
          className="referral-builder-file-input"
          onChange={(e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const s3Mock = mockS3UrlLanding(file, field.id, draft.company_name);
            setBlobs((prev) => {
              const next = { ...prev };
              const old = next[key];
              if (old) URL.revokeObjectURL(old);
              next[key] = URL.createObjectURL(file);
              return next;
            });
            setDraft((prev) => {
              let next = clone(prev);
              field.paths.forEach((path) => {
                next = setAtPath(next, path, s3Mock);
              });
              return next;
            });
            e.target.value = "";
          }}
        />
        <input
          id={`lb-url-${field.id}`}
          type="text"
          value={mockUrl}
          placeholder="o pegá una URL pública (https://...)"
          onChange={(e) => {
            const value = e.target.value.trim();
            setBlobs((prev) => {
              const next = { ...prev };
              const old = next[key];
              if (old) URL.revokeObjectURL(old);
              next[key] = null;
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
        {mockUrl ? (
          <p className="referral-builder-upload-done" title={mockUrl}>
            Listo: <strong>{doneName}</strong>
          </p>
        ) : null}
      </div>
    );
  };

  const style = draft.style || {};
  const referral = draft.referral || {};
  const about = draft.about || { title: "", texts: [] };
  const benefits = draft.benefits || {};
  const since = benefits.benefitsSinceFirstDay || { title: "", texts: [] };
  const fromStart = benefits.benefitsFromStart || { title: "", texts: [] };

  return (
    <div className="referral-builder-page">
      <header className="referral-builder-topbar">
        <div className="referral-builder-topbar-title">
          <h1>Configurador de landing</h1>
          <span className="referral-builder-topbar-sub">
            Página de vacantes (ej. jobs.emilabs.ai/walmart). El JSON exportado deja{" "}
            <code>redrectListingType</code> en <strong>landing</strong>.
          </span>
        </div>
        <div className="referral-builder-topbar-links">
          <a className="referral-builder-topbar-link" href="/referral-builder">
            Configurador referral
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
        <div className="referral-builder-panel referral-builder-config-panel">
          <h2>Empresa</h2>
          <div className="referral-builder-field">
            <label htmlFor="lb-subsidiary">ID de subsidiaria</label>
            <input
              id="lb-subsidiary"
              type="number"
              min={1}
              value={draft.subsidiaryId}
              onChange={(e) => update(["subsidiaryId"], Number(e.target.value) || 0)}
            />
          </div>
          <div className="referral-builder-field">
            <label htmlFor="lb-name">Nombre de la empresa</label>
            <input
              id="lb-name"
              type="text"
              value={draft.company_name || ""}
              onChange={(e) => update(["company_name"], e.target.value)}
            />
          </div>
          <div className="referral-builder-field">
            <label htmlFor="lb-country">País (código)</label>
            <input
              id="lb-country"
              type="text"
              value={draft.country || ""}
              onChange={(e) => update(["country"], e.target.value)}
              placeholder="MX"
            />
          </div>
          <div className="referral-builder-field">
            <label htmlFor="lb-lang">Idioma</label>
            <input
              id="lb-lang"
              type="text"
              value={draft.language || ""}
              onChange={(e) => update(["language"], e.target.value)}
              placeholder="ES"
            />
          </div>
          <div className="referral-builder-field">
            <label>
              <input
                type="checkbox"
                checked={!!draft.vacancies}
                onChange={(e) => update(["vacancies"], e.target.checked)}
              />{" "}
              Listado con vacantes reales (API)
            </label>
          </div>
          <div className="referral-builder-field">
            <label>
              <input
                type="checkbox"
                checked={!!draft.linkGoBack}
                onChange={(e) => update(["linkGoBack"], e.target.checked)}
              />{" "}
              Mostrar enlace volver
            </label>
          </div>

          <h2>Tracking Emi (bloque referral en el mismo JSON)</h2>
          <p className="referral-builder-hint">
            Mismo archivo que la career page: este ID se usa cuando hace falta enlazar con Emi. El tipo de listing se fuerza a{" "}
            <strong>landing</strong> al exportar.
          </p>
          <div className="referral-builder-field">
            <label htmlFor="lb-redirect-listing">ID del listing (redirectListing)</label>
            <input
              id="lb-redirect-listing"
              type="text"
              value={referral.redirectListing || ""}
              onChange={(e) => update(["referral", "redirectListing"], e.target.value)}
            />
          </div>

          <h2>Imágenes</h2>
          {LANDING_ASSETS.map((f) => renderAsset(f))}

          <h2>Textos del buscador y listado</h2>
          <div className="referral-builder-field">
            <label htmlFor="lb-main-title">Título principal</label>
            <input
              id="lb-main-title"
              type="text"
              value={draft.main_title || ""}
              onChange={(e) => update(["main_title"], e.target.value)}
            />
          </div>
          <div className="referral-builder-field">
            <label htmlFor="lb-f1">Texto bajo el título</label>
            <textarea
              id="lb-f1"
              value={draft.filters_description || ""}
              onChange={(e) => update(["filters_description"], e.target.value)}
            />
          </div>
          <div className="referral-builder-field">
            <label htmlFor="lb-f2">Segundo texto (opcional)</label>
            <textarea
              id="lb-f2"
              value={draft.filters_description_2 || ""}
              onChange={(e) => update(["filters_description_2"], e.target.value)}
            />
          </div>
          <div className="referral-builder-field">
            <label htmlFor="lb-pct">Título de la lista de posiciones</label>
            <input
              id="lb-pct"
              type="text"
              value={draft.positions_container_title || ""}
              onChange={(e) => update(["positions_container_title"], e.target.value)}
            />
          </div>
          <div className="referral-builder-field">
            <label htmlFor="lb-pcs">Subtítulo de filtros</label>
            <input
              id="lb-pcs"
              type="text"
              value={draft.positions_container_subtitle || ""}
              onChange={(e) => update(["positions_container_subtitle"], e.target.value)}
            />
          </div>
          <div className="referral-builder-field">
            <label htmlFor="lb-disclaimer">Disclaimer (pie de aplicación)</label>
            <textarea
              id="lb-disclaimer"
              value={draft.disclaimer || ""}
              onChange={(e) => update(["disclaimer"], e.target.value)}
            />
          </div>

          <h2>Colores principales</h2>
          <div className="referral-builder-color-row">
            <span className="referral-builder-color-label">Franja del logo</span>
            <div className="referral-builder-color-inputs">
              <input
                type="color"
                value={style.clientLogoBackgroundColor || "#142D82"}
                onChange={(e) => update(["style", "clientLogoBackgroundColor"], e.target.value)}
              />
              <input
                type="text"
                value={style.clientLogoBackgroundColor || ""}
                onChange={(e) => update(["style", "clientLogoBackgroundColor"], e.target.value)}
              />
              <button
                type="button"
                className="secondary referral-builder-btn-ghost"
                onClick={() => pickColorWithEyedropper(["style", "clientLogoBackgroundColor"])}
                title="Tomar color de la pantalla"
                aria-label="Tomar color de la pantalla para franja del logo"
              >
                🖌
              </button>
            </div>
          </div>
          <div className="referral-builder-color-row">
            <span className="referral-builder-color-label">Barra del buscador</span>
            <div className="referral-builder-color-inputs">
              <input
                type="color"
                value={style.mainFiltersContainerBackgroundColor || "#132e82"}
                onChange={(e) => update(["style", "mainFiltersContainerBackgroundColor"], e.target.value)}
              />
              <input
                type="text"
                value={style.mainFiltersContainerBackgroundColor || ""}
                onChange={(e) => update(["style", "mainFiltersContainerBackgroundColor"], e.target.value)}
              />
              <button
                type="button"
                className="secondary referral-builder-btn-ghost"
                onClick={() => pickColorWithEyedropper(["style", "mainFiltersContainerBackgroundColor"])}
                title="Tomar color de la pantalla"
                aria-label="Tomar color de la pantalla para barra del buscador"
              >
                🖌
              </button>
            </div>
          </div>
          <div className="referral-builder-color-row">
            <span className="referral-builder-color-label">Botón buscar (fondo)</span>
            <div className="referral-builder-color-inputs">
              <input
                type="color"
                value={(style.mainFiltersSearchButton && style.mainFiltersSearchButton.background) || "#2f6db3"}
                onChange={(e) =>
                  update(["style", "mainFiltersSearchButton", "background"], e.target.value)
                }
              />
              <input
                type="text"
                value={(style.mainFiltersSearchButton && style.mainFiltersSearchButton.background) || ""}
                onChange={(e) =>
                  update(["style", "mainFiltersSearchButton", "background"], e.target.value)
                }
              />
              <button
                type="button"
                className="secondary referral-builder-btn-ghost"
                onClick={() => pickColorWithEyedropper(["style", "mainFiltersSearchButton", "background"])}
                title="Tomar color de la pantalla"
                aria-label="Tomar color de la pantalla para botón buscar"
              >
                🖌
              </button>
            </div>
          </div>
          <div className="referral-builder-color-row">
            <span className="referral-builder-color-label">Fondo del footer</span>
            <div className="referral-builder-color-inputs">
              <input
                type="color"
                value={style.footerBackgroundColor || "#dae7f5"}
                onChange={(e) => update(["style", "footerBackgroundColor"], e.target.value)}
              />
              <input
                type="text"
                value={style.footerBackgroundColor || ""}
                onChange={(e) => update(["style", "footerBackgroundColor"], e.target.value)}
              />
              <button
                type="button"
                className="secondary referral-builder-btn-ghost"
                onClick={() => pickColorWithEyedropper(["style", "footerBackgroundColor"])}
                title="Tomar color de la pantalla"
                aria-label="Tomar color de la pantalla para fondo del footer"
              >
                🖌
              </button>
            </div>
          </div>
          <div className="referral-builder-color-row">
            <span className="referral-builder-color-label">Botones de tarjeta (fondo)</span>
            <div className="referral-builder-color-inputs">
              <input
                type="text"
                value={(style.cardButtonStyle && style.cardButtonStyle.background) || ""}
                onChange={(e) => update(["style", "cardButtonStyle", "background"], e.target.value)}
                placeholder="rgba(...) o #hex"
              />
              <button
                type="button"
                className="secondary referral-builder-btn-ghost"
                onClick={() => pickColorWithEyedropper(["style", "cardButtonStyle", "background"])}
                title="Tomar color de la pantalla"
                aria-label="Tomar color de la pantalla para botones de tarjeta"
              >
                🖌
              </button>
            </div>
          </div>
          <div className="referral-builder-field">
            <label>Texto de botones de tarjeta</label>
            <input
              type="text"
              value={(style.cardButtonStyle && style.cardButtonStyle.textColor) || ""}
              onChange={(e) => update(["style", "cardButtonStyle", "textColor"], e.target.value)}
            />
          </div>

          <h2>Redes sociales</h2>
          <div className="referral-builder-field">
            <label htmlFor="lb-social-links">Formato: Nombre: URL (una por linea)</label>
            <textarea
              id="lb-social-links"
              value={socialNetworkLinksToText(draft.socialNetworkLinks)}
              onChange={(e) => update(["socialNetworkLinks"], parseSocialNetworkLinksText(e.target.value))}
              placeholder={"LinkedIn: https://www.linkedin.com/company/campomarmx/\nFacebook: https://www.facebook.com/campomarmx/\nInstagram: https://www.instagram.com/campomarmx/"}
              style={{ minHeight: 110 }}
            />
          </div>

          <h2>Canales (aplicar por WhatsApp / Messenger)</h2>
          <div className="referral-builder-field">
            <label htmlFor="lb-wa">WhatsApp (solo número, ej. 5255…)</label>
            <input
              id="lb-wa"
              type="text"
              value={(draft.channelConfig && draft.channelConfig.whatsapp && draft.channelConfig.whatsapp.phoneNumber) || ""}
              onChange={(e) => update(["channelConfig", "whatsapp", "phoneNumber"], e.target.value)}
            />
          </div>
          <div className="referral-builder-field">
            <label htmlFor="lb-messenger">Página de Facebook (Messenger)</label>
            <input
              id="lb-messenger"
              type="text"
              value={(draft.channelConfig && draft.channelConfig.facebook && draft.channelConfig.facebook.page) || ""}
              onChange={(e) => update(["channelConfig", "facebook", "page"], e.target.value)}
            />
          </div>

          <h2>Sobre la empresa</h2>
          <div className="referral-builder-field">
            <label htmlFor="lb-about-title">Título</label>
            <input
              id="lb-about-title"
              type="text"
              value={about.title || ""}
              onChange={(e) => update(["about", "title"], e.target.value)}
            />
          </div>
          <div className="referral-builder-field">
            <label htmlFor="lb-about-body">Párrafos (separá cada uno con una línea en blanco)</label>
            <textarea
              id="lb-about-body"
              value={joinTextBlocks(about.texts)}
              onChange={(e) => update(["about", "texts"], splitTextBlocks(e.target.value))}
              style={{ minHeight: 160 }}
            />
          </div>

          <h2>Beneficios</h2>
          <div className="referral-builder-field">
            <label htmlFor="lb-ben-title">Título general</label>
            <input
              id="lb-ben-title"
              type="text"
              value={benefits.title || ""}
              onChange={(e) => update(["benefits", "title"], e.target.value)}
            />
          </div>
          <div className="referral-builder-field">
            <label htmlFor="lb-ben-since-title">Título “desde el primer día”</label>
            <input
              id="lb-ben-since-title"
              type="text"
              value={since.title || ""}
              onChange={(e) => update(["benefits", "benefitsSinceFirstDay", "title"], e.target.value)}
            />
          </div>
          <div className="referral-builder-field">
            <label htmlFor="lb-ben-since-body">Ítems (uno por línea)</label>
            <textarea
              id="lb-ben-since-body"
              value={(since.texts || []).map((t) => t.text).join("\n")}
              onChange={(e) =>
                update(
                  ["benefits", "benefitsSinceFirstDay", "texts"],
                  e.target.value
                    .split("\n")
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((text) => ({ text }))
                )
              }
            />
          </div>
          <div className="referral-builder-field">
            <label htmlFor="lb-ben-from-title">Título “al contrato”</label>
            <input
              id="lb-ben-from-title"
              type="text"
              value={fromStart.title || ""}
              onChange={(e) => update(["benefits", "benefitsFromStart", "title"], e.target.value)}
            />
          </div>
          <div className="referral-builder-field">
            <label htmlFor="lb-ben-from-body">Ítems (uno por línea)</label>
            <textarea
              id="lb-ben-from-body"
              value={(fromStart.texts || []).map((t) => t.text).join("\n")}
              onChange={(e) =>
                update(
                  ["benefits", "benefitsFromStart", "texts"],
                  e.target.value
                    .split("\n")
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((text) => ({ text }))
                )
              }
            />
          </div>

          <div className="referral-builder-actions">
            <button type="button" className="primary" onClick={copyJson}>
              Copiar JSON listo
            </button>
          </div>
          {copied ? (
            <div className="referral-builder-toast">Listo: JSON copiado (incluye redrectListingType: landing).</div>
          ) : null}

          <details className="referral-builder-json-details" open>
            <summary className="referral-builder-json-summary">Ver JSON completo</summary>
            <textarea
              value={jsonInput}
              spellCheck={false}
              className="referral-builder-json-textarea"
              onChange={(e) => {
                const raw = e.target.value;
                setJsonInput(raw);
                applyJson(raw);
              }}
            />
            {jsonError ? <p className="referral-builder-hint" style={{ color: "#d11a2a" }}>{jsonError}</p> : null}
          </details>
        </div>

        <div className="referral-builder-panel referral-builder-preview">
          <h2>Vista previa</h2>
          <p className="referral-builder-preview-intro">
            Aproximación del encabezado y buscador. El listado real depende del API de vacantes.
          </p>
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
          <div className={`referral-builder-device-frame referral-builder-device-${previewDevice}`}>
            <LandingLivePreview company={previewCompany} device={previewDevice} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingBuilder;
