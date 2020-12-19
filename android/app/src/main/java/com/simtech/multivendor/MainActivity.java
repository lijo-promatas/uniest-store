package com.simtech.multivendor;

import android.view.Gravity;
import android.graphics.Color;
import android.widget.ImageView;

import android.graphics.drawable.Drawable;
import android.support.v4.content.ContextCompat;
import android.widget.LinearLayout;

import com.reactnativenavigation.controllers.SplashActivity;

public class MainActivity extends SplashActivity {
    @Override
    public LinearLayout createSplashLayout() {
        LinearLayout splash = new LinearLayout(this);
        Drawable launch_screen_bitmap = ContextCompat.getDrawable(getApplicationContext(), R.drawable.splash);
        splash.setBackground(launch_screen_bitmap);

        return splash;
    }
}
