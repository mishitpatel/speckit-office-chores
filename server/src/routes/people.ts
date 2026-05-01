import { Router, type Request, type Response } from "express";
import type { PeopleRepo } from "../repos/people.js";

export function createPeopleRouter(repo: PeopleRepo): Router {
  const r = Router();

  r.get("/", (_req: Request, res: Response) => {
    res.json(repo.list());
  });

  return r;
}
