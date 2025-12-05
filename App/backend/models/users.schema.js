const mongoose = require('mongoose');

// export const UsersSchema = z.object({
//   id: z.string(),
//   name: z.string().min(1),
//   email: z.string(),
//   hashedPassword: z.string(),
//   rating: z.number().optional(),
//   raitingCount: z.number(),
//   type: z.enum(["client", "freelancer", "both"]),
//   registrationDate: z.string().datetime(),
//   educationLevel: z.string().optional(),
//   occupation: z.string().optional(),
//   currentWork: z.string().optional(),
//   cv: z.string().optional(),
//   currentProjects: z.array(z.string()).default([]),
// });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },

  rating: { type: Number, default: 0 },
  raitingCount: { type: Number, default: 0 },

  type: { type: String, enum: ["client", "freelancer", "both"], default: "client" },

  registrationDate: { type: Date, default: Date.now },

  educationLevel: String,
  occupation: String,
  currentWork: String,
  cv: String,

  currentProjects: { type: [String], default: [] },

  profileImage: {
    filename: String,
    path: String,
    url: String,
  },

  portfolio: [{
    title: String,
    description: String,
    filename: String,
    path: String,
    url: String,
    category: String,
    createdAt: { type: Date, default: Date.now }
  }]
});
module.exports = mongoose.model('User', userSchema);
