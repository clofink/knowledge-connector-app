import { GenesysDestinationApi } from './genesys-destination-api.js';
import { GenesysDestinationConfig } from './model/genesys-destination-config.js';
import { fetch, Response } from '../utils/web-client.js';
import { TokenResponse } from './model/token-response.js';
import { SearchAssetResponse } from './model/search-asset-response.js';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('../utils/web-client.js');

describe('GenesysDestinationApi', () => {
  let genesysDestinationApi: GenesysDestinationApi;
  let mockFetch: jest.Mock<typeof fetch>;

  describe('createExportJob', () => {
    beforeEach(async () => {
      genesysDestinationApi = new GenesysDestinationApi();

      mockFetch = fetch as jest.Mock<typeof fetch>;
      mockLoginResponse();
      await genesysDestinationApi.initialize(getConfig());
    });

    it('should call export API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            results: [
              {
                id: 'asset-id',
              },
            ],
          } as SearchAssetResponse),
      } as Response);

      const response = await genesysDestinationApi.lookupImage({
        sortBy: 'name',
        pageSize: 100,
        query: [
          {
            value: 'hash-to-search-for',
            fields: ['name'],
            type: 'STARTS_WITH',
          },
        ],
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://base-url/api/v2/responsemanagement/responseassets/search',
        {
          body: '{"sortBy":"name","pageSize":100,"query":[{"value":"hash-to-search-for","fields":["name"],"type":"STARTS_WITH"}]}',
          headers: {
            Authorization: 'Bearer access-token',
            'Content-Type': 'application/json',
          },
          method: 'POST',
        },
      );
      expect(response.results[0].id).toBe('asset-id');
    });
  });

  function mockLoginResponse() {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({ access_token: 'access-token' } as TokenResponse),
    } as Response);
  }

  function getConfig(): GenesysDestinationConfig {
    return {
      genesysBaseUrl: 'https://base-url',
      genesysLoginUrl: 'https://login-url',
      genesysClientId: 'client-id',
      genesysClientSecret: 'client-secret',
      genesysKnowledgeBaseId: 'kb-id',
    };
  }
});
