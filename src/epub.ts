import AdmZip from 'adm-zip';
import { XMLParser } from 'fast-xml-parser';
import { MetaData } from './types';
import path from 'path';
import fs from 'fs';

export class Epub {
  private path: string;
  private zipFile: AdmZip;

  private parser: XMLParser;

  constructor(path: string) {
    this.path = path;
    this.zipFile = new AdmZip(path);
    this.parser = new XMLParser({
      ignoreAttributes: false,
    });
  }

  private async getRootFile(): Promise<string | undefined> {
    const containerData = this.zipFile.readAsText('META-INF/container.xml');
    const parsedContainer = this.parser.parse<any>(containerData); // TODO: type?

    return parsedContainer.container.rootfiles.rootfile['@_full-path'];
  }

  // todo fix type
  public getMetaValue(property: any): string | undefined {
    if (property === undefined) {
      return undefined;
    }

    if (typeof property === 'string') {
      return property;
    }

    if (Object.prototype.hasOwnProperty.call(property, '#text')) {
      return property['#text'];
    }

    return undefined;
  }

  public async getMetadata(): Promise<MetaData> {

    const epubDirectory = path.dirname(this.path);
    const metaDataPath = path.join(epubDirectory, 'metadata.opf');

    let metaDataFile: string;

    if (fs.existsSync(metaDataPath)) {
      metaDataFile = fs.readFileSync(metaDataPath, 'utf8');
    } else {
      const rootFile = await this.getRootFile();

      if (rootFile === undefined) {
        throw new Error('No root file found');
      }

      metaDataFile = this.zipFile.readAsText(rootFile);
    }

    const parsedRootFile = this.parser.parse<any>(metaDataFile); // TODO: type?

    const metapackage = parsedRootFile.package;

    if (metapackage !== undefined) {
      if (metapackage.metadata !== undefined) {
        const date = this.getMetaValue(metapackage.metadata['dc:date']);
        const dateObject = date ? new Date(date) : undefined;
        const validatedDate = dateObject && dateObject.getFullYear() > 500 ? dateObject : undefined;

        return {
          title: this.getMetaValue(metapackage.metadata['dc:title']),
          creator: this.getMetaValue(metapackage.metadata['dc:creator']),
          date: validatedDate,
          description: this.getMetaValue(metapackage.metadata['dc:description']),
          language: this.getMetaValue(metapackage.metadata['dc:language']),
        };
      } else if (metapackage['opf:metadata'] !== undefined) {
        const date = this.getMetaValue(metapackage['opf:metadata']['dc:date']);

        return {
          title: this.getMetaValue(metapackage['opf:metadata']['dc:title']),
          creator: this.getMetaValue(metapackage['opf:metadata']['dc:creator']),
          date: date ? new Date(date) : undefined,
          description: this.getMetaValue(metapackage['opf:metadata']['dc:description']),
          language: this.getMetaValue(metapackage['opf:metadata']['dc:language']),
        };
      }
    }

    throw new Error('No metadata found');
  }
}
