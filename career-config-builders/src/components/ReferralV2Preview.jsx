import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import DropdownInput from "./DropdownInput";
import "./referralPreview.css";

const SOCIAL_ICONS = {
  TikTok: (
    <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.73a8.21 8.21 0 004.79 1.53V6.77a4.85 4.85 0 01-1.02-.08z" fill="#000"/>
    </svg>
  ),
  Facebook: (
    <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
    </svg>
  ),
  Instagram: (
    <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ig-social-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FED373"/>
          <stop offset="25%" stopColor="#F15245"/>
          <stop offset="50%" stopColor="#D92E7F"/>
          <stop offset="75%" stopColor="#9B36B7"/>
          <stop offset="100%" stopColor="#515ECF"/>
        </linearGradient>
      </defs>
      <path fill="url(#ig-social-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  ),
  LinkedIn: (
    <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
};

function inspectHandlers(builderInspect, regionId, className = "") {
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

export default function ReferralV2Preview({
  company,
  style = {},
  onGenerateLink = () => {},
  code = "",
  query = {},
  isLoading = false,
  builderInspect,
}) {
  const [referralData, setReferralData] = useState({});
  const [errorFields, setErrorFields] = useState(false);

  const onInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setReferralData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleScrollHelp = () => {
    document.getElementById("referral-help-container-id")?.scrollIntoView({ behavior: "smooth" });
  };

  const generateLink = () => {
    const error = [];
    (company.referral?.employeeFields || []).forEach((k) => {
      if (!referralData[k.name]) error.push(k.label || k.name);
    });

    if (company.subsidiaryId === 67 && !referralData.facility) {
      setErrorFields("Completá el campo de instalación (facility).");
    } else if (error.length) {
      setErrorFields(error.join(", "));
    } else {
      setErrorFields(false);
      onGenerateLink(referralData);
    }
  };

  const r = company.referral || {};
  const instructions = r.instructions || [];
  const social = company.socialNetworkLinks || {};
  const socialItems = [
    ["TikTok", social.tikTok || social.tiktok],
    ["Facebook", social.facebook],
    ["Instagram", social.instagram],
    ["LinkedIn", social.linkedin],
  ].filter(([, url]) => Boolean(url));

  return (
    <div className="section">
      <div
        style={{ backgroundColor: style.referralTitleBackgroundColor }}
        {...inspectHandlers(builderInspect, "referral-hero", "referral-title-container")}
      >
        <div>
          <h2
            className="referral-title-text"
            style={style.referralTitleTextColor ? { color: style.referralTitleTextColor } : undefined}
          >
            {r.title}
          </h2>
        </div>
        <div>
          <p
            className="referral-subtitle-text"
            style={style.referralSubtitleTextColor ? { color: style.referralSubtitleTextColor } : undefined}
          >
            {r.subTitle}
          </p>
        </div>
      </div>

      <div
        className="referral-form-container"
        style={style.referralFormContainer || undefined}
      >
        {isLoading ? (
          <p className="referral-preview-loading">Cargando…</p>
        ) : code ? (
          <p className="referral-preview-hint">Vista con código de referido (omitida en el configurador).</p>
        ) : (
          <div className="referral-form-control">
            <div {...inspectHandlers(builderInspect, "referral-form-title", "referral-form-title-wrap")}>
              <p
                className="referral-form-title"
                style={style.referralFormTitleColor ? { color: style.referralFormTitleColor } : undefined}
              >
                {r.formTitle}
              </p>
            </div>

            {(r.employeeFields || []).map((field, i) => (
              <div key={i} {...inspectHandlers(builderInspect, `referral-field-${i}`, "referral-builder-field-hit")}>
                {field.dropdown ? (
                  <DropdownInput
                    name={field.name}
                    label={field.label}
                    emoji={field.emoji}
                    options={field.dropdown}
                    value={referralData[field.name]}
                    onChange={onInputChange}
                    isInputType={field.inputText}
                    style={style}
                  />
                ) : (
                  <div
                    className="referral-form-control-input-container"
                    style={style.referralInputContainer || undefined}
                  >
                    {field.emoji ? (
                      <img src={field.emoji} className="referral-form-control-input-emoji" alt={field.label} />
                    ) : null}
                    <input
                      className="referral-form-control-input"
                      type="text"
                      id={field.name}
                      name={field.name}
                      placeholder={field.label}
                      onChange={onInputChange}
                      maxLength={field.maxLength || undefined}
                    />
                  </div>
                )}
              </div>
            ))}

            {r.help ? (
              <div {...inspectHandlers(builderInspect, "referral-help-trigger", "referral-form-help-button-wrap")}>
                <button type="button" className="referral-form-help-button" onClick={handleScrollHelp}>
                  <p
                    className="referral-form-help-text"
                    style={style.referralHelpTextColor ? { color: style.referralHelpTextColor } : undefined}
                  >
                    {r.help.title}
                  </p>
                </button>
              </div>
            ) : null}

            <div {...inspectHandlers(builderInspect, "referral-warning", "referral-form-warning-wrap")}>
              <p
                className="referral-form-warning-text"
                style={style.referralWarningTextColor ? { color: style.referralWarningTextColor } : undefined}
              >
                {r.warning}
              </p>
            </div>

            <div className="referral-form-actions-row">
              {r.generateLinkMessage ? <div>{r.generateLinkMessage}</div> : null}
              <button
                type="button"
                className="referral-form-button"
                style={style.referralGenerateLinkButtonContainer || undefined}
                onClick={generateLink}
              >
                {r.generateLinkButtonImg ? (
                  <div className="referral-form-button-icon-container">
                    <img className="referral-form-button-icon" src={r.generateLinkButtonImg} alt="" />
                  </div>
                ) : null}
                <div className="referral-form-button-text-container">
                  {r.generateLinkButtonCta || "Generar enlace"}
                </div>
              </button>
              {errorFields ? (
                <div style={{ color: "red" }}>
                  Revisá los campos: {errorFields}
                </div>
              ) : null}
            </div>

            {r.conditions ? (
              <div className="referral_conditions_container">
                <ReactMarkdown className="referral_conditions">{r.conditions}</ReactMarkdown>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div
        className="referral-instructions-container"
        style={style.referralInstructionsContainer || undefined}
      >
        <div {...inspectHandlers(builderInspect, "referral-instructions-header", "referral-instructions-header-wrap")}>
          <div className="referral-instructions-title">
            <p
              className="referral-instructions-title-text"
              style={style.referralInstructionsTitleColor ? { color: style.referralInstructionsTitleColor } : undefined}
            >
              {r.instructionsTitle}
            </p>
          </div>
          <div className="referral-instructions-subtitle">
            <p className="referral-instructions-subtitle-text">{r.instructionsSubTitle}</p>
          </div>
        </div>
        <div className="referral-instructions-steps">
          {instructions.map((step, i) => (
            <div key={i} {...inspectHandlers(builderInspect, `referral-instructions-step-${i}`, "referral-instructions-step")}>
              <div
                className="referral-instructions-step-title"
                style={style.referralInstructionsStepTitleColor ? { color: style.referralInstructionsStepTitleColor } : undefined}
              >
                {step.title}
              </div>
              <div
                className="referral-instructions-step-text"
                style={style.referralInstructionsStepTextColor ? { color: style.referralInstructionsStepTextColor } : undefined}
              >
                {step.text}
              </div>
            </div>
          ))}
        </div>

        {r.attention ? (
          <div
            style={style.referralAttentionContainer || undefined}
            {...inspectHandlers(builderInspect, "referral-attention", "referral-instructions-attention")}
          >
            <div
              className="referral-instructions-attention-title"
              style={style.referralAttentionTitleColor ? { color: style.referralAttentionTitleColor } : undefined}
            >
              {r.attention.title}
            </div>
            {(r.attention.texts || []).map((t, ti) => (
              <div
                key={ti}
                className="referral-instructions-attention-text"
                style={style.referralAttentionTextColor ? { color: style.referralAttentionTextColor } : undefined}
              >
                {t.text}
                {t.link ? (
                  <a href={t.link.href} target="_blank" rel="noreferrer">
                    {t.link.label}
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {r.help ? (
        <div
          id="referral-help-container-id"
          style={style.referralHelpContainer || undefined}
          {...inspectHandlers(builderInspect, "referral-help", "referral-help-container")}
        >
          <div
            className="referral-help-title"
            style={style.referralHelpTitleColor ? { color: style.referralHelpTitleColor } : undefined}
          >
            {r.help.title}
          </div>
          <div
            className="referral-help-subtitle"
            style={style.referralHelpSubtitleColor ? { color: style.referralHelpSubtitleColor } : undefined}
          >
            {r.help.subTitle}
          </div>
          <div
            className="referral-help-instructions"
            style={style.referralHelpInstructionsColor ? { color: style.referralHelpInstructionsColor } : undefined}
          >
            {r.help.instructions}
          </div>
        </div>
      ) : null}
      {socialItems.length ? (
        <div
          {...inspectHandlers(builderInspect, "social-links")}
          style={{
            background: "#dae2ec",
            borderRadius: 8,
            padding: "14px 16px",
            marginTop: 16,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8, textAlign: "center" }}>Encuentranos en:</div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
            {socialItems.map(([label, url]) => (
              <a key={label} href={url} target="_blank" rel="noreferrer" title={label} style={{ display: "flex", alignItems: "center" }}>
                {SOCIAL_ICONS[label] ?? label}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
