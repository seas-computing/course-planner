#!/bin/bash

case "$TRAVIS_BRANCH" in
  main) 
    # Tag the docker image built from main as "stable"
    DOCKER_TAG=stable
    ;;
  develop)
    # Tag the docker image built from develop as "qa"
    DOCKER_TAG=qa
    ;;
  *)
    # Exit cleanly on any other branch
    exit 0
    ;;
esac

# log into our docker-robot account
echo "$DOCKER_PASSWORD" | docker login --username "$DOCKER_USERNAME" --password-stdin

# grab a reference to the repo name (without the org name)
REPO_NAME=$(echo $TRAVIS_REPO_SLUG | gawk -F/ '{print $2}')

# tag the image built by travis with our docker org name and project name, with
# the proper tag
docker tag $TRAVIS_REPO_SLUG:$TRAVIS_BRANCH seascomputing/$REPO_NAME:$DOCKER_TAG

## push the image our docker hub repo
docker push seascomputing/$REPO_NAME:$DOCKER_TAG

# Log out of docker
docker logout
