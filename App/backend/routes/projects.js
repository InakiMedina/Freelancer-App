// routes/projects.js
import express from "express";
import * as service from "../services/projects.service.js";
import * as appService from '../services/applicants.service.js'

const router = express.Router();

router.get("/", (req, res) => {
  const {ownerId, status, freelancerId} = req.query
  
  if (ownerId)
    return res.json(service.getProjectsByOwnerId(ownerId))

  let projects = []
  
  if (status)
    projects = service.getProjectsByStatus(status)
  else 
    projects = service.getProjects()

  if (freelancerId)
    projects = projects.filter(p => p.assignedFreelancerId == freelancerId)

  return res.json(projects)
})

router.get("/:id", (req, res) => {
  console.log(req.params.id)
  return res.json(service.getProjectById(req.params.id))
})

router.post("/", (req, res) => {

  const result = service.createProject(req.body);

  return res.status(result.success).json(result.body)
});

router.put("/:id", (req, res) => {
  const updated = service.updateProject(req.params.id, req.body);
  res.json(updated);
});

router.delete("/", (req, res) => {
  service.deleteAllProjects();
  res.status(204).send();
});

router.delete("/:id", (req, res) => {
  appService.deleteApplicationsByProjectId(req.params.id)
  service.deleteProject(req.params.id);

  res.status(204).send();
});

export const projectsRouter = router