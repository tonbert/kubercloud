docker build -t hammeran/kubercloud-client:latest -t hammeran/kubercloud-client:$SHA -f ./client/Dockerfile ./client
docker build -t hammeran/kubercloud-server:latest -t hammeran/kubercloud-server:$SHA -f ./server/Dockerfile ./server
docker build -t hammeran/kubercloud-worker:latest -t hammeran/kubercloud-worker:$SHA -f ./worker/Dockerfile ./worker

docker push hammeran/kubercloud-client:latest
docker push hammeran/kubercloud-server:latest
docker push hammeran/kubercloud-worker:latest

docker push hammeran/kubercloud-client:$SHA
docker push hammeran/kubercloud-server:$SHA
docker push hammeran/kubercloud-worker:$SHA

kubectl apply -f k8s/

kubectl set image deployments/client-puppetmaster client=hammeran/kubercloud-client:$SHA
kubectl set image deployments/server-puppetmaster server=hammeran/kubercloud-server:$SHA
kubectl set image deployments/worker-puppetmaster worker=hammeran/kubercloud-worker:$SHA

