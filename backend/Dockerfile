FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /workspace

COPY tracker/pom.xml ./pom.xml
RUN mvn -B dependency:go-offline

COPY tracker/src ./src
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
