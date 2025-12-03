//models/applicants.js
import { z } from "zod";

export const AplicantsSchema = z.object({
  projectId: z.string(),
  freelancerId: z.string(),
  status: z.enum(['pending', 'accepted', 'rejected'])
});