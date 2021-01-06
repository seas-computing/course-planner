#!/bin/bash
echo "$DOCKER_PASSWORD" | docker login --username "$DOCKER_USERNAME" --password-stdin
DOCKER_TAG=""
if [ "$TRAVIS_BRANCH" == "develop" ]; then
  DOCKER_TAG=qa
fi
if [ "$TRAVIS_BRANCH" == "main" ]; then
  DOCKER_TAG=stable
fi

if [ "$DOCKER_TAG" != "" ]; then
  REPO_NAME=$(echo $TRAVIS_REPO_SLUG | gawk -F/ '{print $2}')
  docker tag $TRAVIS_REPO_SLUG:$TRAVIS_BRANCH seascomputing/$REPO_NAME:$DOCKER_TAG
  docker push seascomputing/$REPO_NAME:$DOCKER_TAG
fi
