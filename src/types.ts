export type EBook = {
  file: string;

  // Optional metadata file in case of additional data
  // provided by calibre or similar
  metadataFile?: string;

  // Optional additional files like cover.jpg to be copied
  // to the output directory
  additionalFiles?: string[];
}

export type MetaData = {
  title?: string;
  description?: string;

  creator: string;
  distributor?: string;

  date?: Date;
  language?: string;
}

export type ParsedBook = {
  metaData: MetaData;

  eBook: EBook;
}

export type GroupedBooks = {
  [key: string]: ParsedBook[];
}
