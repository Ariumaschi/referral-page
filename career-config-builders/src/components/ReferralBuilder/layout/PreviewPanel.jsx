// Panel derecho del builder: muestra en tiempo real cómo verá el usuario final la página de referral. Tiene tabs para alternar entre vista de escritorio y celular.
// ReferralLivePreview arma el chrome (header Emi, logo, banner) y embebe ReferralV2.
// El sistema de inspect permite hacer clic en cualquier zona del preview para resaltar y hacer scroll al campo correspondiente en el panel de configuración.
import emiLogoFooter from "../../../assets/emi_logo_footer.svg";
import ReferralV2 from "./preview/ReferralV2Preview";
import { useReferralBuilder } from "../context";
import { mergeInspectChrome } from "../utils";

function ReferralLivePreview({ company, device, builderInspect }) {
  const style = company.style || {};
  const bannerSrc =
    device === "mobile"
      ? company.referral?.company_banner_mobile || company.company_banner_mobile
      : company.referral?.company_banner || company.company_banner;

  return (
    <div className="referral-live-preview-root">
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
        style={style.clientLogoBackgroundColor ? { background: style.clientLogoBackgroundColor } : undefined}
        {...mergeInspectChrome(builderInspect, "chrome-logo", "client-logo-container-single-position")}
      >
        <div className="client-logo-single-position">
          <img className="client-logo-image" src={company.company_logo || ""} alt="" />
        </div>
      </div>

      <div
        {...mergeInspectChrome(
          builderInspect,
          "chrome-banner",
          "client-banner-container referral-live-preview-banner-wrap"
        )}
      >
        <img className="client-banner" src={bannerSrc || ""} alt="" />
      </div>

      <ReferralV2
        company={company}
        style={style}
        onGenerateLink={() => {}}
        code=""
        isLoading={false}
        builderInspect={builderInspect}
      />
    </div>
  );
}

export function ReferralPreviewPanel() {
  const {
    previewCompany,
    previewDevice,
    setPreviewDevice,
    builderInspect,
    previewPanelRef,
    setInspectFocus,
  } = useReferralBuilder();

  const handleFocusCapture = (e) => {
    const el = e.target;
    if (!(el instanceof Element)) return;
    const hit = el.closest("[data-rb-preview-region]");
    const id = hit?.getAttribute("data-rb-preview-region");
    if (id) setInspectFocus(id);
  };

  return (
    <div
      className="referral-builder-panel referral-builder-preview"
      ref={previewPanelRef}
      onFocusCapture={handleFocusCapture}
    >
      <h2>Vista previa</h2>
      <p className="referral-builder-preview-intro">
        Es la misma pantalla que verá el referidor. Tocá una zona para ver qué campo la edita.
        Las listas desplegables muestran datos de ejemplo.
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
        <ReferralLivePreview
          company={previewCompany}
          device={previewDevice}
          builderInspect={builderInspect}
        />
      </div>
    </div>
  );
}
