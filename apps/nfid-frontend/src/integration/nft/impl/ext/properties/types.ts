export interface Option {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  options: Option[];
}

export interface ValueMapping {
  id: number;
  values: Array<[number, number]>;
}

export interface ParsedData {
  categories: Category[];
  valueMappings: ValueMapping[];
}
