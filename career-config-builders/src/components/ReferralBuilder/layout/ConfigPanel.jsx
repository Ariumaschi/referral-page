// Panel izquierdo del builder: contiene todos los acordeones de configuración.
// Es el formulario completo que edita el draft (datos de empresa, canales, colores,
// imágenes, textos, campos del formulario, instrucciones, aviso, ayuda, redes y JSON).
// Cada campo llama a update() del contexto, que modifica el draft y dispara un re-render del preview en tiempo real.
import { useReferralBuilder } from "../context";
import { regionDomId, focusSectionClass, clone } from "../utils";
import { ColorRow } from "../config-sections/ColorRow";
import { AssetField } from "../config-sections/AssetField";
import { EmployeeFieldsSection } from "../config-sections/EmployeeFieldsSection";
import { InstructionsSection } from "../config-sections/InstructionsSection";
import { SocialLinksSection } from "../config-sections/SocialLinksSection";

export function ReferralConfigPanel() {
  const {
    draft,
    r,
    update,
    setDraft,
    activeLeftKey,
    handleAccordionToggle,
    accordionRef,
    onLeftPanelFocusCapture,
    colorLogoField,
    colorReferralField,
    assetLogo,
    assetBanners,
    copyJson,
    copied,
    jsonInput,
    setJsonInput,
    applyJson,
    jsonError,
  } = useReferralBuilder();

  return (
    <div
      className="referral-builder-panel referral-builder-config-panel"
      ref={accordionRef}
      onFocusCapture={onLeftPanelFocusCapture}
    >
      {/* Datos de la empresa */}
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

      {/* Canales de contacto */}
      <details className="rb-accordion" onToggle={(e) => handleAccordionToggle(e, null)}>
        <summary className="rb-accordion-summary">
          <span className="rb-summary-content">Canales de contacto</span>
        </summary>
        <div className="rb-accordion-body">
          <p className="referral-builder-hint">
            Canales por los que los candidatos pueden aplicar o contactar a la empresa.
          </p>

          {draft.channelConfig?.whatsapp != null ? (
            <div className="referral-builder-field">
              <label htmlFor="rb-wa">WhatsApp</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  id="rb-wa"
                  type="text"
                  value={draft.channelConfig.whatsapp.phoneNumber || ""}
                  onChange={(e) => update(["channelConfig", "whatsapp", "phoneNumber"], e.target.value)}
                  placeholder="525588817796"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="secondary referral-builder-btn-ghost"
                  onClick={() => setDraft(prev => { const n = clone(prev); if (n.channelConfig) delete n.channelConfig.whatsapp; return n; })}
                >
                  Quitar
                </button>
              </div>
              <small>Solo el número, con código de país (ej. 5255…)</small>
            </div>
          ) : (
            <button
              type="button"
              className="secondary"
              onClick={() => update(["channelConfig", "whatsapp", "phoneNumber"], "")}
            >
              + Agregar WhatsApp
            </button>
          )}

          {draft.channelConfig?.facebook != null ? (
            <div className="referral-builder-field">
              <label htmlFor="rb-fb-page">Facebook (Messenger)</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  id="rb-fb-page"
                  type="text"
                  value={draft.channelConfig.facebook.page || ""}
                  onChange={(e) => update(["channelConfig", "facebook", "page"], e.target.value)}
                  placeholder="TrabajaEnWalmartMX"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="secondary referral-builder-btn-ghost"
                  onClick={() => setDraft(prev => { const n = clone(prev); if (n.channelConfig) delete n.channelConfig.facebook; return n; })}
                >
                  Quitar
                </button>
              </div>
              <small>Nombre de la página de Facebook (sin URL)</small>
            </div>
          ) : (
            <button
              type="button"
              className="secondary"
              onClick={() => update(["channelConfig", "facebook", "page"], "")}
            >
              + Agregar Facebook
            </button>
          )}
        </div>
      </details>

      {/* Logo */}
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
            <ColorRow field={colorLogoField} />
            <AssetField field={assetLogo} />
          </div>
        </div>
      </details>

      {/* Banners */}
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
            {assetBanners.map((field) => (
              <AssetField key={field.id} field={field} />
            ))}
          </div>
        </div>
      </details>

      {/* Título principal */}
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
            <ColorRow field={colorReferralField} />
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

      {/* Formulario */}
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
          <EmployeeFieldsSection />
        </div>
      </details>

      {/* Mensaje de advertencia */}
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

      {/* Instrucciones para el referidor */}
      <details className="rb-accordion" onToggle={(e) => handleAccordionToggle(e, "referral-instructions-header")}>
        <summary className="rb-accordion-summary">
          <span className="rb-summary-content">Instrucciones para el referidor</span>
        </summary>
        <div className="rb-accordion-body">
          <InstructionsSection />
        </div>
      </details>

      {/* Aviso */}
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

      {/* Ayuda */}
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

      {/* Redes sociales */}
      <details className="rb-accordion" onToggle={(e) => handleAccordionToggle(e, "social-links")}>
        <summary className="rb-accordion-summary">
          <span className="rb-summary-content">Redes sociales</span>
        </summary>
        <div
          className="rb-accordion-body"
          id={regionDomId("social-links")}
          data-rb-focus="social-links"
        >
          <SocialLinksSection />
        </div>
      </details>

      {/* Exportación JSON */}
      <div style={{ marginTop: 16 }}>
        <button
          type="button"
          className="primary"
          onClick={copyJson}
          style={{ padding: "10px 18px", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: "0.9rem", background: "#2f6db3", color: "#fff" }}
        >
          Copiar JSON para TIM
        </button>
        {copied && (
          <span className="referral-builder-toast" style={{ display: "inline-block", marginLeft: 12 }}>
            Listo: JSON copiado al portapapeles.
          </span>
        )}
      </div>

      <details className="referral-builder-json-details" open>
        <summary className="referral-builder-json-summary">Ver JSON para TIM</summary>
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
        {jsonError && (
          <p className="referral-builder-hint" style={{ color: "#d11a2a" }}>{jsonError}</p>
        )}
      </details>
    </div>
  );
}
