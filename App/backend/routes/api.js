import express from 'express'

import { projectsRouter} from './projects.js'
import { usersRouter } from './users.js'
import { applicantsRouter } from './applicants.js'

const router = express.Router()

router.use('/project', projectsRouter)
router.use('/user', usersRouter)
router.use('/applicants', applicantsRouter)

export const apiRouter = router