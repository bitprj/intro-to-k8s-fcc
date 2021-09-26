var PROTO_PATH = __dirname + '/manipulate.proto';

import grpc from '@grpc/grpc-js'
import protoLoader from '@grpc/proto-loader'

var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
var manipulate_proto = grpc.loadPackageDefinition(packageDefinition).manipulate;

function requestManipulate(face, hat) {
    target = 'localhost:50051';
    var client = new manipulate_proto.Manipulate(target, grpc.credentials.createInsecure());

    let response = await client.manipulateService({face: face, hat: hat})
    return response.base64
}

import express from 'express'
import multer from 'multer'
import mysql from 'mysql2'
import fetch from 'node-fetch'
const upload = multer()
const app = express()
var router = express.Router();
const PORT = 1337

// for testing locally: node -r dotenv/config index.js  
// https://stackoverflow.com/questions/28305120/differences-between-express-router-and-app-get

const HOST = process.env.HOST;
const PASSWORD = process.env.PASSWORD;

const con = mysql.createConnection({
    host: HOST,
    port: '3306',
    user: "admin",
    password: PASSWORD,
});

app.use('/', router)

app.listen(PORT, () => {
    console.log(`API Gateway started on port ${PORT}`)
})

router.get('/fetch', upload.any(), async(req, res) => {
    let style = req.query.style
    let face = await defaultBoss()
    let b64Result = ''

    if (style != undefined) {
        console.log("No custom image, yes style")
        let hat = await getSpecificHat(style)
        if (hat == null) {
            return res.status(400).send({
                message: 'This hat style does not exist! If you want this style - try submitting it'
             });             
        }
        console.log("Got specific hat")
        b64Result = await requestManipulate(face, hat)
        res.send(b64Result)
    } else {
        console.log("No custom image, no style")
        let hat = await getRandomHat()
        b64Result = await requestManipulate(face, hat)
        res.send(b64Result)
    }
});

router.post('/fetch', upload.any(), async(req, res) => {
    let style = req.query.style
    let face = req.files[0].buffer
    let b64Result = ''

    if (style != undefined) {
        console.log("Custom image, no style")
        let hat = await getSpecificHat(style)

        b64Result = await requestManipulate(face, hat)
    } else {
        console.log("Custom image, yes style")
        let hat = await getRandomHat()

        b64Result = await requestManipulate(face, hat)
    }

    res.send(b64Result)
});

async function getSpecificHat(style) {
    var sql = `SELECT * FROM main.images WHERE description='${style}';`;
    const results = await con.promise().query(sql)
        .catch(err => console.log(err))
    
    let hatList = results[0]
    console.log(hatList)
    if (hatList.length == 0){
        return null
    }

    let randNum = Math.floor(Math.random() * hatList.length)
    let hatLink = hatList[randNum].base64
    console.log(hatLink)

    return Buffer.from(hatLink, "base64")
}

async function getRandomHat() {
    // get random hat picture
    let hats = await listPictures()
    let hatList = hats[0]
    console.log(hatList)

    let randNum = Math.floor(Math.random() * hatList.length)
    let hatLink = hatList[randNum].base64
    console.log(hatLink)

    return Buffer.from(hatLink, "base64")
}

async function downloadBuffer(url) {
    let resp = await fetch(url,{
        method: 'GET',
    })

    // receive the response
    let data = await resp.arrayBuffer()
    return data
}

async function defaultBoss() {
    //my fav boss ever --daniel
    let johnKinmonth = await downloadBuffer("https://user-images.githubusercontent.com/69332964/128645143-86405a62-691b-4de9-8500-b9362675e1db.png");
    johnKinmonth = Buffer.from(johnKinmonth)

    return johnKinmonth
}