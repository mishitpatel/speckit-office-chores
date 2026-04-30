import { z } from "zod";

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

export const ERROR_CODES = {
  VALIDATION: "validation_error",
  PERSON_NOT_FOUND: "person_not_found",
  PERSON_HAS_CHORES: "person_has_chores",
  NAME_TAKEN: "name_taken",
  CHORE_NOT_FOUND: "chore_not_found",
  ASSIGNEE_NOT_FOUND: "assignee_not_found",
  INTERNAL: "internal_error",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
