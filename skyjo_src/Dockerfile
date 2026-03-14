FROM eclipse-temurin:21-jre
WORKDIR /work/
COPY build/quarkus-app/lib/ /work/lib/
COPY build/quarkus-app/*.jar /work/
COPY build/quarkus-app/app/ /work/app/
COPY build/quarkus-app/quarkus/ /work/quarkus/
EXPOSE  1023
CMD ["java", "-jar", "/work/quarkus-run.jar"]