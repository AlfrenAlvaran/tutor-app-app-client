import { z } from "zod";
const SAFE_TEXT = /^[^<>{}$`]*$/;

export const tutorFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name is too short")
    .max(150, "Name is too long")
    .regex(SAFE_TEXT, "Name contains invalid characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address")
    .max(150, "Email is too long"),
  profession: z
    .string()
    .trim()
    .min(2, "Profession is too short")
    .max(100, "Profession is too long")
    .regex(SAFE_TEXT, "Profession contains invalid characters"),
  bio: z
    .string()
    .trim()
    .max(2000, "Bio is too long (2000 characters max)")
    .optional()
});

export type TutorFormValues = z.infer<typeof tutorFormSchema>;
