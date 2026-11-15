export type Range = {
  minimum: number | null;
  maximum: number | null;
};

export type LocalizedName = {
  es: string;
  en?: string;
};

export type Source = {
  label: string;
  url: string | null;
};
