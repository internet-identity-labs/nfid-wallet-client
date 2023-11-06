ARG TAG=22.04
FROM ubuntu:${TAG}

ARG USER_ID=1000
ARG GROUP_ID=1000
ARG NODE_VERSION=18

RUN echo 'debconf debconf/frontend select teletype' | debconf-set-selections
RUN apt-get update && apt-get upgrade -y && apt-get install -y sudo apt-utils curl wget git ca-certificates gnupg \
    && if [ -z "`getent group ${GROUP_ID}`" ]; then \
        addgroup --system --gid ${GROUP_ID} user; \
    else \
        groupmod -n user `getent group ${GROUP_ID} | cut -d: -f1`; \
    fi \
    && if [ -z "`getent passwd ${USER_ID}`" ]; then \
        adduser --system --uid ${USER_ID} --ingroup user --shell /bin/sh user; \
    else \
        usermod -l user -g ${GROUP_ID} -d /home/user -m `getent passwd ${USER_ID} | cut -d: -f1`; \
    fi

# Install NODE
RUN mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_VERSION.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y nodejs

# Install YARN
RUN mkdir -p /etc/apt/keyrings \
    && curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor -o /etc/apt/keyrings/yarnkey.gpg >/dev/null \
    && echo "deb [signed-by=/etc/apt/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian stable main" | sudo tee /etc/apt/sources.list.d/yarn.list \
    && apt-get update && apt-get install -y yarn

# Install Chrome
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && dpkg -i google-chrome-stable_current_amd64.deb || true \
    && apt-get -f install -y \
    && ln -s /usr/bin/google-chrome /usr/local/bin/chrome \
    && rm -f google-chrome-stable_current_amd64.deb

RUN apt-get clean                 \
    && rm -rf                     \
    /var/lib/apt/lists/*          \
    /var/log/alternatives.log     \
    /var/log/apt/history.log      \
    /var/log/apt/term.log         \
    /var/log/dpkg.log             \
    /etc/machine-id               \
    /var/lib/dbus/machine-id

COPY docker-entrypoint.sh /usr/bin/
COPY CI_OUTPUT.sh /usr/src
RUN chmod +x /usr/bin/docker-entrypoint.sh /usr/src/CI_OUTPUT.sh

WORKDIR /home/user/workdir

USER user

ENTRYPOINT [ "docker-entrypoint.sh" ]
