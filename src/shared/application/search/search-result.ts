import { ValueObject } from '../../domain/value-object.js';
import type { SearchParams } from './search-params.js';

export type SearchOutput<Item> = {
  items: Item[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
};

type SearchResultProps<Item> = {
  items: Item[];
  total: number;
  page: number;
  perPage: number;
};

type CreateSearchResultProps<Item> = {
  items: Item[];
  total: number;
  params: SearchParams<string>;
};

/** Uma página de resultados e o que é preciso para navegar pelas outras. */
export class SearchResult<Item> extends ValueObject<SearchResultProps<Item>> {
  static create<Item>({
    items,
    total,
    params,
  }: CreateSearchResultProps<Item>): SearchResult<Item> {
    return new SearchResult({
      items,
      total,
      page: params.page(),
      perPage: params.perPage(),
    });
  }

  map<Converted>(convert: (item: Item) => Converted): SearchResult<Converted> {
    return new SearchResult({
      ...this.props,
      items: this.props.items.map(convert),
    });
  }

  toOutput(): SearchOutput<Item> {
    return {
      ...this.props,
      items: [...this.props.items],
      lastPage: this.lastPage(),
    };
  }

  private lastPage(): number {
    return Math.max(1, Math.ceil(this.props.total / this.props.perPage));
  }
}
