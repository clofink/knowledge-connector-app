import { Configurer } from '../pipe/configurer.js';
import { Pipe } from '../pipe/pipe.js';
import { HtmlTransformer } from '../processor/html-transformer.js';
import { ImageProcessor } from '../processor/image-processor.js';
import { PrefixExternalId } from '../processor/prefix-external-id.js';
import { DiffAggregator } from '../aggregator/diff-aggregator.js';
import { DiffUploader } from '../uploader/diff-uploader.js';
import { NanoRepAdapter } from './nanorep-adapter.js';
import { NanoRepLoader } from './nanorep-loader.js';

export const configurer: Configurer = (pipe: Pipe) => {
  pipe
    .source(new NanoRepAdapter())
    .loaders(new NanoRepLoader())
    .processors(
      new HtmlTransformer(),
      new ImageProcessor(),
      new PrefixExternalId(),
    )
    .aggregator(new DiffAggregator())
    .uploaders(new DiffUploader());
};
