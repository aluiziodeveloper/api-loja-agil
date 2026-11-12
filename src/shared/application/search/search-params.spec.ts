import { InvalidSearchParamsError } from './invalid-search-params.error.js';
import { SearchParams, SortDirection } from './search-params.js';

const options = {
  sortableFields: ['name', 'price'] as const,
  defaultSort: 'name' as const,
};

describe('SearchParams', () => {
  it('should apply the defaults when nothing is sent', () => {
    const params = SearchParams.create({}, options);

    expect(params.page()).toBe(1);
    expect(params.perPage()).toBe(15);
    expect(params.sort()).toBe('name');
    expect(params.sortDirection()).toBe(SortDirection.ASC);
    expect(params.filter()).toBeNull();
  });

  it('should keep the values that are sent', () => {
    const params = SearchParams.create(
      {
        page: 3,
        perPage: 50,
        sort: 'price',
        sortDirection: 'desc',
        filter: 'caneca',
      },
      options,
    );

    expect(params.page()).toBe(3);
    expect(params.perPage()).toBe(50);
    expect(params.sort()).toBe('price');
    expect(params.sortDirection()).toBe(SortDirection.DESC);
    expect(params.filter()).toBe('caneca');
  });

  it('should accept 100 items per page, the maximum', () => {
    expect(SearchParams.create({ perPage: 100 }, options).perPage()).toBe(100);
  });

  it('should compute how many items to skip', () => {
    expect(SearchParams.create({ page: 1 }, options).offset()).toBe(0);
    expect(
      SearchParams.create({ page: 3, perPage: 10 }, options).offset(),
    ).toBe(20);
  });

  it('should treat a blank filter as no filter', () => {
    expect(SearchParams.create({ filter: '   ' }, options).filter()).toBeNull();
    expect(SearchParams.create({ filter: ' azul ' }, options).filter()).toBe(
      'azul',
    );
  });

  it.each([
    ['page 0', { page: 0 }, 'page deve ser um inteiro maior ou igual a 1.'],
    [
      'a fractional page',
      { page: 1.5 },
      'page deve ser um inteiro maior ou igual a 1.',
    ],
    ['perPage 0', { perPage: 0 }, 'perPage deve ser um inteiro entre 1 e 100.'],
    [
      'perPage above 100',
      { perPage: 101 },
      'perPage deve ser um inteiro entre 1 e 100.',
    ],
    [
      'an unknown sort field',
      { sort: 'password' },
      'sort deve ser um destes: name, price.',
    ],
    [
      'an unknown direction',
      { sortDirection: 'up' },
      'sortDirection deve ser asc ou desc.',
    ],
  ])('should reject %s', (_case, input, detail) => {
    expect(() => SearchParams.create(input, options)).toThrow(
      new InvalidSearchParamsError(detail),
    );
  });

  it('should report the INVALID_SEARCH_PARAMS code', () => {
    expect(() => SearchParams.create({ page: 0 }, options)).toThrow(
      expect.objectContaining({
        code: 'INVALID_SEARCH_PARAMS',
        message:
          'Parâmetros de busca inválidos: page deve ser um inteiro maior ou igual a 1.',
      }),
    );
  });

  it('should be equal to other params with the same values', () => {
    const first = SearchParams.create({ page: 2, filter: 'azul' }, options);
    const second = SearchParams.create({ page: 2, filter: ' azul ' }, options);

    expect(first.equals(second)).toBe(true);
  });
});
