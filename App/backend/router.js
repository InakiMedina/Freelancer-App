import express from 'express'
const app = express()
import path from 'path'

import {projectsRouter} from './routes/projects.js'
import { usersRouter } from './routes/users.js'
import { applicantsRouter } from './routes/applicants.js'

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router()

router.use('/api/project', projectsRouter)
router.use('/api/user', usersRouter)
router.use('/api/applicants', applicantsRouter)

const viewsPath = path.resolve(__dirname, "..", "frontend", "views")
router.get('/', (req, res) => res.sendFile(path.resolve(viewsPath, "home.html")))
router.get('/home', (req, res) => res.sendFile(path.resolve(viewsPath, "home.html")))

export default router