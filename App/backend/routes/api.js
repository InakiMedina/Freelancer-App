import express from 'express'

import { projectsRouter} from './projects.js'
import { usersRouter } from './users.js'
import { applicantsRouter } from './applicants.js'
// import dotenv from "dotenv";

// app.get("/api/files/list", async (req, res) => {
//   try {
//     const users = await User.find({}, "name profileImage portfolio");

//     res.json({
//       success: true,
//       totalUsers: users.length,
//       users: users.map((user) => ({
//         name: user.name,
//         hasAvatar: !!user.profileImage,
//         portfolioCount: user.portfolio ? user.portfolio.length : 0,
//       })),
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });


const router = express.Router()

router.use('/project', projectsRouter)
router.use('/user', usersRouter)
router.use('/applicants', applicantsRouter)

export const apiRouter = router