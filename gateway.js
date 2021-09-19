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

function getNumber(req) {
    let param = ""
    if (req.query.number != undefined) {
        param = `number=${req.query.number}`
    }

    return param
}

router.post('/', upload.any(), async (req, res) => {
    let param = getNumber(req)
    let formData = new FormData()
    formData.append('file', req.files[0].buffer, {filename: "face", data: req.files[0].buffer})
    const formHeaders = formData.getHeaders();
    const fetchResp = await fetch(`http://${process.env.FETCH_ENDPOINT}/fetch?` + param, {
        method: 'POST',
        body: formData,
        headers: {
        ...formHeaders,
        },  
    });

    console.log("Fetching base64 image")

    var result = await fetchResp.json()
    res.send({result}) 
})

router.post('/:apiName', upload.any(), async (req, res) => {
    console.log(`[!] ${req.params.apiName} was accessed.`)
    let route = req.params.apiName

    let param = getNumber(req)
    let formData = new FormData()
    formData.append('file', req.files[0].buffer, {filename: "face", data: req.files[0].buffer})
    const formHeaders = formData.getHeaders();
    const fetchResp = await fetch(`http://${process.env.FETCH_ENDPOINT}/fetch?style=${route}&` + param, {
        method: 'POST',
        body: formData,
        headers: {
        ...formHeaders,
        },  
    });

    console.log("Fetching base64 image")

    var result = await fetchResp.json()
    res.send({result}) 
})

router.get('/', upload.any(), async (req, res) => {
    let param = getNumber(req)
    const addResp = await fetch(`http://${process.env.FETCH_ENDPOINT}/fetch?` + param, {
        method: 'GET',      
    });

    console.log("Fetching base64 image")

    var result = await addResp.json()
    res.send({result}) 
})

router.get('/:apiName', upload.any(), async (req, res) => {
    console.log(`[!] ${req.params.apiName} was accessed.`)

    let route = req.params.apiName;
    let param = getNumber(req)
    const addResp = await fetch(`http://${process.env.FETCH_ENDPOINT}/fetch?style=${route}&` + param, {
        method: 'GET',      
    });

    console.log("Fetching base64 image")
    
    let responseCode = addResp.status

    var result = await addResp.json()
    res.status(responseCode).send({result}) 
})

router.get('/api/:apiName', upload.any(), async (req, res) => {
    console.log(`[!] /api/${req.params.apiName} was accessed.`)
    let route = req.params.apiName;
    
    if (route == "hats") {
        const addResp = await fetch(`http://${process.env.FETCH_ENDPOINT}/fetch?hats=true`, {
            method: 'GET',      
        });

        console.log("Fetching hat list")

        var result = await addResp.json()
        res.send(result)
    }
})

app.use('/', router)

app.listen(PORT, () => {
    console.log(`API Gateway started on port ${PORT}`)
})
