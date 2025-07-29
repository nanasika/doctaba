import { Stethoscope, Calendar, Video, Shield, Users, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Video,
      title: 'Video Consultations',
      description: 'High-quality video calls with healthcare providers from anywhere.'
    },
    {
      icon: Calendar,
      title: 'Easy Scheduling',
      description: 'Book appointments 24/7 with your preferred healthcare providers.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'HIPAA-compliant platform ensuring your medical data stays protected.'
    },
    {
      icon: Users,
      title: 'Expert Doctors',
      description: 'Access to qualified healthcare professionals across specialties.'
    }
  ];

  const benefits = [
    'Save time with remote consultations',
    'Access healthcare from anywhere',
    'Secure medical record storage',
    'Prescription management',
    'Follow-up care coordination'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-cyan-600 rounded-full p-2">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Doctaba</span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/api/login"
                className="bg-cyan-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-cyan-700 transition-colors"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Healthcare Made
              <span className="text-cyan-600"> Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with qualified healthcare providers through secure video consultations. 
              Get the care you need, when you need it, from the comfort of your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/api/login"
                className="bg-cyan-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-cyan-700 transition-colors"
              >
                Get Started Today
              </a>
              <button className="border-2 border-cyan-600 text-cyan-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-cyan-50 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Modern Healthcare at Your Fingertips
            </h2>
            <p className="text-lg text-gray-600">
              Experience the future of healthcare with our comprehensive telemedicine platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                <div className="bg-cyan-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-cyan-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose Doctaba?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our platform combines cutting-edge technology with compassionate care to deliver 
                an exceptional healthcare experience.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-xl p-8">
              <div className="text-center">
                <div className="bg-cyan-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <Stethoscope className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
                <p className="text-gray-600 mb-6">
                  Join thousands of patients who trust Doctaba for their healthcare needs.
                </p>
                <a
                  href="/api/login"
                  className="bg-cyan-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-cyan-700 transition-colors inline-block"
                >
                  Sign Up Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-cyan-600 rounded-full p-2">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Doctaba</span>
            </div>
            <p className="text-gray-400 mb-4">
              Connecting patients with healthcare providers through secure, convenient telemedicine.
            </p>
            <p className="text-gray-500 text-sm">
              © 2024 Doctaba. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}