import express from 'express'
const app = express()
import path from 'path'

const port = 3000
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import router from './App/backend/router.js'

// make easy for the html files to call the css/js/images
app.use(express.static(path.join(__dirname, "app", "frontend")));
app.use(router)

app.listen(port, () => {
  console.log(`Freelancer app runing on: http://localhost:${port}`)
})
