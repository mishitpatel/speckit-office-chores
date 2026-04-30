import { ERROR_CODES, type ErrorCode } from "@office-chores/shared";

export class ApiHttpError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly details: Record<string, unknown> | undefined;

  constructor(
    status: number,
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const errors = {
  validation: (message: string, details?: Record<string, unknown>) =>
    new ApiHttpError(400, ERROR_CODES.VALIDATION, message, details),
  personNotFound: () =>
    new ApiHttpError(404, ERROR_CODES.PERSON_NOT_FOUND, "person not found"),
  nameTaken: () => new ApiHttpError(409, ERROR_CODES.NAME_TAKEN, "name already in use"),
  personHasChores: (choreCount: number) =>
    new ApiHttpError(
      409,
      ERROR_CODES.PERSON_HAS_CHORES,
      "person has chores assigned; reassign or delete them first",
      { choreCount },
    ),
  choreNotFound: () =>
    new ApiHttpError(404, ERROR_CODES.CHORE_NOT_FOUND, "chore not found"),
  assigneeNotFound: () =>
    new ApiHttpError(422, ERROR_CODES.ASSIGNEE_NOT_FOUND, "assignee does not exist"),
};
