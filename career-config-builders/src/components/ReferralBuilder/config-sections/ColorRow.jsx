// Fila de edición de un color del draft. Muestra tres controles sincronizados:
// el selector de color nativo del navegador, un input de texto con el código hex,
// y un botón de cuentagotas (EyeDropper API) para tomar el color de cualquier
// punto de la pantalla. Los tres escriben al mismo path dentro del draft.
import { useReferralBuilder } from "../context";
import { getAtPath } from "../utils";

export function ColorRow({ field }) {
  const { draft, update, pickColorWithEyedropper } = useReferralBuilder();
  const value = getAtPath(draft, field.path) || field.fallback;

  return (
    <div className="referral-builder-color-row">
      <span className="referral-builder-color-label">{field.label}</span>
      <div className="referral-builder-color-inputs">
        <input
          type="color"
          value={value}
          onChange={(e) => update(field.path, e.target.value)}
          aria-label={field.label}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => update(field.path, e.target.value)}
          aria-label={`${field.label}, código hexadecimal`}
        />
        <button
          type="button"
          className="secondary referral-builder-btn-ghost"
          onClick={() => pickColorWithEyedropper(field.path)}
          title="Tomar color de la pantalla"
          aria-label={`Tomar color de la pantalla para ${field.label}`}
        >
          🖌
        </button>
      </div>
    </div>
  );
}
