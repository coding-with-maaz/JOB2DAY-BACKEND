import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/job.dart';
import '../config/api_config.dart';
import '../utils/logger.dart';

class JobService {
  final String baseUrl = ApiConfig.baseUrl;

  Future<Map<String, dynamic>> getJobs({
    int page = 1,
    int limit = 10,
    String? search,
    String? location,
    String? jobType,
    String? experience,
    String? salaryRange,
    String? sortBy,
  }) async {
    try {
      final queryParams = {
        'page': page.toString(),
        'limit': limit.toString(),
        if (search != null && search.isNotEmpty) 'search': search,
        if (location != null && location.isNotEmpty) 'location': location,
        if (jobType != null && jobType.isNotEmpty) 'jobType': jobType,
        if (experience != null && experience.isNotEmpty) 'experience': experience,
        if (salaryRange != null && salaryRange.isNotEmpty) 'salaryRange': salaryRange,
        if (sortBy != null && sortBy.isNotEmpty) 'sortBy': sortBy,
      };

      final uri = Uri.parse('$baseUrl/jobs').replace(queryParameters: queryParams);
      Logger.info('Fetching jobs from: $uri');
      
      final response = await http.get(uri, headers: ApiConfig.headers);
      Logger.info('Response status: ${response.statusCode}');
      
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        final List<Job> jobs = (data['jobs'] as List)
            .map((json) => Job.fromJson(json as Map<String, dynamic>))
            .toList();
        Logger.info('Successfully loaded ${jobs.length} jobs');
        return {
          'jobs': jobs,
          'total': data['total'] ?? jobs.length,
        };
      } else {
        Logger.error('Error response body: ${response.body}');
        throw Exception('Failed to load jobs: ${response.statusCode}');
      }
    } catch (e) {
      Logger.error('Exception while loading jobs: $e');
      throw Exception('Failed to load jobs: $e');
    }
  }

  Future<Job> getJobBySlug(String slug) async {
    try {
      final uri = Uri.parse('$baseUrl/jobs/slug/$slug');
      Logger.info('Fetching job by slug: $uri');
      
      final response = await http.get(
        uri,
        headers: ApiConfig.headers,
      );
      
      Logger.info('Job detail response status: ${response.statusCode}');
      
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        Logger.info('Successfully loaded job: ${data['title']}');
        return Job.fromJson(data);
      } else {
        Logger.error('Failed to load job. Status: ${response.statusCode}, Body: ${response.body}');
        throw Exception('Failed to fetch job: ${response.statusCode}');
      }
    } catch (e) {
      Logger.error('Exception while loading job: $e');
      throw Exception('Failed to fetch job: $e');
    }
  }

  Future<List<Job>> getFeaturedJobs({
    int page = 1,
    int limit = 10,
    String? location,
    String? jobType,
    String? experience,
    double? minSalary,
    double? maxSalary,
    String? sort,
  }) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/jobs/featured').replace(
          queryParameters: {
            'page': page.toString(),
            'limit': limit.toString(),
            if (location != null) 'location': location,
            if (jobType != null) 'jobType': jobType,
            if (experience != null) 'experience': experience,
            if (minSalary != null) 'minSalary': minSalary.toString(),
            if (maxSalary != null) 'maxSalary': maxSalary.toString(),
            if (sort != null) 'sort': sort,
          },
        ),
        headers: ApiConfig.headers,
      );
      
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        return (data['jobs'] as List).map((json) => Job.fromJson(json as Map<String, dynamic>)).toList();
      } else {
        throw Exception('Failed to fetch featured jobs: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to fetch featured jobs: $e');
    }
  }

  Future<Map<String, dynamic>> getJobsByCategory(
    String categoryId, {
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/jobs/category/$categoryId').replace(
          queryParameters: {
            'page': page.toString(),
            'limit': limit.toString(),
          },
        ),
        headers: ApiConfig.headers,
      );
      
      if (response.statusCode == 200) {
        final dynamic data = jsonDecode(response.body);
        Logger.info('DEBUG: API response type: ${data.runtimeType}');
        Logger.info('DEBUG: API response data: $data');
        
        // Handle different response formats
        List<Job> jobs;
        int total = 0;
        int currentPage = page;
        int currentLimit = limit;
        
        if (data is List) {
          // API returned a list directly
          jobs = data.map((json) => Job.fromJson(json as Map<String, dynamic>)).toList();
          total = jobs.length;
        } else if (data is Map<String, dynamic>) {
          // API returned a map with jobs key
          if (data.containsKey('jobs')) {
            jobs = (data['jobs'] as List).map((json) => Job.fromJson(json as Map<String, dynamic>)).toList();
          } else {
            // Try to parse the entire response as a list of jobs
            jobs = data.entries.map((entry) {
              if (entry.value is Map<String, dynamic>) {
                return Job.fromJson(entry.value as Map<String, dynamic>);
              }
              throw Exception('Invalid job data format');
            }).toList();
          }
          total = data['total'] ?? jobs.length;
          currentPage = data['page'] ?? page;
          currentLimit = data['limit'] ?? limit;
        } else {
          throw Exception('Unexpected response format');
        }
        
        return {
          'jobs': jobs,
          'total': total,
          'page': currentPage,
          'limit': currentLimit,
        };
      } else {
        throw Exception('Failed to fetch jobs by category: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to fetch jobs by category: $e');
    }
  }

  Future<List<Map<String, dynamic>>> getCountries() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/jobs/countries'),
        headers: ApiConfig.headers,
      );
      
      Logger.info('Countries API response status: ${response.statusCode}');
      
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        final List<dynamic> countries = data['countries'] as List;
        Logger.info('Successfully loaded ${countries.length} countries');
        return countries.cast<Map<String, dynamic>>();
      } else {
        Logger.error('Failed to fetch countries: ${response.statusCode}');
        throw Exception('Failed to fetch countries: ${response.statusCode}');
      }
    } catch (e) {
      Logger.error('Exception while loading countries: $e');
      throw Exception('Failed to fetch countries: $e');
    }
  }

  Future<Map<String, dynamic>> getJobsByCountry(
    String country, {
    int page = 1,
    int limit = 10,
    String? sort,
  }) async {
    try {
      final queryParams = {
        'page': page.toString(),
        'limit': limit.toString(),
        if (sort != null) 'sort': sort,
      };

      final response = await http.get(
        Uri.parse('$baseUrl/jobs/country/$country').replace(
          queryParameters: queryParams,
        ),
        headers: ApiConfig.headers,
      );
      
      Logger.info('Country jobs API response status: ${response.statusCode}');
      
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        Logger.info('Successfully loaded jobs for country: $country');
        return {
          'country': data['country'],
          'jobs': (data['jobs'] as List).map((json) => Job.fromJson(json as Map<String, dynamic>)).toList(),
          'total': data['total'],
          'currentPage': data['currentPage'],
          'totalPages': data['totalPages'],
        };
      } else {
        Logger.error('Failed to fetch jobs by country: ${response.statusCode}');
        throw Exception('Failed to fetch jobs by country: ${response.statusCode}');
      }
    } catch (e) {
      Logger.error('Exception while loading country jobs: $e');
      throw Exception('Failed to fetch jobs by country: $e');
    }
  }

  Future<Map<String, dynamic>> getJobsByCompany(
    String companyName, {
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/jobs/company/$companyName').replace(
          queryParameters: {
            'page': page.toString(),
            'limit': limit.toString(),
          },
        ),
        headers: ApiConfig.headers,
      );
      
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        return {
          'jobs': (data['jobs'] as List).map((json) => Job.fromJson(json as Map<String, dynamic>)).toList(),
          'total': data['total'],
          'page': data['page'],
          'limit': data['limit'],
        };
      } else {
        throw Exception('Failed to fetch jobs by company: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to fetch jobs by company: $e');
    }
  }

  Future<Map<String, dynamic>> getTodayJobs({
    int page = 1,
    int limit = 10,
    String? sort,
  }) async {
    try {
      // Use the dedicated today jobs endpoint
      final response = await http.get(
        Uri.parse('$baseUrl/jobs/today'),
        headers: ApiConfig.headers,
      );
      
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final List<Job> jobs = data.map((json) => Job.fromJson(json as Map<String, dynamic>)).toList();
        
        // Sort by newest first if requested
        if (sort == 'newest') {
          jobs.sort((a, b) => b.createdAt.compareTo(a.createdAt));
        }
        
        return {
          'jobs': jobs,
          'total': jobs.length,
          'page': 1,
          'limit': jobs.length,
        };
      } else {
        throw Exception('Failed to fetch today\'s jobs: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to fetch today\'s jobs: $e');
    }
  }

  Future<int> getTotalJobsCount() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/jobs/total'),
        headers: ApiConfig.headers,
      );
      
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        return data['totalJobs'];
      } else {
        throw Exception('Failed to fetch total jobs count: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to fetch total jobs count: $e');
    }
  }

  Future<Map<String, dynamic>> searchJobs({
    required String query,
    int page = 1,
    int limit = 10,
    String? location,
    String? jobType,
    String? experience,
    double? minSalary,
    double? maxSalary,
    String? sort,
  }) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/jobs').replace(
          queryParameters: {
            'page': page.toString(),
            'limit': limit.toString(),
            'search': query,
            if (location != null) 'location': location,
            if (jobType != null) 'jobType': jobType,
            if (experience != null) 'experience': experience,
            if (minSalary != null) 'minSalary': minSalary.toString(),
            if (maxSalary != null) 'maxSalary': maxSalary.toString(),
            if (sort != null) 'sort': sort,
          },
        ),
        headers: ApiConfig.headers,
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        return {
          'jobs': (data['jobs'] as List).map((json) => Job.fromJson(json as Map<String, dynamic>)).toList(),
          'total': data['total'] ?? 0,
          'page': data['page'] ?? page,
          'limit': data['limit'] ?? limit,
        };
      } else {
        throw Exception('Failed to search jobs: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to search jobs: $e');
    }
  }

  // Job Application Methods
  Future<Map<String, dynamic>> quickApply({
    required int jobId,
    required String firstName,
    required String lastName,
    required String email,
    required String phone,
    required String coverLetter,
    String? resumeUrl,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/jobs/$jobId/quick-apply');
      Logger.info('Submitting quick apply to: $uri');
      
      final body = {
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'phone': phone,
        'coverLetter': coverLetter,
        if (resumeUrl != null && resumeUrl.isNotEmpty) 'resumeUrl': resumeUrl,
      };
      
      final response = await http.post(
        uri,
        headers: ApiConfig.headers,
        body: jsonEncode(body),
      );
      
      Logger.info('Quick apply response status: ${response.statusCode}');
      Logger.info('Quick apply response body: ${response.body}');
      
      if (response.statusCode == 200 || response.statusCode == 201) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        Logger.info('Quick apply successful');
        return data;
      } else {
        final errorData = jsonDecode(response.body);
        Logger.error('Quick apply failed: ${response.statusCode}, ${response.body}');
        throw Exception(errorData['message'] ?? 'Failed to submit application');
      }
    } catch (e) {
      Logger.error('Exception during quick apply: $e');
      throw Exception('Failed to submit application: $e');
    }
  }

  Future<Map<String, dynamic>> applyForJob({
    required int jobId,
    required String coverLetter,
    String? resumeUrl,
    String? authToken,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/jobs/$jobId/apply');
      Logger.info('Submitting authenticated apply to: $uri');
      
      final headers = Map<String, String>.from(ApiConfig.headers);
      if (authToken != null) {
        headers['Authorization'] = 'Bearer $authToken';
      }
      
      final body = {
        'coverLetter': coverLetter,
        if (resumeUrl != null && resumeUrl.isNotEmpty) 'resumeUrl': resumeUrl,
      };
      
      final response = await http.post(
        uri,
        headers: headers,
        body: jsonEncode(body),
      );
      
      Logger.info('Authenticated apply response status: ${response.statusCode}');
      
      if (response.statusCode == 201) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        Logger.info('Authenticated apply successful');
        return data;
      } else {
        final errorData = jsonDecode(response.body);
        Logger.error('Authenticated apply failed: ${response.statusCode}, ${response.body}');
        throw Exception(errorData['message'] ?? 'Failed to submit application');
      }
    } catch (e) {
      Logger.error('Exception during authenticated apply: $e');
      throw Exception('Failed to submit application: $e');
    }
  }
} 
