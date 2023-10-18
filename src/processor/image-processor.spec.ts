import { AdapterPair } from '../adapter/adapter-pair.js';
import { ImageProcessor } from './image-processor.js';
import { ImageSourceAdapter } from '../adapter/image-source-adapter.js';
import { GenesysDestinationAdapter } from '../genesys/genesys-destination-adapter.js';
import { generateDocument } from '../tests/utils/entity-generators.js';
import { Image } from '../model/image.js';

jest.mock('../utils/web-client.js');
jest.mock('../genesys/genesys-destination-adapter.js');

describe('ImageProcessor', () => {
  let sourceAdapter: ImageSourceAdapter;
  let destinationAdapter: GenesysDestinationAdapter;
  let adapters: AdapterPair<ImageSourceAdapter, GenesysDestinationAdapter>;
  let imageProcessor: ImageProcessor;
  let mockGetAttachment: jest.MockedFn<() => Promise<Image | null>>;
  let mockLookupImage: jest.MockedFn<() => Promise<string | null>>;

  beforeEach(async () => {
    sourceAdapter = {
      initialize: jest.fn(),
      getAttachment: jest.fn(),
    };
    mockGetAttachment = sourceAdapter.getAttachment as jest.MockedFn<
      () => Promise<Image | null>
    >;

    destinationAdapter = new GenesysDestinationAdapter();
    mockLookupImage = destinationAdapter.lookupImage as jest.MockedFn<
      () => Promise<string | null>
    >;

    adapters = {
      sourceAdapter,
      destinationAdapter,
    };

    imageProcessor = new ImageProcessor();

    await imageProcessor.initialize({}, adapters);
  });

  describe('run', () => {
    beforeEach(() => {
      mockGetAttachment.mockResolvedValue({
        url: 'https://attachment-url',
        name: '',
        contentType: 'image/png',
        content: new Blob([]),
      });
      mockLookupImage.mockResolvedValue('https://api.mypurecloud.com/image');
    });

    it('should replace all image block urls', async () => {
      const result = await imageProcessor.run({
        categories: [],
        labels: [],
        documents: [
          generateDocument('1'),
          generateDocument('2'),
          generateDocument('3'),
        ],
      });

      expect(
        result.documents[0].published?.variations[0].body?.blocks[0].image?.url,
      ).toBe('https://api.mypurecloud.com/image');
    });
  });
});
