import { createContext, useContext } from "react";

// Crea el "contenedor" de datos compartidos. El null es el valor por defecto
// Este objeto no guarda datos todavía — solo define el canal de comunicación.
export const ReferralBuilderContext = createContext(null);

// Hook de conveniencia: cualquier componente hijo que quiera leer el contexto llama a useReferralBuilder() en lugar de escribir useContext(ReferralBuilderContext)
// useContext se suscribe al Provider más cercano en el árbol y devuelve su value={}
export function useReferralBuilder() {
  return useContext(ReferralBuilderContext);
}
