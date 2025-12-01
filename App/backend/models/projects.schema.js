import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  budget: z.number(),
  category: z.string(),
  ownerId: z.string(),
  status: z.enum(["open", "in_progress", "completed", "payed", "canceled", "not_delivered"]),
  creationDate: z.string().datetime(),
  assignedFreelancerId: z.string().optional(),
  projectAsignedDate:z.string().datetime().optional(),
  projectMaxDate: z.string().datetime().optional(),
  projectDoneDate: z.string().datetime().optional(),
});