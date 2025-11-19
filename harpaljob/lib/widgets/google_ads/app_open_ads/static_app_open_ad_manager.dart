import 'package:google_mobile_ads/google_mobile_ads.dart';

class StaticAppOpenAdManager {
  static AppOpenAd? _ad;
  static bool _isLoading = false;
  static bool _isShowing = false;
  static DateTime? _lastShownAt;
  static bool _pendingResumeShow = false;

  static Future<void> _load() async {
    if (_isLoading || _ad != null) return;
    _isLoading = true;
    await AppOpenAd.load(
      // adUnitId: 'ca-app-pub-2809929499941883/2910146436', // Google test app open
      adUnitId: 'ca-app-pub-3940256099942544/3419835294', // Google test app open
      request: const AdRequest(),
      adLoadCallback: AppOpenAdLoadCallback(
        onAdLoaded: (ad) {
          _ad = ad;
          _isLoading = false;
          // If a resume-triggered show is pending, show immediately
          if (_pendingResumeShow) {
            _pendingResumeShow = false;
            _showInternal();
          }
        },
        onAdFailedToLoad: (error) {
          _ad = null;
          _isLoading = false;
        },
      ),
    );
  }

  /// Optionally preload ad in background
  static Future<void> preload() async {
    await _load();
  }

  /// Show on app resume only (call from lifecycle resumed)
  static Future<void> showOnResume() async {
    // simple cooldown: 30s to avoid spam
    if (_isShowing) return;
    if (_lastShownAt != null && DateTime.now().difference(_lastShownAt!) < const Duration(seconds: 10)) {
      return;
    }

    if (_ad == null) {
      _pendingResumeShow = true;
      await _load();
      return;
    }

    await _showInternal();
  }

  static Future<void> _showInternal() async {
    if (_ad == null || _isShowing) return;
    _isShowing = true;
    _ad!.fullScreenContentCallback = FullScreenContentCallback(
      onAdShowedFullScreenContent: (ad) {
        _isShowing = true;
      },
      onAdDismissedFullScreenContent: (ad) {
        ad.dispose();
        _ad = null;
        _isShowing = false;
        _lastShownAt = DateTime.now();
      },
      onAdFailedToShowFullScreenContent: (ad, error) {
        ad.dispose();
        _ad = null;
        _isShowing = false;
      },
    );
    await _ad!.show();
  }
}


