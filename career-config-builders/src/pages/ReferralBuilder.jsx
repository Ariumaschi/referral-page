// Componente raíz del configurador de referral. Centraliza todo el estado
// (draft, preview, inspect, assets) y los callbacks que lo modifican.
// Construye el contextValue con useMemo y lo provee a los componentes hijos
// (Topbar, ConfigPanel, PreviewPanel) a través de ReferralBuilderContext.Provider,
// evitando tener que pasar props manualmente a cada nivel del árbol.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import walmartTemplate from "../data/walmart.json";
import "../styles/headerPreview.css";
import "../styles/ReferralBuilder.css";

import { ReferralBuilderContext } from "../components/ReferralBuilder/context";
import { ReferralBuilderTopbar } from "../components/ReferralBuilder/layout/Topbar";
import { ReferralConfigPanel } from "../components/ReferralBuilder/layout/ConfigPanel";
import { ReferralPreviewPanel } from "../components/ReferralBuilder/layout/PreviewPanel";
import {
  FIELD_CATALOG,
  COLOR_FIELDS,
  ASSET_UPLOADS,
  clone,
  setAtPath,
  normalizeEmployeeFields,
  applyExportTweaks,
  buildPreviewCompany,
  scrollInspectTarget,
  regionDomId,
} from "../components/ReferralBuilder/utils";

