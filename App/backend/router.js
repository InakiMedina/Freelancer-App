const express = require('express')
const app = express()
const path = require('path')

const router = express.Router()

const viewsPath = path.resolve(__dirname, "..", "frontend", "views")
router.get('/', (req, res) => res.sendFile(path.resolve(viewsPath, "home.html")))
router.get('/home', (req, res) => res.sendFile(path.resolve(viewsPath, "home.html")))

module.exports = router