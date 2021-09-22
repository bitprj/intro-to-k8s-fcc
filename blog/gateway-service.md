## Coding the `gateway-service`
As a recap, recall that the `gateway-service` will be our microservice that routes the user's request to the other microservices. This is the "gateway" that requests have to pass through before reaching the interal services.

### Setting Up
Create a new folder named `gateway-service` inside of your `services` directory.

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

### "GET"ting Started
Our first step will be to accept GET requests in our server.
```js
router.get('/', upload.any(), async(req, res) => {
    // We'll put some code here.
}
```
Adding this function defines how our `express` server should react when someone makes a GET request to the `/` endpoint. To make sure it works, let's add `console.log("GET request received from /")` as a line of code inside of the `router.get()` function.

### Dockerizing with a Whale
Now that we have a complete `express` server, let's make it into a container and deploy it to test.

#### The Dockerfile
Create a new file named `Dockerfile` in your `gateway-service` directory and place this inside:
```
FROM node:12.0-slim
COPY . .
RUN npm install
CMD [ "node", "gateway.js" ]
```

This set of instructions tells Docker to:
1. Get a `node` Docker image
2. Copy the `gateway-service` files inside
3. Install all the npm packages
4. Start the `express` server

#### Package it Up
> If you don't have Docker, install it [here](https://docs.docker.com/get-docker/). You'll also need a Docker Hub account can be used to login to the CLI with `docker login`.

In the same directory as the Dockerfile, run the below command, making sure to replace the [insert your username] with your own Docker Hub username.
```bash
docker buildx build --platform linux/amd64,linux/arm64 . --push -t [insert your username]/gateway-service
```
We specified a specific architecture that is compatible with Kubernetes!

### YAML, YAML, YAML.
Return to the main root directory and `cd` into the `kube` folder. There, create a file named `gateway.yaml` and enter in the below contents:

> Make sure to update the your username in the containers --> image field.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gateway-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: gateway-service
  template:
    metadata:
      labels:
        app: gateway-service
    spec:
      containers:
        - name: gateway-service
          image: [your username]/gateway-service
          ports:
            - containerPort: 4444
          env:
            - name: FETCH_ENDPOINT
              value: fetch-service:80
          imagePullPolicy: Always
---
apiVersion: v1
kind: Service
metadata:
  name: gateway-service
spec:
  selector:
    app: gateway-service
  ports:
    - port: 80
      targetPort: 4444
  type: LoadBalancer
```

### Shipping it off
Return back to your root directory and get ready to test! Run the below command to update your Kubernetes cluster:
```
kubectl apply -f kube
```
Go to NewRelic One and access the logs for the `gateway-service`. Do you see a log saying `API Gateway started on port 4444`? 

Now, run the below command to get an endpoint for the `gateway-service`.
```
minikube service -n default --url gateway-service
```
Paste the link that you get into your browser.
> Example: http://127.0.0.1:8888/

Go back to your logs; do you see a new entry that says `GET request received from /`? If so, your `express` server is up and running so we can start the actual coding...