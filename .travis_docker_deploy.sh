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

# grab a reference to the repo name (without the org name)
REPO_NAME=$(echo $TRAVIS_REPO_SLUG | gawk -F/ '{print $2}')

# tag the image built by travis with our docker org name and project name, with
# the proper tag
docker tag $TRAVIS_REPO_SLUG:$TRAVIS_BRANCH seascomputing/$REPO_NAME:$DOCKER_TAG

# push the image our docker hub repo
docker push seascomputing/$REPO_NAME:$DOCKER_TAG

# get the text of the current git tag, if it exists. This should have been set
# by the .travis_version_bump script in the before_deploy hook 
GIT_TAG=`git tag --points-at HEAD`

# When there's a valid tag on the current branch, also tag the container
# with that and push to Docker Hub
if [[ -n $GIT_TAG ]]; then
  docker tag $TRAVIS_REPO_SLUG:$TRAVIS_BRANCH seascomputing/$REPO_NAME:$GIT_TAG
  docker push seascomputing/$REPO_NAME:$GIT_TAG
fi
