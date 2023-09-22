import fs from 'fs';
import { Epub } from './epub';
import { GroupedBooks, ParsedBook } from './types';
import sanitize from 'sanitize-filename';
import path from 'path';

const readFolder = async (folder: string, files: string[]): Promise<void> => {
  const directory = fs.readdirSync(folder);

  for (let i = 0; i < directory.length; i++) {
    const entry = directory[i];

    if (fs.lstatSync(folder + "/" + entry).isDirectory()) {
      readFolder(folder + "/" + entry, files);
    } else if (entry.endsWith('.epub')) {
      files.push(folder + "/" + entry);
    }
  }
};

const parseBooks = async (
  files: string[],
  parsedBooks: ParsedBook[],
  invalidBooks: string[],
): Promise<void> => {
  for (let i = 0; i < files.length; i++) {

    try {
      const book = new Epub(files[i]);
      const metaData = await book.getMetadata();

      parsedBooks.push({
        metaData,
        originalLocation: files[i],
      });
    } catch (e) {
      // ignore for now
      // console.log(e);

      invalidBooks.push(files[i]);
      console.log(`Book failed << ${e} >> ${files[i]}`);
    }
  }
};

const groupByAuthor = async (parsedBooks: ParsedBook[]): Promise<GroupedBooks> => {
  const groupedByAuthor: GroupedBooks = {};
  for (let i = 0; i < parsedBooks.length; i++) {
    const book = parsedBooks[i];

    if (book.metaData.creator) {
      if (!groupedByAuthor[book.metaData.creator]) {
        groupedByAuthor[book.metaData.creator] = [];
      }

      groupedByAuthor[book.metaData.creator].push(book);
    }
  }

  return groupedByAuthor;
};

const copyBooks = async (groupedByAuthor: GroupedBooks): Promise<void> => {

  // store all books in directory per author in the output folder
  const outputFolder = 'output';
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
  }

  const authorNames = Object.keys(groupedByAuthor);
  for (let i = 0; i < authorNames.length; i++) {

    const authorName = authorNames[i];
    const newAuthorName = authorName
      .replace(/v\/h/gi, 'van het')
      .replace(/\s\/\s/gi, ' & ');

    const authorFolder = `${outputFolder}/${newAuthorName}`;

    if (!fs.existsSync(authorFolder)) {
      fs.mkdirSync(authorFolder);
    }

    const books = groupedByAuthor[authorName];
    for (let j = 0; j < books.length; j++) {
      const book = books[j];

      let newLocation = '';
      if (book.metaData.title) {
        newLocation = `${authorFolder}/${sanitize(book.metaData.title as string)} - ${newAuthorName}.epub`;
        if (book.metaData.date) {
          newLocation = `${authorFolder}/${sanitize(book.metaData.title as string)} (${book.metaData.date.getFullYear()}) - ${newAuthorName}.epub`;
        }
      } else {
        console.log('BASENAME COPY' + path.basename(book.originalLocation));

        newLocation = `${authorFolder}/${path.basename(book.originalLocation)}`;
      }

      fs.copyFileSync(book.originalLocation, newLocation);
    }
  }
};

const collectBooks = async (folder: string): Promise<GroupedBooks> => {

  // Create empty array and pass along as reference to
  // fill it recursively with all epub paths
  const files: string[] = [];
  await readFolder(folder, files);
  files.sort();

  // Create empty array and pass along as reference to
  // fill it with parsed books based on metadata
  const parsedBooks: ParsedBook[] = [];
  const invalidFiles: string[] = [];
  await parseBooks(files, parsedBooks, invalidFiles);

  const groupedByAuthor: GroupedBooks = await groupByAuthor(parsedBooks);

  console.log(`Authors: ${Object.keys(groupedByAuthor).length}`);
  console.log(`Parseable books: ${parsedBooks.length}`);
  console.log(`Invalid books: ${invalidFiles.length}`)

  return groupedByAuthor;
};


async function handle() {
  const ebooks: GroupedBooks = await collectBooks('books');

  // write to new structure
  await copyBooks(ebooks);
};

handle();
