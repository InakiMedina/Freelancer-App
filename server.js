import express from 'express'
import cors from 'cors'
const app = express()
import path from 'path'
import cookieParse from "cookie-parser"

const port = 3000
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import router from './App/backend/router.js'

// make easy for the html files to call the css/js/images
app.use(cors({
  origin: `http://localhost:${port}`, 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json())
app.use(cookieParse())
app.use(express.static(path.join(__dirname, "app", "frontend")));
app.use(router)

app.listen(port, () => {
  console.log(`Freelancer app runing on: http://localhost:${port}`)
})