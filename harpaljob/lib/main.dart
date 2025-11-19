import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'pages/onboarding_screen.dart';
import 'pages/home_screen.dart';
import 'pages/job_details_page.dart';
import 'widgets/google_ads/dynamic_ad_config.dart';
import 'widgets/google_ads/interstitial_ads/interstitial_ad_manager.dart' as StaticInterstitial;
import 'widgets/google_ads/app_open_ads/static_app_open_ad_manager.dart';
import 'services/simple_notification_service.dart';
import 'services/notification_navigation.dart';
import 'utils/logger.dart';
import 'package:flutter/services.dart';
import 'utils/app_info.dart';
import 'services/review_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent, // Transparent status bar
      statusBarIconBrightness: Brightness.light, // Light icons for dark backgrounds
      statusBarBrightness: Brightness.dark, // For iOS
      systemNavigationBarColor: Color(0xFFFFF7F4), // Match bottom navigation background
      systemNavigationBarIconBrightness: Brightness.dark, // Dark navigation icons
    ),
  );
  
  Logger.info('=== App Starting (Parallel Initialization) ===');
  
  // PARALLEL INITIALIZATION - Much faster startup!
  final initializationStartTime = DateTime.now();
  
  try {
    // Run all initializations in parallel for maximum speed
    await Future.wait([
      // Core services (critical)
      Firebase.initializeApp().then((_) => Logger.info('Firebase initialized successfully')),
      MobileAds.instance.initialize().then((_) => Logger.info('Google Mobile Ads initialized successfully')),
      
      // App services (can run in parallel)
      AppInfo.initialize().timeout(const Duration(seconds: 5)).then((_) => Logger.info('AppInfo initialized successfully')),
      ReviewService().incrementAppOpenCount().timeout(const Duration(seconds: 5)).then((_) => Logger.info('ReviewService initialized successfully')),
      
      // Ad services (banner + static interstitial on app open)
      DynamicAdConfig.initialize().timeout(const Duration(seconds: 15)).then((_) => Logger.info('DynamicAdConfig initialized successfully')),
      
      // Notification service (can run in parallel)
      SimpleNotificationService.instance.initialize().timeout(const Duration(seconds: 10)).then((_) => Logger.info('NotificationService initialized successfully')),
    ]);
    
    // App Open and Interstitial ads removed; banner ads remain only
    
    final initializationTime = DateTime.now().difference(initializationStartTime);
    Logger.info('=== All services initialized in ${initializationTime.inMilliseconds}ms ===');
    
  } catch (e) {
    Logger.error('Some services failed to initialize: $e');
    // Continue with partial initialization
  }
  
  // Show a single interstitial on first app open (static test unit)
  StaticInterstitial.InterstitialAdManager.showOnAppOpen();

  // Test API connection (non-blocking)
  DynamicAdConfig.testApiConnection()
      .timeout(const Duration(seconds: 10))
      .then((result) => Logger.info('API Connection Test Result: $result'))
      .catchError((e) => Logger.error('API connection test failed: $e'));
  
  Logger.info('=== App Started ===');

  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> with WidgetsBindingObserver {
  bool _hasBeenBackgrounded = false;

  @override
  void initState() {
    super.initState();
    Logger.info('MyApp: initState called');
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    Logger.info('MyApp: dispose called');
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    Logger.info('MyApp: App lifecycle state changed to: $state');
    if (state == AppLifecycleState.paused) {
      Logger.info('MyApp: App paused');
      _hasBeenBackgrounded = true;
    } else if (state == AppLifecycleState.resumed && _hasBeenBackgrounded) {
      Logger.info('MyApp: App resumed from background');
      // Static app open ad on resume only
      StaticAppOpenAdManager.showOnResume();
    }
  }


  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'JOB2DAY',
      navigatorKey: NotificationNavigation.navigatorKey,
      theme: ThemeData(
        // New color scheme based on deepPurple
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.deepPurple,
          brightness: Brightness.light,
          background: const Color(0xFFFFF7F4), // Soft blush background
        ),
        // Custom text theme
        textTheme: const TextTheme(
          headlineLarge: TextStyle(
            color: Color(0xFF1A1A1A), // Dark charcoal for headings
            fontWeight: FontWeight.bold,
            fontSize: 26,
            fontFamily: 'Poppins',
          ),
          headlineMedium: TextStyle(
            color: Color(0xFF1A1A1A),
            fontWeight: FontWeight.bold,
            fontSize: 22,
            fontFamily: 'Poppins',
          ),
          headlineSmall: TextStyle(
            color: Color(0xFF1A1A1A),
            fontWeight: FontWeight.bold,
            fontSize: 18,
            fontFamily: 'Poppins',
          ),
          bodyLarge: TextStyle(
            color: Color(0xFF3C3C43), // Medium gray for body text
            fontWeight: FontWeight.w500,
            fontSize: 16,
          ),
          bodyMedium: TextStyle(
            color: Color(0xFF3C3C43),
            fontWeight: FontWeight.w500,
            fontSize: 14,
          ),
          bodySmall: TextStyle(
            color: Color(0xFF3C3C43),
            fontWeight: FontWeight.w400,
            fontSize: 12,
          ),
        ),
        // App bar theme
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFFFFF7F4), // Match status bar background
          elevation: 0,
          titleTextStyle: TextStyle(
            color: Color(0xFF1A1A1A),
            fontWeight: FontWeight.bold,
            fontSize: 26,
            fontFamily: 'Poppins',
          ),
          iconTheme: IconThemeData(
            color: Color(0xFF1A1A1A),
          ),
          systemOverlayStyle: SystemUiOverlayStyle(
            statusBarColor: Colors.transparent,
            statusBarIconBrightness: Brightness.light,
            statusBarBrightness: Brightness.dark,
          ),
        ),
        // Scaffold theme
        scaffoldBackgroundColor: const Color(0xFFFFF7F4), // Soft blush background
        useMaterial3: true,
      ),
      home: const SplashScreen(),
      routes: {
        '/job-details': (context) {
          final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
          return JobDetailsPage(jobSlug: args['jobSlug'] as String);
        },
      },
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  bool _adShown = false;
  bool _isNavigating = false;

  @override
  void initState() {
    super.initState();
    _handleAppOpen();
  }

  Future<void> _handleAppOpen() async {
    Logger.info('SplashScreen: Starting app open handling');
    
    // Show app open ad first, then proceed with navigation
    // Removed app-open/interstitial ads; proceed directly
    
    // Proceed with normal flow after ad handling
    await _checkOnboardingStatus();
  }

  // Removed ad display helpers

  Future<void> _checkOnboardingStatus() async {
    if (_isNavigating) return;
    _isNavigating = true;
    
    Logger.info('SplashScreen: Starting onboarding status check');
    
    // Add a small delay for splash screen effect
    Logger.info('SplashScreen: Starting splash screen delay');
    await Future.delayed(const Duration(seconds: 1));
    Logger.info('SplashScreen: Splash screen delay completed');
    
    if (!mounted) {
      Logger.info('SplashScreen: Widget not mounted after delay, returning');
      return;
    }
    
    final prefs = await SharedPreferences.getInstance();
    final onboardingCompleted = prefs.getBool('onboarding_completed') ?? false;
    Logger.info('SplashScreen: Onboarding completed: $onboardingCompleted');
    
    if (!mounted) {
      Logger.info('SplashScreen: Widget not mounted after prefs check, returning');
      return;
    }
    
    if (onboardingCompleted) {
      Logger.info('SplashScreen: Navigating to HomeScreen');
      _navigateToHome();
    } else {
      Logger.info('SplashScreen: Navigating to OnboardingScreen');
      _navigateToOnboarding();
    }
  }

  void _navigateToHome() {
    if (!mounted) return;
    
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) =>
            const HomeScreen(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(opacity: animation, child: child);
        },
        transitionDuration: const Duration(milliseconds: 800),
      ),
    );
  }

  void _navigateToOnboarding() {
    if (!mounted) return;
    
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) =>
            const OnboardingScreen(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(opacity: animation, child: child);
        },
        transitionDuration: const Duration(milliseconds: 800),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF6A11CB),
              Color(0xFF2575FC),
              Color(0xFF6D5BFF),
            ],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // App Logo/Icon
              const Icon(
                Icons.work,
                size: 80,
                color: Colors.white,
              ),
              const SizedBox(height: 24),
              // App Name
              const Text(
                'JOB2DAY',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Poppins',
                ),
              ),
              const SizedBox(height: 16),
              // Tagline
              const Text(
                'Find Your Dream Job',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 18,
                  fontFamily: 'Poppins',
                ),
              ),
              const SizedBox(height: 40),
              // Loading indicator
              const CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
              // Show ad status if debug mode
              if (_adShown) ...[
                const SizedBox(height: 20),
                const Text(
                  'Ad Shown',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
