// Sección del formulario que gestiona los campos que el empleado debe completar
// antes de generar su link de referido (ej: nombre, número de empleado, tienda).
// Cada campo tiene un tipo (elegido del catálogo), una etiqueta visible y un ícono.
// Se pueden agregar, editar y quitar campos dinámicamente.
import { useReferralBuilder } from "../context";
import { regionDomId, focusSectionClass } from "../utils";

export function EmployeeFieldsSection() {
  const {
    r,
    update,
    activeLeftKey,
    fieldCatalog,
    updateEmployeeField,
    addEmployeeField,
    removeEmployeeField,
  } = useReferralBuilder();

  return (
    <>
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
    </>
  );
}
