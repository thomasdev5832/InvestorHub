import org.jetbrains.kotlin.gradle.tasks.KotlinCompile
import org.springframework.boot.gradle.tasks.run.BootRun

val commonsIoVersion = "2.18.0"
val errorHandlingVersion = "4.5.0"
val web3jCoreVersion = "4.12.3"
val springDocApiVersion = "2.7.0"
val ulidjVersion = "1.0.4"

plugins {
    id("org.springframework.boot") version "3.4.1"
    id("io.spring.dependency-management") version "1.1.7"
    kotlin("jvm") version "1.9.25"
    kotlin("plugin.spring") version "1.9.25"
    kotlin("plugin.allopen") version "1.9.25"
}

group = "io.sevenseven.staking.aggregator.service"
version = "1.0.0"

java.sourceCompatibility = JavaVersion.VERSION_21
java.targetCompatibility = JavaVersion.VERSION_21

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-undertow")
    modules {
        module("org.springframework.boot:spring-boot-starter-tomcat") {
            replacedBy("org.springframework.boot:spring-boot-starter-undertow", "Use Undertow instead of Tomcat")
        }
    }
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
    implementation("org.springframework.boot:spring-boot-starter-data-mongodb")
    implementation("io.github.wimdeblauwe:error-handling-spring-boot-starter:$errorHandlingVersion")
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:$springDocApiVersion")
    implementation("org.springframework.boot:spring-boot-starter-mail")
    implementation("org.springframework.boot:spring-boot-starter-websocket")
//    implementation("org.flywaydb:flyway-database-mongodb")
    implementation("commons-io:commons-io:$commonsIoVersion")
    implementation("org.springframework.boot:spring-boot-starter-logging")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("io.azam.ulidj:ulidj:$ulidjVersion")
    implementation("org.web3j:core:$web3jCoreVersion")


    developmentOnly("org.springframework.boot:spring-boot-devtools")
//    developmentOnly("org.springframework.boot:spring-boot-docker-compose")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

allOpen {
    annotation("org.springframework.data.mongodb.core.mapping.Document")
}

tasks.getByName<BootRun>("bootRun") {
    environment["SPRING_PROFILES_ACTIVE"] = environment["SPRING_PROFILES_ACTIVE"] ?: "local"
}

tasks.withType<KotlinCompile>().all {
    kotlinOptions {
        freeCompilerArgs = listOf("-Xjsr305=strict")
        jvmTarget = JavaVersion.VERSION_21.toString()
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}
