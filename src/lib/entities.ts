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

export function brandName(value?: string | null) {
  switch (value) {
    case "RENTAL_MOTOR":
      return "Rentalday";
    case "RENTAL_IPHONE":
      return "Pixelnesia";
    case "SEWA_APARTMENT":
      return "Perfect Room";
    case "PINDAHLOKA":
      return "Pindah Loka";
    default:
      return value ?? "-";
  }
}

export function brandDomain(value?: string | null) {
  switch (value) {
    case "RENTAL_MOTOR":
      return "Rentalday.id";
    case "RENTAL_IPHONE":
      return "Pixelnesia.id";
    case "SEWA_APARTMENT":
      return "Perfectroom.id";
    case "PINDAHLOKA":
      return "Pindahloka.id";
    default:
      return `${(value || "").toLowerCase().replace(/_/g, "")}.id`;
  }
}

