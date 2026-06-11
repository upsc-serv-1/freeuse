package com.anonymous.minimalist.ui;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.widget.TextView;

import com.anonymous.minimalist.R;

/**
 * Translucent overlay activity that shows a blocking screen
 * when the user tries to open a blocked/distracting app.
 */
public class BlockOverlayActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Make sure this appears over other apps
        getWindow().addFlags(
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL |
            WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH |
            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN |
            WindowManager.LayoutParams.FLAG_LAYOUT_INSET_DECOR |
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
        );

        setContentView(new View(this)); // Minimal view - in production, inflate a real layout

        String blockedPackage = getIntent().getStringExtra("blocked_package");

        // Close the blocked app by sending a home intent
        Intent homeIntent = new Intent(Intent.ACTION_MAIN);
        homeIntent.addCategory(Intent.CATEGORY_HOME);
        homeIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(homeIntent);

        // Finish this overlay
        finish();
    }
}