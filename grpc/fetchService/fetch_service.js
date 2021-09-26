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

function fetchService(call, callback) {
    let style = call.request.style;
    let face = call.request.face;
    var hat;
    if (style != undefined) {
        hat = await getSpecificHat(style)
    } else {
        hat = await getRandomHat()
    }

    if (call.request.face == undefined) {
        face = await defaultBoss()
    }

    b64Result = await requestManipulate(face, hat)

    callback(null, {base64: b64Result});
}


function main() {
    var server = new grpc.Server();
    console.log("Fetch Service running on Port 50052")
    server.addService(manipulate_proto.Fetch.service, {fetchService: fetchService});
    server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), () => {
      server.start();
    });
  }
  
  main();

import mysql from 'mysql2'

const HOST = process.env.HOST;
const PASSWORD = process.env.PASSWORD;

const con = mysql.createConnection({
    host: HOST,
    port: '3306',
    user: "admin",
    password: PASSWORD,
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