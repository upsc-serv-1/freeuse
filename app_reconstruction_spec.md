# Minimalist Phone Clone: Architectural & Technical Reconstruction Spec

This document contains a comprehensive technical specification designed for an AI agent to reconstruct the app monitoring, time-reminder, and app-blocking features of the "minimalist phone" launcher app.

---

## 1. System Architecture & Workflows

To track active app usage and enforce time limits, the system operates on a dual-monitoring architecture combining a **Foreground Service** and an **Accessibility Service**.

```mermaid
graph TD
    subgraph System Setup
        U[User opens distracting app]
    end

    subgraph Accessibility Service (Priority Monitor)
        A[AccessibilityEvent: TYPE_WINDOW_STATE_CHANGED] -->|Sends package name| C[Active App Processor]
    end

    subgraph Polling Thread (Fallback Monitor)
        B[UsageStatsManager query every 5 seconds] -->|Extracts foreground package| C
    end

    subgraph Core Logic Service (Foreground Service)
        C --> D{Is package changed?}
        D -->|Yes| E[Dismiss current dialogs & Reset active timer]
        D -->|No/Yes| F{Is app on Blocklist?}
        F -->|Yes| G[Launch Blocking Activity Overlay]
        F -->|No| H{Is Time Reminder set?}
        H -->|Yes| I{Is Timer Expired?}
        H -->|No| J[Show Time Limit Selector Dialog]
        I -->|Yes| K[Reset Timer & Trigger Enforce Behavior]
        I -->|No (1 min left)| L[Show warning Toast]
    end

    K --> M[Simulate Home Intent / Close App Screen]
```

---

## 2. Core Components & Implementation Guidelines

### A. Android Manifest Configuration (`AndroidManifest.xml`)
To monitor other apps and display overlays, your app requires specific permissions and components:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.minimalistclone">

    <!-- Permissions required for monitoring and overlays -->
    <uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />

    <application>
        <!-- The Core Tracking Foreground Service -->
        <service
            android:name=".services.BlockingAndReminderService"
            android:foregroundServiceType="specialUse"
            android:exported="false" />

        <!-- Optional but Recommended Accessibility Service -->
        <service
            android:name=".services.AppAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

        <!-- Blocking overlay Activity -->
        <activity
            android:name=".ui.BlockOverlayActivity"
            android:theme="@style/Theme.AppCompat.Translucent"
            android:excludeFromRecents="true"
            android:exported="false" />
    </application>
</manifest>
```

#### Accessibility Configuration (`res/xml/accessibility_service_config.xml`):
```xml
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:accessibilityEventTypes="typeWindowStateChanged"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:accessibilityFlags="flagDefault"
    android:canRetrieveWindowContent="false"
    android:description="@string/accessibility_desc" />
```

---

### B. Accessibility Service Monitoring (`AppAccessibilityService.kt`)
When enabled, this service provides low-overhead, real-time events when the active window changes.

```kotlin
class AppAccessibilityService : AccessibilityService() {
    companion object {
        val activePackage = MutableLiveData<String?>()
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            val packageName = event.packageName?.toString()
            if (!packageName.isNullOrEmpty()) {
                activePackage.postValue(packageName)
            }
        }
    }

    override fun onInterrupt() {}
}
```

---

### C. UsageStats Polling Fallback (Kotlin)
If the user chooses not to enable the Accessibility Service, query the foreground app using `UsageStatsManager` inside a runnable scheduled every 5 seconds.

```kotlin
fun getForegroundPackage(context: Context): String? {
    val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    val endTime = System.currentTimeMillis()
    val startTime = endTime - 10000 // Look back 10 seconds

    val usageEvents = usageStatsManager.queryEvents(startTime, endTime)
    val event = UsageEvents.Event()
    var lastForegroundApp: String? = null

    while (usageEvents.hasNextEvent()) {
        usageEvents.getNextEvent(event)
        if (event.eventType == UsageEvents.Event.ACTIVITY_RESUMED) {
            lastForegroundApp = event.packageName
        }
    }
    return lastForegroundApp
}
```

---

### D. The Core Logic Loop (`BlockingAndReminderService.kt`)
The service operates as a Foreground Service showing an ongoing notification. It updates tracking states based on the active package name.

```kotlin
class BlockingAndReminderService : Service() {
    private var lastPackageName: String? = null
    private var timerEndTime: Long? = null
    private var reminderDialog: Dialog? = null

    // Handler loop for fallback polling
    private val pollingHandler = Handler(Looper.getMainLooper())
    private val pollingRunnable = object : Runnable {
        override fun run() {
            // Only poll if Accessibility Service is not active
            if (!isAccessibilityServiceActive()) {
                val currentApp = getForegroundPackage(this@BlockingAndReminderService)
                processAppChange(currentApp)
            }
            pollingHandler.postDelayed(this, 5000)
        }
    }

    override fun onCreate() {
        super.onCreate()
        startForegroundNotification()
        
        // Listen to Accessibility Service LiveData
        AppAccessibilityService.activePackage.observeForever { packageName ->
            processAppChange(packageName)
        }
        
        pollingHandler.post(pollingRunnable)
    }

    private fun processAppChange(packageName: String?) {
        if (packageName == lastPackageName) {
            checkActiveTimer()
            return
        }

        // App changed: dismiss current dialogs and reset state
        reminderDialog?.dismiss()
        reminderDialog = null
        lastPackageName = packageName

        if (packageName == null) return

        if (isBlocked(packageName)) {
            launchBlockActivity(packageName)
            return
        }

        if (isTimeReminderEnabled(packageName)) {
            val remindTime = getSavedReminderEndTime(packageName)
            if (remindTime == null) {
                // First launch of the distracting app: show selection dialog
                showTimeSelectorDialog(packageName)
            } else {
                timerEndTime = remindTime
            }
        }
    }

