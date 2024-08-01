FROM node:20.2.0

ARG PROJECT_NAME
ARG USER_NAME
ENV TZ=Asia/Tokyo

RUN corepack enable npm yarn

USER ${USER_NAME}

WORKDIR /home/${USER_NAME}/${PROJECT_NAME}

EXPOSE 3000

CMD ["bash", "-c", "node -r ./.pnp.cjs $(yarn bin next) dev"]
