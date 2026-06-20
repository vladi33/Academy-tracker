FROM eclipse-temurin:21-jre-jammy
WORKDIR /app


COPY tracker/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]