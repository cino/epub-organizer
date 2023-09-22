
export type MetaData = {
  title?: string;
  description?: string;

  creator?: string;
  distributor?: string;

  date?: Date;
  language?: string;
}

export type ParsedBook = {
  metaData: MetaData;

  originalLocation: string;
}

export type GroupedBooks = {
  [key: string]: ParsedBook[];
}
