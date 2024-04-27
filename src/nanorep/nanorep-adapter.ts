import { SourceAdapter } from '../adapter/source-adapter.js';
import { ImageSourceAdapter } from '../adapter/image-source-adapter.js';
import { NanoRepConfig } from './model/nanorep-config.js';
import { NanoRepApi } from './nanorep-api.js';
import { NanoRepArticle } from './model/nanorep-article.js';
import { Image } from '../model/image.js';
import logger from '../utils/logger.js';

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
    logger.info(`${articleId} ${url}`);
    return null;
    // const attachmentIdMatch = url.match(/sys_id=([^&]+)/);
    // if (!attachmentIdMatch || !articleId) {
    //   return null;
    // }

    // const content = await this.api.downloadAttachment(
    //   info.result.download_link,
    // );

    // return {
    //   url: info.result.download_link,
    //   name: info.result.file_name,
    //   contentType: info.result.content_type,
    //   content,
    // };
  }

  public getAllCategories(): Promise<unknown[]> {
    return Promise.reject();
  }

  public getAllLabels(): Promise<unknown[]> {
    return Promise.reject();
  }
}
