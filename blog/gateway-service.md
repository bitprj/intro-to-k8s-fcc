## Coding the `gateway-service`
As a recap, recall that the `gateway-service` will be our microservice that routes the user's request to the other microservices. This is the "gateway" that requests have to pass through before reaching the interal services.

### Setting Up
Create a new folder named `fetch-service` inside of your `services` directory.

Then, run the below commands to initialize a new `package.json` and install the needed packages for this service.

```
npm init -y
npm i express
npm i multer
npm i node-fetch
npm i form-data
```

Create a new file in the current directory named `gateway.js`: this is where all of our code for the microservice will go! Before we can start, let's import the npm packages we just installed.

```js
const express = require('express')
const multer = require('multer')
const FormData = require('form-data')
const fetch = require("node-fetch")
```

### Configuring the Express.JS NodeJS Server
First, define two variables, `upload` and `app`, to initialize our `express` instance and `multer` middleware.
> Middleware, like `multer`, is used to accept different types of requests from clients. In this case, `multer` will help us parse `multipart/form` data.

```js
const upload = multer()
const app = express()
```

Create a `router` object that will "route" requests to specific parts of our application and pass it into an `app.use()` function. This will make more sense once we begin considering what kinds of requests we may receive!
```js
var router = express.Router();
app.use('/', router)
```
Below that, we'll add a constant that defines what port the server should run on. Then, tell the `express` application to listen on that port.
```js
const PORT = 4444
app.listen(PORT, () => {
    console.log(`API Gateway started on port ${PORT}`)
})
```

### Considering User Input
Since this microservice is what users will be working with, we have to consider what functionality they will be expecting.

**Our "tinyhats" application should:**
1. Allow users to GET the root URL "/" and get a random hat with a default picture.
2. Allow users to GET a directory (ex: "/cat-ears") and get the specified hat ("cat-ears") with a default picture.
3. Allow userse to POST their own image with the root URL "/" and get a random hat.
4. Allow users to POST their own image with a specific directory (ex: "/spicy") and get the specified hat ("spicy").

> Read more about [GET and POST requests](https://lazaroibanez.com/difference-between-the-http-requests-post-and-get-3b4ed40164c1)!

#### Example
John wants to put cat ears on a picture of his friend. He should be able to make a POST request to `http://sampledomain.com/cat-ears` with his friend's picture to get the correct result.
