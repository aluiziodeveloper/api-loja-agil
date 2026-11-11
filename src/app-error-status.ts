import { catalogErrorStatus } from './catalog/infrastructure/http/catalog-error-status.js';
import { identityErrorStatus } from './identity/infrastructure/http/identity-error-status.js';
import { inventoryErrorStatus } from './inventory/infrastructure/http/inventory-error-status.js';
import { orderingErrorStatus } from './ordering/infrastructure/http/ordering-error-status.js';
import type { ErrorStatusMap } from './shared/infrastructure/http/error-response.js';
import { sharedErrorStatus } from './shared/infrastructure/http/shared-error-status.js';

/** A tabela inteira: cada contexto declara a sua, e a aplicação junta todas. */
export const appErrorStatus: ErrorStatusMap = {
  ...sharedErrorStatus,
  ...identityErrorStatus,
  ...catalogErrorStatus,
  ...inventoryErrorStatus,
  ...orderingErrorStatus,
};
