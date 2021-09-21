## Coding the `fetch-service`
As a recap, recall that the `fetch-service` will be our microservice that procresses users' requests based on their personalized options.

### Setting Up
Create a new folder named `fetch-service` inside of your `services` directory.

Then, run the below commands to initialize a new `package.json` and install the needed packages for this service.

```
npm init -y
npm i express
npm i multer
npm i mysql2
npm i node-fetch
npm i form-data
```

Create a new file in the current directory named `index.js`: this is where all of our code for the microservice will go! Before we can start, let's import the npm packages we just installed.

```js
import express from 'express'
import multer from 'multer'
import mysql from 'mysql2'
import fetch from 'node-fetch'
import FormData from 'form-data'
```
> You might notice that the syntax is slightly different - this is because we are using EJS to import modules. Certain npm packages are only compatible with this style of JS!

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
const PORT = 1337
app.listen(PORT, () => {
    console.log(`API Gateway started on port ${PORT}`)
})
```

### Considering Service Input
The `fetch-service` will be accepting requests from `gateway-service`. We have engineered this network so that the "style" of the hat will be passed in as a parameter in both GET and POST requests.

> Read more about [GET and POST requests](https://lazaroibanez.com/difference-between-the-http-requests-post-and-get-3b4ed40164c1)!

### "GET"ting Started
Our first step will be to accept GET requests in our server.
```js
router.get('/fetch', upload.any(), async(req, res) => {
    // We'll put some code here.
}
```
Adding this function defines how our `express` server should react when someone makes a GET request to the `/fetch` endpoint.