import { Page, presentPage } from './page.js';

describe('presentPage', () => {
  it('should present every item and keep what is needed to navigate', () => {
    const output = {
      items: [{ cents: 1990 }, { cents: 4590 }],
      total: 17,
      page: 2,
      perPage: 2,
      lastPage: 9,
    };

    const page = presentPage(output, ({ cents }) => ({ reais: cents / 100 }));

    expect(page).toBeInstanceOf(Page);
    expect(page.items).toEqual([{ reais: 19.9 }, { reais: 45.9 }]);
    expect(page.meta).toEqual({ total: 17, page: 2, perPage: 2, lastPage: 9 });
  });
});
