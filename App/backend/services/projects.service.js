import fs from "fs";
import path from "path";
import { ProjectSchema } from "../models/projects.schema.js";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = path.join(__dirname, "..", "data", "projects.json");

const readFile = () => JSON.parse(fs.readFileSync(filePath, "utf8"));
const writeFile = (data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

export const getProjects = () => readFile();

export const getProjectsFromOwnerId = (id) => {
  const data = readFile()
  
  return data.filter(project => {
    project.ownerId == id
  })
}

export const createProject = (projectData) => {

  const result  = ProjectSchema.safeParse(projectData);  // validation
  if (!result.success) 
    return { 
        'success': 409,
        'body': Object.assign(
          {"description": "insertion of project on post failed cause project was ugly"}, 
          result.error)
      }

  const data = readFile();
  data.push(result.data);
  writeFile(data);

  return { 
        'success': 201,
        'body': result.data
  }
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