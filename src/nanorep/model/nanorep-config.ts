import { Config } from '../../config.js';

export interface NanoRepConfig extends Config {
  nanorepBaseUrl?: string;
  nanorepApiKey?: string;
  nanorepKbId?: string;
  nanorepContextFilter?: string;
}
