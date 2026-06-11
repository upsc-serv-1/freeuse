package com.anonymous.minimalist.ui;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.TextView;

import com.anonymous.minimalist.R;

/**
 * Full-screen blocking overlay that shows a "This App is Blocked" message.
 * Unlike the previous version, it does NOT immediately send a home intent.
 * Instead it displays a blocking UI with a "Go back to Home" button,
 * giving the user a clear reason why the app was blocked.
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
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
        );

        // Inflate the beautiful blocking layout
        setContentView(R.layout.activity_block_overlay);

        // Show which app was blocked
        String blockedPackage = getIntent().getStringExtra("blocked_package");
        TextView appNameView = findViewById(R.id.blocked_app_name);
        if (blockedPackage != null && appNameView != null) {
            appNameView.setText(blockedPackage);
        }

        // When user taps "Go back to Home", send them home and close overlay
        Button goHomeButton = findViewById(R.id.btn_go_home);
        goHomeButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Close the blocked app by sending a home intent
                Intent homeIntent = new Intent(Intent.ACTION_MAIN);
                homeIntent.addCategory(Intent.CATEGORY_HOME);
                homeIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(homeIntent);

                // Close this overlay
                finish();
            }
        });
    }

    @Override
    public void onBackPressed() {
        // Block back button — user must tap "Go back to Home"
        // Optionally could show a toast: "Press the button to go home"
    }
}