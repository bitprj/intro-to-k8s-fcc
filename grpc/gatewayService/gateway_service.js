var PROTO_PATH = __dirname + '/manipulate.proto';

var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
var manipulate_proto = grpc.loadPackageDefinition(packageDefinition).manipulate;

async function requestFetch(style, face) {
    target = process.env.FETCH_ENDPOINT;
    var client = new manipulate_proto.Fetch(target, grpc.credentials.createInsecure());
    let request = {};

    if (style != undefined && face != undefined) {
        request = {style: style, face: face}
    } else if (style == undefined && face != undefined) {
        request = {face: face}
    } else if (face == undefined && style != undefined) {
        request = {style: style}
    }

    console.log(request)
    console.log(face, style)

    // let response = await client.fetchService(request)
    client.fetchService(request, function(err, response) {
        if (err) {
          console.log(err)
        } else {
          console.log(response.base64)
          return response.base64
        }
      });
}

const express = require('express')
const multer = require('multer')
const upload = multer()
const app = express()
var router = express.Router();
const PORT = 4444

// for testing locally: node -r dotenv/config index.js  
// https://stackoverflow.com/questions/28305120/differences-between-express-router-and-app-get

router.post('/', upload.any(), async (req, res) => {
    res.send(requestFetch(undefined, req.files[0].buffer))
})

router.post('/:apiName', upload.any(), async (req, res) => {
    console.log(`[!] ${req.params.apiName} was accessed.`)
    let style = req.params.apiName

    res.send(requestFetch(style, req.files[0].buffer))
})

router.get('/', upload.any(), async (req, res) => {
    res.send(requestFetch(undefined, undefined))
})

router.get('/:apiName', upload.any(), async (req, res) => {
    console.log(`[!] ${req.params.apiName} was accessed.`)

    let route = req.params.apiName;
    res.send(requestFetch(route, undefined))
})

app.use('/', router)

app.listen(PORT, () => {
    console.log(`API Gateway started on port ${PORT}`)
})

