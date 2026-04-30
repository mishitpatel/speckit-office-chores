import { z } from "zod";

export const PersonSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(60),
  createdAt: z.string().datetime(),
});
export type Person = z.infer<typeof PersonSchema>;

const NameField = z.string().trim().min(1).max(60);

export const PersonCreateSchema = z.object({
  name: NameField,
});
export type PersonCreate = z.infer<typeof PersonCreateSchema>;

export const PersonUpdateSchema = z.object({
  name: NameField,
});
export type PersonUpdate = z.infer<typeof PersonUpdateSchema>;