const ReferralBuilder = () => {
  // ── CATÁLOGO DE CAMPOS ──────────────────────────────────────────────────────
  const fieldCatalog = useMemo(() => FIELD_CATALOG, []);
  const fieldCatalogMap = useMemo(
    () => fieldCatalog.reduce((acc, item) => ({ ...acc, [item.name]: item }), {}),
    [fieldCatalog]
  );

  // ── ESTADO ──────────────────────────────────────────────────────────────────
  const [draft, setDraft] = useState(() =>
    normalizeEmployeeFields(clone(walmartTemplate), fieldCatalogMap)
  );
  const [copied, setCopied] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [assetPreviewUrls, setAssetPreviewUrls] = useState({
    logo: null,
    bannerDesktop: null,
    bannerMobile: null,
  });
  const [inspectFocus, setInspectFocus] = useState(null);

  const assetPreviewUrlsRef = useRef(assetPreviewUrls);
  const previewPanelRef = useRef(null);
  const accordionRef = useRef(null);
  const prevDraftRef = useRef(null);

  // ── EFECTOS ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    assetPreviewUrlsRef.current = assetPreviewUrls;
  }, [assetPreviewUrls]);

  useEffect(
    () => () => {
      Object.values(assetPreviewUrlsRef.current).forEach((u) => {
        if (u) URL.revokeObjectURL(u);
      });
    },
    []
  );

  // ── VALORES DERIVADOS ────────────────────────────────────────────────────────
  const previewCompany = useMemo(
    () => buildPreviewCompany(draft, assetPreviewUrls),
    [draft, assetPreviewUrls]
  );

  const exportJson = useMemo(
    () => JSON.stringify(applyExportTweaks(draft), null, 2),
    [draft]
  );

  useEffect(() => {
    setJsonInput(exportJson);
  }, [exportJson]);

  useEffect(() => {
    const prev = prevDraftRef.current;
    if (prev) {
      const chequear = (label, getValue) => {
        if (JSON.stringify(getValue(prev)) !== JSON.stringify(getValue(draft))) {
          console.log(`✏️ ${label}`, { antes: getValue(prev), después: getValue(draft) });
        }
      };
      chequear("Subsidiary ID",               d => d.subsidiaryId);
      chequear("Nombre de la empresa",         d => d.company_name);
      chequear("Listing ID",                   d => d.referral?.redirectListing);
      chequear("Canales de contacto",          d => d.channelConfig);
      chequear("Color del logo",               d => d.style?.clientLogoBackgroundColor);
      chequear("Color del título",             d => d.style?.referralTitleBackgroundColor);
      chequear("Logo (imagen)",                d => d.company_logo);
      chequear("Banners",                      d => [d.company_banner, d.company_banner_mobile]);
      chequear("Título principal",             d => d.referral?.title);
      chequear("Subtítulo principal",          d => d.referral?.subTitle);
      chequear("Formulario - título",          d => d.referral?.formTitle);
      chequear("Formulario - preguntas",       d => d.referral?.employeeFields);
      chequear("Advertencia",                  d => d.referral?.warning);
      chequear("Instrucciones - encabezado",   d => [d.referral?.instructionsTitle, d.referral?.instructionsSubTitle]);
      chequear("Instrucciones - pasos",        d => d.referral?.instructions);
      chequear("Aviso",                        d => d.referral?.attention);
      chequear("Ayuda",                        d => d.referral?.help);
      chequear("Redes sociales",               d => d.socialNetworkLinks);
    }
    prevDraftRef.current = draft;
  }, [draft]);


  const activeLeftKey = useMemo(
    () => (inspectFocus ? scrollInspectTarget(inspectFocus) : null),
    [inspectFocus]
  );

  // ── CALLBACKS ────────────────────────────────────────────────────────────────
  const update = useCallback((path, value) => {
    setDraft((prev) => setAtPath(prev, path, value));
  }, []);

  const pickColorWithEyedropper = useCallback(
    async (path) => {
      if (typeof window === "undefined" || !("EyeDropper" in window)) {
        window.alert("Tu navegador no soporta el selector de color en pantalla.");
        return;
      }
      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) update(path, result.sRGBHex);
      } catch {
        // El usuario canceló el selector.
      }
    },
    [update]
  );

  const updateInstruction = useCallback((index, key, value) => {
    setDraft((prev) => {
      const next = clone(prev);
      if (!next.referral?.instructions?.[index]) return prev;
      next.referral.instructions[index][key] = value;
      return next;
    });
  }, []);

  const addInstruction = useCallback(() => {
    setDraft((prev) => {
      const next = clone(prev);
      next.referral = next.referral || {};
      next.referral.instructions = next.referral.instructions || [];
      const nextNumber = next.referral.instructions.length + 1;
      next.referral.instructions.push({ title: `Paso ${nextNumber}`, text: "" });
      return next;
    });
  }, []);

  const removeInstruction = useCallback((index) => {
    setDraft((prev) => {
      const next = clone(prev);
      next.referral = next.referral || {};
      next.referral.instructions = (next.referral.instructions || []).filter((_, i) => i !== index);
      return next;
    });
  }, []);

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

  const removeEmployeeField = useCallback((index) => {
    setDraft((prev) => {
      const next = clone(prev);
      next.referral.employeeFields = next.referral.employeeFields.filter((_, i) => i !== index);
      return next;
    });
  }, []);

  const copyJson = useCallback(() => {
    navigator.clipboard.writeText(exportJson).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [exportJson]);

  const clearPreviewAssetUrls = useCallback(() => {
    setAssetPreviewUrls((prev) => {
      Object.values(prev).forEach((u) => {
        if (u) URL.revokeObjectURL(u);
      });
      return { logo: null, bannerDesktop: null, bannerMobile: null };
    });
  }, []);

  const applyJson = useCallback(
    (rawJson) => {
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
    },
    [clearPreviewAssetUrls, fieldCatalogMap]
  );

  const handleInspectActivate = useCallback((regionId) => {
    setInspectFocus(regionId);
    requestAnimationFrame(() => {
      const key = scrollInspectTarget(regionId);
      const section = document.getElementById(regionDomId(key));
      const accordion = section?.closest("details.rb-accordion");
      if (accordion && !accordion.open) {
        accordionRef.current
          ?.querySelectorAll("details.rb-accordion[open]")
          .forEach((d) => d.removeAttribute("open"));
        accordion.open = true;
      }
      section?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      requestAnimationFrame(() => {
        const focusable = section?.querySelector(
          'input:not([type="file"]):not([readonly]), textarea:not([readonly]), select, button:not([disabled])'
        );
        focusable?.focus({ preventScroll: true });
      });
    });
  }, []);

  const builderInspect = useMemo(
    () => ({
      activeId: inspectFocus,
      onActivate: handleInspectActivate,
      isRegionActive: (regionId) => {
        if (inspectFocus == null) return false;
        return scrollInspectTarget(inspectFocus) === scrollInspectTarget(regionId);
      },
    }),
    [inspectFocus, handleInspectActivate]
  );

  const handleAccordionToggle = useCallback((e, regionId) => {
    const opened = e.currentTarget;
    if (opened.open) {
      accordionRef.current
        ?.querySelectorAll("details.rb-accordion[open]")
        .forEach((d) => { if (d !== opened) d.removeAttribute("open"); });
      if (regionId) setInspectFocus(regionId);
    } else {
      setInspectFocus(null);
    }
  }, []);

  const onLeftPanelFocusCapture = useCallback((e) => {
    const el = e.target;
    if (!(el instanceof Element)) return;
    const block = el.closest("[data-rb-focus]");
    if (!block) return;
    const id = block.getAttribute("data-rb-focus");
    if (id) setInspectFocus(id);
  }, []);

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

  // ── VALOR DEL CONTEXTO ───────────────────────────────────────────────────────
  const contextValue = useMemo(
    //useMemo evita re-renders innecesarios en cascada.
    // Sin él, cada render de ReferralBuilder crearía un objeto contextValue nuevo en memoria — aunque el contenido sea idéntico. El Provider lo detectaría como un valor distinto y re-renderizaría todos los hijos (ConfigPanel, PreviewPanel, Topbar...) sin necesidad.
    // Con useMemo, React reutiliza el mismo objeto mientras ninguna dependencia del array cambie. Solo recalcula — y solo re-renderiza los hijos — cuando algo realmente cambió.
    
    () => ({
      draft,
      r: draft.referral,
      update,
      activeLeftKey,
      handleAccordionToggle,
      accordionRef,
      onLeftPanelFocusCapture,
      previewCompany,
      previewDevice,
      setPreviewDevice,
      builderInspect,
      previewPanelRef,
      setInspectFocus,
      assetPreviewUrls,
      setAssetPreviewUrls,
      setDraft,
      fieldCatalog,
      colorLogoField: COLOR_FIELDS[0],
      colorReferralField: COLOR_FIELDS[1],
      assetLogo: ASSET_UPLOADS[0],
      assetBanners: ASSET_UPLOADS.slice(1),
      updateEmployeeField,
      addEmployeeField,
      removeEmployeeField,
      updateInstruction,
      addInstruction,
      removeInstruction,
      pickColorWithEyedropper,
      copyJson,
      copied,
      jsonInput,
      setJsonInput,
      applyJson,
      jsonError,
    }),
    [
      draft, update, activeLeftKey, handleAccordionToggle, onLeftPanelFocusCapture,
      previewCompany, previewDevice, builderInspect, assetPreviewUrls,
      fieldCatalog, updateEmployeeField, addEmployeeField, removeEmployeeField,
      updateInstruction, addInstruction, removeInstruction, pickColorWithEyedropper,
      copyJson, copied, jsonInput, applyJson, jsonError,
    ]
  );

  // ── RENDER ───────────────────────────────────────────────────────────────────
  return (
    // Este Provider es el que "proporciona" los datos a los componentes hijos que usan useReferralBuilder(). 
    // Provider es un componente de React como cualquier otro — acepta una prop especial llamada value y la hace disponible para todos sus hijos. No renderiza nada visual, solo actúa como "emisor" del dato.
    <ReferralBuilderContext.Provider value={contextValue}>
      <div className="referral-builder-page">
        <ReferralBuilderTopbar />
        <div className="referral-builder-layout">
          <ReferralConfigPanel />
          <ReferralPreviewPanel />
        </div>
      </div>
    </ReferralBuilderContext.Provider>
  );
};

export default ReferralBuilder;
