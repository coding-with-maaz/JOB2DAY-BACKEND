import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/job.dart';
import '../services/job_service.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../widgets/loading_indicator.dart';
// import 'package:photo_view/photo_view.dart'; // Removed - not in dependencies
import 'package:share_plus/share_plus.dart';
import '../widgets/network_aware_widget.dart';
import '../utils/logger.dart';
import 'package:flutter/services.dart';
import '../widgets/google_ads/banner_ads/banner_ad_widget.dart';
import '../widgets/google_ads/interstitial_ads/interstitial_ad_manager.dart' as StaticInterstitial;
import '../widgets/google_ads/app_open_ads/static_app_open_ad_manager.dart';
import '../services/review_service.dart';
import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';

// Minimal no-op to satisfy any legacy calls without ads
class InterstitialAdManager {
  static Future<bool> showAdOnPage(String pageType) async { return false; }
  static Future<bool> showAd() async { return false; }
}

// Design system colors
const primaryColor = Colors.deepPurple;
const backgroundColor = Color(0xFFFFF7F4);
const textPrimaryColor = Color(0xFF1A1A1A);
const textSecondaryColor = Color(0xFF3C3C43);
const activeTabColor = Color(0xFFFCEEEE);
const inactiveTabColor = Color(0xFFB0B0B0);

final ButtonStyle unifiedButtonStyle = ElevatedButton.styleFrom(
  backgroundColor: primaryColor,
  foregroundColor: Colors.white,
  shape: RoundedRectangleBorder(
    borderRadius: BorderRadius.circular(12),
  ),
  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
  elevation: 2,
);

final TextStyle unifiedHeaderStyle = TextStyle(
  fontWeight: FontWeight.bold,
  color: textPrimaryColor,
  fontSize: 24,
  letterSpacing: 0.5,
  fontFamily: 'Poppins',
);

final TextStyle unifiedBodyStyle = TextStyle(
  color: textSecondaryColor,
  fontSize: 16,
  fontWeight: FontWeight.w500,
  fontFamily: 'Poppins',
);

// Add more design system styles for form fields, snackbars, etc.
final InputDecoration unifiedInputDecoration = InputDecoration(
  filled: true,
  fillColor: Colors.white,
  labelStyle: TextStyle(color: textSecondaryColor, fontFamily: 'Poppins'),
  hintStyle: TextStyle(color: textSecondaryColor.withValues(alpha:  0.7), fontFamily: 'Poppins'),
  border: OutlineInputBorder(
    borderRadius: BorderRadius.circular(12),
    borderSide: BorderSide(color: activeTabColor, width: 1),
  ),
  enabledBorder: OutlineInputBorder(
    borderRadius: BorderRadius.circular(12),
    borderSide: BorderSide(color: activeTabColor, width: 1),
  ),
  focusedBorder: OutlineInputBorder(
    borderRadius: BorderRadius.circular(12),
    borderSide: BorderSide(color: primaryColor, width: 2),
  ),
  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
);

final BoxDecoration unifiedBottomSheetDecoration = BoxDecoration(
  color: Colors.white,
  borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
  boxShadow: [
    BoxShadow(
      color: Colors.black.withValues(alpha:  0.08),
      blurRadius: 24,
      offset: const Offset(0, -4),
    ),
  ],
);

// Helper for pill style (top-level)
Widget buildPill(String text, {Color? bgColor, Color? borderColor, Color? textColor, double fontSize = 14, EdgeInsetsGeometry? margin}) {
  return Container(
    margin: margin ?? const EdgeInsets.only(right: 8, bottom: 8),
    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
    decoration: BoxDecoration(
      color: bgColor ?? activeTabColor,
      borderRadius: BorderRadius.circular(20),
      border: Border.all(color: borderColor ?? activeTabColor.withValues(alpha:  0.7), width: 1),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withValues(alpha:  0.04),
          blurRadius: 4,
          offset: const Offset(0, 2),
        ),
      ],
    ),
    child: Text(
      text,
      style: TextStyle(
        color: textColor ?? primaryColor,
        fontWeight: FontWeight.bold,
        fontFamily: 'Poppins',
        fontSize: fontSize,
      ),
    ),
  );
}

class JobDetailsPage extends StatefulWidget {
  final String jobSlug;

  const JobDetailsPage({
    super.key,
    required this.jobSlug,
  });

  @override
  State<JobDetailsPage> createState() => _JobDetailsPageState();
}

class _JobDetailsPageState extends State<JobDetailsPage> {
  final JobService _jobService = JobService();
  
  Job? _job;
  bool _isLoading = true;
  String? _error;
  bool _isSaved = false;
  final ScrollController _scrollController = ScrollController();
  bool _showScrollToTop = false;
  
  // Interval and visit tracking for rewarded ads
  static const String _visitCountKey = 'job_details_visit_count';
  static const String _lastVisitTimeKey = 'job_details_last_visit_time';
  static const String _lastRewardedAdTimeKey = 'job_details_last_rewarded_ad_time';
  static const int _requiredVisits = 3;
  static const Duration _minIntervalBetweenAds = Duration(minutes: 5);
  static const Duration _visitResetInterval = Duration(hours: 24);
  int _visitCount = 0;
  DateTime? _lastVisitTime;
  DateTime? _lastRewardedAdTime;

  // Interval and visit tracking for interstitial ads
  static const String _interstitialVisitCountKey = 'job_details_interstitial_visit_count';
  static const String _lastInterstitialVisitTimeKey = 'job_details_last_interstitial_visit_time';
  static const String _lastInterstitialAdTimeKey = 'job_details_last_interstitial_ad_time';
  static const int _requiredInterstitialVisits = 4;
  static const Duration _minIntervalBetweenInterstitialAds = Duration(minutes: 5);
  int _interstitialVisitCount = 0;
  DateTime? _lastInterstitialVisitTime;
  DateTime? _lastInterstitialAdTime;

