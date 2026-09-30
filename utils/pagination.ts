import { Request } from "express";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export interface Pagination {
  skip: number;
  limit: number;
}

// Clamp page/limit query params to safe bounds for unbounded list endpoints.
export default (req: Request): Pagination => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(req.query.limit) || DEFAULT_LIMIT)
  );

  return { skip: (page - 1) * limit, limit };
};
