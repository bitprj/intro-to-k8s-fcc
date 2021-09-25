const express = require('express')
const multer = require('multer')
const FormData = require('form-data')
const upload = multer()
const fetch = require("node-fetch")
const app = express()
var router = express.Router();
const PORT = 4444

// for testing locally: node -r dotenv/config index.js  
// https://stackoverflow.com/questions/28305120/differences-between-express-router-and-app-get

async function customHat(req, url) {
    let formData = new FormData()
    formData.append('file', req.files[0].buffer, {filename: "face", data: req.files[0].buffer})
    const formHeaders = formData.getHeaders();
    const fetchResp = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
        ...formHeaders,
        },  
    });

    console.log("Fetching base64 image")

    var result = await fetchResp.json()
    return result
}
router.post('/', upload.any(), async (req, res) => {
    let result = await customHat(req, `http://${process.env.FETCH_ENDPOINT}/fetch`)
    res.send({result}) 
})

router.post('/:apiName', upload.any(), async (req, res) => {
    console.log(`[!] ${req.params.apiName} was accessed.`)
    let style = req.params.apiName

    let result = await customHat(req, `http://${process.env.FETCH_ENDPOINT}/fetch?style=${style}`)
    res.send({result}) 
})

router.get('/', upload.any(), async (req, res) => {
    const addResp = await fetch(`http://${process.env.FETCH_ENDPOINT}/fetch`, {
        method: 'GET',      
    });

    console.log("Fetching base64 image")

    var result = await addResp.json()
    res.send({result}) 
})

router.get('/:apiName', upload.any(), async (req, res) => {
    console.log(`[!] ${req.params.apiName} was accessed.`)

    let route = req.params.apiName;
    const addResp = await fetch(`http://${process.env.FETCH_ENDPOINT}/fetch?style=${route}`, {
        method: 'GET',      
    });

    console.log("Fetching base64 image")
    
    let responseCode = addResp.status

    var result = await addResp.json()
    res.status(responseCode).send({result}) 
})

app.use('/', router)

app.listen(PORT, () => {
    console.log(`API Gateway started on port ${PORT}`)
})
