# -------- Build Stage --------
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Cache dependencies separately (only re-downloads if pom.xml changes)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build the application
COPY src ./src
RUN mvn clean package -DskipTests

# Extract layers for better Docker caching
# In Spring Boot 3.2+ the format changed, and layertools works on the jar
RUN java -Djarmode=layertools -jar target/*.jar extract

# -------- Run Stage --------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Add a non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy the extracted layers from the build stage
COPY --from=build /app/dependencies/ ./
COPY --from=build /app/spring-boot-loader/ ./
COPY --from=build /app/snapshot-dependencies/ ./
COPY --from=build /app/application/ ./

# Port documentation
EXPOSE 8080

# Profile defaults
ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8080

# Use standard JarLauncher. (Spring Boot 3.2+ uses JarLauncher)
# This handles the layered jars correctly
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher --server.port=${PORT:-8080}"]
