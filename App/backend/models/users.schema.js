const mongoose = require('mongoose');

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
