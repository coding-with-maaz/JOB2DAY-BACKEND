import 'package:flutter/material.dart';
// import 'package:flutter_html/flutter_html.dart'; // Removed - not in dependencies
import '../../models/job.dart';
import '../../utils/logger.dart';

class JobContentWidget extends StatelessWidget {
  final Job job;

  const JobContentWidget({
    super.key,
    required this.job,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Job Description
          _buildSection(
            title: 'Job Description',
            content: job.description ?? 'No description available.',
          ),
          
          const SizedBox(height: 24),
          
          // Requirements (if available in Job model)
          // if (job.requirements != null && job.requirements!.isNotEmpty)
          //   _buildSection(
          //     title: 'Requirements',
          //     content: job.requirements!,
          //   ),
          
          const SizedBox(height: 24),
          
          // Benefits (if available in Job model)
          // if (job.benefits != null && job.benefits!.isNotEmpty)
          //   _buildSection(
          //     title: 'Benefits',
          //     content: job.benefits!,
          //   ),
          
          const SizedBox(height: 24),
          
          // Company Information
          if (job.company != null)
            _buildCompanySection(job.company!),
        ],
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required String content,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1A1A1A),
          ),
        ),
        const SizedBox(height: 12),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey[200]!),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha:  0.05),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Text(
            content,
            style: const TextStyle(
              fontSize: 14,
              height: 1.5,
              color: Color(0xFF3C3C43),
              fontFamily: 'Poppins',
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCompanySection(dynamic company) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'About Company',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1A1A1A),
          ),
        ),
        const SizedBox(height: 12),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey[200]!),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha:  0.05),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.grey[300]!),
                    ),
                    child: company.logoUrl != null
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.network(
                              company.logoUrl!,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) {
                                Logger.error('Error loading company logo: $error');
                                return Icon(
                                  Icons.business,
                                  color: Colors.grey[600],
                                  size: 24,
                                );
                              },
                            ),
                          )
                        : Icon(
                            Icons.business,
                            color: Colors.grey[600],
                            size: 24,
                          ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          company.name ?? 'Unknown Company',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1A1A1A),
                          ),
                        ),
                        if (company.website != null)
                          Text(
                            company.website!,
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.blue[600],
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
              if (company.description != null && company.description!.isNotEmpty) ...[
                const SizedBox(height: 12),
                Text(
                  company.description!,
                  style: const TextStyle(
                    fontSize: 14,
                    height: 1.5,
                    color: Color(0xFF3C3C43),
                    fontFamily: 'Poppins',
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}
