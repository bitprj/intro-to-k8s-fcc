# Intro to K8s with FreeCodeCamp

### Download `minikube`
Follow instructions [here](https://v1-18.docs.kubernetes.io/docs/tasks/tools/install-minikube/) to install minikube.

### Deploy Cluster
```
minikube start
```
Clone this repository and apply the `kube` folder.
```
kubectl apply -f minikube
```

### Test Cluster
To test the API directly:
```
minikube service -n default --url gateway-service
```

### Cleaning Up
```
minikube delete
```
