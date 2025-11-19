import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:shared_preferences/shared_preferences.dart';

class InterstitialAdManager {
  static InterstitialAd? _ad;
  static bool _isLoading = false;
  static bool _shownThisLaunch = false;
  static const String _firstInstallKey = 'interstitial_first_install_shown';

  /// Show an interstitial on first install only (not every launch)
  static Future<bool> showOnAppOpen() async {
    if (_isLoading) return false;
    
    // Check if we've already shown on first install
    final prefs = await SharedPreferences.getInstance();
    final hasShownFirstInstall = prefs.getBool(_firstInstallKey) ?? false;
    if (hasShownFirstInstall) {
      return false; // Don't show again after first install
    }
    _isLoading = true;
    try {
      await InterstitialAd.load(
        // adUnitId: 'ca-app-pub-2809929499941883/5106679335', // Google test interstitial
        adUnitId: 'ca-app-pub-3940256099942544/1033173712', // Google test interstitial
        request: const AdRequest(),
        adLoadCallback: InterstitialAdLoadCallback(
          onAdLoaded: (ad) async {
            _ad = ad;
            _isLoading = false;
            _ad!.fullScreenContentCallback = FullScreenContentCallback(
              onAdDismissedFullScreenContent: (ad) {
                ad.dispose();
                _ad = null;
                // Mark that we've shown on first install
                prefs.setBool(_firstInstallKey, true);
              },
              onAdFailedToShowFullScreenContent: (ad, error) {
                ad.dispose();
                _ad = null;
              },
            );
            await _ad!.show();
          },
          onAdFailedToLoad: (error) {
            _isLoading = false;
            _ad = null;
          },
        ),
      );
      return true;
    } catch (_) {
      _isLoading = false;
      _ad = null;
      return false;
    }
  }

  /// Show an interstitial on demand (no per-launch guard)
  static Future<bool> show() async {
    if (_isLoading) return false;
    _isLoading = true;
    try {
      await InterstitialAd.load(
        // adUnitId: 'ca-app-pub-2809929499941883/5106679335', // Google test interstitial
        adUnitId: 'ca-app-pub-3940256099942544/1033173712', // Google test interstitial
        request: const AdRequest(),
        adLoadCallback: InterstitialAdLoadCallback(
          onAdLoaded: (ad) async {
            _ad = ad;
            _isLoading = false;
            _ad!.fullScreenContentCallback = FullScreenContentCallback(
              onAdDismissedFullScreenContent: (ad) {
                ad.dispose();
                _ad = null;
              },
              onAdFailedToShowFullScreenContent: (ad, error) {
                ad.dispose();
                _ad = null;
              },
            );
            await _ad!.show();
          },
          onAdFailedToLoad: (error) {
            _isLoading = false;
            _ad = null;
          },
        ),
      );
      return true;
    } catch (_) {
      _isLoading = false;
      _ad = null;
      return false;
    }
  }
}


