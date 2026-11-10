import { SearchParams } from './search-params.js';
import { SearchResult } from './search-result.js';

const options = {
  sortableFields: ['name'] as const,
  defaultSort: 'name' as const,
};

describe('SearchResult', () => {
  it('should describe the page that was found', () => {
    const params = SearchParams.create({ page: 2, perPage: 2 }, options);

    const result = SearchResult.create({ items: ['c', 'd'], total: 5, params });

    expect(result.toOutput()).toEqual({
      items: ['c', 'd'],
      total: 5,
      page: 2,
      perPage: 2,
      lastPage: 3,
    });
  });

  it.each([
    [0, 15, 1],
    [15, 15, 1],
    [16, 15, 2],
    [100, 10, 10],
  ])(
    'should compute the last page for %i items, %i per page',
    (total, perPage, lastPage) => {
      const params = SearchParams.create({ perPage }, options);

      const result = SearchResult.create({ items: [], total, params });

      expect(result.toOutput().lastPage).toBe(lastPage);
    },
  );

  it('should convert the items and keep the pagination', () => {
    const params = SearchParams.create({}, options);
    const result = SearchResult.create({ items: [1, 2], total: 2, params });

    const converted = result.map((item) => `#${item}`);

    expect(converted.toOutput()).toEqual({
      items: ['#1', '#2'],
      total: 2,
      page: 1,
      perPage: 15,
      lastPage: 1,
    });
  });
});
