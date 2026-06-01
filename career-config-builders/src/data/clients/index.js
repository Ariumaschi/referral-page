import pizzaHut from "./pizza-hut.json";
import donaTota from "./dona-tota.json";
import tiendasBara from "./tiendas-bara.json";
import blank from "./blank.json";

export const BLANK_CONFIG_ID = "__blank__";

// Simula el catálogo de configs disponibles en S3.
// Cada entrada tiene id, label y el JSON de configuración.
export const CLIENT_CONFIGS = [
  { id: "pizza-hut",    label: "Pizza Hut",     config: pizzaHut },
  { id: "dona-tota",    label: "Doña Tota",     config: donaTota },
  { id: "tiendas-bara", label: "Tiendas Bara",  config: tiendasBara },
];

// Simula fetch desde S3: resuelve el config por id con un pequeño delay.
// El id especial BLANK_CONFIG_ID devuelve la plantilla vacía sin delay.
export function fetchClientConfig(id) {
  if (id === BLANK_CONFIG_ID) return Promise.resolve(blank);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const entry = CLIENT_CONFIGS.find((c) => c.id === id);
      if (entry) resolve(entry.config);
      else reject(new Error(`Config no encontrada: ${id}`));
    }, 300);
  });
}
