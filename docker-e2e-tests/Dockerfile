ARG NODE_VERSION=22.18.0
FROM node:${NODE_VERSION}-slim

# Use non-root user
ARG USER_ID=1000
ARG GROUP_ID=1000
RUN groupadd -g ${GROUP_ID} user \
    && useradd -m -u ${USER_ID} -g ${GROUP_ID} -s /bin/sh user
USER user

WORKDIR /home/user/workdir

# Install dependencies
RUN apt-get update && apt-get install -y \
    sudo curl wget git ca-certificates gnupg apt-utils \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Chrome for E2E
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && sudo dpkg -i google-chrome-stable_current_amd64.deb || sudo apt-get -f install -y \
    && ln -s /usr/bin/google-chrome /usr/local/bin/chrome \
    && rm -f google-chrome-stable_current_amd64.deb

# Install Yarn via Corepack (simpler than apt)
RUN corepack enable && corepack prepare yarn@stable --activate

# Copy scripts
COPY docker-entrypoint.sh /usr/bin/
COPY CI_OUTPUT.sh /usr/src
RUN chmod +x /usr/bin/docker-entrypoint.sh /usr/src/CI_OUTPUT.sh

ENTRYPOINT ["docker-entrypoint.sh"]
