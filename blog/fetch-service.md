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
Adding this function defines how our `express` server should react when someone makes a GET request to the `/fetch` endpoint. To make sure it works, let's add `console.log("GET request received from /fetch")` as a line of code inside of the `router.get()` function.

### Dockerizing with a Whale
Now that we have a complete `express` server, let's make it into a container and deploy it to test.

#### The Dockerfile
Create a new file named `Dockerfile` in your `fetch-service` directory and place this inside:
```
FROM node:12.0-slim
COPY . .
RUN npm install
CMD [ "node", "--experimental-modules", "index.js" ]
```

This set of instructions tells Docker to:
1. Get a `node` Docker image
2. Copy the `fetch-service` files inside
3. Install all the npm packages
4. Start the `express` server

> Notice that we added `--experimental-modules` because we are using EJS.

#### Package it Up
> If you don't have Docker, install it [here](https://docs.docker.com/get-docker/). You'll also need a Docker Hub account can be used to login to the CLI with `docker login`.

In the same directory as the Dockerfile, run the below command, making sure to replace the [insert your username] with your own Docker Hub username.
```bash
docker buildx build --platform linux/amd64,linux/arm64 . --push -t [insert your username]/fetch-service
```
We specified a specific architecture that is compatible with Kubernetes!

### YAML, YAML, YAML.
Return to the main root directory and `cd` into the `kube` folder. There, create a file named `fetch.yaml` and enter in the below contents:

> Make sure to update the your username in the containers --> image field.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fetch-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: fetch-service
  template:
    metadata:
      labels:
        app: fetch-service
    spec:
      containers:
        - name: fetch-service
          image: [your Dockerhub username]/fetch-service
          ports:
            - containerPort: 1337
          env:
            - name: HOST
              value: mysql
            - name: PASSWORD
              value: password
            - name: MANIPULATE_ENDPOINT
              value: manipulation-service:80
          imagePullPolicy: Always
---
apiVersion: v1
kind: Service
metadata:
  name: fetch-service
spec:
  selector:
    app: fetch-service
  ports:
    - port: 80
      targetPort: 1337
  type: ClusterIP
```

### Shipping it off
Return back to your root directory and get ready to test! Run the below command to update your Kubernetes cluster:
```
kubectl apply -f kube
```
Go to NewRelic One and access the logs for the `fetch-service`. Do you see a log saying `API Gateway started on port 1337`? 

Now, run the below command to get an endpoint for the `fetch-service`.
```
minikube service -n default --url fetch-service
```
Paste the link that you get along with `/fetch` at the end into your browser.
> Example: http://127.0.0.1/fetch

Go back to your logs; do you see a new entry that says `GET request received from /fetch`? If so, your `express` server is up and running so we can start the actual coding...

