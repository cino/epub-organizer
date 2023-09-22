import { test, expect } from 'bun:test';
import { Epub } from '../src/epub';

// test('ePub: basic-v3plus2', async () => {
//   const testBook = new Epub('tests/fixtures/basic-v3plus2.epub');
//   const metadata = await testBook.getMetadata();

//   expect(metadata.title).toBe('Your title here');
//   expect(metadata.creator).toBe('Hingle McCringleberry');
//   expect(metadata.language).toBe('en');
// });

// test('ePub: minimal-v2', async () => {
//   const testBook = new Epub('tests/fixtures/minimal-v2.epub');
//   const metadata = await testBook.getMetadata();

//   expect(metadata.title).toBe('Your title here');
//   expect(metadata.creator).toBe(undefined);
//   expect(metadata.language).toBe('en');
// });

// test('ePub: minimal-v3', async () => {
//   const testBook = new Epub('tests/fixtures/minimal-v3.epub');
//   const metadata = await testBook.getMetadata();

//   expect(metadata.title).toBe('Your title here');
//   expect(metadata.creator).toBe(undefined);
//   expect(metadata.language).toBe('en');
// });

// test('ePub: minimal-v3plus2', async () => {
//   const testBook = new Epub('tests/fixtures/minimal-v3plus2.epub');
//   const metadata = await testBook.getMetadata();

//   expect(metadata.title).toBe('Your title here');
//   expect(metadata.creator).toBe(undefined);
//   expect(metadata.language).toBe('en');
// });

// Random books from gutenberg.org
test('ePub: pg71701-images', async () => {
  const testBook = new Epub('tests/fixtures/pg71701-images.epub');
  const metadata = await testBook.getMetadata();


  expect(metadata.title).toBe('Repton and its neighbourhood');
  expect(metadata.creator).toBe('Frederick Charles Hipkins');
  expect(metadata.language).toBe('en');
});

test('ePub: pg71701-images-3', async () => {
  const testBook = new Epub('tests/fixtures/pg71701-images-3.epub');
  const metadata = await testBook.getMetadata();

  expect(metadata.title).toBe('Repton and its neighbourhood');
  expect(metadata.creator).toBe('Frederick Charles Hipkins');
  expect(metadata.language).toBe('en');
});

test('ePub: pg71697-images-3', async () => {
  const testBook = new Epub('tests/fixtures/pg71697-images-3.epub');
  const metadata = await testBook.getMetadata();

  expect(metadata.title).toBe('Runoja');
  expect(metadata.creator).toBe('Lars Stenbäck');
  expect(metadata.language).toBe('fi');
});

test('ePub: pg71697', async () => {
  const testBook = new Epub('tests/fixtures/pg71697.epub');
  const metadata = await testBook.getMetadata();

  expect(metadata.title).toBe('Runoja');
  expect(metadata.creator).toBe('Lars Stenbäck');
  expect(metadata.language).toBe('fi');
});
