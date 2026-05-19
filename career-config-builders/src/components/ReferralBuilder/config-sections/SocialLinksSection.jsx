// Sección para gestionar los links de redes sociales.
// Cada red es una fila con nombre y URL, al estilo de los pasos de instrucciones.
// Los botones de acceso rápido pre-completan el nombre de redes conocidas.
// Usa estado local para edición fluida y sincroniza al draft en cada cambio.
// Si se carga un JSON externo (applyJson), detecta el cambio y reinicializa las filas.
import { useState, useEffect } from "react";
import { useReferralBuilder } from "../context";
import { socialNetworkLinksToArray, socialNetworkLinksFromArray } from "../utils";

const QUICK_ADD = [
  {
    label: "LinkedIn",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="ig-quick-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FED373" />
            <stop offset="50%" stopColor="#D92E7F" />
            <stop offset="100%" stopColor="#515ECF" />
          </linearGradient>
        </defs>
        <path fill="url(#ig-quick-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#000">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.73a8.21 8.21 0 004.79 1.53V6.77a4.85 4.85 0 01-1.02-.08z" />
      </svg>
    ),
  },
  {
    label: "X",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#000">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF0000">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export function SocialLinksSection() {
  const { draft, update } = useReferralBuilder();

  const [rows, setRows] = useState(() => socialNetworkLinksToArray(draft.socialNetworkLinks));

  useEffect(() => {
    const currentObj = socialNetworkLinksFromArray(rows);
    if (JSON.stringify(currentObj) === JSON.stringify(draft.socialNetworkLinks)) return;
    setRows(socialNetworkLinksToArray(draft.socialNetworkLinks));
  }, [draft.socialNetworkLinks]);

  const sync = (newRows) => {
    update(["socialNetworkLinks"], socialNetworkLinksFromArray(newRows));
  };

  const updateRow = (i, field, value) => {
    const newRows = rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r));
    setRows(newRows);
    sync(newRows);
  };

  const addRow = (label = "") => {
    setRows((prev) => [...prev, { label, url: "" }]);
  };

  const removeRow = (i) => {
    const newRows = rows.filter((_, idx) => idx !== i);
    setRows(newRows);
    sync(newRows);
  };

  return (
    <>
      {rows.map((row, i) => (
        <div key={i} className="referral-builder-field-card">
          <div className="referral-builder-field-card-head">
            <span className="referral-builder-field-card-title">Red {i + 1}</span>
            <button
              type="button"
              className="secondary referral-builder-btn-ghost"
              onClick={() => removeRow(i)}
            >
              Quitar
            </button>
          </div>
          <div className="referral-builder-field-grid" style={{ gridTemplateColumns: "1fr 2fr" }}>
            <div className="referral-builder-field">
              <label htmlFor={`rb-social-name-${i}`}>Nombre</label>
              <input
                id={`rb-social-name-${i}`}
                type="text"
                value={row.label}
                placeholder="LinkedIn"
                onChange={(e) => updateRow(i, "label", e.target.value)}
              />
            </div>
            <div className="referral-builder-field">
              <label htmlFor={`rb-social-url-${i}`}>URL</label>
              <input
                id={`rb-social-url-${i}`}
                type="text"
                value={row.url}
                placeholder="https://..."
                onChange={(e) => updateRow(i, "url", e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}

      <div style={{ marginTop: 10 }}>
        <p className="referral-builder-hint" style={{ marginBottom: 6 }}>Agregar red conocida:</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {QUICK_ADD.map(({ label, icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => addRow(label)}
              title={`Agregar ${label}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 10px",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                background: "#fff",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "#374151",
              }}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="referral-builder-actions" style={{ marginTop: 8 }}>
        <button type="button" className="secondary" onClick={() => addRow()}>
          + Personalizada
        </button>
      </div>
    </>
  );
}
