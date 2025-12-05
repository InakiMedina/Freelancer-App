import express from 'express'
import path from 'path'

import { tokenVerify } from './routes/auth.js'
import { apiRouter } from './routes/api.js'
import * as authRouter from "./routes/auth.js"

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router()

router.use('/api', apiRouter)

router.post('/login', authRouter.login)
router.post('/signup', authRouter.signup)

const viewsPath = path.resolve(__dirname, "..", "frontend", "views")
router.get('/', tokenVerify, (req, res) => res.sendFile(path.resolve(viewsPath, "home.html")))
router.get('/auth', (req, res) => res.sendFile(path.resolve(viewsPath, "auth.html")))
router.get('/home', tokenVerify, (req, res) => res.sendFile(path.resolve(viewsPath, "home.html")))

export default router