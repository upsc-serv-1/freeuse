package com.anonymous.minimalist.services;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.app.usage.UsageStatsManager;
import android.app.usage.UsageEvents;
import android.content.pm.PackageManager;
import android.widget.Toast;

import androidx.core.app.NotificationCompat;
import androidx.lifecycle.Observer;

import com.anonymous.minimalist.R;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.HashSet;
import java.util.Set;

/**
 * Foreground Service that runs continuously to:
 * 1. Monitor the current foreground app
 * 2. Check against the blocklist
 * 3. Enforce time limits
 * 4. Launch blocking overlays when needed
 */
public class BlockingAndReminderService extends Service {

    private static final String CHANNEL_ID = "blocking_service_channel";
    private static final int NOTIFICATION_ID = 1001;

    private String lastPackageName = null;
    private final Handler pollingHandler = new Handler(Looper.getMainLooper());
    private final Set<String> blockedApps = new HashSet<>();
    private SharedPreferences preferences;
    private Observer<String> accessibilityObserver;

    private final Runnable pollingRunnable = new Runnable() {
        @Override
        public void run() {
            String currentApp = getForegroundPackage(BlockingAndReminderService.this);
            processAppChange(currentApp);
            pollingHandler.postDelayed(this, 5000);
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        preferences = getSharedPreferences("minimalist_prefs", MODE_PRIVATE);
        createNotificationChannel();
        startForeground(NOTIFICATION_ID, buildNotification());
        loadBlockedApps();

        // Listen to Accessibility Service
        accessibilityObserver = packageName -> processAppChange(packageName);
        AppAccessibilityService.activePackage.observeForever(accessibilityObserver);

        // Start fallback polling
        pollingHandler.post(pollingRunnable);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.hasExtra("blocked_apps")) {
            // Update blocked apps list from React Native bridge
            String blockedAppsJson = intent.getStringExtra("blocked_apps");
            updateBlockedApps(blockedAppsJson);
        }
        return START_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        pollingHandler.removeCallbacks(pollingRunnable);
        if (accessibilityObserver != null) {
            AppAccessibilityService.activePackage.removeObserver(accessibilityObserver);
        }
    }

    private void processAppChange(String packageName) {
        if (packageName == null || packageName.equals(lastPackageName)) {
            return;
        }

        lastPackageName = packageName;

        // Don't block our own app
        if (packageName.equals(getPackageName())) {
            return;
        }

        if (blockedApps.contains(packageName)) {
            // Launch blocking overlay
            Intent blockIntent = new Intent(this, com.anonymous.minimalist.ui.BlockOverlayActivity.class);
            blockIntent.putExtra("blocked_package", packageName);
            blockIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(blockIntent);
        }
    }

    private boolean isAccessibilityServiceActive() {
        // Check if our accessibility service is enabled
        String service = getPackageName() + "/" + AppAccessibilityService.class.getCanonicalName();
        try {
            int enabled = android.provider.Settings.Secure.getInt(
                getContentResolver(),
                android.provider.Settings.Secure.ACCESSIBILITY_ENABLED, 0
            );
            if (enabled == 1) {
                String enabledServices = android.provider.Settings.Secure.getString(
                    getContentResolver(),
                    android.provider.Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
                );
                return enabledServices != null && enabledServices.contains(service);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    private String getForegroundPackage(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
            return null;
        }
        UsageStatsManager usageStatsManager = (UsageStatsManager) context.getSystemService(Context.USAGE_STATS_SERVICE);
        long endTime = System.currentTimeMillis();
        long startTime = endTime - 10000;

        UsageEvents usageEvents = usageStatsManager.queryEvents(startTime, endTime);
        UsageEvents.Event event = new UsageEvents.Event();
        String lastForegroundApp = null;

        while (usageEvents.hasNextEvent()) {
            usageEvents.getNextEvent(event);
            if (event.getEventType() == UsageEvents.Event.ACTIVITY_RESUMED) {
                lastForegroundApp = event.getPackageName();
            }
        }
        return lastForegroundApp;
    }

    private void loadBlockedApps() {
        String json = preferences.getString("blocked_apps", "[]");
        updateBlockedApps(json);
    }

    private void updateBlockedApps(String json) {
        blockedApps.clear();
        try {
            JSONArray arr = new JSONArray(json);
            for (int i = 0; i < arr.length(); i++) {
                blockedApps.add(arr.getString(i));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "App Blocker Service",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Running service to block distracting apps");
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private Notification buildNotification() {
        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Minimalist Launcher")
            .setContentText("Protecting your focus")
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .build();
    }
}