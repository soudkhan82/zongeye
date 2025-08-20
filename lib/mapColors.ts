// app/lib/mapColors.ts

// Hex colors per SiteClassification
export const CLASS_COLORS: Record<string, string> = {
  platinum: "#15803d", // green-700
  gold: "#eab308", // yellow-500
  strategic: "#2563eb", // blue-600
  silver: "#9ca3af", // gray-400
  bronze: "#ea580c", // orange-600
  default: "#dc2626", // red-600
};

/**
 * Return a MapLibre expression to color circles by `siteclassification`
 * in your feature properties.
 *
 * Usage: <Layer paint={{ "circle-color": circleColorBySiteClass(), ... }} />
 */
export function circleColorBySiteClass(): any {
  return [
    "match",
    ["downcase", ["coalesce", ["get", "siteclassification"], ""]],
    "platinum",
    CLASS_COLORS.platinum,
    "gold",
    CLASS_COLORS.gold,
    "strategic",
    CLASS_COLORS.strategic,
    "silver",
    CLASS_COLORS.silver,
    "bronze",
    CLASS_COLORS.bronze,
    CLASS_COLORS.default,
  ];
}

/** Helper to read a hex color for legends, etc. */
export function colorForSiteClass(cls?: string | null): string {
  const key = (cls ?? "").toLowerCase();
  return CLASS_COLORS[key] ?? CLASS_COLORS.default;
}
