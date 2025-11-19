class EnvironmentConfig {
  static const bool isProduction = false; // Set to true for production builds
  
  static String get baseUrl {
    if (isProduction) {
      return 'https://backend.harpaljob.com/api';
    } else {
      // For development - adjust based on platform
      // return 'http://10.0.2.2:3000/api'; // Android Emulator (FIXED - server runs on 3000, not 5000)
      return 'https://frontend.harpaljob.com/api'; // Web/Desktop
    }
  }
  
  static const int timeout = 30000; // 30 seconds
  static const Map<String, String> headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}
