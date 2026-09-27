/** Website yang dikelola dari CMS ini. Dipakai di form, filter, dan tabel. */
export const ENTITIES = [
  { value: "RENTAL_MOTOR", label: "Rental Motor" },
  { value: "RENTAL_IPHONE", label: "Rental iPhone" },
  { value: "SEWA_APARTMENT", label: "Sewa Apartemen" },
  { value: "PINDAHLOKA", label: "Pindahloka" },
] as const;

export type Entity = (typeof ENTITIES)[number]["value"];

export function entityLabel(value?: string | null) {
  return ENTITIES.find((e) => e.value === value)?.label ?? value ?? "-";
}

