import { z } from "zod";

export const UsersSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string(),
  password: z.string(),
  rating: z.number(),
  raitingCount: z.number(),
  type: z.enum(["client", "freelancer", "both"]),
  registrationDate: z.string().datetime(),
  educationLevel: z.string().optional(),
  occupation: z.string().optional(),
  currentWork: z.string().optional(),
  cv: z.string().optional(),
  currentProjects: z.array(z.string()).default([]),
});