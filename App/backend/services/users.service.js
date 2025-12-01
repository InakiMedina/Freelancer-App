import fs from "fs";
import path from "path";
import { UsersSchema } from "../models/users.schema.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = path.join(__dirname, "..", "data", "users.json");

const readFile = () => JSON.parse(fs.readFileSync(filePath, "utf8"));
const writeFile = (data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

export const getUsers = () => readFile();

export const getUserById = (id) => {
  const data = readFile();
  return data.find(u => u.id === id);
};

export const getUserByEmail = (email) => {
  const data = readFile();
  return data.find(u => u.email === email);
};

export const createUser = (userData) => {
  const result = UsersSchema.safeParse(userData);
  if (!result.success)
    return {
      success: 409,
      body: Object.assign(
        { description: "User creation failed due to invalid data" },
        result.error
      )
    };

  const data = readFile();
  data.push(result.data);
  writeFile(data);

  return {
    success: 201,
    body: result.data
  };
};

export const updateUser = (id, newData) => {
  const data = readFile();
  const index = data.findIndex(u => u.id === id);
  if (index === -1) throw new Error("User not found");

  const updated = UsersSchema.parse({ ...data[index], ...newData });
  data[index] = updated;

  writeFile(data);
  return updated;
};

export const deleteUser = (id) => {
  const data = readFile();
  const filtered = data.filter(u => u.id !== id);
  writeFile(filtered);
};
