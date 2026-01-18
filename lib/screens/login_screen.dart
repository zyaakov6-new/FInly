import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeIn),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  void _handleLogin() {
    if (_formKey.currentState!.validate()) {
      // Simulate login delay or logic here if needed
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('מתחבר...'),
          backgroundColor: Color(0xFF00C853),
        ),
      );
      
      // Navigate to dashboard
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted) {
           Navigator.pushReplacementNamed(context, '/dashboard');
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(32.0),
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Title
                    Text(
                      'מעקב הוצאות',
                      style: GoogleFonts.rubik(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    // Description
                    Text(
                      'ניהול הוצאות פשוט לעצמאים',
                      style: GoogleFonts.rubik(
                        fontSize: 18,
                        color: Colors.white70,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 48),
                    
                    // Email Field
                    TextFormField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      textAlign: TextAlign.right,
                      textDirection: TextDirection.ltr, // Input text LTR for email usually, but requirement says "RTL". Keeping standard RTL flow for UI, input might naturally be LTR characters. 
                      // Actually, for Hebrew UI, fields usually align right. The email content itself is ASCII. 
                      // Let's stick to the requested TextAlign.right.
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: 'דוא״ל',
                        prefixIcon: Icon(Icons.email_outlined, color: Colors.white54),
                        // Adjust prefix/suffix for RTL: in RTL, prefix is on the right.
                        // Flutter handles RTL automatically if Directionality is set, but sometimes icons flip.
                        // Ideally we want the icon on the visual right (start).
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'נא להזין דוא״ל';
                        }
                        if (!value.contains('@')) {
                          return 'כתובת דוא״ל לא תקינה';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),

                    // Password Field
                    TextFormField(
                      controller: _passwordController,
                      obscureText: true,
                      textAlign: TextAlign.right,
                       style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: 'סיסמה',
                        prefixIcon: Icon(Icons.lock_outline, color: Colors.white54),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'נא להזין סיסמה';
                        }
                        if (value.length < 6) {
                          return 'הסיסמה חייבת להכיל לפחות 6 תווים';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 48),

                    // Login Button
                    AnimatedScale(
                      scale: 1.0, // Can add state for press effect
                      duration: const Duration(milliseconds: 100),
                      child: SizedBox(
                        height: 56,
                        child: ElevatedButton(
                          onPressed: _handleLogin,
                          child: const Text('התחברות'),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Signup Link
                    TextButton(
                      onPressed: () {
                        Navigator.pushNamed(context, '/signup');
                      },
                      child: const Text(
                        'אין לך חשבון? הרשמה',
                        style: TextStyle(color: Colors.white70, fontSize: 16),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
