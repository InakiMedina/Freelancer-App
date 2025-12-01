// controllers/users.js
import express from "express";
import * as service from "../services/users.service.js";

const router = express.Router();

router.get("/", (req, res) => res.json(service.getUsers()));

router.get("/:id", (req, res) => {
  const user = service.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

router.get("/email/:email", (req, res) => {
  const user = service.getUserByEmail(req.params.email);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

router.post("/login", (req, res) => {
  console.log("here")
  console.log(req.body)
  const user = service.getUserByEmail(req.body.email);
  if (!user || user.password != req.body.password) 
    return res.status(404).json({ error: "User not found" });
  res.json(user);
});

router.post("/", (req, res) => {
  const result = service.createUser(req.body);
  return res.status(result.success).json(result.body);
});

router.put("/:id", (req, res) => {
  try {
    const updated = service.updateUser(req.params.id, req.body);
    res.json(updated);
  } catch {
    res.status(404).json({ error: "User not found" });
  }
});

router.delete("/:id", (req, res) => {
  service.deleteUser(req.params.id);
  res.status(204).send();
});

export const usersRouter = router;
