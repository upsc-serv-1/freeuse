package com.anonymous.minimalist.bridge;

import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.Promise;

import com.anonymous.minimalist.services.BlockingAndReminderService;

import org.json.JSONArray;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nonnull;

/**
 * React Native Bridge Module that allows the JS UI to communicate
 * with the native Android blocking services.
 */
public class AppBlockerModule extends ReactContextBaseJavaModule {

    private static final String TAG = "AppBlockerModule";
    private static final String PREFS_NAME = "minimalist_prefs";

    public AppBlockerModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    @Nonnull
    public String getName() {
        return "AppBlockerModule";
    }

    /**
     * Update the list of blocked apps on the native side.
     * This is called from React Native whenever the user changes their blocklist.
     */
    @ReactMethod
    public void updateBlockedApps(ReadableArray blockedPackages, Promise promise) {
        try {
            // Save to SharedPreferences (fast local storage)
            SharedPreferences prefs = getReactApplicationContext()
                .getSharedPreferences(PREFS_NAME, ReactApplicationContext.MODE_PRIVATE);

            JSONArray jsonArray = new JSONArray();
            for (int i = 0; i < blockedPackages.size(); i++) {
                jsonArray.put(blockedPackages.getString(i));
            }

            prefs.edit().putString("blocked_apps", jsonArray.toString()).apply();

            // Send to the foreground service
            Intent intent = new Intent(getReactApplicationContext(), BlockingAndReminderService.class);
            intent.putExtra("blocked_apps", jsonArray.toString());
            getReactApplicationContext().startService(intent);

            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Failed to update blocked apps", e);
            promise.reject("UPDATE_ERROR", e.getMessage());
        }
    }

    /**
     * Start the foreground blocking service.
     */
    @ReactMethod
    public void startBlockingService(Promise promise) {
        try {
            Intent intent = new Intent(getReactApplicationContext(), BlockingAndReminderService.class);
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                getReactApplicationContext().startForegroundService(intent);
            } else {
                getReactApplicationContext().startService(intent);
            }
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Failed to start blocking service", e);
            promise.reject("START_ERROR", e.getMessage());
        }
    }

    /**
     * Check if the accessibility service is enabled.
     */
    @ReactMethod
    public void isAccessibilityServiceEnabled(Promise promise) {
        try {
            String service = getReactApplicationContext().getPackageName() + "/" +
                "com.anonymous.minimalist.services.AppAccessibilityService";
            int enabled = android.provider.Settings.Secure.getInt(
                getReactApplicationContext().getContentResolver(),
                android.provider.Settings.Secure.ACCESSIBILITY_ENABLED, 0
            );
            if (enabled == 1) {
                String enabledServices = android.provider.Settings.Secure.getString(
                    getReactApplicationContext().getContentResolver(),
                    android.provider.Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
                );
                promise.resolve(enabledServices != null && enabledServices.contains(service));
            } else {
                promise.resolve(false);
            }
        } catch (Exception e) {
            promise.resolve(false);
        }
    }

    /**
     * Open the usage access settings so the user can grant permission.
     */
    @ReactMethod
    public void openUsageAccessSettings() {
        Intent intent = new Intent(android.provider.Settings.ACTION_USAGE_ACCESS_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getReactApplicationContext().startActivity(intent);
    }

    /**
     * Open the accessibility settings so the user can enable our service.
     */
    @ReactMethod
    public void openAccessibilitySettings() {
        Intent intent = new Intent(android.provider.Settings.ACTION_ACCESSIBILITY_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getReactApplicationContext().startActivity(intent);
    }

    /**
     * Open the battery optimization settings.
     */
    @ReactMethod
    public void openBatteryOptimizationSettings() {
        Intent intent = new Intent(android.provider.Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getReactApplicationContext().startActivity(intent);
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("MODULE_NAME", "AppBlockerModule");
        return constants;
    }
}