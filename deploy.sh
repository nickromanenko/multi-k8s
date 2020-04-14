docker build -t nickrockstar/complex-multi-client:latest -t nickrockstar/complex-multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t nickrockstar/complex-multi-worker:latest -t nickrockstar/complex-multi-worker:$SHA -f ./worker/Dockerfile ./worker
docker build -t nickrockstar/complex-multi-api:latest -t nickrockstar/complex-multi-api:$SHA -f ./api/Dockerfile ./api
docker push nickrockstar/complex-multi-client:latest
docker push nickrockstar/complex-multi-client:$SHA
docker push nickrockstar/complex-multi-worker:latest
docker push nickrockstar/complex-multi-worker:$SHA
docker push nickrockstar/complex-multi-api:latest
docker push nickrockstar/complex-multi-api:$SHA
kubectl apply -f k8s
kubectl set image deployments/client-deployment client=nickrockstar/complex-multi-client:$SHA
kubectl set image deployments/worker-deployment worker=nickrockstar/complex-multi-worker:$SHA
kubectl set image deployments/api-deployment api=nickrockstar/complex-multi-api:$SHA