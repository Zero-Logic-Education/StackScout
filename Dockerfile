# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Копируем только файлы для разрешения зависимостей
COPY settings.gradle.kts ./
COPY gradlew ./
COPY gradle/wrapper ./gradle/wrapper
COPY backend/build.gradle.kts backend/gradle.properties ./backend/

# Копируем исходный код
COPY backend/src ./backend/src

# Собираем приложение
RUN chmod +x ./gradlew && ./gradlew build -x test --no-daemon

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Устанавливаем wget для health checks
RUN apk add --no-cache wget

# Создаем непривилегированного пользователя
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Копируем JAR файл
COPY --from=build /app/backend/build/libs/*-SNAPSHOT.jar app.jar

EXPOSE 8081

# Оптимизированные JVM параметры для контейнера
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-XX:InitialRAMPercentage=50.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]