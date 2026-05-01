import { Router, type NextFunction, type Request, type Response } from "express";
import { PersonCreateSchema, PersonUpdateSchema } from "@office-chores/shared";
import type { PeopleRepo } from "../repos/people.js";
import { errors } from "../lib/errors.js";

export function createPeopleRouter(repo: PeopleRepo): Router {
  const r = Router();

  r.get("/", (_req: Request, res: Response) => {
    res.json(repo.list());
  });

  r.post("/", (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = PersonCreateSchema.parse(req.body);
      res.status(201).json(repo.create(body));
    } catch (e) {
      next(e);
    }
  });

  r.patch("/:id", (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = PersonUpdateSchema.parse(req.body);
      res.json(repo.rename(req.params.id!, body.name));
    } catch (e) {
      next(e);
    }
  });

  r.delete("/:id", (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      if (!id) throw errors.validation("id is required");
      repo.delete(id);
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  return r;
}
