# Docker nfid-wallet-client e2e tests

## Info

This file contains HOWTO instructions for running scripts on your environments

## Requirements

- Docker >= 17
- User with shell and rights to run docker
- Git for downloading repository
- Internet connection for downloading docker images from docker hub
- Base knowledge of Docker

_All instructions tested on Ubuntu 22, but they will work for other Linux system._
_You can choose which you are familiar with._

---

## About

This project contains tools for **[nfid-wallet-client](https://github.com/internet-identity-labs/nfid-wallet-client/)** e2e tests.

The docker container will contain such packages:

- **Node**
- **Yarn**
- **cUrl**
- **Wget**
- **GIT**
- **Chrome Browser**
- other libs and tools

## Build

- Open shell in the folder which contains Dockerfile
- Run `docker build -t test:e2e .`

### Build Arguments:

- **TAG** - Version of Ubuntu base image. _( default: 22.04 )_
- **USER_ID** - Default user id. _( default: 1000 )_
- **GROUP_ID** - Default group id. _( default: 1000 )_
- **NODE_VERSION** - Preinstalled version of NodeJs. _( default: 16 )_

### Build Actions:

- Docker will create default user with name `user` and with provided or default `user id` and `group id`
- Download and install **NodeJs** and **Yarn**
- Install Stable Current release of **Chrome Browser**
- Copy inside Docker image `docker-entrypoint.sh` and `CI_OUTPUT.sh` scripts

## Run

- Mount source code to the inner directory `/home/user/workdir`
- Example of Run _(check option before run this command)_:

```
docker run --rm -it \
    -v $(pwd):/home/user/workdir \
    -v npmrc_file:/home/user/.npmrc \
    --env-file docker_env \
    -e CI_DEBUG=true \
    test:e2e
```

Docker will run `docker-entrypoint.sh` script, which will build and run **frontend**.
After that it will run `nfid-wallet-client-e2e` tests.
Be sure that you set such options for browser:

- **--no-sandbox**
- **--disable-dev-shm-usage**

### Environment Variables:

- **WORKDIR** - Directory with source code inside Docker container _( default: /home/user/workdir )_
- **FRONTEND_PORT** - Port wich will be used for frontend start _( default: 9090 )_
- **CI_DEBUG** - Show CI debug messages during the run _( default: false )_

### List of files:

    .
    ├── CI_OUTPUT.sh            ( Color output libs for docker-entrypoint.sh )
    ├── docker-entrypoint.sh    ( Init script which run on docker start )
    ├── Dockerfile              ( Dockerfile for building the image )
    └── README.md               ( Current README file )

_Aproximate image size is 1.5 GB_
