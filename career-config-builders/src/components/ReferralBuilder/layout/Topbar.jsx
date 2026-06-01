import { useState } from "react";
import { useReferralBuilder } from "../context";
import { CLIENT_CONFIGS, BLANK_CONFIG_ID, fetchClientConfig } from "../../../data/clients/index.js";

export function ReferralBuilderTopbar() {
  const { applyJson } = useReferralBuilder();
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSelect = async (e) => {
    const id = e.target.value;
    setSelectedId(id);
    if (!id) return;

    setLoading(true);
    try {
      const config = await fetchClientConfig(id);
      applyJson(JSON.stringify(config));
    } catch {
      // fetchClientConfig solo falla si el id no existe — no puede ocurrir aquí
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="referral-builder-topbar">
      <div className="referral-builder-topbar-row-top">
        <h1 className="referral-builder-topbar-title">Configurador de Referral Pages</h1>
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
      </div>

      <div className="referral-builder-topbar-row-selector">
        <label htmlFor="client-config-select" className="referral-builder-topbar-select-label">
          Cargar config de cliente
        </label>
        <div className="referral-builder-topbar-select-wrapper">
          <select
            id="client-config-select"
            className="referral-builder-topbar-select"
            value={selectedId}
            onChange={handleSelect}
            disabled={loading}
          >
            <option value="">— Seleccionar cliente —</option>
            <option value={BLANK_CONFIG_ID}>Nueva config (en blanco)</option>
            {CLIENT_CONFIGS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          {loading && <span className="referral-builder-topbar-select-loading">Cargando…</span>}
        </div>
      </div>
    </header>
  );
}
