/**
 * Copy lookup.
 *
 * Every string a section shows has a default here in the platform, taken from
 * the handoff. A tenant overrides one by putting the same key under `copy` in
 * their tenant.json -- no fork, no override section, just a string.
 *
 *   "copy": { "servicesHeading": "What we fix" }
 */
export function copyFor(config) {
  const overrides = config.copy || {};
  return (key, fallback) => (overrides[key] !== undefined ? overrides[key] : fallback);
}
