import { searchQuery } from './search-query.js';

describe('searchQuery', () => {
  it('should convert the numbers of the query string', () => {
    const query = searchQuery.parse({ page: '2', perPage: '30', sort: 'name' });

    expect(query).toEqual({ page: 2, perPage: 30, sort: 'name' });
  });

  it('should leave out what was not informed, for the defaults to apply', () => {
    expect(searchQuery.parse({})).toEqual({});
  });

  it('should reject a page that is not a number', () => {
    expect(searchQuery.safeParse({ page: 'abc' }).success).toBe(false);
  });
});