    private fun checkActiveTimer() {
        val endTime = timerEndTime ?: return
        val timeLeftMs = endTime - System.currentTimeMillis()

        if (timeLeftMs <= 0) {
            // Time is up!
            timerEndTime = null
            clearSavedReminder(lastPackageName)
            enforceTimeUpBehavior(lastPackageName)
        } else if (timeLeftMs in 59000..60000) {
            // Warn when 1 minute remains
            showOneMinuteWarningToast(lastPackageName)
        }
    }

    private fun enforceTimeUpBehavior(packageName: String?) {
        // Option 1: Simulate pressing the home button to close the app
        val homeIntent = Intent(Intent.ACTION_MAIN).apply {
            addCategory(Intent.CATEGORY_HOME)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        startActivity(homeIntent)

        // Option 2: Show overlay notification or Block Screen
        Toast.makeText(this, "Time is up for $packageName!", Toast.LENGTH_LONG).show()
    }
}
```

---

### E. Database Schema & State Management (Shared Preferences / Room)
To persist configured limits and track active timers even if the service restarts, maintain a settings repository:

1.  **Blocklist Configuration:**
    *   Key: `blocked_apps` -> JSON list of package names (e.g. `["com.instagram.android", "com.zhiliaoapp.musically"]`).
2.  **App Reminder Configurations:**
    *   Key: `reminder_settings_[package_name]` -> Store configuration limits.
3.  **Active Session End Time:**
    *   Key: `active_timer_end_[package_name]` -> Timestamp in milliseconds when the active timer should expire. (Cleared when app is closed).

---

## 3. UI Design Principles for Reconstruction Spec
To preserve the minimalist phone design style, the UI/UX constructed by your AI agent should adhere to:
*   **Monochrome Typography:** Text-based layouts using high-contrast typography (Google Fonts *Inter* or *Outfit* recommended) instead of colorful grid icons.
*   **Translucent Dialog overlays:** Use glassmorphism or dark transparent layouts for the Selector dialog (`s3/s1;`), presenting duration chips (`1 min`, `5 min`, `15 min`) in a clean, vertical layout.

---

## 4. Auxiliary Features Specifications

### A. Monochrome (Grayscale) Mode (`MonochromeModeService.kt`)
Forces the display (or specific apps) into grayscale to reduce dopamine triggers from colorful UI designs.
*   **System Implementation:** Uses secure settings write or a grayscale accessibility color adjustment overlay.
*   **Service Integration:** When a monitored app launches, the service triggers grayscale mode globally or sets a system-wide color filter matrix.
```kotlin
// Grayscale Color Matrix applied to window overlay or Accessibility service
val grayscaleMatrix = ColorMatrix().apply {
    setSaturation(0f)
}
val filter = ColorMatrixColorFilter(grayscaleMatrix)
paint.colorFilter = filter
```

### B. Hidden Apps & Custom Folders
*   **Hidden Apps:** Store hidden app package names in your configuration repository. During home screen listing, filter out apps matching the hidden list.
*   **Folder Elements:** To group apps under text headers (Folders) without using standard icon-grid views, maintain a database linking packages to folder categories. Group elements as text-nested expandables.

### C. App Renaming (Alias Display Names)
*   **Staging Entity:** To allow users to rename tempting apps (e.g. renaming "Instagram" to "Distraction 1"), store local alias values in a Room database:
```kotlin
@Entity(tableName = "renamed_apps")
data class RenamedApp(
    @PrimaryKey val packageName: String,
    val aliasName: String
)
```
*   **Launcher Adapter Integration:** When rendering lists of applications, check this entity list. If an alias name exists, render the alias instead of the app's standard ApplicationInfo label.

### D. Notification Manager / Filter Service (`NotificationManagerService.kt`)
Intercepts notifications from distracting apps to bundle them or display them within a custom history view in the launcher.
*   **System Permission Requirement:**
    *   Requires declaration of the service binding the `BIND_NOTIFICATION_LISTENER_SERVICE` permission in `AndroidManifest.xml`.
    *   Requires the user to manually grant "Notification Access" in Android System Settings.
*   **Implementation Blueprint:**
```kotlin
class NotificationManagerService : NotificationListenerService() {
    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val packageName = sbn.packageName
        if (isNotificationFilteringEnabledFor(packageName)) {
            // Cancel notification instantly from showing in status bar
            cancelNotification(sbn.key)
            // Persist notification detail in local db to render inside a Custom Inbox UI
            saveNotificationToInboxDb(sbn)
        }
    }
}
```

---

## 5. Premium-by-Default Activation Strategy

To reconstruct the app as a **fully unlocked premium clone** (matching the bypassed mod logic in the RE target):

1.  **Do Not Include Billing Libraries:** Remove `com.android.vending.BILLING` permissions and the Google Play Billing Library.
2.  **Omit the Paywall Flow:** Delete paywall screens (like `HardPaywallActivity`) and intro trial screens.
3.  **Hardcode Premium Flags:** Inside your settings manager/repository class, ensure state verification methods (like `isPremiumUser()` or `isProActive()`) hardcode-return `true` directly:
```kotlin
object LicenseManager {
    fun isPremiumUnlocked(): Boolean = true
    fun isSubscriptionActive(): Boolean = true
}
```
4.  **Bypass Feature Gating:** Integrate `LicenseManager.isPremiumUnlocked()` at all feature entry points (custom fonts selection, unlimited schedule creations, hidden app additions, and advanced notification filters) so they immediately evaluate as unlocked.


