# Use Temurin JDK for Quarkus JVM mode
FROM eclipse-temurin:21-jre

WORKDIR /work/

# Copy the Quarkus build output
COPY build/quarkus-app/ /work/

EXPOSE 8080

# Run the Quarkus jar
CMD ["java", "-jar", "/work/quarkus-run.jar"]