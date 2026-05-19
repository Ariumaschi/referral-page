// Componente reutilizable para cargar una imagen (logo o banner).
// Permite subir un archivo local (crea una URL temporal de previsualización)
// o ingresar directamente una URL pública. Cuando el usuario sube un archivo,
// el draft guarda la URL vieja (la de producción) y el preview local se guarda
// por separado en assetPreviewUrls para no pisar el JSON final.
import { useState, useEffect } from "react";
import { useReferralBuilder } from "../context";
import { getAtPath, setAtPath, clone, mockUrlFilename, ASSET_PREVIEW_KEYS } from "../utils";
import { fetchAssets } from "../../../services/s3Logos";

export function AssetField({ field }) {
  const { draft, setDraft, assetPreviewUrls, setAssetPreviewUrls } = useReferralBuilder();
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryLogos, setLibraryLogos] = useState(null); // null = no cargado aún
  const [libraryLoading, setLibraryLoading] = useState(false);

  useEffect(() => {
    if (!libraryOpen || libraryLogos !== null) return;
    setLibraryLoading(true);
    fetchAssets(field.id)
      .then((logos) => setLibraryLogos(logos))
      .finally(() => setLibraryLoading(false));
  }, [libraryOpen, libraryLogos]);

  const handlePickFromLibrary = (logo) => {
    setAssetPreviewUrls((prev) => {
      const next = { ...prev };
      const old = next[ASSET_PREVIEW_KEYS[field.id]];
      if (old) URL.revokeObjectURL(old);
      next[ASSET_PREVIEW_KEYS[field.id]] = null;
      return next;
    });
    setDraft((prev) => {
      let next = clone(prev);
      field.paths.forEach((path) => {
        next = setAtPath(next, path, logo.url);
      });
      return next;
    });
    setLibraryOpen(false);
  };
  const previewKey = ASSET_PREVIEW_KEYS[field.id];
  const mockUrl = getAtPath(draft, field.paths[0]) || "";
  const localPreview = assetPreviewUrls[previewKey];
  const displayUrl = localPreview || mockUrl;
  const doneName = mockUrlFilename(mockUrl);

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

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setAssetPreviewUrls((prev) => {
      const next = { ...prev };
      const old = next[previewKey];
      if (old) URL.revokeObjectURL(old);
      next[previewKey] = URL.createObjectURL(file);
      return next;
    });
    e.target.value = "";
  };

  const handleUrlChange = (e) => {
    const value = e.target.value;
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
  };

  return (
    <div className="rb-asset-card">
      <div className="rb-asset-card-label">{field.label}</div>

      {displayUrl ? (
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
        <label className="rb-asset-dropzone" htmlFor={`rb-file-${field.id}`}>
          <svg
            className="rb-asset-upload-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12M8 8l4-4 4 4" />
          </svg>
          <span className="rb-asset-dropzone-text">Subir archivo</span>
          <span className="rb-asset-dropzone-hint">PNG · JPG · SVG · WEBP</span>
          <input
            id={`rb-file-${field.id}`}
            type="file"
            accept="image/*"
            className="rb-asset-file-input-hidden"
            onChange={handleFileChange}
          />
        </label>
      )}

      <div className="rb-asset-url-row">
        <span className="rb-asset-url-or">o pegá una URL</span>
        <input
          type="text"
          className="rb-asset-url-input"
          value={mockUrl}
          placeholder="https://..."
          onChange={handleUrlChange}
        />
      </div>

      <div className="rb-asset-library">
          <button
            type="button"
            className="rb-asset-library-toggle"
            onClick={() => setLibraryOpen((v) => !v)}
          >
            {libraryOpen ? "▲ Cerrar librería" : "▼ Elegir de librería S3"}
          </button>

          {libraryOpen && (
            <div className="rb-asset-library-grid">
              {libraryLoading && (
                <span className="rb-asset-library-loading">Cargando logos...</span>
              )}
              {!libraryLoading && libraryLogos?.map((logo) => (
                <button
                  key={logo.key}
                  type="button"
                  className="rb-asset-library-item"
                  onClick={() => handlePickFromLibrary(logo)}
                  title={logo.name}
                >
                  <img src={logo.url} alt={logo.name} className="rb-asset-library-thumb" />
                  <span className="rb-asset-library-name">{logo.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}
