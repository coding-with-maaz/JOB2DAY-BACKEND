import 'environment_config.dart';

class ApiConfig {
  static String get baseUrl => EnvironmentConfig.baseUrl;
  static int get timeout => EnvironmentConfig.timeout;
  static Map<String, String> get headers => EnvironmentConfig.headers;
} 
