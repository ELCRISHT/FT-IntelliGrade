import type { AuthenticatedRequest } from '../middleware/authenticate.js';

declare module 'express-serve-static-core' {
  interface Request extends AuthenticatedRequest {}
}
