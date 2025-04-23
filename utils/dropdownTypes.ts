export type themeType =
  | "Modern"
  | "Vintage"
  | "Minimalist"
  | "Professional"
  | "Tropical";

export type roomType =
  | "Living Room"
  | "Dining Room"
  | "Bedroom"
  | "Bathroom"
  | "Office"
  | "Gaming Room";

export const themes: themeType[] = [
  "Modern",
  "Minimalist",
  "Professional",
  "Tropical",
  "Vintage",
];
export const rooms: roomType[] = [
  "Living Room",
  "Dining Room",
  "Office",
  "Bedroom",
  "Bathroom",
  "Gaming Room",
];

// Traduções para exibição na interface
export const themeTranslations: Record<themeType, string> = {
  "Modern": "Moderno",
  "Vintage": "Vintage",
  "Minimalist": "Minimalista",
  "Professional": "Profissional",
  "Tropical": "Tropical"
};

export const roomTranslations: Record<roomType, string> = {
  "Living Room": "Sala de estar",
  "Dining Room": "Sala de jantar",
  "Bedroom": "Quarto",
  "Bathroom": "Banheiro",
  "Office": "Escritório",
  "Gaming Room": "Sala de jogos"
};
