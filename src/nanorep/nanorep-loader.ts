import { Loader } from '../pipe/loader.js';
import { NanoRepAdapter } from './nanorep-adapter.js';
import { ExternalContent } from '../model/external-content.js';
import { contentMapper } from './content-mapper.js';
import { NanoRepConfig } from './model/nanorep-config.js';
import { AdapterPair } from '../adapter/adapter-pair.js';
import { Adapter } from '../adapter/adapter.js';
import { NanoRepArticle } from './model/nanorep-article.js';
import { validateNonNull } from '../utils/validate-non-null.js';
import logger from '../utils/logger.js';

/**
 * NanoRep is a specific {@Link Loader} implementation for fetching data from NanoRep API
 */
export class NanoRepLoader implements Loader {
  private adapter?: NanoRepAdapter;

  public async initialize(
    _config: NanoRepConfig,
    adapters: AdapterPair<NanoRepAdapter, Adapter>,
  ): Promise<void> {
    this.adapter = adapters.sourceAdapter;
  }

  public async run(_input?: ExternalContent): Promise<ExternalContent> {
    validateNonNull(this.adapter, 'Missing source adapter');

    logger.info('Fetching data...');
    const allArticles = await this.adapter!.getAllArticles();
    const articles = allArticles.filter((article) => !isConversational(article));
    const labels = await this.adapter!.getAllLabels();

    const data = contentMapper(articles, labels);

    logger.info('Labels loaded: ' + data.labels.length);
    logger.info('Documents loaded: ' + data.documents.length);

    return data;
  }
}

function isConversational(article: NanoRepArticle) {
    let result = false;
    try {
      JSON.parse(article.body);
      logger.warn(`Skipping "${article.title}" (${article.id}) because it is conversational`);
      result = true;
    }
    catch {
      result = false;
    }
    return result;
}
