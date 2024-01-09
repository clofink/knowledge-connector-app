import { DiffAggregator } from './diff-aggregator.js';
import { DestinationAdapter } from '../adapter/destination-adapter.js';
import { AdapterPair } from '../adapter/adapter-pair.js';
import { Adapter } from '../adapter/adapter.js';
import { SourceAdapter } from '../adapter/source-adapter.js';
import {
  generateCategory,
  generateDocument,
  generateLabel,
} from '../tests/utils/entity-generators.js';
import { GenesysDestinationAdapter } from '../genesys/genesys-destination-adapter.js';
import { Document, ImportExportModel } from '../model/import-export-model.js';
import { ImportableContent } from '../model/importable-contents.js';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Category } from '../model/category.js';
import { Label } from '../model/label.js';

jest.mock('../genesys/genesys-destination-adapter.js');

describe('DiffAggregator', () => {
  let sourceAdapter: SourceAdapter<Category, Label, Document>;
  let destinationAdapter: GenesysDestinationAdapter;
  let adapters: AdapterPair<Adapter, DestinationAdapter>;
  let aggregator: DiffAggregator;
  let mockExportAllEntities: jest.Mock<() => Promise<ImportExportModel>>;

  describe('run', () => {
    beforeEach(() => {
      sourceAdapter = {} as typeof sourceAdapter;
      destinationAdapter = new GenesysDestinationAdapter();
      mockExportAllEntities = destinationAdapter.exportAllEntities as jest.Mock<
        () => Promise<ImportExportModel>
      >;
      adapters = {
        sourceAdapter,
        destinationAdapter,
      };
      aggregator = new DiffAggregator();

      aggregator.initialize(
        { protectedFields: 'published.alternatives' },
        adapters,
      );
    });

    describe('when export from destination is empty', () => {
      beforeEach(() => {
        mockExportAllEntities.mockResolvedValue({
          version: 2,
          knowledgeBase: {
            id: '',
          },
          documents: [],
          categories: [],
          labels: [],
        });
      });

      it('should collect all entities to the created group', async () => {
        const importableContents = await aggregator.run({
          categories: [
            generateCategory('1'),
            generateCategory('2'),
            generateCategory('3'),
          ],
          labels: [generateLabel('1'), generateLabel('2'), generateLabel('3')],
          documents: [
            generateDocument('1'),
            generateDocument('2'),
            generateDocument('3'),
          ],
        });

        verifyGroups(importableContents.categories, 3, 0, 0);
        verifyGroups(importableContents.labels, 3, 0, 0);
        verifyGroups(importableContents.documents, 3, 0, 0);
      });
    });

    describe('when export from destination is not empty', () => {
      beforeEach(() => {
        mockExportAllEntities.mockResolvedValue({
          version: 2,
          knowledgeBase: {
            id: '',
          },
          documents: [generateDocument('1'), generateDocument('4')],
          categories: [generateCategory('1'), generateCategory('2')],
          labels: [generateLabel('1'), generateLabel('2')],
        });
      });

      it('should collect entities to the correct group', async () => {
        const importableContents = await aggregator.run({
          categories: [
            generateCategory('1'),
            generateCategory('2', 'updated-category'),
            generateCategory('3'),
          ],
          labels: [
            generateLabel('1', 'updated-label'),
            generateLabel('2'),
            generateLabel('3'),
          ],
          documents: [
            generateDocument('1', 'updated-document'),
            generateDocument('2'),
            generateDocument('3'),
          ],
        });

        verifyGroups(importableContents.categories, 1, 1, 0);
        verifyGroups(importableContents.labels, 1, 1, 0);
        verifyGroups(importableContents.documents, 2, 1, 1);
      });
    });

    describe('when export from destination is not empty and contains protected fields', () => {
      beforeEach(() => {
        const doc1Alternatives = [
          {
            phrase: 'protected field 1',
            autocomplete: true,
          },
        ];
        const doc2Alternatives = [
          {
            phrase: 'protected field 2',
            autocomplete: true,
          },
          {
            phrase: 'protected field 3',
            autocomplete: true,
          },
        ];
        const doc1 = generateDocument('1', 'title1', doc1Alternatives);
        const doc2 = generateDocument('2', 'title2', doc2Alternatives);
        mockExportAllEntities.mockResolvedValue({
          version: 2,
          knowledgeBase: {
            id: '',
          },
          documents: [doc1, doc2],
          categories: [],
          labels: [],
        });
      });

      it('should not update if the only change is a protected field', async () => {
        const importableContents = await aggregator.run({
          categories: [],
          labels: [],
          documents: [
            generateDocument('1', 'title1'),
            generateDocument('2', 'updated title'),
          ],
        });

        verifyGroups(importableContents.documents, 0, 1, 0);
        const alternatives =
          importableContents.documents.updated[0].published?.alternatives;
        expect(alternatives?.length).toBe(2);
      });

      it('should handle primitive protected values', async () => {
        aggregator.initialize(
          {
            protectedFields:
              'published.visible,published.title,published.alternatives',
          },
          adapters,
        );

        const importableContents = await aggregator.run({
          categories: [],
          labels: [],
          documents: [
            generateDocument('1', 'title1', null, false),
            generateDocument('2', 'updated title', null, false),
          ],
        });

        verifyGroups(importableContents.documents, 0, 0, 0);
      });
    });

    function verifyGroups<T>(
      importableContent: ImportableContent<T>,
      createdCount: number,
      updatedCount: number,
      deletedCount: number,
    ): void {
      expect(importableContent.created.length).toBe(createdCount);
      expect(importableContent.updated.length).toBe(updatedCount);
      expect(importableContent.deleted.length).toBe(deletedCount);
    }
  });
});
