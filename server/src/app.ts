import express, { type Application, type ErrorRequestHandler, type Request, type Response } from "express";
import { pinoHttp } from "pino-http";
import { ZodError } from "zod";
import { ERROR_CODES } from "@office-chores/shared";
import { ApiHttpError } from "./lib/errors.js";

export interface AppDeps {
  /** Optional logger toggle for tests. */
  silent?: boolean;
}

export function createApp(_deps: AppDeps = {}): Application {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "64kb" }));
  if (!_deps.silent) app.use(pinoHttp({ transport: { target: "pino-pretty" } }));

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // Routers are wired in by user-story phases (US1+).

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ code: "not_found", message: "route not found" });
  });

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof ZodError) {
      res.status(400).json({
        code: ERROR_CODES.VALIDATION,
        message: "validation failed",
        details: { issues: err.issues },
      });
      return;
    }
    if (err instanceof ApiHttpError) {
      res
        .status(err.status)
        .json({ code: err.code, message: err.message, details: err.details });
      return;
    }
    res
      .status(500)
      .json({ code: ERROR_CODES.INTERNAL, message: "internal server error" });
  };
  app.use(errorHandler);

  return app;
}
