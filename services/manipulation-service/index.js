const express = require('express')
const multer = require('multer')
const upload = multer()
const Jimp = require('jimp')
const faceapi = require('face-api.js')
const canvas = require('canvas')
const app = express()
var router = express.Router();
const PORT = 80

// for testing locally: node -r dotenv/config index.js  
// https://stackoverflow.com/questions/28305120/differences-between-express-router-and-app-get

const { Canvas, Image, ImageData } = canvas  
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

app.use('/', router)

app.listen(PORT, () => {
    console.log(`API Gateway started on port ${PORT}`)
})

router.post('/manipulate', upload.any(), async(req, res) => {
    var result;
    console.log(req.files)
    let baby = req.files[0].buffer
    let hat = req.files[1].buffer
    let rotate = parseInt(req.query.rotate)
    let translate = parseInt(req.query.translate)

    try {
        // send to AWS SDK
        console.log(baby)
        result = await findBaby(baby)
    } catch (e) {
        res.send("Invalid image")
        console.log(e)
    }

    let finalBaby = await overlayHat(hat, result, baby, translate, rotate)
    res.send({finalBaby}) 
  });

  const findBaby = async (baby) => {
    const image = await canvas.loadImage(baby)
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
  
async function overlayHat(hat, result, baby, translate, rotate) {
    let hatImg = await Jimp.read(hat);
    const image = await Jimp.read(baby);
    let jimpFace = image.bitmap
  
    let width = result._width
    let height = result._height
    let left = result._x
    let top = result._y
    console.log(width, height, left, top)
    //  BoundingBox.Width:      ${data.BoundingBox.Width}`)
  
    hatImg = await hatImg.resize(width, height)
    hatImg = await hatImg.rotate(rotate)
  
    translate = translate * 0.3
  
    image.composite(hatImg, left - width*translate, top - height*1.2, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacityDest: 1,
      opacitySource: 0.9
    })
  
    return await image.getBase64Async(Jimp.MIME_PNG)
  }