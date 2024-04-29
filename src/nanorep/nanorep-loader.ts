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
  private config: NanoRepConfig = {};
  private conversationalCount: number = 0;
  private contextFiltered: number = 0;

  public async initialize(
    config: NanoRepConfig,
    adapters: AdapterPair<NanoRepAdapter, Adapter>,
  ): Promise<void> {
    this.adapter = adapters.sourceAdapter;
    this.config = config;
  }

  public async run(_input?: ExternalContent): Promise<ExternalContent> {
    validateNonNull(this.adapter, 'Missing source adapter');

    logger.info('Fetching data...');
    const contextFilters = this.processContextFilters();
    const allArticles = await this.adapter!.getAllArticles();
    const articles = allArticles.filter((article) => !this.isConversational(article) && this.matchesContext(article, contextFilters));
    const labels = await this.adapter!.getAllLabels();

    const data = contentMapper(articles, labels);

    logger.info('Labels loaded: ' + data.labels.length);
    logger.info('Documents loaded: ' + data.documents.length);
    logger.info('Conversation documents skipped: ' + this.conversationalCount);
    logger.info('Documents filterd by context: ' + this.contextFiltered);

    return data;
  }

  private isConversational(article: NanoRepArticle): boolean {
    let result = false;
    try {
      JSON.parse(article.body);
      this.conversationalCount++;
      result = true;
    }
    catch {
      result = false;
    }
    return result;
  }

  private matchesContext(article: NanoRepArticle, contextFilters: Record<string, string>[]): boolean {
    if (!article.contextInfo) return true;
    const articleCategories = article.contextInfo!.filter(e => contextFilters.some(obj => obj.hasOwnProperty(e.id)));
    const matchingCategories = articleCategories.filter(e => contextFilters.some(obj => obj[e.id].toLowerCase().split("|").some(val => e.value.toLowerCase().split("|").some(artVal => artVal === val))));
    const doesMatchContext = articleCategories.length === matchingCategories.length;
    if (!doesMatchContext) this.contextFiltered++;
    return doesMatchContext;
  }
  
  private processContextFilters() {
    if (!this.config?.nanorepContextFilter) return [];
    const contextFilters = this.config!.nanorepContextFilter!.split(",");
    const filters = contextFilters.map((context) => {const parts = context.split(":"); return {[parts[0]]: parts[1]}});
    return filters;
  }
}
