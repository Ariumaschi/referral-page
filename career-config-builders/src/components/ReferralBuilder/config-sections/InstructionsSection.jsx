// Sección que gestiona los pasos de instrucciones que se muestran al referidor  debajo del formulario. Incluye el título y subtítulo de la sección, más una
// lista de pasos (cada uno con encabezado y texto) que se pueden agregar, editar, quitar o eliminar en bloque.
import { useReferralBuilder } from "../context";
import { regionDomId, focusSectionClass } from "../utils";

export function InstructionsSection() {
  const {
    r,
    update,
    activeLeftKey,
    updateInstruction,
    addInstruction,
    removeInstruction,
  } = useReferralBuilder();

  return (
    <>
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
    </>
  );
}
