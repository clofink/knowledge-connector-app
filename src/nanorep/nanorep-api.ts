import { NanoRepConfig } from './model/nanorep-config.js';
import { NanoRepArticle } from './model/nanorep-article.js';
import { fetch, Response } from '../utils/web-client.js';
import { NanoRepResponse } from './model/nanorep-response.js';

export class NanoRepApi {
  private config: NanoRepConfig = {};

  public async initialize(config: NanoRepConfig): Promise<void> {
    this.config = config;
  }

  public async fetchAllArticles(): Promise<NanoRepArticle[]> {
    return await this.getPage<NanoRepArticle>(
      `/api/kb/v1/export?format=json&_phrasingsKind_internal_=entities&kb=${this.config.nanorepKbId}&apiKey=${this.config.nanorepApiKey}`,
    );
  }

  private async getPage<T>(endpoint: string): Promise<NanoRepArticle[]> {
    const url = `${this.config.nanorepBaseUrl}${endpoint}`;
    const response = await fetch(url);
    await this.verifyResponse(response, url);

    const json = (await response.json()) as NanoRepResponse;
    const exported = json.exported;
    const skipped = json.skipped;
    const total = json.totalArticles;
    let list = json.articles;

    if ((skipped + exported) < total) {
      const nextUrl = `/api/kb/v1/export?format=json&_phrasingsKind_internal_=entities&kb=${this.config.nanorepKbId}&apiKey=${this.config.nanorepApiKey}&skip=${skipped + exported}`;
      const tail = await this.getPage<T>(nextUrl);
      list = list.concat(tail);
    }

    return list;
  }

  private async verifyResponse(response: Response, url: string): Promise<void> {
    if (!response.ok) {
      const message = await response.text();
      throw new Error(
        `Api request [${url}] failed with status [${response.status}] and message [${message}]`,
      );
    }
  }
}
