FROM node:10-stretch

ARG ID

RUN : "${ID:?Build argument needs to be set and non-empty.}"

SHELL ["/bin/bash", "-c"]

RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y \
  yasm \
  python \
  gcc \
  g++ \
  cmake \
  make \
  curl \
  wget \
  apt-transport-https \
  m4 \
  zip \
  unzip \
  vim

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install yarn -y

RUN mkdir smpc-player
COPY . /smpc-player

RUN git clone https://github.com/Athena-MHMD/SCALE-MAMBA.git

WORKDIR /SCALE-MAMBA
RUN ./install_dependencies.sh

RUN echo 'export mylocal="$HOME/local"' >> ~/.bashrc
RUN echo 'export PATH="${mylocal}/openssl/bin/:${PATH}"' >> ~/.bashrc
RUN echo 'export C_INCLUDE_PATH="${mylocal}/openssl/include/:${C_INCLUDE_PATH}"' >> ~/.bashrc
RUN echo 'export CPLUS_INCLUDE_PATH="${mylocal}/openssl/include/:${CPLUS_INCLUDE_PATH}"' >> ~/.bashrc
RUN echo 'export LIBRARY_PATH="${mylocal}/openssl/lib/:${LIBRARY_PATH}"' >> ~/.bashrc
RUN echo 'export LD_LIBRARY_PATH="${mylocal}/openssl/lib/:${LD_LIBRARY_PATH}"' >> ~/.bashrc
RUN echo 'export C_INCLUDE_PATH="${mylocal}/mpir/include/:${C_INCLUDE_PATH}"' >> ~/.bashrc
RUN echo 'export CPLUS_INCLUDE_PATH="${mylocal}/mpir/include/:${CPLUS_INCLUDE_PATH}"' >> ~/.bashrc
RUN echo 'export LIBRARY_PATH="${mylocal}/mpir/lib/:${LIBRARY_PATH}"' >> ~/.bashrc
RUN echo 'export LD_LIBRARY_PATH="${mylocal}/mpir/lib/:${LD_LIBRARY_PATH}"' >> ~/.bashrc
RUN echo 'export CPLUS_INCLUDE_PATH="${mylocal}/cryptopp/include/:${CPLUS_INCLUDE_PATH}"' >> ~/.bashrc
RUN echo 'export LIBRARY_PATH="${mylocal}/cryptopp/lib/:${LIBRARY_PATH}"' >> ~/.bashrc
RUN echo 'export LD_LIBRARY_PATH="${mylocal}/cryptopp/lib/:${LD_LIBRARY_PATH}"' >> ~/.bashrc

RUN source ~/.bashrc

RUN cp CONFIG CONFIG.mine

RUN echo 'ROOT = $HOME/SCALE-MAMBA' >> CONFIG.mine
RUN echo 'OSSL = ${mylocal}/openssl' >> CONFIG.mine

RUN make progs

WORKDIR /smpc-player
RUN ./install.sh

RUN mkdir certs

RUN touch .env
RUN echo 'PORT=3000' >> .env
RUN echo 'SMPC_ENGINE=/SCALE-MAMBA' >> .env
RUN echo 'ID=${ID}' >> .env
RUN echo 'NODE_ENV=production' >> .env
RUN echo 'PEM_KEY=./certs/PlayerWeb${ID}.key' >> .env
RUN echo 'PEM_CERT=./certs/PlayerWeb${ID}.pem' >> .env
RUN echo 'ROOT_CA=./certs/RootCA.pem' >> .env

CMD ["node", "player.js"]
