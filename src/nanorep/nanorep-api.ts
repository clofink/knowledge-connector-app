import { NanoRepConfig } from './model/nanorep-config.js';
import { NanoRepArticle } from './model/nanorep-article.js';
import { fetch, Response } from '../utils/web-client.js';
import { NanoRepResponse } from './model/nanorep-response.js';
// import { NanoRepArticleAttachment } from './model/nanorep-article-attachment.js';
import logger from '../utils/logger.js';

export class NanoRepApi {
  private config: NanoRepConfig = {};
  private limit: number = 0;

  public async initialize(config: NanoRepConfig): Promise<void> {
    this.config = config;
    this.limit = this.config.limit ? parseInt(this.config.limit, 10) : 50;
  }

  public async fetchAllArticles(): Promise<NanoRepArticle[]> {
    // https://ACCOUNT.nanorep.co/api/kb/v1/export?apiKey=API_KEY&kb=KB_NAME&plainText=true&maxItems=3000&skip=0
    return await this.getPage<NanoRepArticle>(
      `/api/kb/v1/export?format=json&_phrasingsKind_internal_=entities&kb=${this.config.nanorepKbId}&apiKey=${this.config.nanorepApiKey}&maxItems=10`,
    );
  }

  private async getPage<T>(endpoint: string): Promise<NanoRepArticle[]> {
      const url = `${this.config.nanorepBaseUrl}${endpoint}`;
    const response = await fetch(url);
    // await this.verifyResponse(response, url);

    const json = (await response.json()) as NanoRepResponse;
    const exported = json.exported;
    const skipped = json.skipped;
    const total = json.totalArticles;
    let list = json.articles as NanoRepArticle[];

    // if ((skipped + exported) < total) {
    //   const nextUrl = `/api/kb/v1/export?format=json&_includePhrasings_internal_=true&kb=${this.config.nanorepKbId}&apiKey=${this.config.nanorepApiKey}&skip=${skipped + exported}`;
    //   logger.info(nextUrl);
    //   const tail = await this.getPage<T>(nextUrl);
    //   list = list.concat(tail);
    // }

    return list;
  }

//   public getAttachment(
//     articleId: string | null,
//     url: string,
//   ): Promise<Image | null> {
//     return fetchImage(url, {
//       Authorization: 'Bearer ' + this.bearerToken,
//     });
//   }

//   public async fetchAttachmentInfo(
//     attachmentId: string,
//   ): Promise<NanoRepArticleAttachment> {
//     const url = `${this.config.nanorepBaseUrl}/api/now/attachment/${attachmentId}`;
//     const response = await fetch(url, {
//       headers: this.buildHeaders(),
//     });
//     await this.verifyResponse(response, url);

//     return (await response.json()) as NanoRepArticleAttachment;
//   }

  public async downloadAttachment(url: string): Promise<Blob> {
    const response = await fetch(url, {
      headers: this.buildHeaders(),
    });
    await this.verifyResponse(response, url);

    return await response.blob();
  }

  private buildHeaders() {
    return {
      Authorization:
        'Basic ' +
        Buffer.from(
          this.config.nanorepUsername + ':' + this.config.nanorepPassword,
          'utf-8',
        ).toString('base64'),
    };
  }

  private async verifyResponse(response: Response, url: string): Promise<void> {
    if (!response.ok) {
      const message = JSON.stringify(await response.json());
      throw new Error(
        `Api request [${url}] failed with status [${response.status}] and message [${message}]`,
      );
    }
  }
}
