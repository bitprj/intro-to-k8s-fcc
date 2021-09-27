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

/**
 * Implements the SayHello RPC method.
 */
async function manipulateService(call, callback) {
    let face = Buffer.from(call.request.face).toString("base64");
    let hat = Buffer.from(call.request.hat).toString("base64");

    console.log(face, hat)

    try {
        result = await findFace(face)
    } catch (e) {
        console.log(e)
    }

    let finalFace = await overlayHat(hat, result, face)
    callback(null, {base64: finalFace});
}

/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
function main() {
  var server = new grpc.Server();
  console.log("Manipulate Service running on Port 50051")
  server.addService(manipulate_proto.Manipulate.service, {manipulateService: manipulateService});
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
  });
}

main();
const Jimp = require('jimp')
const faceapi = require('face-api.js')
const canvas = require('canvas')

const findFace = async (face) => {
    const image = await canvas.loadImage(face)
    await faceapi.nets.ssdMobilenetv1.loadFromDisk('./weights')
    // const Canvas = canvas.createCanvas(image.width, image.height)
    // const ctx = Canvas.getContext('2d')
    // ctx.drawImage(image, 0, 0, image.width, image.height)
    // console.log(ctx)
  
    const fullFaceDescription = await faceapi.detectAllFaces(image)
    // use await to retrieve face data
  
    let relData = fullFaceDescription[0]._box
    console.log(`Detected faces: ${JSON.stringify(relData)}`)
  
    return relData;
    // {"_x":225.59293228387833,"_y":122.78662695563085,"_width":183.89773482084274,"_height":181.8649869230835}
  }
  
async function overlayHat(hat, result, face) {
    let hatImg = await Jimp.read(hat);
    const image = await Jimp.read(face);
  
    let width = result._width
    let height = result._height
    let left = result._x
    let top = result._y
    console.log(width, height, left, top)
    //  BoundingBox.Width:      ${data.BoundingBox.Width}`)
  
    hatImg = await hatImg.resize(width, height)
    hatImg = await hatImg.rotate(10)
    
    image.composite(hatImg, left - width*0.18, top - height*1.2, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacityDest: 1,
      opacitySource: 0.9
    })
  
    return await image.getBase64Async(Jimp.MIME_PNG)
  }