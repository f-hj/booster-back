#!/bin/bash

helm --namespace booster install stable/postgresql \
  --name postgresql \
  --set persistence.storageClass=nfs \
  --set postgresqlDatabase=booster \
  --set postgresqlUsername=booster