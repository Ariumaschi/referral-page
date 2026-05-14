const modules = import.meta.glob("./endpoints/*.json", { eager: true });

/** Objetos endpoint como en `endpoints/index.js` del repo grande: slug → config */
export const endpointsBySlug = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => {
    const file = path.split("/").pop();
    const slug = file.replace(/\.json$/i, "");
    return [slug, mod.default];
  })
);

export function getEndpointConfigs() {
  return Object.values(endpointsBySlug);
}
