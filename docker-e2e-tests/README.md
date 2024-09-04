# Docker nfid-wallet-client e2e tests
## Info
This file contains HOWTO instructions for running scripts on your environments

## Requirements
- Docker >= 17
- User with shell and rights to run docker
- Git for downloading repository
- Internet connection for downloading docker images from docker hub
- Base knowledge of Docker

*All instructions tested on Ubuntu 22, but they will work for other Linux system.*
*You can choose which you are familiar with.*

------------
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
- **TAG** - Version of Ubuntu base image. *( default: 22.04 )*
- **USER_ID** - Default user id. *( default: 1000 )*
- **GROUP_ID** - Default group id. *( default: 1000 )*
- **NODE_VERSION** - Preinstalled version of NodeJs. *( default: 16 )*

### Build Actions:
- Docker will create default user with name `user` and with provided or default `user id` and `group id`
- Download and install **NodeJs** and **Yarn**
- Install Stable Current release of **Chrome Browser**
- Copy inside Docker image `docker-entrypoint.sh` and `CI_OUTPUT.sh` scripts

## Run
- Mount source code to the inner directory `/home/user/workdir`
- Example of Run *(check option before run this command)*:
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

If you need custom **User Profile Directory** for Chrome Browser pls set `--user-data-dir=chrome-user-data-dir` and
mount or put directory with your profile to the `chrome-user-data-dir` directory inside your tests folder.

### Environment Variables:
- **WORKDIR** - Directory with source code inside Docker container *( default: /home/user/workdir )*
- **FRONTEND_PORT** - Port wich will be used for frontend start *( default: 9090 )*
- **CI_DEBUG** - Show CI debug messages during the run *( default: false )*

### List of files:
    .
    ├── CI_OUTPUT.sh            ( Color output libs for docker-entrypoint.sh )
    ├── docker-entrypoint.sh    ( Init script which run on docker start )
    ├── Dockerfile              ( Dockerfile for building the image )
    └── README.md               ( Current README file )

*Aproximate image size is 1.5 GB*