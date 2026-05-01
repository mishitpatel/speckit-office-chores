import { Router, type NextFunction, type Request, type Response } from "express";
import { ChoreCreateSchema, ChoreListQuerySchema } from "@office-chores/shared";
import type { ChoresRepo } from "../repos/chores.js";

export function createChoresRouter(repo: ChoresRepo): Router {
  const r = Router();

  r.get("/", (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = ChoreListQuerySchema.parse(req.query);
      res.json(repo.listByDateRange(query));
    } catch (e) {
      next(e);
    }
  });

  r.post("/", (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = ChoreCreateSchema.parse(req.body);
      const created = repo.create(body);
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  });

  return r;
}
