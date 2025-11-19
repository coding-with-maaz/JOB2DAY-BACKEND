import 'package:flutter/material.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../models/job.dart';
import '../../utils/logger.dart';

class JobHeaderWidget extends StatelessWidget {
  final Job job;
  final VoidCallback? onShare;
  final VoidCallback? onSave;

  const JobHeaderWidget({
    super.key,
    required this.job,
    this.onShare,
    this.onSave,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(24),
          bottomRight: Radius.circular(24),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha:  0.1),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Company logo and basic info
          Row(
            children: [
              // Company logo
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[300]!),
                ),
                child: job.company != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(
                          'https://via.placeholder.com/60x60/cccccc/666666?text=${job.company!['name']?.toString().substring(0, 1) ?? 'C'}',
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            Logger.error('Error loading company logo: $error');
                            return Icon(
                              Icons.business,
                              color: Colors.grey[600],
                              size: 30,
                            );
                          },
                        ),
                      )
                    : Icon(
                        Icons.business,
                        color: Colors.grey[600],
                        size: 30,
                      ),
              ),
              const SizedBox(width: 16),
              
              // Job title and company
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      job.title,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1A1A1A),
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      job.company?['name']?.toString() ?? 'Unknown Company',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[600],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              
              // Action buttons
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    onPressed: onSave,
                    icon: const Icon(Icons.bookmark_border),
                    tooltip: 'Save Job',
                  ),
                  IconButton(
                    onPressed: onShare,
                    icon: const Icon(Icons.share),
                    tooltip: 'Share Job',
                  ),
                ],
              ),
            ],
          ),
          
          const SizedBox(height: 20),
          
          // Job details row
          Row(
            children: [
              _buildInfoChip(
                icon: Icons.location_on,
                text: job.location,
                color: Colors.blue,
              ),
              const SizedBox(width: 12),
              _buildInfoChip(
                icon: Icons.work,
                text: job.jobType,
                color: Colors.green,
              ),
              const SizedBox(width: 12),
              _buildInfoChip(
                icon: Icons.access_time,
                text: timeago.format(job.createdAt),
                color: Colors.orange,
              ),
            ],
          ),
          
          if (job.salary != null && job.salary!.isNotEmpty) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.green.withValues(alpha:  0.1),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.green.withValues(alpha:  0.3)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.attach_money, color: Colors.green[700], size: 20),
                  const SizedBox(width: 8),
                  Text(
                    job.salary!,
                    style: TextStyle(
                      color: Colors.green[700],
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildInfoChip({
    required IconData icon,
    required String text,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha:  0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha:  0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 16),
          const SizedBox(width: 6),
          Text(
            text,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.w500,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}
