import { ValueObject } from '../../domain/value-object.js';
import { InvalidSearchParamsError } from './invalid-search-params.error.js';

export const SortDirection = { ASC: 'asc', DESC: 'desc' } as const;
export type SortDirection = (typeof SortDirection)[keyof typeof SortDirection];

export const DEFAULT_SORT_DIRECTION: SortDirection = SortDirection.ASC;

const DEFAULT_PER_PAGE = 15;
const MAX_PER_PAGE = 100;

export type SearchParamsInput = {
  page?: number;
  perPage?: number;
  sort?: string;
  sortDirection?: string;
  filter?: string;
};

export type SearchOptions<Field extends string> = {
  sortableFields: readonly Field[];
  defaultSort: Field;
};

type SearchParamsProps<Field extends string> = {
  page: number;
  perPage: number;
  sort: Field;
  sortDirection: SortDirection;
  filter: string | null;
};

function parsePage(page = 1): number {
  if (!Number.isInteger(page) || page < 1) {
    throw new InvalidSearchParamsError(
      'page deve ser um inteiro maior ou igual a 1.',
    );
  }
  return page;
}

function parsePerPage(perPage = DEFAULT_PER_PAGE): number {
  if (!Number.isInteger(perPage) || perPage < 1 || perPage > MAX_PER_PAGE) {
    throw new InvalidSearchParamsError(
      `perPage deve ser um inteiro entre 1 e ${MAX_PER_PAGE}.`,
    );
  }
  return perPage;
}

function parseSort<Field extends string>(
  sort: string | undefined,
  { sortableFields, defaultSort }: SearchOptions<Field>,
): Field {
  const field = sortableFields.find((candidate) => candidate === sort);
  if (sort !== undefined && !field) {
    throw new InvalidSearchParamsError(
      `sort deve ser um destes: ${sortableFields.join(', ')}.`,
    );
  }
  return field ?? defaultSort;
}

function parseSortDirection(
  direction: string = DEFAULT_SORT_DIRECTION,
): SortDirection {
  if (direction !== SortDirection.ASC && direction !== SortDirection.DESC) {
    throw new InvalidSearchParamsError('sortDirection deve ser asc ou desc.');
  }
  return direction;
}

/** Página, ordenação e filtro de uma busca, já validados. */
export class SearchParams<Field extends string> extends ValueObject<
  SearchParamsProps<Field>
> {
  static create<Field extends string>(
    input: SearchParamsInput,
    options: SearchOptions<Field>,
  ): SearchParams<Field> {
    return new SearchParams({
      page: parsePage(input.page),
      perPage: parsePerPage(input.perPage),
      sort: parseSort(input.sort, options),
      sortDirection: parseSortDirection(input.sortDirection),
      filter: input.filter?.trim() || null,
    });
  }

  page(): number {
    return this.props.page;
  }

  perPage(): number {
    return this.props.perPage;
  }

  offset(): number {
    return (this.props.page - 1) * this.props.perPage;
  }

  sort(): Field {
    return this.props.sort;
  }

  sortDirection(): SortDirection {
    return this.props.sortDirection;
  }

  filter(): string | null {
    return this.props.filter;
  }
}
