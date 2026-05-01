import { Router, type NextFunction, type Request, type Response } from "express";
import { ChoreCreateSchema, ChoreListQuerySchema, ChoreUpdateSchema } from "@office-chores/shared";
import type { ChoresRepo } from "../repos/chores.js";
import { errors } from "../lib/errors.js";

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

  r.get("/:id", (req: Request, res: Response, next: NextFunction) => {
    try {
      const chore = repo.getById(req.params.id!);
      if (!chore) throw errors.choreNotFound();
      res.json(chore);
    } catch (e) {
      next(e);
    }
  });

  r.patch("/:id", (req: Request, res: Response, next: NextFunction) => {
    try {
      const patch = ChoreUpdateSchema.parse(req.body);
      const updated = repo.update(req.params.id!, patch);
      res.json(updated);
    } catch (e) {
      next(e);
    }
  });

  r.delete("/:id", (req: Request, res: Response, next: NextFunction) => {
    try {
      repo.delete(req.params.id!);
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  return r;
}
