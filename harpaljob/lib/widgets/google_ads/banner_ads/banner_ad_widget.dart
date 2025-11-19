import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'dart:io';
import '../../../utils/logger.dart';
import '../dynamic_ad_config.dart';

class BannerAdWidget extends StatefulWidget {
  final String? adUnitId;
  final AdSize? adSize;
  final VoidCallback? onAdLoaded;
  final VoidCallback? onAdFailedToLoad;
  final VoidCallback? onAdOpened;
  final VoidCallback? onAdClosed;
  final VoidCallback? onAdImpression;
  final bool collapsible;
  final String collapsiblePlacement; // 'top' or 'bottom'

  const BannerAdWidget({
    Key? key,
    this.adUnitId,
    this.adSize,
    this.onAdLoaded,
    this.onAdFailedToLoad,
    this.onAdOpened,
    this.onAdClosed,
    this.onAdImpression,
    this.collapsible = false,
    this.collapsiblePlacement = 'bottom',
  }) : super(key: key);

  @override
  State<BannerAdWidget> createState() => _BannerAdWidgetState();
}

class _BannerAdWidgetState extends State<BannerAdWidget> {
  BannerAd? _bannerAd;
  bool _isLoaded = false;
  bool _isLoading = false;
  String? _errorMessage;
  AdSize? _adSize;

  @override
  void initState() {
    super.initState();
    // Don't load ad here, wait for didChangeDependencies for adaptive size
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_bannerAd == null && _adSize == null) {
      _getAdSizeAndLoadAd();
    }
  }

  @override
  void dispose() {
    _bannerAd?.dispose();
    super.dispose();
  }

  Future<void> _getAdSizeAndLoadAd() async {
    // Get ad unit ID - use dynamic config if available, otherwise fallback to test ads
    String adUnitId = '';
    
    if (DynamicAdConfig.isAvailable && DynamicAdConfig.isEnabled('banner')) {
      adUnitId = DynamicAdConfig.getAdUnitId('banner');
    }
    
    // Fallback to test ads if dynamic config is not available or no ad unit ID
    if (adUnitId.isEmpty) {
      adUnitId = Platform.isAndroid
          ? 'ca-app-pub-2809929499941883/2384937793'  // Android banner test ad
          : 'ca-app-pub-3940256099942544/2934735716'; // iOS banner test ad
      Logger.info('BannerAdWidget: Using test banner ad unit ID: $adUnitId');
    } else {
      Logger.info('BannerAdWidget: Using dynamic banner ad unit ID: $adUnitId');
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      AdSize? adSize = widget.adSize;
      if (adSize == null) {
        final AnchoredAdaptiveBannerAdSize? adaptiveSize =
            await AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(
                MediaQuery.of(context).size.width.truncate());
        if (adaptiveSize == null) {
          Logger.info('BannerAdWidget: Unable to get adaptive banner size, falling back to AdSize.banner');
          adSize = AdSize.banner;
        } else {
          adSize = adaptiveSize;
        }
      }
      setState(() {
        _adSize = adSize;
      });
      Logger.info('BannerAdWidget: Loading banner ad with size:  [38;5;2m${adSize.width}x${adSize.height} [0m');
      final adRequest = widget.collapsible
          ? AdRequest(extras: {"collapsible": widget.collapsiblePlacement})
          : const AdRequest();
      _bannerAd = BannerAd(
        adUnitId: widget.adUnitId ?? adUnitId,
        size: adSize,
        request: adRequest,
        listener: BannerAdListener(
          onAdLoaded: (ad) {
            Logger.info('BannerAdWidget: Ad loaded successfully');
            setState(() {
              _isLoaded = true;
              _isLoading = false;
            });
            widget.onAdLoaded?.call();
          },
          onAdFailedToLoad: (ad, error) {
            Logger.error('BannerAdWidget: Ad failed to load: ${error.message}');
            setState(() {
              _isLoaded = false;
              _isLoading = false;
              _errorMessage = error.message;
            });
            widget.onAdFailedToLoad?.call();
            ad.dispose();
          },
          onAdOpened: (ad) {
            Logger.info('BannerAdWidget: Ad opened');
            widget.onAdOpened?.call();
          },
          onAdClosed: (ad) {
            Logger.info('BannerAdWidget: Ad closed');
            widget.onAdClosed?.call();
          },
          onAdImpression: (ad) {
            Logger.info('BannerAdWidget: Ad impression recorded');
            widget.onAdImpression?.call();
          },
        ),
      );
      await _bannerAd!.load();
    } catch (e) {
      Logger.error('BannerAdWidget: Error loading ad: $e');
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString();
      });
      widget.onAdFailedToLoad?.call();
    }
  }

  @override
  Widget build(BuildContext context) {
    // Banner ads will always show (with test ads as fallback)
    if (_isLoading || _adSize == null) {
      return Container(
        height: (_adSize?.height.toDouble() ?? 50),
        decoration: BoxDecoration(
          color: Colors.grey[200],
          border: Border.all(color: Colors.grey[300]!)),
        child: const Center(
          child: CircularProgressIndicator(),
        ),
      );
    }
    if (_errorMessage != null) {
      Logger.info('BannerAdWidget: Not rendering due to error: $_errorMessage');
      return const SizedBox.shrink();
    }
    if (!_isLoaded || _bannerAd == null) {
      Logger.info('BannerAdWidget: Not rendering - ad not loaded');
      return const SizedBox.shrink();
    }
    Logger.info('BannerAdWidget: Rendering banner ad');
    return Container(
      alignment: Alignment.center,
      width: _bannerAd!.size.width.toDouble(),
      height: _bannerAd!.size.height.toDouble(),
      child: AdWidget(ad: _bannerAd!),
    );
  }
} 
