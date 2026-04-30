import { z } from "zod";

const TitleField = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[^\n\r]+$/, "title must be a single line");

const DateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD")
  .refine((s) => !Number.isNaN(new Date(`${s}T00:00:00Z`).getTime()), {
    message: "date must be a real calendar date",
  });

export const ChoreSchema = z.object({
  id: z.string().uuid(),
  title: TitleField,
  assigneeId: z.string().uuid(),
  date: DateField,
  done: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Chore = z.infer<typeof ChoreSchema>;

export const ChoreCreateSchema = z.object({
  title: TitleField,
  assigneeId: z.string().uuid(),
  date: DateField,
});
export type ChoreCreate = z.infer<typeof ChoreCreateSchema>;

export const ChoreUpdateSchema = z
  .object({
    title: TitleField.optional(),
    assigneeId: z.string().uuid().optional(),
    date: DateField.optional(),
    done: z.boolean().optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), {
    message: "at least one field must be provided",
  });
export type ChoreUpdate = z.infer<typeof ChoreUpdateSchema>;

export const ChoreListQuerySchema = z
  .object({
    from: DateField,
    to: DateField,
    assigneeId: z.string().uuid().optional(),
  })
  .refine((v) => v.from <= v.to, { message: "from must be on or before to" })
  .refine(
    (v) => {
      const ms = new Date(`${v.to}T00:00:00Z`).getTime() - new Date(`${v.from}T00:00:00Z`).getTime();
      return ms / 86_400_000 <= 92;
    },
    { message: "range must not exceed 92 days" },
  );
export type ChoreListQuery = z.infer<typeof ChoreListQuerySchema>;
