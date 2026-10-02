plugins { id("com.android.application") }
android {
    namespace = "com.iseseponbele.digitalopele"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.iseseponbele.digitalopele"
        minSdk = 24
        targetSdk = 35
        versionCode = 3
        versionName = "3.0.0"
    }
    androidResources {
        noCompress += "js"
    }
}
