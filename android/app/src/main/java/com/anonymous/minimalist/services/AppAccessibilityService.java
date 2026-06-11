package com.anonymous.minimalist.services;

import android.accessibilityservice.AccessibilityService;
import android.view.accessibility.AccessibilityEvent;

import androidx.lifecycle.MutableLiveData;

/**
 * Accessibility Service that monitors the current foreground app.
 * This provides real-time events when the user switches between apps,
 * allowing the blocking service to intercept distracting apps immediately.
 */
public class AppAccessibilityService extends AccessibilityService {

    public static final MutableLiveData<String> activePackage = new MutableLiveData<>(null);

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event.getEventType() == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            String packageName = event.getPackageName() != null ? event.getPackageName().toString() : null;
            if (packageName != null && !packageName.isEmpty()) {
                activePackage.postValue(packageName);
            }
        }
    }

    @Override
    public void onInterrupt() {
        // Service was interrupted
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        activePackage.postValue(null);
    }
}