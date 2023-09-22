# ePub deduplicator / orderer

Mostly for personal needs, this will do the following;

- Remove duplicate ePub files from directory
- Outputs all outbooks in a new formatted directory: {author}/{title} ({year}) - {author}.epub


## Usage

1. Ensure you have a directory with ebooks (subdirectories are supported)
2. Ensure bun is installed
3. Run the following command:
```bash
bun run src/index.ts
```

## Development

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```
