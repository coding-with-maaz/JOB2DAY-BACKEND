import 'package:flutter/material.dart';
import 'package:in_app_review/in_app_review.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import '../utils/app_colors.dart';

class StyledExitDialog extends StatefulWidget {
  const StyledExitDialog({super.key});

  @override
  State<StyledExitDialog> createState() => _StyledExitDialogState();
}

class _StyledExitDialogState extends State<StyledExitDialog>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late AnimationController _starAnimationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;
  late Animation<double> _slideAnimation;
  late Animation<double> _starAnimation;
  
  int _selectedStars = 0;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _starAnimationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    
    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.elasticOut),
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeIn),
    );
    _slideAnimation = Tween<double>(begin: 50.0, end: 0.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );
    _starAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _starAnimationController, curve: Curves.bounceOut),
    );
    
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _starAnimationController.dispose();
    super.dispose();
  }

  void _onStarTap(int starIndex) {
    setState(() {
      _selectedStars = starIndex + 1;
    });
    _starAnimationController.forward().then((_) {
      _starAnimationController.reverse();
    });
  }

  Future<void> openPlayStoreReviewPage() async {
    const packageName = 'com.maazkhan07.jobsinquwait'; // Your actual app ID

    final Uri reviewUri = Uri.parse('market://details?id=$packageName');

    if (await canLaunchUrl(reviewUri)) {
      await launchUrl(reviewUri, mode: LaunchMode.externalApplication);
    } else {
      final Uri webUri = Uri.parse('https://play.google.com/store/apps/details?id=$packageName');
      await launchUrl(webUri, mode: LaunchMode.externalApplication);
    }
  }

  Future<void> _requestReview() async {
    if (_selectedStars < 4) {
      // If user gives less than 4 stars, just exit
      Navigator.of(context).pop(true);
      return;
    }
    
    setState(() => _isSubmitting = true);
    
    try {
      // Mark that user has rated
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('hasRated', true);
      
      // Open direct review page
      await openPlayStoreReviewPage();
      
      if (mounted) {
        Navigator.of(context).pop(true); // Exit app
        _showThankYouSnackBar();
      }
    } catch (e) {
      if (mounted) {
        _showErrorSnackBar();
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  void _showThankYouSnackBar() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              _selectedStars >= 4 ? Icons.star : Icons.feedback,
              color: Colors.white,
              size: 20,
            ),
            const SizedBox(width: 8),
            Text(
              _selectedStars >= 4 
                  ? 'Thank you for your ${_selectedStars}-star rating! ⭐'
                  : 'Thank you for your honest feedback! 💪',
            ),
          ],
        ),
        backgroundColor: _selectedStars >= 4 ? AppColors.success : Colors.orange,
        duration: const Duration(seconds: 3),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  void _showErrorSnackBar() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error_outline, color: Colors.white, size: 20),
            const SizedBox(width: 8),
            const Text('Unable to open Play Store review page. Please try again.'),
          ],
        ),
        backgroundColor: AppColors.error,
        duration: const Duration(seconds: 3),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animationController,
      builder: (context, child) {
        return FadeTransition(
          opacity: _fadeAnimation,
          child: ScaleTransition(
            scale: _scaleAnimation,
            child: SlideTransition(
              position: Tween<Offset>(
                begin: const Offset(0, 0.1),
                end: Offset.zero,
              ).animate(_slideAnimation),
              child: Dialog(
                backgroundColor: Colors.transparent,
                elevation: 0,
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                                                boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha:  0.1),
                                blurRadius: 20,
                                offset: const Offset(0, 10),
                              ),
                            ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Header with gradient background
                      Container(
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
                          borderRadius: BorderRadius.only(
                            topLeft: Radius.circular(24),
                            topRight: Radius.circular(24),
                          ),
                        ),
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          children: [
                                                        // Icon
                            Container(
                              width: 60,
                              height: 60,
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha:  0.2),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.star,
                                color: Colors.white,
                                size: 30,
                              ),
                            ),
                            const SizedBox(height: 16),
                            // Title
                            const Text(
                              'Enjoying JOB2DAY?',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'Poppins',
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 8),
                            // Subtitle
                            const Text(
                              'How would you rate JOB2DAY?',
                              style: TextStyle(
                                color: Colors.white70,
                                fontSize: 16,
                                fontFamily: 'Poppins',
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                      // Content
                      Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          children: [
                            // Star Rating
                            const SizedBox(height: 16),
                            Container(
                              padding: const EdgeInsets.all(20),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                  colors: [
                                    Colors.amber.withOpacity(0.1),
                                    Colors.orange.withOpacity(0.05),
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: Colors.amber.withOpacity(0.2),
                                  width: 2,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.amber.withOpacity(0.1),
                                    blurRadius: 10,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: Column(
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: List.generate(5, (index) {
                                      return Expanded(
                                        child: Padding(
                                          padding: const EdgeInsets.symmetric(horizontal: 2),
                                          child: GestureDetector(
                                            onTap: () => _onStarTap(index),
                                            child: AnimatedBuilder(
                                              animation: _starAnimation,
                                              builder: (context, child) {
                                                final isSelected = index < _selectedStars;
                                                final isLastSelected = _selectedStars == index + 1;
                                                
                                                return Transform.scale(
                                                  scale: isLastSelected ? 1.2 : 1.0,
                                                  child: Container(
                                                    padding: const EdgeInsets.all(2),
                                                    decoration: BoxDecoration(
                                                      shape: BoxShape.circle,
                                                      color: isSelected 
                                                          ? Colors.amber.withOpacity(0.1)
                                                          : Colors.transparent,
                                                      boxShadow: isSelected ? [
                                                        BoxShadow(
                                                          color: Colors.amber.withOpacity(0.3),
                                                          blurRadius: 6,
                                                          spreadRadius: 1,
                                                        ),
                                                      ] : null,
                                                    ),
                                                    child: Icon(
                                                      isSelected ? Icons.star : Icons.star_border,
                                                      color: isSelected 
                                                          ? Colors.amber 
                                                          : Colors.grey.shade400,
                                                      size: 32,
                                                    ),
                                                  ),
                                                );
                                              },
                                            ),
                                          ),
                                        ),
                                      );
                                    }),
                                  ),
                                  const SizedBox(height: 12),
                                  // Star count indicator
                                  if (_selectedStars > 0)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          colors: [
                                            Colors.amber.withOpacity(0.8),
                                            Colors.orange.withOpacity(0.6),
                                          ],
                                        ),
                                        borderRadius: BorderRadius.circular(15),
                                        boxShadow: [
                                          BoxShadow(
                                            color: Colors.amber.withOpacity(0.3),
                                            blurRadius: 6,
                                            offset: const Offset(0, 2),
                                          ),
                                        ],
                                      ),
                                      child: Text(
                                        '${_selectedStars} Star${_selectedStars > 1 ? 's' : ''}',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 14,
                                          fontWeight: FontWeight.bold,
                                          fontFamily: 'Poppins',
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 12),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                  colors: _selectedStars >= 4 
                                      ? [
                                          Colors.green.withOpacity(0.15),
                                          Colors.green.withOpacity(0.05),
                                        ]
                                      : _selectedStars >= 3
                                          ? [
                                              Colors.orange.withOpacity(0.15),
                                              Colors.orange.withOpacity(0.05),
                                            ]
                                          : _selectedStars >= 1
                                              ? [
                                                  Colors.red.withOpacity(0.15),
                                                  Colors.red.withOpacity(0.05),
                                                ]
                                              : [
                                                  Colors.grey.withOpacity(0.1),
                                                  Colors.grey.withOpacity(0.05),
                                                ],
                                ),
                                borderRadius: BorderRadius.circular(25),
                                border: Border.all(
                                  color: _selectedStars >= 4 
                                      ? Colors.green.withOpacity(0.4)
                                      : _selectedStars >= 3
                                          ? Colors.orange.withOpacity(0.4)
                                          : _selectedStars >= 1
                                              ? Colors.red.withOpacity(0.4)
                                              : Colors.grey.withOpacity(0.3),
                                  width: 2,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: (_selectedStars >= 4 
                                        ? Colors.green
                                        : _selectedStars >= 3
                                            ? Colors.orange
                                            : _selectedStars >= 1
                                                ? Colors.red
                                                : Colors.grey).withOpacity(0.1),
                                    blurRadius: 8,
                                    offset: const Offset(0, 3),
                                  ),
                                ],
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  if (_selectedStars > 0) ...[
                                    Icon(
                                      _selectedStars >= 4 
                                          ? Icons.sentiment_very_satisfied
                                          : _selectedStars >= 3
                                              ? Icons.sentiment_satisfied
                                              : Icons.sentiment_dissatisfied,
                                      color: _selectedStars >= 4 
                                          ? Colors.green.shade700
                                          : _selectedStars >= 3
                                              ? Colors.orange.shade700
                                              : Colors.red.shade700,
                                      size: 20,
                                    ),
                                    const SizedBox(width: 8),
                                  ],
                                  Text(
                                    _selectedStars == 0 
                                        ? 'Tap to rate us'
                                        : _selectedStars == 1 
                                            ? 'Poor'
                                            : _selectedStars == 2 
                                                ? 'Fair'
                                                : _selectedStars == 3 
                                                    ? 'Good'
                                                    : _selectedStars == 4 
                                                        ? 'Very Good'
                                                        : 'Excellent!',
                                    style: TextStyle(
                                      color: _selectedStars >= 4 
                                          ? Colors.green.shade700
                                          : _selectedStars >= 3
                                              ? Colors.orange.shade700
                                              : _selectedStars >= 1
                                                  ? Colors.red.shade700
                                                  : Color(0xFF3C3C43),
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                      fontFamily: 'Poppins',
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                            // Description
                            Text(
                              _selectedStars >= 4 
                                  ? 'Thank you! Tap "Rate App" to leave a review on Play Store.'
                                  : _selectedStars >= 3
                                      ? 'Thanks for your feedback! Tap "Submit Rating" to continue.'
                                      : _selectedStars >= 1
                                          ? 'We appreciate your honest feedback. We\'ll work to improve!'
                                          : 'Your feedback helps us improve and helps other job seekers find great opportunities!',
                              style: TextStyle(
                                color: Color(0xFF3C3C43),
                                fontSize: 14,
                                fontFamily: 'Poppins',
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 24),
                            // Action buttons
                            Row(
                              children: [
                                // Not Now button
                                Expanded(
                                  child: Container(
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(15),
                                      border: Border.all(
                                        color: const Color(0xFFE5E5E5),
                                        width: 2,
                                      ),
                                    ),
                                    child: Material(
                                      color: Colors.transparent,
                                      child: InkWell(
                                        onTap: () => Navigator.of(context).pop(false),
                                        borderRadius: BorderRadius.circular(15),
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(vertical: 16),
                                          child: const Text(
                                            'Not Now',
                                            style: TextStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.w600,
                                              fontFamily: 'Poppins',
                                              color: Color(0xFF3C3C43),
                                            ),
                                            textAlign: TextAlign.center,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                // Rate Us button
                                Expanded(
                                  child: Container(
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        begin: Alignment.topLeft,
                                        end: Alignment.bottomRight,
                                        colors: _selectedStars >= 4 
                                            ? [
                                                Colors.green,
                                                Colors.green.shade600,
                                              ]
                                            : _selectedStars >= 3
                                                ? [
                                                    Colors.orange,
                                                    Colors.orange.shade600,
                                                  ]
                                                : [
                                                    const Color(0xFF6A11CB),
                                                    const Color(0xFF2575FC),
                                                  ],
                                      ),
                                      borderRadius: BorderRadius.circular(15),
                                      boxShadow: [
                                        BoxShadow(
                                          color: (_selectedStars >= 4 
                                              ? Colors.green
                                              : _selectedStars >= 3
                                                  ? Colors.orange
                                                  : const Color(0xFF6A11CB)).withOpacity(0.3),
                                          blurRadius: 8,
                                          offset: const Offset(0, 4),
                                        ),
                                      ],
                                    ),
                                    child: Material(
                                      color: Colors.transparent,
                                      child: InkWell(
                                        onTap: _selectedStars == 0 || _isSubmitting ? null : _requestReview,
                                        borderRadius: BorderRadius.circular(15),
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(vertical: 16),
                                          child: _isSubmitting
                                              ? const SizedBox(
                                                  width: 20,
                                                  height: 20,
                                                  child: CircularProgressIndicator(
                                                    strokeWidth: 2,
                                                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                                  ),
                                                )
                                              : Text(
                                                  _selectedStars >= 4 
                                                      ? 'Rate App' 
                                                      : _selectedStars >= 3
                                                          ? 'Submit Rating'
                                                          : 'Continue',
                                                  style: const TextStyle(
                                                    fontSize: 16,
                                                    fontWeight: FontWeight.w600,
                                                    fontFamily: 'Poppins',
                                                    color: Colors.white,
                                                  ),
                                                  textAlign: TextAlign.center,
                                                ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            // Exit button
                            SizedBox(
                              width: double.infinity,
                              child: TextButton(
                                onPressed: () => Navigator.of(context).pop(true),
                                style: TextButton.styleFrom(
                                  foregroundColor: const Color(0xFFB0B0B0),
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                ),
                                child: const Text(
                                  'Exit App',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w500,
                                    fontFamily: 'Poppins',
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

// Helper function to show the styled exit dialog
Future<bool?> showStyledExitDialog(BuildContext context) {
  return showDialog<bool>(
    context: context,
    barrierDismissible: false,
    builder: (context) => const StyledExitDialog(),
  );
} 
