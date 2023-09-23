import fs from 'fs';
import { Epub } from './epub';
import { EBook, ParsedBook } from './types';
import path from 'path';

// Loop over all files in a folder recursively and add all epub files to the files array
// If there is only 1 file in the folder, it will be checked for a metadata.opf
// file and if it exists, it will be used to parse the metadata
const collectBooks = async (folder: string, files: EBook[]): Promise<void> => {
  const directory = fs.readdirSync(folder);

  for (let i = 0; i < directory.length; i++) {
    const entry = directory[i];

    if (fs.lstatSync(folder + "/" + entry).isDirectory()) {
      // Create recursive call to collectBooks
      collectBooks(folder + "/" + entry, files);

      // go to next iteration
      continue;
    }

    if (entry.endsWith('.epub')) {
      const ePubsInDirectory = directory.filter((file) => file.endsWith('.epub'));

      const eBook: EBook = {
        file: folder + "/" + entry,
      };

      if (ePubsInDirectory.length === 1) {
        // check if there is a metadata.opf file in the same directory
        const metaDataPath = folder + "/metadata.opf";

        if (fs.existsSync(metaDataPath)) {
          eBook.metadataFile = metaDataPath;
        }

        // check if there is a cover.jpg file in the same directory
        // TODO is a cover always jpg?
        const coverPath = folder + "/cover.jpg";

        if (fs.existsSync(coverPath)) {
          eBook.additionalFiles = [coverPath];
        }
      }

      files.push(eBook);
    }
  }
};

const parseBooks = async (
  files: EBook[],
  parsedBooks: ParsedBook[],
  invalidBooks: string[],
): Promise<void> => {
  for (let i = 0; i < files.length; i++) {
    try {
      const book = new Epub(files[i]);
      const metaData = await book.getMetadata();

      parsedBooks.push({
        metaData,
        eBook: files[i],
      });
    } catch (e) {
      // ignore for now

      invalidBooks.push(files[i].file);
      console.log(`Book failed << ${e} >> ${files[i]}`);
    }
  }
};

const copyBooks = async (books: ParsedBook[]): Promise<void> => {
  // store all books in directory per author in the output folder
  const outputFolder = 'output';
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
  }

  for (const book of books) {
    // Create author folder if it doesn't exist yet
    const authorFolder = `${outputFolder}/${book.metaData.creator}`;
    if (!fs.existsSync(authorFolder)) {
      fs.mkdirSync(authorFolder);
    }

    // Location for books withouth additional files
    let bookLocation = `${authorFolder}`;

    // Default book title for when there is no metadata present
    let bookTitle = path.basename(book.eBook.file);

    // When there are additional files for an ebook the book will
    // be placed in it's own folder
    if (book.eBook.metadataFile || book.eBook.additionalFiles?.length) {
      bookLocation += `/${book.metaData.title}`;

      if (!fs.existsSync(bookLocation)) {
        fs.mkdirSync(bookLocation);
      }

      // Move additional files to the book folder
      for (const file of book.eBook.additionalFiles ?? []) {
        fs.copyFileSync(
          file,
          `${bookLocation}/${path.basename(file)}`,
        );
      }

      if (book.eBook.metadataFile) {
        fs.copyFileSync(
          book.eBook.metadataFile,
          `${bookLocation}/metadata.opf`,
        );
      }
    }

    if (book.metaData.title && book.metaData.date) {
      bookLocation += `/${book.metaData.title} (${book.metaData.date.getFullYear()}) - ${book.metaData.creator}.epub`;
    } else if (book.metaData.title) {
      bookLocation += `/${book.metaData.title} - ${book.metaData.creator}.epub`;
    } else {
      bookLocation += `/${bookTitle}`;
    }

    console.log(bookLocation);

    fs.copyFileSync(
      book.eBook.file,
      `${bookLocation}`,
    );
  }
};

async function handle(): Promise<void> {
  const booksDirectory = 'books';

  // Create empty array and pass along as reference to
  // fill it recursively with all epub paths
  const files: EBook[] = [];
  await collectBooks(booksDirectory, files);
  files.sort();

  // Create empty array and pass along as reference to
  // fill it with parsed books based on metadata
  const parsedBooks: ParsedBook[] = [];
  const invalidFiles: string[] = [];
  await parseBooks(
    files,
    parsedBooks,
    invalidFiles,
  );

  // write to new structure
  await copyBooks(parsedBooks);
};

handle();
