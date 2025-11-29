import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  budget: z.number(),
  category: z.string(),
  ownerId: z.string(),
  status: z.literal(["open", "in_progress", "completed", "payed", "canceled", "not_delivered"]),
  creationDate: z.string().datetime(),
  assignedFreelancerId: z.string().optional(),
  proyectAsignedDate:z.string().datetime().optional(),
  proyectMaxDate: z.string().datetime().optional(),
  proyectDoneDate: z.string().datetime().optional(),
});