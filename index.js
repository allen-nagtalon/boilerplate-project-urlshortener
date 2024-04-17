require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const dns = require('node:dns')

// Basic Configuration
const port = process.env.PORT || 3000

mongoose.connect(process.env.MONGO_URI)

const urlSchema = new mongoose.Schema({ url: String })

const Url = mongoose.model('url', urlSchema)

app.use(cors())

app.use('/public', express.static(`${process.cwd()}/public`))

app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html')
})

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' })
})

app.post('/api/shorturl', (req, res) => {
  try {
    const urlObj = new URL(req.body.url)

    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        res.json({ error: 'invalid url' })
      } else {
        const urlDoc = new Url({ url: req.body.url })
        urlDoc.save()
          .then((url) => {
            res.json({
              original_url: req.body.url,
              short_url: url.id
            })
          })
      }
    })
  } catch (err) {
    res.json({ error: 'invalid url' })
  }
})

app.get('/api/shorturl/:short_url', (req, res) => {
  Url.findById(req.params.short_url)
    .then((url) => {
      res.redirect(url.url)
    })
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`)
})
