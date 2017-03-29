package com.example.x230i.myapplication;

import android.app.AlertDialog;
import android.content.Context;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.JsResult;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;


public class MainActivity extends AppCompatActivity {

    WebView webView = null;
    String mode = null;
    String ip = "192.168.0.10";
    String airDataString = null; // JSON format
    String targetDataString = null; // JSON format

    WebViewClient mWebViewClient = new WebViewClient() {
        @Override public boolean shouldOverrideUrlLoading( WebView view, String url) { return false; }

    };
    String url = "file:///android_asset/AirSpace/index.html";
//    String url = "file:///android_asset/test.html";
//    String url = "http://google.com";
//
    @JavascriptInterface
    public void showToast(String str) {
        Toast.makeText(this,str, Toast.LENGTH_SHORT).show();
    }
    @JavascriptInterface
    public String getMode(){
        return String.valueOf(mode);
    }
    @JavascriptInterface
    public void setMode(String str){
        this.mode = str;
    }
    @JavascriptInterface
    public String getIP(){
        return String.valueOf(ip);
    }
    @JavascriptInterface
    public void setIP(String str){
        this.ip = str;
    }
    @JavascriptInterface
    public String getAirDataString(){
        System.out.println(airDataString);
        return airDataString;
    }
    @JavascriptInterface
    public void setAirDataString(String str){
        this.airDataString = str;
    }
    @JavascriptInterface
    public String getTargetDataString(){
        return this.targetDataString;
    }
    @JavascriptInterface
    public void setTargetDataString(String str){
        this.targetDataString = str;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        showToast("app start");
        setContentView(R.layout.activity_main);
        webView = (WebView)findViewById(R.id.webView);
        webView.setWebViewClient(mWebViewClient);
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(
                    String origin,
                    GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }
        });

        webView.setInitialScale(1);
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);
        webView.getSettings().setLoadWithOverviewMode(true);
        webView.getSettings().setUseWideViewPort(true);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setGeolocationEnabled(true);
        // HTML5 API flags
        webView.getSettings().setAppCacheEnabled(true);
        webView.getSettings().setAppCachePath(this.getApplicationContext().getDir("cache", Context.MODE_PRIVATE).getPath());
        webView.getSettings().setDatabaseEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.addJavascriptInterface(this,"android");
        webView.getSettings().setGeolocationDatabasePath(getFilesDir().getPath());
//        webView.getSettings().setDatabasePath(this.getApplicationContext().getDir("database", Context.MODE_PRIVATE).getPath());
        webView.getSettings().setDatabasePath("/data/data/" + getPackageName() + "/databases");
//        webView.getSettings().setUserAgentString("Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.0.4) Gecko/20100101 Firefox/4.0");

        // disable scroll on touch
        webView.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View v, MotionEvent event) {
                return (event.getAction() == MotionEvent.ACTION_MOVE);
            }
        });

        webView.loadUrl(url);

    }// end of inCreate(.)

    // 覆寫掉返回鍵的功能，改為webView的上一頁功能，預設為關掉activity
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (event.getAction() == KeyEvent.ACTION_DOWN) {
            switch (keyCode) {
                case KeyEvent.KEYCODE_BACK:
                    if (webView.canGoBack()) {
                        webView.goBack();
                    } else {
                        finish();
                    }
                    return true;
            }
        }
        return super.onKeyDown(keyCode, event);
    } // end of onKeyDown(.)

}// end of MainActivity
