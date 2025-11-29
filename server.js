const express = require('express')
const app = express()
const path = require('path')

const port = 3000

const router = require('./App/backend/router')

// make easy for the html files to call the css/js/images
app.use(express.static(path.join(__dirname, "app", "frontend")));
app.use(router)

app.listen(port, () => {
  console.log(`Freelancer app runing on: http://localhost:${port}`)
})
