import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../models/job.dart';
import '../../utils/logger.dart';

class JobActionsWidget extends StatelessWidget {
  final Job job;
  final VoidCallback? onApply;
  final bool isLoading;

  const JobActionsWidget({
    super.key,
    required this.job,
    this.onApply,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Apply Button
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: isLoading ? null : onApply,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.deepPurple,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 2,
                shadowColor: Colors.deepPurple.withValues(alpha:  0.3),
              ),
              child: isLoading
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.send, size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Apply Now',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
            ),
          ),
          
          const SizedBox(height: 12),
          
          // Additional Actions
          Row(
            children: [
              Expanded(
                child: _buildActionButton(
                  icon: Icons.phone,
                  label: 'Call',
                  onTap: () => _makePhoneCall(),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildActionButton(
                  icon: Icons.email,
                  label: 'Email',
                  onTap: () => _sendEmail(),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildActionButton(
                  icon: Icons.language,
                  label: 'Website',
                  onTap: () => _openWebsite(),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey[300]!),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha:  0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: Colors.deepPurple,
              size: 24,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: Color(0xFF3C3C43),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _makePhoneCall() async {
    // Note: Phone field not available in current Job model
    Logger.warning('Phone functionality not available - field not in Job model');
  }

  Future<void> _sendEmail() async {
    // Note: Email field not available in current Job model
    Logger.warning('Email functionality not available - field not in Job model');
  }

  Future<void> _openWebsite() async {
    // Note: Website field not available in current Job model
    Logger.warning('Website functionality not available - field not in Job model');
  }
}
