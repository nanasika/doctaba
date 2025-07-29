import { useState } from 'react';
import { useLocation } from 'wouter';
import { Stethoscope, Mail, Lock, User, Building2, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  userType: z.enum(['patient', 'doctor'], {
    required_error: 'Please select your role',
  }),
  specialty: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect if already logged in
  if (user) {
    setLocation('/');
    return null;
  }

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      userType: 'patient' as const,
      specialty: '',
    },
  });

  const watchUserType = registerForm.watch('userType');

  const onLogin = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterForm) => {
    const userData = {
      ...data,
      specialty: data.userType === 'doctor' ? data.specialty : undefined,
    };
    registerMutation.mutate(userData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-screen">
          {/* Left Column - Form */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="bg-cyan-600 rounded-full p-2">
                    <Stethoscope className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">Doctaba</span>
                </div>
                <CardTitle>{isLogin ? 'Welcome Back' : 'Create Account'}</CardTitle>
                <CardDescription>
                  {isLogin 
                    ? 'Sign in to access your healthcare dashboard' 
                    : 'Join our telemedicine platform today'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLogin ? (
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          {...loginForm.register('email')}
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                        />
                      </div>
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{loginForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          {...loginForm.register('password')}
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10"
                        />
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">First Name</label>
                        <Input 
                          {...registerForm.register('firstName')}
                          placeholder="John" 
                        />
                        {registerForm.formState.errors.firstName && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.firstName.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Last Name</label>
                        <Input 
                          {...registerForm.register('lastName')}
                          placeholder="Doe" 
                        />
                        {registerForm.formState.errors.lastName && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.lastName.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          {...registerForm.register('email')}
                          type="email"
                          placeholder="john@example.com"
                          className="pl-10"
                        />
                      </div>
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          {...registerForm.register('password')}
                          type="password"
                          placeholder="Create a password"
                          className="pl-10"
                        />
                      </div>
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">I am a</label>
                      <div className="relative">
                        <select
                          {...registerForm.register('userType')}
                          className="flex h-10 w-full appearance-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="patient">Patient</option>
                          <option value="doctor">Doctor</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                      {registerForm.formState.errors.userType && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.userType.message}</p>
                      )}
                    </div>
                    {watchUserType === 'doctor' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Medical Specialty</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            {...registerForm.register('specialty')}
                            placeholder="e.g., General Medicine, Cardiology"
                            className="pl-10"
                          />
                        </div>
                        {registerForm.formState.errors.specialty && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.specialty.message}</p>
                        )}
                      </div>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                )}

                <div className="text-center mt-6">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-cyan-600 hover:text-cyan-700"
                  >
                    {isLogin 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Hero Section */}
          <div className="flex items-center justify-center p-8">
            <div className="text-center max-w-lg">
              <div className="bg-white rounded-full p-6 inline-block mb-8 shadow-lg">
                <Stethoscope className="h-16 w-16 text-cyan-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                Modern Healthcare,
                <span className="text-cyan-600"> Simplified</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Connect with healthcare providers through secure video consultations. 
                Experience the future of telemedicine with our comprehensive platform.
              </p>
              <div className="grid grid-cols-1 gap-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="bg-cyan-100 rounded-full p-2">
                    <User className="h-4 w-4 text-cyan-600" />
                  </div>
                  <span className="text-gray-700">Secure patient-doctor communication</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-cyan-100 rounded-full p-2">
                    <Stethoscope className="h-4 w-4 text-cyan-600" />
                  </div>
                  <span className="text-gray-700">High-quality video consultations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-cyan-100 rounded-full p-2">
                    <Building2 className="h-4 w-4 text-cyan-600" />
                  </div>
                  <span className="text-gray-700">Easy appointment scheduling</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}