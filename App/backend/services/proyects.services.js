import fs from "fs";
import path from "path";
import { ProjectSchema } from "../models/projects.schema.js";

const filePath = path.join(process.cwd(), "data", "projects.json");

const readFile = () => JSON.parse(fs.readFileSync(filePath, "utf8"));
const writeFile = (data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

export const getProjects = () => readFile();

export const createProject = (projectData) => {
  const parsed = ProjectSchema.parse(projectData);  // validation
  const data = readFile();
  data.push(parsed);
  writeFile(data);
  return parsed;
};

export const updateProject = (id, newData) => {
  const data = readFile();
  const index = data.findIndex(p => p.id === id);
  if (index === -1) throw new Error("Project not found");

  const updated = ProjectSchema.parse({ ...data[index], ...newData });
  data[index] = updated;

  writeFile(data);
  return updated;
};

export const deleteProject = (id) => {
  const data = readFile();
  const filtered = data.filter(p => p.id !== id);
  writeFile(filtered);
};