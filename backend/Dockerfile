FROM gradle:8.10-jdk17

WORKDIR /app

COPY . .

RUN gradle clean build --no-daemon

EXPOSE 7070

CMD ["gradle", "run", "--no-daemon"]