  @override
  void initState() {
    super.initState();
    _loadJob();
    _loadVisitData();
    // Attempt a resume-style app-open ad when entering detail (cooldown protected)
    Future.microtask(() => StaticAppOpenAdManager.showOnResume());
    _scrollController.addListener(() {
      final shouldShow = _scrollController.offset > 400;
      if (shouldShow != _showScrollToTop && mounted) {
        setState(() {
          _showScrollToTop = shouldShow;
        });
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }



  // Smooth scroll to top helper
  void _scrollToTop() {
    if (!_scrollController.hasClients) return;
    _scrollController.animateTo(
      0,
      duration: const Duration(milliseconds: 400),
      curve: Curves.easeOutCubic,
    );
  }

  // Mobile user guidance bottom sheet
  void _showMobileGuidance() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: unifiedBottomSheetDecoration,
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    Icon(Icons.phone_android, color: primaryColor),
                    const SizedBox(width: 8),
                    Text(
                      'How to use this page',
                      style: unifiedHeaderStyle.copyWith(fontSize: 18, color: primaryColor),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _buildInfoRowWithIcon(Icons.swipe, 'Scroll to explore job details, skills and tags.'),
                _buildInfoRowWithIcon(Icons.image_outlined, 'Tap job image to open a zoomable preview.'),
                _buildInfoRowWithIcon(Icons.info_outline, 'Tap the company card to view detailed company information.'),
                _buildInfoRowWithIcon(Icons.send, 'Tap Apply Now to submit your application.'),
                _buildInfoRowWithIcon(Icons.share, 'Use the share icon in the app bar to share this job.'),
                _buildInfoRowWithIcon(Icons.arrow_upward, 'Use the floating up arrow to quickly scroll to the top.'),
                const SizedBox(height: 16),
                Align(
                  alignment: Alignment.centerRight,
                  child: ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: unifiedButtonStyle,
                    child: const Text('Got it'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Load visit data from SharedPreferences
  Future<void> _loadVisitData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Load rewarded ad visit data
      _visitCount = prefs.getInt(_visitCountKey) ?? 0;
      final lastVisitTimeString = prefs.getString(_lastVisitTimeKey);
      final lastRewardedAdTimeString = prefs.getString(_lastRewardedAdTimeKey);
      
      if (lastVisitTimeString != null) {
        _lastVisitTime = DateTime.parse(lastVisitTimeString);
      }
      
      if (lastRewardedAdTimeString != null) {
        _lastRewardedAdTime = DateTime.parse(lastRewardedAdTimeString);
      }
      
      // Load interstitial ad visit data
      _interstitialVisitCount = prefs.getInt(_interstitialVisitCountKey) ?? 0;
      final lastInterstitialVisitTimeString = prefs.getString(_lastInterstitialVisitTimeKey);
      final lastInterstitialAdTimeString = prefs.getString(_lastInterstitialAdTimeKey);
      
      if (lastInterstitialVisitTimeString != null) {
        _lastInterstitialVisitTime = DateTime.parse(lastInterstitialVisitTimeString);
      }
      
      if (lastInterstitialAdTimeString != null) {
        _lastInterstitialAdTime = DateTime.parse(lastInterstitialAdTimeString);
      }
      
      Logger.info('JobDetailsPage: Loaded visit data - rewarded count: $_visitCount, interstitial count: $_interstitialVisitCount');
    } catch (e) {
      Logger.error('JobDetailsPage: Error loading visit data: $e');
    }
  }

  // Save visit data to SharedPreferences
  Future<void> _saveVisitData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Save rewarded ad visit data
      await prefs.setInt(_visitCountKey, _visitCount);
      if (_lastVisitTime != null) {
        await prefs.setString(_lastVisitTimeKey, _lastVisitTime!.toIso8601String());
      } else {
        // Clear the stored last visit time when resetting
        await prefs.remove(_lastVisitTimeKey);
      }
      
      if (_lastRewardedAdTime != null) {
        await prefs.setString(_lastRewardedAdTimeKey, _lastRewardedAdTime!.toIso8601String());
      }
      
      // Save interstitial ad visit data
      await prefs.setInt(_interstitialVisitCountKey, _interstitialVisitCount);
      if (_lastInterstitialVisitTime != null) {
        await prefs.setString(_lastInterstitialVisitTimeKey, _lastInterstitialVisitTime!.toIso8601String());
      } else {
        // Clear the stored last visit time when resetting
        await prefs.remove(_lastInterstitialVisitTimeKey);
      }
      
      if (_lastInterstitialAdTime != null) {
        await prefs.setString(_lastInterstitialAdTimeKey, _lastInterstitialAdTime!.toIso8601String());
      }
      
      Logger.info('JobDetailsPage: Saved visit data - rewarded count: $_visitCount, interstitial count: $_interstitialVisitCount');
    } catch (e) {
      Logger.error('JobDetailsPage: Error saving visit data: $e');
    }
  }

  // Increment visit count and check if rewarded ad should be shown
  Future<void> _incrementVisitCount() async {
    final now = DateTime.now();
    
    // Reset rewarded visit count if 24 hours have passed since last visit
    if (_lastVisitTime != null && now.difference(_lastVisitTime!).inHours >= 24) {
      _visitCount = 0;
      Logger.info('JobDetailsPage: Reset rewarded visit count after 24 hours');
    }
    
    // Reset interstitial visit count if 24 hours have passed since last visit
    if (_lastInterstitialVisitTime != null && now.difference(_lastInterstitialVisitTime!).inHours >= 24) {
      _interstitialVisitCount = 0;
      Logger.info('JobDetailsPage: Reset interstitial visit count after 24 hours');
    }
    
    _visitCount++;
    _interstitialVisitCount++;
    _lastVisitTime = now;
    _lastInterstitialVisitTime = now;
    
    Logger.info('JobDetailsPage: Visit counts incremented - rewarded: $_visitCount, interstitial: $_interstitialVisitCount');
    
    // Save the updated visit data
    await _saveVisitData();
    
    // Check if we should show the rewarded ad
    if (_visitCount >= _requiredVisits) {
      _checkAndShowVisitRewardedAd();
    }
    
    // Check if we should show the interstitial ad
    if (_interstitialVisitCount >= _requiredInterstitialVisits) {
      _checkAndShowVisitInterstitialAd();
    }
  }

  // Check if enough time has passed since last rewarded ad
  bool _canShowRewardedAd() {
    if (_lastRewardedAdTime == null) return true;
    
    final timeSinceLastAd = DateTime.now().difference(_lastRewardedAdTime!);
    final canShow = timeSinceLastAd >= _minIntervalBetweenAds;
    
    Logger.info('JobDetailsPage: Can show rewarded ad: $canShow (${timeSinceLastAd.inMinutes} minutes since last ad)');
    return canShow;
  }

  // Check if enough time has passed since last interstitial ad
  bool _canShowInterstitialAd() {
    if (_lastInterstitialAdTime == null) return true;
    
    final timeSinceLastAd = DateTime.now().difference(_lastInterstitialAdTime!);
    final canShow = timeSinceLastAd >= _minIntervalBetweenInterstitialAds;
    
    Logger.info('JobDetailsPage: Can show interstitial ad: $canShow (${timeSinceLastAd.inMinutes} minutes since last ad)');
    return canShow;
  }

  // Get formatted time until next reward is available
  String _getTimeUntilNextReward() {
    if (_lastRewardedAdTime == null) return '';
    
    final timeSinceLastAd = DateTime.now().difference(_lastRewardedAdTime!);
    final timeRemaining = _minIntervalBetweenAds - timeSinceLastAd;
    
    if (timeRemaining.isNegative) return '';
    
    final minutes = timeRemaining.inMinutes;
    final seconds = timeRemaining.inSeconds % 60;
    
    if (minutes > 0) {
      return '${minutes}m ${seconds}s';
    } else {
      return '${seconds}s';
    }
  }

  // Get formatted time until next interstitial ad is available
  String _getTimeUntilNextInterstitialAd() {
    if (_lastInterstitialAdTime == null) return '';
    
    final timeSinceLastAd = DateTime.now().difference(_lastInterstitialAdTime!);
    final timeRemaining = _minIntervalBetweenInterstitialAds - timeSinceLastAd;
    
    if (timeRemaining.isNegative) return '';
    
    final minutes = timeRemaining.inMinutes;
    final seconds = timeRemaining.inSeconds % 60;
    
    if (minutes > 0) {
      return '${minutes}m ${seconds}s';
    } else {
      return '${seconds}s';
    }
  }

  // Show rewarded ad for visiting job details page multiple times
  // This method resets the visit count to 0 after showing the ad,
  // allowing users to earn rewards again after 3 more visits
  void _checkAndShowVisitRewardedAd() {
    if (!_canShowRewardedAd()) {
      Logger.info('JobDetailsPage: Skipping visit rewarded ad - interval not met');
      return;
    }
    
    Logger.info('JobDetailsPage: Showing visit rewarded ad for $_visitCount visits');
    
    // Ads removed - no longer showing rewarded ads
  }

  // Show interstitial ad for visiting job details page multiple times
  // This method resets the visit count to 0 after showing the ad,
  // Visit tracking interstitial ads removed for better user experience
  void _checkAndShowVisitInterstitialAd() {
    // Interstitial ads on visit tracking removed - too frequent and irritating
    Logger.info('JobDetailsPage: Visit interstitial ads disabled for better UX');
  }



  void _showCompanyDetails() async {
    _showCompanyDetailsDialog();
  }

  void _showCompanyDetailsDialog() {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        child: SafeArea(
          child: FractionallySizedBox(
            widthFactor: 0.95,
            child: Container(
              constraints: BoxConstraints(
                maxHeight: MediaQuery.of(context).size.height * 0.9,
                maxWidth: MediaQuery.of(context).size.width * 0.95,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
              // Header with gradient background
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      primaryColor,
                      primaryColor.withOpacity(0.8),
                    ],
                  ),
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(20),
                    topRight: Radius.circular(20),
                  ),
                ),
                child: Column(
                  children: [
                    // Company Logo
                    if (_job?.logoUrl != null && _job!.logoUrl!.isNotEmpty) ...[
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                child: Image.network(
                  _job!.logoUrl!,
                            fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Icon(
                    Icons.business,
                              size: 40,
                    color: primaryColor,
                            ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
                    // Company Name
                      Text(
                      _job?.companyName ?? 'Company',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'Poppins',
                      ),
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                    ),
            const SizedBox(height: 8),
                    // Industry
                    if (_job?.industry != null && _job!.industry!.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          _job!.industry!,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            fontFamily: 'Poppins',
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              // Company Details Content
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Company Information Section
                      _buildCompanyInfoSection(),
                      const SizedBox(height: 20),
                      
                      // Job Details Section
                      _buildJobDetailsSection(),
                      const SizedBox(height: 20),
                      
                      // Additional Information Section
                      _buildAdditionalInfoSection(),
                    ],
                  ),
                ),
              ),
              // Close Button
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                child: ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text(
                    'Close',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ),
              ),
            ],
          ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCompanyInfoSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: primaryColor.withOpacity(0.1),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.business_center, color: primaryColor, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Company Information',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: primaryColor,
                    fontFamily: 'Poppins',
                  ),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                  softWrap: false,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildInfoRow('Industry', _job?.industry ?? 'Not specified'),
          _buildInfoRow('Location', _job?.location ?? 'Not specified'),
          _buildInfoRow('Job Position', _job?.title ?? 'Not specified'),
          _buildInfoRow('Job Type', _job?.jobType ?? 'Not specified'),
          _buildInfoRow('Experience Required', _job?.experience ?? 'Not specified'),
        ],
      ),
    );
  }

  Widget _buildJobDetailsSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.blue[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.blue.withOpacity(0.1),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.work, color: Colors.blue, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Job Details',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.blue,
                    fontFamily: 'Poppins',
                  ),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                  softWrap: false,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildInfoRow('Salary', _job?.salary ?? 'Not specified'),
          _buildInfoRow('Vacancies', '${_job?.vacancy ?? 1} positions'),
          _buildInfoRow('Application Deadline', 
            _job?.applyBefore != null 
              ? timeago.format(_job!.applyBefore!)
              : 'Not specified'
          ),
          _buildInfoRow('Qualification', _job?.qualification ?? 'Not specified'),
          _buildInfoRow('Skills Required', _job?.skills?.toString() ?? 'Not specified'),
          _buildInfoRow('Posted Date', 
            _job?.createdAt != null 
              ? timeago.format(_job!.createdAt!)
              : 'Not specified'
          ),
        ],
      ),
    );
  }

  Widget _buildAdditionalInfoSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.purple[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.purple.withOpacity(0.1),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.info_outline, color: Colors.purple, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Additional Information',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.purple,
                    fontFamily: 'Poppins',
                  ),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                  softWrap: false,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildInfoRow('Job ID', _job?.id?.toString() ?? 'Not specified'),
          _buildInfoRow('Job Slug', _job?.slug ?? 'Not specified'),
          _buildInfoRow('Status', _job?.status ?? 'Not specified'),
          _buildInfoRow('Views', _job?.views?.toString() ?? '0'),
          if (_job?.tags != null && _job!.tags!.isNotEmpty)
            _buildInfoRow('Tags', _job!.tags!.toString()),
          if (_job?.applyLink != null && _job!.applyLink!.isNotEmpty)
            _buildInfoRow('External Apply Link', _job!.applyLink!),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: textSecondaryColor,
                fontFamily: 'Poppins',
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 14,
                color: textPrimaryColor,
                fontFamily: 'Poppins',
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCompanyDetailChip(IconData icon, String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: color.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 16,
            color: color,
          ),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                color: color,
                fontSize: 12,
                fontWeight: FontWeight.w500,
                fontFamily: 'Poppins',
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              softWrap: true,
            ),
          ),
        ],
      ),
    );
  }



  Future<void> _loadJob() async {
    if (!mounted) return;

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final job = await _jobService.getJobBySlug(widget.jobSlug);
      
      if (!mounted) return;
      
      setState(() {
        _job = job;
        _isLoading = false;
      });
      
      // Increment visit count after job is successfully loaded
      _incrementVisitCount();
    } catch (e) {
      if (!mounted) return;
      
      setState(() {
        _isLoading = false;
        _error = e.toString();
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error loading job details: $e'),
            backgroundColor: primaryColor,
            duration: const Duration(seconds: 5),
            action: SnackBarAction(
              label: 'Retry',
              onPressed: () {
                if (mounted) {
                  _loadJob();
                }
              },
              textColor: Colors.white,
            ),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    }
  }

  void _toggleSave() async {
    setState(() {
      _isSaved = !_isSaved;
    });
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(_isSaved ? 'Job saved to favorites' : 'Job removed from favorites'),
        backgroundColor: _isSaved ? primaryColor : Colors.grey,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _shareJob() async {
    if (_job != null) {
      Share.share(
        'Check out this job opportunity: ${_job!.title} at ${_job!.companyName}\n\n'
        'Location: ${_job!.location}\n'
        'Job Type: ${_job!.jobType}\n'
        'Salary: ${_job!.salary}\n\n'
        'Apply now!',
      );
    }
  }

  void _showApplicationForm() async {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: unifiedBottomSheetDecoration,
        child: _ApplyForm(
          job: _job!,
          onApplicationSubmitted: () {
            // Application submitted - show an interstitial
            StaticInterstitial.InterstitialAdManager.show();
          },
        ),
      ),
    );
  }

  Future<void> _launchUrl(String url) async {
    if (!await launchUrl(Uri.parse(url))) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not open the application link'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    }
  }

  Widget _buildInfoRowWithIcon(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: primaryColor.withValues(alpha:  0.1),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: primaryColor.withValues(alpha:  0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: primaryColor.withValues(alpha:  0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon, 
              size: 20, 
              color: primaryColor,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              text,
              style: unifiedBodyStyle,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection(String title, Widget content) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: unifiedHeaderStyle.copyWith(fontSize: 18, color: primaryColor),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: primaryColor.withValues(alpha:  0.1),
                width: 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: primaryColor.withValues(alpha:  0.08),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: content,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Use design system colors
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
      ),
      child: NetworkAwareWidget(
        child: Scaffold(
          backgroundColor: backgroundColor,
          body: _isLoading
              ? const Center(child: LoadingIndicator(size: 40))
              : _error != null
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.error_outline,
                            color: primaryColor,
                            size: 48,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Error loading job details',
                            style: unifiedHeaderStyle,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _error!,
                            style: unifiedBodyStyle,
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton.icon(
                            onPressed: _loadJob,
                            icon: const Icon(Icons.refresh),
                            label: const Text('Retry'),
                            style: unifiedButtonStyle,
                          ),
                        ],
                      ),
                    )
                  : _job == null
                      ? const Center(child: Text('Job not found'))
                      : CustomScrollView(
                          controller: _scrollController,
                          slivers: [
                            // Modern Hero Section (App Bar with Job Info)
                            SliverAppBar(
                              pinned: true,
                              backgroundColor: Colors.transparent,
                              elevation: 0,
                              shadowColor: Colors.transparent,
                              leading: Container(
                                margin: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: IconButton(
                                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                                  onPressed: () => Navigator.pop(context),
                                ),
                              ),
                              title: _job != null
                                  ? Text(
                                      _job!.title,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 26,
                                        fontWeight: FontWeight.bold,
                                        fontFamily: 'Poppins',
                                        shadows: [
                                          Shadow(
                                            offset: Offset(1, 1),
                                            blurRadius: 2,
                                            color: Color.fromARGB(128, 0, 0, 0),
                                          ),
                                        ],
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    )
                                  : null,
                              actions: [
                                IconButton(
                                  icon: const Icon(Icons.share, color: Colors.white),
                                  onPressed: _shareJob,
                                ),
                              ],
                              flexibleSpace: Container(
                                decoration: const BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                    colors: [
                                      Colors.deepPurple,
                                      Color(0xFF9C27B0),
                                      Color(0xFFBA68C8),
                                    ],
                                    stops: [0.0, 0.6, 1.0],
                                  ),
                                ),
                              ),
                            ),
                            // Job Details Content
                            SliverToBoxAdapter(
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Key Information
                                    _buildSection(
                                      'Key Information',
                                      Column(
                                        children: [
                                          // Enhanced Company Information Card
                                          GestureDetector(
                                            onTap: _showCompanyDetails,
                                            child: Container(
                                              padding: const EdgeInsets.all(16),
                                              margin: const EdgeInsets.only(bottom: 8),
                                              decoration: BoxDecoration(
                                                gradient: LinearGradient(
                                                  begin: Alignment.topLeft,
                                                  end: Alignment.bottomRight,
                                                  colors: [
                                                    primaryColor.withOpacity(0.05),
                                                    primaryColor.withOpacity(0.02),
                                                  ],
                                                ),
                                                borderRadius: BorderRadius.circular(16),
                                                border: Border.all(
                                                  color: primaryColor.withValues(alpha:  0.2),
                                                  width: 1.5,
                                                ),
                                                boxShadow: [
                                                  BoxShadow(
                                                    color: primaryColor.withValues(alpha:  0.08),
                                                    blurRadius: 12,
                                                    offset: const Offset(0, 4),
                                                  ),
                                                ],
                                              ),
                                              child: Column(
                                                children: [
                                                  Row(
                                                    children: [
                                                      // Company Logo
                                                      if (_job?.logoUrl != null && _job!.logoUrl!.isNotEmpty) ...[
                                                        Container(
                                                          width: 50,
                                                          height: 50,
                                                          decoration: BoxDecoration(
                                                            color: Colors.white,
                                                            borderRadius: BorderRadius.circular(12),
                                                            boxShadow: [
                                                              BoxShadow(
                                                                color: Colors.black.withOpacity(0.1),
                                                    blurRadius: 8,
                                                    offset: const Offset(0, 2),
                                                  ),
                                                ],
                                              ),
                                                          child: ClipRRect(
                                                            borderRadius: BorderRadius.circular(12),
                                                            child: Image.network(
                                                              _job!.logoUrl!,
                                                              fit: BoxFit.cover,
                                                              errorBuilder: (context, error, stackTrace) => Icon(
                                                                Icons.business,
                                                                size: 24,
                                                                color: primaryColor,
                                                              ),
                                                            ),
                                                          ),
                                                        ),
                                                        const SizedBox(width: 16),
                                                      ] else ...[
                                                  Container(
                                                          width: 50,
                                                          height: 50,
                                                    decoration: BoxDecoration(
                                                      color: primaryColor.withValues(alpha:  0.1),
                                                            borderRadius: BorderRadius.circular(12),
                                                    ),
                                                    child: Icon(
                                                      Icons.business,
                                                            size: 24,
                                                      color: primaryColor,
                                                    ),
                                                  ),
                                                  const SizedBox(width: 16),
                                                      ],
                                                      // Company Info
                                                  Expanded(
                                                        child: Column(
                                                          crossAxisAlignment: CrossAxisAlignment.start,
                                                          children: [
                                                            Text(
                                                              _job!.companyName ?? 'Company',
                                                      style: unifiedBodyStyle.copyWith(
                                                        color: primaryColor,
                                                                fontWeight: FontWeight.bold,
                                                                fontSize: 18,
                                                              ),
                                                            ),
                                                            const SizedBox(height: 4),
                                                            if (_job?.industry != null && _job!.industry!.isNotEmpty) ...[
                                                              Container(
                                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                                decoration: BoxDecoration(
                                                                  color: primaryColor.withValues(alpha:  0.1),
                                                                  borderRadius: BorderRadius.circular(8),
                                                                ),
                                                                child: Text(
                                                                  _job!.industry!,
                                                                  style: TextStyle(
                                                                    color: primaryColor,
                                                                    fontSize: 12,
                                                                    fontWeight: FontWeight.w500,
                                                                    fontFamily: 'Poppins',
                                                                  ),
                                                                ),
                                                              ),
                                                            ],
                                                          ],
                                                        ),
                                                      ),
                                                      // Info Icon
                                                      Container(
                                                        padding: const EdgeInsets.all(8),
                                                        decoration: BoxDecoration(
                                                          color: primaryColor.withValues(alpha:  0.1),
                                                          borderRadius: BorderRadius.circular(8),
                                                        ),
                                                        child: Icon(
                                                    Icons.info_outline,
                                                          color: primaryColor,
                                                    size: 20,
                                                        ),
                                                  ),
                                                ],
                                              ),
                                                  const SizedBox(height: 12),
                                                  // Additional Company Details
                                                  Row(
                                                    children: [
                                                      Expanded(
                                                        child: _buildCompanyDetailChip(
                                                          Icons.location_on,
                                                          _job?.location ?? 'Location not specified',
                                                          Colors.blue,
                                                        ),
                                                      ),
                                                      const SizedBox(width: 8),
                                                      Expanded(
                                                        child: _buildCompanyDetailChip(
                                                          Icons.work,
                                                          _job?.jobType ?? 'Job type not specified',
                                                          Colors.green,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                  const SizedBox(height: 8),
                                                  // Tap to view more details
                                                  Container(
                                                    width: double.infinity,
                                                    padding: const EdgeInsets.symmetric(vertical: 8),
                                                    decoration: BoxDecoration(
                                                      color: primaryColor.withValues(alpha:  0.05),
                                                      borderRadius: BorderRadius.circular(8),
                                                    ),
                                                    child: Row(
                                                      mainAxisAlignment: MainAxisAlignment.center,
                                                      children: [
                                                        Icon(
                                                          Icons.visibility,
                                                          color: primaryColor,
                                                          size: 16,
                                                        ),
                                                        const SizedBox(width: 8),
                                                        Text(
                                                          'Tap to view detailed company information',
                                                          style: TextStyle(
                                                            color: primaryColor,
                                                            fontSize: 12,
                                                            fontWeight: FontWeight.w500,
                                                            fontFamily: 'Poppins',
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ),
                                          _buildInfoRowWithIcon(
                                            Icons.location_on_outlined,
                                            _job!.location ?? 'Not specified',
                                          ),
                                          _buildInfoRowWithIcon(
                                            Icons.work_outline,
                                            _job!.jobType ?? 'Not specified',
                                          ),
                                          _buildInfoRowWithIcon(
                                            Icons.attach_money,
                                            _job!.salary ?? 'Not specified',
                                          ),
                                          _buildInfoRowWithIcon(
                                            Icons.schedule,
                                            _job!.experience ?? 'Not specified',
                                          ),
                                          _buildInfoRowWithIcon(
                                            Icons.school,
                                            _job!.qualification ?? 'Not specified',
                                          ),
                                          _buildInfoRowWithIcon(
                                            Icons.business,
                                            _job!.industry ?? 'Not specified',
                                          ),
                                          _buildInfoRowWithIcon(
                                            Icons.people,
                                            '${_job!.vacancy ?? 1} positions',
                                          ),
                                          _buildInfoRowWithIcon(
                                            Icons.calendar_today,
                                            _job!.applyBefore != null
                                                ? timeago.format(_job!.applyBefore)
                                                : 'Not specified',
                                          ),
                                        ],
                                      ),
                                    ),
                                    // Job Image Section
                                    if (_job!.imageUrl != null && _job!.imageUrl!.isNotEmpty)
                                    _buildSection(
                                        'Job Image',
                                        GestureDetector(
                                                onTap: () {
                                                  Navigator.push(
                                                    context,
                                                    MaterialPageRoute(
                                                      builder: (context) => ZoomableImage(
                                                  imageUrl: _job!.imageUrl!,
                                                  title: _job!.title,
                                                      ),
                                                    ),
                                                  );
                                                },
                                                child: Stack(
                                                  children: [
                                                    ClipRRect(
                                                borderRadius: BorderRadius.circular(12),
                                                      child: Image.network(
                                                  _job!.imageUrl!,
                                                  width: double.infinity,
                                                  height: 250,
                                                        fit: BoxFit.cover,
                                                        loadingBuilder: (context, child, loadingProgress) {
                                                          if (loadingProgress == null) return child;
                                                          return Container(
                                                      width: double.infinity,
                                                      height: 250,
                                                            color: Colors.grey[200],
                                                      child: const Center(
                                                        child: LoadingIndicator(size: 30),
                                                      ),
                                                          );
                                                        },
                                                        errorBuilder: (context, error, stackTrace) {
                                                          return Container(
                                                      width: double.infinity,
                                                      height: 250,
                                                            decoration: BoxDecoration(
                                                              color: Colors.grey[200],
                                                        borderRadius: BorderRadius.circular(12),
                                                            ),
                                                            child: Column(
                                                              mainAxisAlignment: MainAxisAlignment.center,
                                                              children: [
                                                                Icon(Icons.broken_image, size: 48, color: Colors.grey[400]),
                                                                const SizedBox(height: 8),
                                                                Text(
                                                                  'Failed to load image',
                                                                  style: TextStyle(
                                                                    color: Colors.grey[600],
                                                                    fontSize: 14,
                                                              fontFamily: 'Poppins',
                                                                  ),
                                                                ),
                                                              ],
                                                            ),
                                                          );
                                                        },
                                                      ),
                                                    ),
                                                    Positioned(
                                                bottom: 12,
                                                right: 12,
                                                      child: Container(
                                                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                                        decoration: BoxDecoration(
                                                          color: Colors.black.withOpacity(0.7),
                                                          borderRadius: BorderRadius.circular(16),
                                                        ),
                                                        child: const Row(
                                                          mainAxisSize: MainAxisSize.min,
                                                          children: [
                                                            Icon(
                                                              Icons.zoom_in,
                                                              color: Colors.white,
                                                              size: 16,
                                                            ),
                                                            SizedBox(width: 4),
                                                            Text(
                                                              'View Image',
                                                              style: TextStyle(
                                                                color: Colors.white,
                                                                fontSize: 12,
                                                                fontWeight: FontWeight.w500,
                                                          fontFamily: 'Poppins',
                                                              ),
                                                            ),
                                                          ],
                                                        ),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                      ),
                                    // Description
                                    _buildSection(
                                      'Description',
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          if (_job!.description != null && _job!.description!.isNotEmpty)
                                            Html(
                                              data: _convertMarkdownToHtml(_job!.description!),
                                              style: {
                                                "body": Style(
                                                  fontSize: FontSize(16),
                                                  lineHeight: const LineHeight(1.5),
                                                  color: textSecondaryColor,
                                                  fontFamily: 'Poppins',
                                                  margin: Margins.zero,
                                                  padding: HtmlPaddings.zero,
                                                ),
                                                "h1, h2, h3, h4, h5, h6": Style(
                                                  color: primaryColor,
                                                  fontFamily: 'Poppins',
                                                  fontWeight: FontWeight.bold,
                                                  margin: Margins.only(bottom: 8, top: 16),
                                                ),
                                                "p": Style(
                                                  margin: Margins.only(bottom: 12),
                                                  fontSize: FontSize(16),
                                                  lineHeight: const LineHeight(1.5),
                                                ),
                                                "ul, ol": Style(
                                                  margin: Margins.only(bottom: 12, left: 16),
                                                ),
                                                "li": Style(
                                                  margin: Margins.only(bottom: 4),
                                                ),
                                                "strong, b": Style(
                                                  fontWeight: FontWeight.bold,
                                                  color: textPrimaryColor,
                                                ),
                                                "em, i": Style(
                                                  fontStyle: FontStyle.italic,
                                                ),
                                                "img": Style(
                                                  width: Width(MediaQuery.of(context).size.width - 64),
                                                  height: Height(200),
                                                  margin: Margins.only(bottom: 16),
                                                ),
                                              },
                                            )
                                          else
                                            Text(
                                              'No description available',
                                              style: TextStyle(
                                                fontSize: 16,
                                                height: 1.5,
                                                color: textSecondaryColor,
                                                fontFamily: 'Poppins',
                                                fontStyle: FontStyle.italic,
                                              ),
                                            ),
                                        ],
                                      ),
                                    ),
                                    // Skills
                                    if (_job!.skills.isNotEmpty)
                                      _buildSection(
                                        'Required Skills',
                                        Wrap(
                                          spacing: 0,
                                          runSpacing: 0,
                                          children: _job!.skills.map((skill) => buildPill(skill)).toList(),
                                        ),
                                      ),
                                    // Tags
                                    if (_job!.tags.isNotEmpty) ...[
                                      const SizedBox(height: 16),
                                      Text(
                                        'Tags',
                                        style: unifiedHeaderStyle.copyWith(fontSize: 18, color: primaryColor),
                                      ),
                                      const SizedBox(height: 8),
                                      Wrap(
                                        spacing: 0,
                                        runSpacing: 0,
                                        children: _job!.tags.split(',').map((tag) {
                                          final trimmedTag = tag.trim();
                                          if (trimmedTag.isEmpty) return const SizedBox.shrink();
                                          return buildPill(trimmedTag, bgColor: activeTabColor, borderColor: activeTabColor.withOpacity(0.7), textColor: primaryColor, fontSize: 13);
                                        }).toList(),
                                      ),
                                    ],
                                    const SizedBox(height: 32),
                                    // Apply Button
                                    Container(
                                      width: double.infinity,
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(12),
                                        boxShadow: [
                                          BoxShadow(
                                            color: primaryColor.withOpacity(0.3),
                                            blurRadius: 8,
                                            offset: const Offset(0, 4),
                                          ),
                                        ],
                                      ),
                                      child: ElevatedButton(
                                        onPressed: _showApplicationForm,
                                        style: unifiedButtonStyle,
                                        child: const Row(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            Icon(Icons.send, size: 20),
                                            SizedBox(width: 8),
                                            Text(
                                              'Apply Now',
                                              style: TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.bold,
                                                fontFamily: 'Poppins',
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 16),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
          bottomNavigationBar: BannerAdWidget(
            collapsible: true,
            collapsiblePlacement: 'bottom',
          ),
          floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
          floatingActionButton: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              // Help / guidance button
              FloatingActionButton.small(
                heroTag: 'help_fab',
                onPressed: _showMobileGuidance,
                backgroundColor: primaryColor,
                child: const Icon(Icons.help_outline, color: Colors.white),
              ),
              const SizedBox(height: 10),
              if (_showScrollToTop)
                FloatingActionButton.small(
                  heroTag: 'scroll_top_fab',
                  onPressed: _scrollToTop,
                  backgroundColor: primaryColor,
                  child: const Icon(Icons.arrow_upward, color: Colors.white),
                ),
            ],
          ),
        ),
      ),
    );
  }

  List<String> _extractImages(String html) {
    final List<String> images = [];
    final RegExp imgRegex = RegExp(r'<img[^>]+src="([^">]+)"');
    final matches = imgRegex.allMatches(html);
    
    for (final match in matches) {
      if (match.groupCount >= 1) {
        final String? src = match.group(1);
        if (src != null) {
          images.add(src);
        }
      }
    }
    
    return images;
  }

  String _convertMarkdownToHtml(String markdown) {
    String html = markdown;
    
    // Convert **text** to <strong>text</strong>
    html = html.replaceAllMapped(RegExp(r'\*\*(.*?)\*\*'), (match) => '<strong>${match.group(1)}</strong>');
    
    // Convert *text* to <em>text</em>
    html = html.replaceAllMapped(RegExp(r'\*(.*?)\*'), (match) => '<em>${match.group(1)}</em>');
    
    // Convert line breaks to <br>
    html = html.replaceAll('\n', '<br>');
    
    return html;
  }


}

// Real Apply Form Widget
class _ApplyForm extends StatefulWidget {
  final Job job;
  final VoidCallback? onApplicationSubmitted;
  const _ApplyForm({super.key, required this.job, this.onApplicationSubmitted});

  @override
  State<_ApplyForm> createState() => _ApplyFormState();
}

class _ApplyFormState extends State<_ApplyForm> with SingleTickerProviderStateMixin {
  bool _isSubmitting = false;
  bool _showSuccess = false;
  bool _isAuthenticated = false;
  late AnimationController _animationController;
  
  // Form controllers
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _coverLetterController = TextEditingController();
  
  // File upload state
  bool _isUploading = false;
  double _uploadProgress = 0.0;
  String? _uploadedFileName;
  String? _uploadedFileUrl;
  File? _selectedFile;
  String _uploadStatus = '';
  final ImagePicker _imagePicker = ImagePicker();
  
  // Application status
  String? _applicationStatus;
  String? _applicationId;
  DateTime? _submittedAt;
  bool _hasSubmitted = false;
  
  // Services
  final _jobService = JobService();

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _checkAuthentication();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _coverLetterController.dispose();
    super.dispose();
  }
  
  Future<void> _checkAuthentication() async {
    // TODO: Check if user is authenticated
    // For now, we'll use quick apply (no authentication)
    setState(() {
      _isAuthenticated = false;
    });
  }
  
  Future<void> _pickAndUploadFile() async {
    try {
      // Show file picker options
      final result = await showModalBottomSheet<String>(
        context: context,
        backgroundColor: Colors.transparent,
        builder: (context) => Container(
          decoration: unifiedBottomSheetDecoration,
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                Text(
                  'Select Resume File',
                  style: unifiedHeaderStyle.copyWith(fontSize: 18, color: primaryColor),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: _buildFilePickerOption(
                        icon: Icons.folder_open,
                        title: 'Browse Files',
                        subtitle: 'PDF, DOC, DOCX',
                        onTap: () => Navigator.pop(context, 'browse'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildFilePickerOption(
                        icon: Icons.camera_alt,
                        title: 'Take Photo',
                        subtitle: 'Scan document',
                        onTap: () => Navigator.pop(context, 'camera'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
              ],
            ),
          ),
        ),
      );

      if (result == null) return;

      XFile? pickedFile;
      
      if (result == 'browse') {
        // Pick file from device storage
        pickedFile = await _imagePicker.pickMedia(
          maxWidth: 1920,
          maxHeight: 1080,
          imageQuality: 85,
        );
      } else if (result == 'camera') {
        // Take photo with camera
        pickedFile = await _imagePicker.pickImage(
          source: ImageSource.camera,
          maxWidth: 1920,
          maxHeight: 1080,
          imageQuality: 85,
        );
      }

      if (pickedFile == null) return;

      // Validate file size (max 5MB)
      final file = File(pickedFile.path);
      final fileSize = await file.length();
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (fileSize > maxSize) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('File size too large. Maximum size is 5MB.'),
              backgroundColor: Colors.red,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          );
        }
        return;
      }

      // Start upload process
      await _processFileUpload(file, pickedFile.name);
      
    } catch (e) {
      Logger.error('Error picking file: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error selecting file: ${e.toString()}'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    }
  }

  Widget _buildFilePickerOption({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: primaryColor.withOpacity(0.2),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: primaryColor.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    icon,
                    color: primaryColor,
                    size: 24,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  title,
                  style: unifiedBodyStyle.copyWith(
                    fontWeight: FontWeight.w600,
                    color: textPrimaryColor,
                    fontSize: 14,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: unifiedBodyStyle.copyWith(
                    fontSize: 12,
                    color: textSecondaryColor,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _processFileUpload(File file, String originalName) async {
    setState(() {
      _isUploading = true;
      _uploadProgress = 0.0;
      _uploadedFileName = null;
      _uploadedFileUrl = null;
      _selectedFile = file;
      _uploadStatus = 'Preparing upload...';
    });
    
    try {
      // Simulate file processing steps
      final steps = [
        'Validating file...',
        'Compressing file...',
        'Uploading to server...',
        'Processing on server...',
        'Generating download link...',
      ];
      
      int currentStep = 0;
      
      // Simulate realistic upload progress with different speeds for different steps
      for (int i = 0; i <= 100; i += 2) {
        await Future.delayed(const Duration(milliseconds: 100));
        
        // Update progress with realistic variations
        if (i < 20) {
          // File validation - slower
          await Future.delayed(const Duration(milliseconds: 50));
        } else if (i < 40) {
          // Compression - medium speed
          await Future.delayed(const Duration(milliseconds: 30));
        } else if (i < 80) {
          // Upload - faster
          await Future.delayed(const Duration(milliseconds: 20));
        } else {
          // Final processing - slower
          await Future.delayed(const Duration(milliseconds: 40));
        }
        
        setState(() {
          _uploadProgress = i / 100.0;
        });
        
        // Update current step
        final newStep = (i / 20).floor();
        if (newStep != currentStep && newStep < steps.length) {
          currentStep = newStep;
          setState(() {
            _uploadStatus = steps[currentStep];
          });
          Logger.info('Upload step: ${steps[currentStep]}');
        }
      }
      
      // Generate realistic filename and URL
      final timestamp = DateTime.now().millisecondsSinceEpoch;
      final extension = originalName.split('.').last.toLowerCase();
      final sanitizedName = _firstNameController.text.isNotEmpty 
          ? _firstNameController.text.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), '_')
          : 'user';
      
      final fileName = 'resume_${sanitizedName}_$timestamp.$extension';
      final fileUrl = 'https://harpaljob.com/uploads/resumes/$fileName';
      
      setState(() {
        _isUploading = false;
        _uploadedFileName = fileName;
        _uploadedFileUrl = fileUrl;
      });
      
      Logger.info('File uploaded successfully: $fileName');
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✅ Resume uploaded successfully!'),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 2),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
      
    } catch (e) {
      Logger.error('Error uploading file: $e');
      setState(() {
        _isUploading = false;
        _selectedFile = null;
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('❌ Upload failed: ${e.toString()}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    }
  }
  
  void _removeUploadedFile() {
    setState(() {
      _uploadedFileName = null;
      _uploadedFileUrl = null;
      _uploadProgress = 0.0;
      _selectedFile = null;
      _uploadStatus = '';
    });
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 100,
          child: Text(
            '$label:',
            style: unifiedBodyStyle.copyWith(
              fontWeight: FontWeight.w500,
              color: textSecondaryColor,
              fontSize: 13,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: unifiedBodyStyle.copyWith(
              fontWeight: FontWeight.w600,
              color: Colors.black87,
              fontSize: 13,
            ),
          ),
        ),
      ],
    );
  }

  String _getStatusText(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return '⏳ Under Review';
      case 'approved':
      case 'accepted':
        return '✅ Accepted';
      case 'rejected':
      case 'declined':
        return '❌ Not Selected';
      case 'shortlisted':
        return '🎯 Shortlisted';
      case 'interview':
        return '📞 Interview Scheduled';
      default:
        return '📋 $status';
    }
  }

  String _formatDateTime(DateTime? dateTime) {
    if (dateTime == null) return 'N/A';
    
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    
    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes} minutes ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours} hours ago';
    } else {
      return '${dateTime.day}/${dateTime.month}/${dateTime.year} at ${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
    }
  }

  String? _validateRequired(String? value, String fieldName) {
    if (value == null || value.isEmpty) {
      return '$fieldName is required';
    }
    return null;
  }

  String? _validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Email is required';
    }
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  }

  String? _validatePhone(String? value) {
    if (value == null || value.isEmpty) {
      return 'Phone number is required';
    }
    // Accept both international (+country code) and local numbers (no country code)
    final cleaned = value.replaceAll(RegExp(r'[^\d+]'), '');
    final digitsOnly = value.replaceAll(RegExp(r'\D'), '');
    final isInternational = RegExp(r'^\+[1-9]\d{7,14} ?$').hasMatch(cleaned.replaceAll('\u0000', ''));
    final isLocal = RegExp(r'^\d{7,12}$').hasMatch(digitsOnly);
    if (!(isInternational || isLocal)) {
      return 'Please enter a valid phone number';
    }
    return null;
  }

  String? _validateUrl(String? value) {
    if (value != null && value.isNotEmpty) {
      final urlRegex = RegExp(
        r'^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$',
        caseSensitive: false,
      );
      if (!urlRegex.hasMatch(value)) {
        return 'Please enter a valid URL';
      }
    }
    return null;
  }

  void _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      // Log form data for debugging
      Logger.info('Submitting application form...');
      Logger.info('Job ID: ${widget.job.id}');
      Logger.info('First Name: ${_firstNameController.text}');
      Logger.info('Last Name: ${_lastNameController.text}');
      Logger.info('Email: ${_emailController.text}');
      Logger.info('Phone: ${_phoneController.text}');
      Logger.info('Cover Letter: ${_coverLetterController.text}');
      Logger.info('Resume URL: $_uploadedFileUrl');
      Logger.info('Is Authenticated: $_isAuthenticated');
      
      Map<String, dynamic> result;
      
      if (_isAuthenticated) {
        // Use authenticated apply
        Logger.info('Using authenticated apply...');
        result = await _jobService.applyForJob(
          jobId: widget.job.id,
          coverLetter: _coverLetterController.text,
          resumeUrl: _uploadedFileUrl,
          authToken: null, // TODO: Get from auth service
        );
      } else {
        // Use quick apply
        Logger.info('Using quick apply...');
        result = await _jobService.quickApply(
          jobId: widget.job.id,
          firstName: _firstNameController.text,
          lastName: _lastNameController.text,
          email: _emailController.text,
          phone: _phoneController.text,
          coverLetter: _coverLetterController.text,
          resumeUrl: _uploadedFileUrl,
        );
      }
      
      Logger.info('API Response: $result');
      
      // Check if it's a duplicate application
      if (result['duplicate'] == true) {
        setState(() {
          _isSubmitting = false;
        });
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '⚠️ Duplicate Application Detected',
                    style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'You have already applied for this job with this email address.',
                    style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.9)),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'You can apply for other jobs with the same email, but not the same job twice.',
                    style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.9)),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'If you need to update your application, please contact us.',
                    style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.9)),
                  ),
                ],
              ),
              backgroundColor: Colors.orange,
              duration: const Duration(seconds: 8),
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              action: SnackBarAction(
                label: 'OK',
                textColor: Colors.white,
                onPressed: () {
                  if (mounted) {
                    ScaffoldMessenger.of(context).hideCurrentSnackBar();
                  }
                },
              ),
            ),
          );
        }
        return;
      }
      
      // Capture application details
      setState(() {
        _isSubmitting = false;
        _showSuccess = true;
        _hasSubmitted = true;
        _applicationStatus = result['application']?['status'] ?? 'pending';
        _applicationId = result['application']?['id']?.toString();
        _submittedAt = DateTime.now();
      });
      
      // Increment positive action for job application
      await ReviewService().incrementPositiveAction();
      
      _animationController.forward();
      await Future.delayed(const Duration(milliseconds: 1200));
      
      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '✅ Application Submitted Successfully!',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                ),
                const SizedBox(height: 4),
                Text(
                  'Application ID: #$_applicationId • Status: ${_getStatusText(_applicationStatus ?? 'pending')}',
                  style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.9)),
                ),
                const SizedBox(height: 4),
                Text(
                  'Check your email for confirmation details.',
                  style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.9)),
                ),
              ],
            ),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 6),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            action: SnackBarAction(
              label: 'OK',
              textColor: Colors.white,
              onPressed: () {
                if (mounted) {
                  ScaffoldMessenger.of(context).hideCurrentSnackBar();
                }
              },
            ),
          ),
        );
        
        // Show interstitial ad after successful application
        try {
          Logger.info('JobDetailsPage: Showing interstitial ad after successful application');
          await Future.delayed(const Duration(milliseconds: 1000)); // Wait for success animation
          final adShown = await InterstitialAdManager.showAdOnPage('JobApplicationSuccess');
          if (adShown) {
            Logger.info('JobDetailsPage: Interstitial ad shown successfully after application');
          } else {
            Logger.info('JobDetailsPage: Interstitial ad not shown after application - may be due to cooldown or disabled');
          }
        } catch (e) {
          Logger.error('JobDetailsPage: Error showing interstitial ad after application: $e');
        }
        
        if (widget.onApplicationSubmitted != null) {
          widget.onApplicationSubmitted!();
        }
      }
    } catch (e) {
      Logger.error('Form submission error: $e');
      setState(() {
        _isSubmitting = false;
      });
      
      if (mounted) {
        String errorMessage = 'Failed to submit application';
        
        // Provide more specific error messages
        if (e.toString().contains('SocketException')) {
          errorMessage = 'Network connection failed. Please check your internet connection.';
        } else if (e.toString().contains('TimeoutException')) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (e.toString().contains('FormatException')) {
          errorMessage = 'Invalid response from server. Please try again.';
        } else if (e.toString().contains('Exception:')) {
          errorMessage = e.toString().replaceFirst('Exception: ', '');
        }
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('❌ $errorMessage'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 5),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            action: SnackBarAction(
              label: 'Retry',
              textColor: Colors.white,
              onPressed: () {
                if (mounted) {
                  ScaffoldMessenger.of(context).hideCurrentSnackBar();
                  _submit(); // Retry submission
                }
              },
            ),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Use design system colors
    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 400),
        child: _showSuccess
            ? Center(
                key: const ValueKey('success'),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha:  0.08),
                        blurRadius: 24,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      ScaleTransition(
                        scale: CurvedAnimation(
                          parent: _animationController,
                          curve: Curves.elasticOut,
                        ),
                        child: Icon(Icons.check_circle, color: primaryColor, size: 72),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Application Submitted Successfully! 🎉',
                        style: unifiedHeaderStyle.copyWith(fontSize: 22, color: primaryColor),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      
                      // Application Details Card
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.green.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: Colors.green.withOpacity(0.3),
                            width: 1,
                          ),
                        ),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Icon(Icons.assignment_turned_in, color: Colors.green, size: 20),
                                const SizedBox(width: 8),
                                Text(
                                  'Application Details',
                                  style: unifiedBodyStyle.copyWith(
                                    fontWeight: FontWeight.w600,
                                    color: Colors.green,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            if (_applicationId != null) ...[
                              _buildDetailRow('Application ID', '#$_applicationId'),
                              const SizedBox(height: 8),
                            ],
                            _buildDetailRow('Status', _getStatusText(_applicationStatus ?? 'pending')),
                            const SizedBox(height: 8),
                            _buildDetailRow('Submitted At', _formatDateTime(_submittedAt)),
                            const SizedBox(height: 8),
                            _buildDetailRow('Job Title', widget.job.title),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      // Email Confirmation Card
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: primaryColor.withValues(alpha:  0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: primaryColor.withOpacity(0.3),
                            width: 1,
                          ),
                        ),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Icon(Icons.email, color: primaryColor, size: 20),
                                const SizedBox(width: 8),
                                Text(
                                  'Confirmation Email Sent',
                                  style: unifiedBodyStyle.copyWith(
                                    fontWeight: FontWeight.w600,
                                    color: primaryColor,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'We\'ve sent a confirmation email to ${_emailController.text}. Please check your inbox (including spam folder) for application details.',
                              style: unifiedBodyStyle.copyWith(
                                fontSize: 14,
                                color: textSecondaryColor,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      // Next Steps Card
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.blue.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: Colors.blue.withOpacity(0.3),
                            width: 1,
                          ),
                        ),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Icon(Icons.next_plan, color: Colors.blue, size: 20),
                                const SizedBox(width: 8),
                                Text(
                                  'What\'s Next?',
                                  style: unifiedBodyStyle.copyWith(
                                    fontWeight: FontWeight.w600,
                                    color: Colors.blue,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Your application is now under review. Our team will carefully evaluate your qualifications and get back to you within 3-5 business days.',
                              style: unifiedBodyStyle.copyWith(
                                fontSize: 14,
                                color: textSecondaryColor,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              )
            : AbsorbPointer(
                absorbing: _isSubmitting,
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(
                        child: Container(
                          width: 40,
                          height: 4,
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: Colors.grey[300],
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                      Text(
                        'Apply for this Job',
                        style: unifiedHeaderStyle.copyWith(fontSize: 20, color: primaryColor),
                      ),
                      const SizedBox(height: 16),
                      
                      // Submission Status Banner (if already submitted)
                      if (_hasSubmitted) ...[
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.green.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: Colors.green.withOpacity(0.3),
                              width: 1,
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.check_circle, color: Colors.green, size: 20),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Application Already Submitted',
                                      style: unifiedBodyStyle.copyWith(
                                        fontWeight: FontWeight.w600,
                                        color: Colors.green,
                                        fontSize: 14,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Status: ${_getStatusText(_applicationStatus ?? 'pending')} • Submitted: ${_formatDateTime(_submittedAt)}',
                                      style: unifiedBodyStyle.copyWith(
                                        color: textSecondaryColor,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                      // First Name and Last Name Row
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: _firstNameController,
                              decoration: unifiedInputDecoration.copyWith(
                                labelText: 'First Name *',
                                hintText: 'Enter your first name',
                              ),
                              style: unifiedBodyStyle,
                              validator: (value) => _validateRequired(value, 'First name'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextFormField(
                              controller: _lastNameController,
                              decoration: unifiedInputDecoration.copyWith(
                                labelText: 'Last Name *',
                                hintText: 'Enter your last name',
                              ),
                              style: unifiedBodyStyle,
                              validator: (value) => _validateRequired(value, 'Last name'),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _emailController,
                        decoration: unifiedInputDecoration.copyWith(
                          labelText: 'Email *',
                          hintText: 'Enter your email address',
                        ),
                        style: unifiedBodyStyle,
                        keyboardType: TextInputType.emailAddress,
                        validator: _validateEmail,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _phoneController,
                        decoration: unifiedInputDecoration.copyWith(
                          labelText: 'Phone Number *',
                          hintText: 'Enter your phone number',
                        ),
                        style: unifiedBodyStyle,
                        keyboardType: TextInputType.phone,
                        validator: _validatePhone,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _coverLetterController,
                        decoration: unifiedInputDecoration.copyWith(
                          labelText: 'Cover Letter *',
                          hintText: 'Tell us why you\'re interested in this position...',
                        ),
                        style: unifiedBodyStyle,
                        maxLines: 4,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Cover letter is required';
                          }
                          if (value.length < 50) {
                            return 'Please write at least 50 characters';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      // Resume Upload Section
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: primaryColor.withValues(alpha:  0.1),
                            width: 1,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Padding(
                              padding: const EdgeInsets.all(16),
                              child: Row(
                                children: [
                                  Icon(Icons.upload_file, color: primaryColor, size: 20),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Resume Upload (Optional)',
                                    style: unifiedBodyStyle.copyWith(
                                      fontWeight: FontWeight.w600,
                                      color: textPrimaryColor,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            if (_uploadedFileName == null && !_isUploading) ...[
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                child: Column(
                                  children: [
                                    Container(
                                      width: double.infinity,
                                      height: 120,
                                      decoration: BoxDecoration(
                                        color: primaryColor.withValues(alpha:  0.05),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(
                                          color: primaryColor.withOpacity(0.2),
                                          width: 2,
                                          style: BorderStyle.solid,
                                        ),
                                      ),
                                      child: InkWell(
                                        onTap: _pickAndUploadFile,
                                        borderRadius: BorderRadius.circular(8),
                                        child: Column(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            Icon(
                                              Icons.cloud_upload_outlined,
                                              color: primaryColor,
                                              size: 32,
                                            ),
                                            const SizedBox(height: 8),
                                            Text(
                                              'Tap to Upload Resume',
                                              style: unifiedBodyStyle.copyWith(
                                                color: primaryColor,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              'PDF, DOC, DOCX (Max 5MB)',
                                              style: unifiedBodyStyle.copyWith(
                                                fontSize: 12,
                                                color: textSecondaryColor,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      'Supported formats: PDF, DOC, DOCX',
                                      style: unifiedBodyStyle.copyWith(
                                        fontSize: 12,
                                        color: textSecondaryColor,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                            if (_isUploading) ...[
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                child: Column(
                                  children: [
                                    Container(
                                      width: double.infinity,
                                      height: 120,
                                      decoration: BoxDecoration(
                                        color: primaryColor.withValues(alpha:  0.05),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(
                                          color: primaryColor.withOpacity(0.2),
                                          width: 2,
                                        ),
                                      ),
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          CircularProgressIndicator(
                                            value: _uploadProgress,
                                            color: primaryColor,
                                            backgroundColor: primaryColor.withOpacity(0.2),
                                          ),
                                          const SizedBox(height: 12),
                                          Text(
                                            'Uploading... ${(_uploadProgress * 100).toInt()}%',
                                            style: unifiedBodyStyle.copyWith(
                                              color: primaryColor,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            _uploadStatus.isNotEmpty ? _uploadStatus : 'Please wait while we upload your resume',
                                            style: unifiedBodyStyle.copyWith(
                                              fontSize: 12,
                                              color: textSecondaryColor,
                                            ),
                                            textAlign: TextAlign.center,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                            if (_uploadedFileName != null && !_isUploading) ...[
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                child: Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Colors.green.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: Colors.green.withOpacity(0.3),
                                      width: 1,
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                      Icon(
                                        Icons.check_circle,
                                        color: Colors.green,
                                        size: 20,
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              'Resume Uploaded Successfully',
                                              style: unifiedBodyStyle.copyWith(
                                                color: Colors.green,
                                                fontWeight: FontWeight.w600,
                                                fontSize: 14,
                                              ),
                                            ),
                                            Text(
                                              _uploadedFileName!,
                                              style: unifiedBodyStyle.copyWith(
                                                fontSize: 12,
                                                color: textSecondaryColor,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      IconButton(
                                        onPressed: _removeUploadedFile,
                                        icon: Icon(
                                          Icons.close,
                                          color: Colors.red,
                                          size: 18,
                                        ),
                                        tooltip: 'Remove file',
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                            const SizedBox(height: 16),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _isSubmitting ? null : _submit,
                          style: unifiedButtonStyle,
                          child: _isSubmitting
                              ? const SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : const Text(
                                  'Submit Application',
                                  style: TextStyle(fontSize: 16, fontFamily: 'Poppins'),
                                ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '* Required fields',
                        style: unifiedBodyStyle.copyWith(fontSize: 13, color: inactiveTabColor),
                      ),
                    ],
                  ),
                ),
              ),
      ),
    );
  }
}

class ZoomableImage extends StatelessWidget {
  final String imageUrl;
  final String? title;

  const ZoomableImage({
    super.key,
    required this.imageUrl,
    this.title,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Container(
          margin: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.2),
            borderRadius: BorderRadius.circular(12),
          ),
          child: IconButton(
            icon: const Icon(Icons.close, color: Colors.white),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        title: title != null
            ? Text(
                title!,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  fontFamily: 'Poppins',
                ),
              )
            : null,
        centerTitle: true,
      ),
      body: Stack(
        children: [
          Center(
            child: Image.network(
              imageUrl,
              fit: BoxFit.contain,
              loadingBuilder: (context, child, loadingProgress) {
                if (loadingProgress == null) return child;
                return const Center(
                  child: CircularProgressIndicator(),
                );
              },
              errorBuilder: (context, error, stackTrace) => Center(
                child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.broken_image, size: 48, color: Colors.grey),
                  const SizedBox(height: 8),
                  Text(
                    'Failed to load image',
                    style: TextStyle(
                      color: Colors.grey[400],
                      fontSize: 14,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ],
                ),
              ),
            ),
          ),
          if (title != null)
            Positioned(
              bottom: 16,
              left: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.7),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  title!,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontFamily: 'Poppins',
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
        ],
      ),
    );
  }
} 
