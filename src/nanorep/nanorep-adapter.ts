import { SourceAdapter } from '../adapter/source-adapter.js';
import { ImageSourceAdapter } from '../adapter/image-source-adapter.js';
import { NanoRepConfig } from './model/nanorep-config.js';
import { NanoRepApi } from './nanorep-api.js';
import { NanoRepArticle } from './model/nanorep-article.js';
import { Image } from '../model/image.js';
import logger from '../utils/logger.js';
import { NanoRepLabel } from './model/nanorep-label.js';

export class NanoRepAdapter
  implements
    SourceAdapter<unknown, unknown, NanoRepArticle>,
    ImageSourceAdapter
{
  private config: NanoRepConfig = {};
  private api: NanoRepApi;

  constructor() {
    this.api = new NanoRepApi();
  }

  public initialize(config: NanoRepConfig): Promise<void> {
    this.config = config;
    return this.api.initialize(config);
  }

  public getAllArticles(): Promise<NanoRepArticle[]> {
    return this.api.fetchAllArticles();
  }

  public async getAttachment(
    articleId: string | null,
    url: string,
  ): Promise<Image | null> {
    return null;
  }

  public getAllCategories(): Promise<unknown[]> {
    return Promise.reject();
  }

  public getAllLabels(): Promise<NanoRepLabel[]> {
    return this.api.fetchAllLabels();
  }
}
