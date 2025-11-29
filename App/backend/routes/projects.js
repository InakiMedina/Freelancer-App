// controllers/projects.js
import express from "express";
import * as service from "../services/projects.service.js";

const router = express.Router();

router.get("/", (req, res) => res.json(service.getProjects()));

router.post("/", (req, res) => {
  const created = service.createProject(req.body);
  res.status(201).json(created);
});

router.put("/:id", (req, res) => {
  const updated = service.updateProject(req.params.id, req.body);
  res.json(updated);
});

router.delete("/:id", (req, res) => {
  service.deleteProject(req.params.id);
  res.status(204).send();
});

export const projectsRouter = router