import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'dart:io';
import '../../../utils/logger.dart';
import '../dynamic_ad_config.dart';

class StickyBannerAdWidget extends StatefulWidget {
  const StickyBannerAdWidget({Key? key}) : super(key: key);

  @override
  State<StickyBannerAdWidget> createState() => _StickyBannerAdWidgetState();
}

class _StickyBannerAdWidgetState extends State<StickyBannerAdWidget> {
  BannerAd? _bannerAd;
  bool _isAdLoaded = false;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _loadStickyBanner();
  }

  void _loadStickyBanner() async {
    // Get ad unit ID - use dynamic config if available, otherwise fallback to test ads
    String adUnitId = '';
    
    if (DynamicAdConfig.isAvailable && DynamicAdConfig.isEnabled('banner')) {
      adUnitId = DynamicAdConfig.getAdUnitId('banner');
    }
    
    // Fallback to test ads if dynamic config is not available or no ad unit ID
    if (adUnitId.isEmpty) {
      adUnitId = Platform.isAndroid
          ? 'ca-app-pub-3940256099942544/6300978111'  // Android banner test ad
          : 'ca-app-pub-3940256099942544/2934735716'; // iOS banner test ad
      Logger.info('StickyBannerAdWidget: Using test banner ad unit ID: $adUnitId');
    } else {
      Logger.info('StickyBannerAdWidget: Using dynamic banner ad unit ID: $adUnitId');
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    // For sticky bottom banner, we use a standard banner size
    final AdSize size = AdSize.banner;

    try {
      Logger.info('StickyBannerAdWidget: Loading sticky banner ad with ID: $adUnitId');
      
      _bannerAd = BannerAd(
        size: size,
        adUnitId: adUnitId,
        listener: BannerAdListener(
          onAdLoaded: (Ad ad) {
            Logger.info('StickyBannerAdWidget: Ad loaded successfully');
            setState(() {
              _isAdLoaded = true;
              _isLoading = false;
            });
          },
          onAdFailedToLoad: (Ad ad, LoadAdError error) {
            Logger.error('StickyBannerAdWidget: Ad failed to load: ${error.message}');
            setState(() {
              _isAdLoaded = false;
              _isLoading = false;
              _errorMessage = error.message;
            });
            ad.dispose();
          },
        ),
        request: const AdRequest(),
      )..load();
    } catch (e) {
      Logger.error('StickyBannerAdWidget: Error loading ad: $e');
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // Banner ads will always show (with test ads as fallback)

    if (_isLoading) {
      return const SizedBox.shrink(); // Don't show loading indicator for sticky banner
    }

    if (_errorMessage != null) {
      Logger.info('StickyBannerAdWidget: Not rendering due to error: $_errorMessage');
      return const SizedBox.shrink();
    }

    if (_isAdLoaded && _bannerAd != null) {
      Logger.info('StickyBannerAdWidget: Rendering sticky banner ad');
      return Container(
        width: double.infinity,
        height: _bannerAd!.size.height.toDouble(),
        color: Colors.white,
        child: AdWidget(ad: _bannerAd!),
      );
    } else {
      Logger.info('StickyBannerAdWidget: Not rendering - ad not loaded');
      return const SizedBox.shrink();
    }
  }

  @override
  void dispose() {
    _bannerAd?.dispose();
    super.dispose();
  }
} 
