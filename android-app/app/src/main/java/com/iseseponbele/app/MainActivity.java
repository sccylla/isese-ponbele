package com.iseseponbele.app;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.HapticFeedbackConstants;
import android.view.MenuItem;
import android.view.View;
import android.view.animation.DecelerateInterpolator;
import android.view.animation.OvershootInterpolator;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import androidx.webkit.WebViewAssetLoader;

import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.progressindicator.LinearProgressIndicator;

public class MainActivity extends AppCompatActivity {
    private static final String ASSET_HOST = "appassets.androidplatform.net";
    private static final String LOCAL_BASE = "https://" + ASSET_HOST + "/assets/www/";
    private static final String LIVE_BASE = "https://isese-ponbele.vercel.app/";

    private WebView webView;
    private LinearProgressIndicator progressBar;
    private SwipeRefreshLayout swipeRefresh;
    private BottomNavigationView bottomNav;
    private MaterialToolbar topBar;
    private TextView pageTitle;
    private TextView offlineChip;
    private View splashOverlay;
    private View splashLogo;
    private View splashTitle;
    private View splashSubtitle;
    private View ringOuter;
    private View ringInner;

    private WebViewAssetLoader assetLoader;
    private AnimatorSet ringOuterAnimator;
    private AnimatorSet ringInnerAnimator;
    private String currentFile = "index.html";
    private boolean firstPageFinished = false;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(18, 16, 13));
        getWindow().setNavigationBarColor(Color.rgb(15, 10, 7));
        setContentView(R.layout.activity_main);

        bindViews();
        configureAssetLoader();
        configureWebView();
        configureNativeNavigation();
        configureRefresh();
        playLaunchAnimation();
        updateConnectivityChip();

        if (savedInstanceState == null) {
            navigateLocal("index.html", R.id.nav_home, false);
        } else {
            webView.restoreState(savedInstanceState);
        }
    }

    private void bindViews() {
        webView = findViewById(R.id.webView);
        progressBar = findViewById(R.id.progressBar);
        swipeRefresh = findViewById(R.id.swipeRefresh);
        bottomNav = findViewById(R.id.bottomNav);
        topBar = findViewById(R.id.topBar);
        pageTitle = findViewById(R.id.pageTitle);
        offlineChip = findViewById(R.id.offlineChip);
        splashOverlay = findViewById(R.id.splashOverlay);
        splashLogo = findViewById(R.id.splashLogo);
        splashTitle = findViewById(R.id.splashTitle);
        splashSubtitle = findViewById(R.id.splashSubtitle);
        ringOuter = findViewById(R.id.ringOuter);
        ringInner = findViewById(R.id.ringInner);
    }

    private void configureAssetLoader() {
        assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();
    }

    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setUserAgentString(settings.getUserAgentString() + " IsesePonbeleAndroid/2.0");

        webView.setBackgroundColor(Color.rgb(18, 16, 13));
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgressCompat(newProgress, true);
                progressBar.setVisibility(newProgress >= 100 ? View.GONE : View.VISIBLE);
                if (newProgress >= 100) {
                    swipeRefresh.setRefreshing(false);
                }
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Nullable
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleUrl(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleUrl(Uri.parse(url));
            }

            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                progressBar.setVisibility(View.VISIBLE);
                view.animate().cancel();
                view.setAlpha(0.58f);
                view.setTranslationX(18f);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                injectAndroidAppStyles(view);
                currentFile = extractFile(url);
                updatePageTitle(currentFile);
                syncBottomNavigation(currentFile);
                view.animate()
                        .alpha(1f)
                        .translationX(0f)
                        .setDuration(firstPageFinished ? 260 : 420)
                        .setInterpolator(new DecelerateInterpolator())
                        .start();
                swipeRefresh.setRefreshing(false);
                firstPageFinished = true;
            }
        });
    }

    private void configureNativeNavigation() {
        bottomNav.setSelectedItemId(R.id.nav_home);
        bottomNav.setOnItemSelectedListener(item -> {
            bottomNav.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP);
            int id = item.getItemId();
            if (id == R.id.nav_home) {
                navigateLocal("index.html", id, true);
            } else if (id == R.id.nav_oogun) {
                navigateLocal("catalogue.html", id, true);
            } else if (id == R.id.nav_leaves) {
                navigateLocal("herbs.html", id, true);
            } else if (id == R.id.nav_dictionary) {
                navigateLocal("dictionary.html", id, true);
            } else if (id == R.id.nav_contact) {
                navigateLocal("contact.html", id, true);
            }
            animateBottomNavPulse();
            return true;
        });

        topBar.setOnMenuItemClickListener(item -> {
            if (item.getItemId() == R.id.action_refresh) {
                topBar.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP);
                animateToolbarAction(item);
                webView.reload();
                return true;
            }
            if (item.getItemId() == R.id.action_share) {
                topBar.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP);
                shareCurrentPage();
                return true;
            }
            return false;
        });
    }

    private void configureRefresh() {
        swipeRefresh.setColorSchemeColors(
                Color.rgb(215, 177, 106),
                Color.rgb(184, 131, 56),
                Color.rgb(120, 78, 32)
        );
        swipeRefresh.setProgressBackgroundColorSchemeColor(Color.rgb(26, 18, 12));
        swipeRefresh.setOnRefreshListener(webView::reload);
    }

    private void navigateLocal(String file, int navId, boolean animate) {
        currentFile = file;
        updatePageTitle(file);
        String target = LOCAL_BASE + file;
        if (animate && target.equals(webView.getUrl())) {
            webView.evaluateJavascript("window.scrollTo({top:0,behavior:'smooth'});", null);
            return;
        }
        if (animate) {
            webView.animate().cancel();
            webView.animate()
                    .alpha(0.25f)
                    .translationX(-24f)
                    .setDuration(115)
                    .withEndAction(() -> webView.loadUrl(target))
                    .start();
        } else {
            webView.loadUrl(target);
        }
    }

    private boolean handleUrl(Uri uri) {
        String scheme = uri.getScheme() == null ? "" : uri.getScheme();
        String host = uri.getHost() == null ? "" : uri.getHost();

        if (("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme))
                && ASSET_HOST.equalsIgnoreCase(host)) {
            return false;
        }

        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            startActivity(intent);
            return true;
        } catch (Exception ignored) {
            return true;
        }
    }

    private void injectAndroidAppStyles(WebView view) {
        String css = ".site-header,.top-ticker,.site-loader,.scroll-progress,.cursor-dot,.cursor-ring{display:none!important;}" +
                "html,body{overscroll-behavior:none!important;}" +
                "body{padding-top:0!important;margin-top:0!important;-webkit-tap-highlight-color:transparent!important;}" +
                "a,button,.btn,.category-card{touch-action:manipulation;}" +
                ".footer{padding-bottom:20px!important;}";
        String script = "(function(){var old=document.getElementById('isese-android-style');if(old)old.remove();" +
                "var s=document.createElement('style');s.id='isese-android-style';s.innerHTML=" + quoteJs(css) + ";document.head.appendChild(s);" +
                "document.documentElement.classList.add('isese-android-app');})();";
        view.evaluateJavascript(script, null);
    }

    private String quoteJs(String value) {
        return "'" + value.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n") + "'";
    }

    private void updatePageTitle(String file) {
        String title;
        switch (file) {
            case "catalogue.html": title = "Oogun Archive"; break;
            case "herbs.html": title = "Leaves Documentary"; break;
            case "amulets.html": title = "Amulet Works"; break;
            case "store.html": title = "Cultural Store"; break;
            case "dictionary.html": title = "Yoruba Dictionary"; break;
            case "contact.html": title = "Private Consultation"; break;
            case "about.html": title = "About Isese Ponbele"; break;
            default: title = "Traditional Knowledge House"; break;
        }
        pageTitle.animate().cancel();
        pageTitle.animate().alpha(0f).setDuration(90).withEndAction(() -> {
            pageTitle.setText(title);
            pageTitle.setTranslationY(6f);
            pageTitle.animate().alpha(1f).translationY(0f).setDuration(220).start();
        }).start();
    }

    private void syncBottomNavigation(String file) {
        int id = 0;
        if ("index.html".equals(file) || file.isEmpty()) id = R.id.nav_home;
        else if ("catalogue.html".equals(file)) id = R.id.nav_oogun;
        else if ("herbs.html".equals(file)) id = R.id.nav_leaves;
        else if ("dictionary.html".equals(file)) id = R.id.nav_dictionary;
        else if ("contact.html".equals(file)) id = R.id.nav_contact;
        if (id != 0 && bottomNav.getSelectedItemId() != id) {
            bottomNav.getMenu().findItem(id).setChecked(true);
        }
    }

    private String extractFile(String url) {
        if (url == null) return "index.html";
        Uri uri = Uri.parse(url);
        String path = uri.getPath();
        if (path == null || path.endsWith("/")) return "index.html";
        int slash = path.lastIndexOf('/');
        String file = slash >= 0 ? path.substring(slash + 1) : path;
        return file.isEmpty() ? "index.html" : file;
    }

    private void shareCurrentPage() {
        String shareUrl = LIVE_BASE + ("index.html".equals(currentFile) ? "" : currentFile);
        Intent intent = new Intent(Intent.ACTION_SEND);
        intent.setType("text/plain");
        intent.putExtra(Intent.EXTRA_SUBJECT, "Isese Ponbele");
        intent.putExtra(Intent.EXTRA_TEXT, "Explore Isese Ponbele: " + shareUrl);
        startActivity(Intent.createChooser(intent, "Share Isese Ponbele"));
    }

    private void animateBottomNavPulse() {
        bottomNav.animate().cancel();
        bottomNav.animate().scaleY(0.985f).setDuration(70).withEndAction(() ->
                bottomNav.animate().scaleY(1f).setDuration(160).setInterpolator(new OvershootInterpolator(1.2f)).start()
        ).start();
    }

    private void animateToolbarAction(MenuItem ignored) {
        topBar.animate().cancel();
        topBar.animate().alpha(0.72f).setDuration(80).withEndAction(() ->
                topBar.animate().alpha(1f).setDuration(180).start()
        ).start();
    }

    private void playLaunchAnimation() {
        splashOverlay.setAlpha(1f);
        splashLogo.setAlpha(0f);
        splashLogo.setScaleX(0.45f);
        splashLogo.setScaleY(0.45f);
        splashLogo.setRotation(-8f);
        splashTitle.setAlpha(0f);
        splashTitle.setTranslationY(18f);
        splashSubtitle.setAlpha(0f);
        splashSubtitle.setTranslationY(14f);

        topBar.setTranslationY(-68f);
        topBar.setAlpha(0f);
        bottomNav.setTranslationY(72f);
        bottomNav.setAlpha(0f);

        splashLogo.animate()
                .alpha(1f)
                .scaleX(1f)
                .scaleY(1f)
                .rotation(0f)
                .setDuration(820)
                .setInterpolator(new OvershootInterpolator(1.45f))
                .start();

        splashTitle.animate().alpha(1f).translationY(0f).setStartDelay(240).setDuration(620).start();
        splashSubtitle.animate().alpha(1f).translationY(0f).setStartDelay(430).setDuration(620).start();

        ringOuterAnimator = makeRingAnimator(ringOuter, 1f, 1.52f, 0.28f, 0f, 1650, 0);
        ringInnerAnimator = makeRingAnimator(ringInner, 0.95f, 1.42f, 0.42f, 0f, 1500, 350);
        ringOuterAnimator.start();
        ringInnerAnimator.start();

        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            splashOverlay.animate()
                    .alpha(0f)
                    .scaleX(1.025f)
                    .scaleY(1.025f)
                    .setDuration(460)
                    .setInterpolator(new DecelerateInterpolator())
                    .setListener(new AnimatorListenerAdapter() {
                        @Override
                        public void onAnimationEnd(Animator animation) {
                            splashOverlay.setVisibility(View.GONE);
                            if (ringOuterAnimator != null) ringOuterAnimator.cancel();
                            if (ringInnerAnimator != null) ringInnerAnimator.cancel();
                        }
                    }).start();

            topBar.animate().alpha(1f).translationY(0f).setDuration(520).setStartDelay(80).setInterpolator(new OvershootInterpolator(0.8f)).start();
            bottomNav.animate().alpha(1f).translationY(0f).setDuration(520).setStartDelay(140).setInterpolator(new OvershootInterpolator(0.8f)).start();
        }, 1750);
    }

    private AnimatorSet makeRingAnimator(View view, float fromScale, float toScale, float fromAlpha, float toAlpha, long duration, long delay) {
        ObjectAnimator scaleX = ObjectAnimator.ofFloat(view, View.SCALE_X, fromScale, toScale);
        ObjectAnimator scaleY = ObjectAnimator.ofFloat(view, View.SCALE_Y, fromScale, toScale);
        ObjectAnimator alpha = ObjectAnimator.ofFloat(view, View.ALPHA, fromAlpha, toAlpha);
        AnimatorSet set = new AnimatorSet();
        set.playTogether(scaleX, scaleY, alpha);
        set.setDuration(duration);
        set.setStartDelay(delay);
        set.setInterpolator(new DecelerateInterpolator());
        set.addListener(new AnimatorListenerAdapter() {
            @Override
            public void onAnimationEnd(Animator animation) {
                if (splashOverlay.getVisibility() == View.VISIBLE) {
                    view.setScaleX(fromScale);
                    view.setScaleY(fromScale);
                    view.setAlpha(fromAlpha);
                    set.start();
                }
            }
        });
        return set;
    }

    private void updateConnectivityChip() {
        boolean online = isOnline();
        if (!online) {
            offlineChip.setText("Offline library ready");
            offlineChip.setAlpha(0f);
            offlineChip.setVisibility(View.VISIBLE);
            offlineChip.animate().alpha(1f).translationY(8f).setDuration(260).start();
        } else if (offlineChip.getVisibility() == View.VISIBLE) {
            offlineChip.animate().alpha(0f).translationY(-8f).setDuration(220).withEndAction(() -> offlineChip.setVisibility(View.GONE)).start();
        }
    }

    private boolean isOnline() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        if (cm == null) return false;
        Network network = cm.getActiveNetwork();
        if (network == null) return false;
        NetworkCapabilities capabilities = cm.getNetworkCapabilities(network);
        return capabilities != null && capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET);
    }

    @Override
    protected void onResume() {
        super.onResume();
        updateConnectivityChip();
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }
}
