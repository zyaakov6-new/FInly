import 'package:flutter/material.dart';

class SignupScreen extends StatelessWidget {
  const SignupScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('הרשמה'),
        centerTitle: true,
      ),
      body: const Center(
        child: Text(
          'עמוד הרשמה',
          style: TextStyle(fontSize: 24),
        ),
      ),
    );
  }
}
