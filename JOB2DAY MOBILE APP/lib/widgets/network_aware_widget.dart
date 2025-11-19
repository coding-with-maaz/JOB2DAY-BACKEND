import 'package:flutter/material.dart';
// import 'package:connectivity_plus/connectivity_plus.dart'; // Removed - not in dependencies
// import 'package:internet_connection_checker/internet_connection_checker.dart'; // Removed - not in dependencies
import 'no_internet_widget.dart';

class NetworkAwareWidget extends StatefulWidget {
  final Widget child;

  const NetworkAwareWidget({super.key, required this.child});

  @override
  State<NetworkAwareWidget> createState() => _NetworkAwareWidgetState();
}

class _NetworkAwareWidgetState extends State<NetworkAwareWidget> {
  bool _hasInternet = true;

  @override
  void initState() {
    super.initState();
    _checkInternet();
    // Connectivity check removed - dependencies not available
  }

  Future<void> _checkInternet() async {
    // Simplified connectivity check - assume connected
    if (mounted) {
      setState(() {
        _hasInternet = true; // Assume connected for now
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return _hasInternet
        ? widget.child
        : NoInternetWidget(
            onRetry: _checkInternet,
          );
  }
} 
