import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Cookie,
  Settings,
  Shield,
  BarChart3,
  Target,
  Eye,
  Check,
  X,
  Info,
  ExternalLink,
  Calendar,
  Download,
} from "lucide-react";

const Cookies = () => {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState({
    essential: true, // Always true, cannot be disabled
    functional: true,
    analytics: true,
    marketing: false,
  });

  const lastUpdated = "January 15, 2024";

  const cookieTypes = [
    {
      type: "essential",
      title: "Essential Cookies",
      description: "Required for basic website functionality and security",
      icon: Shield,
      required: true,
      examples: [
        "Authentication tokens",
        "Session management",
        "Security preferences",
        "Load balancing",
      ],
      retention: "Session or up to 1 year",
      color: "blue",
    },
    {
      type: "functional",
      title: "Functional Cookies",
      description: "Remember your preferences and enhance your experience",
      icon: Settings,
      required: false,
      examples: [
        "Language preferences",
        "Theme settings",
        "Form data",
        "Accessibility options",
      ],
      retention: "Up to 2 years",
      color: "green",
    },
    {
      type: "analytics",
      title: "Analytics Cookies",
      description: "Help us understand how you use our website",
      icon: BarChart3,
      required: false,
      examples: [
        "Page views and interactions",
        "Error reporting",
        "Performance metrics",
        "Usage patterns",
      ],
      retention: "Up to 2 years",
      color: "purple",
    },
    {
      type: "marketing",
      title: "Marketing Cookies",
      description: "Used to deliver relevant advertisements",
      icon: Target,
      required: false,
      examples: [
        "Ad personalization",
        "Conversion tracking",
        "Social media integration",
        "Remarketing campaigns",
      ],
      retention: "Up to 1 year",
      color: "orange",
    },
  ];

  const cookieDetails = [
    {
      name: "_borrowmycar_session",
      purpose: "Authentication and session management",
      type: "Essential",
      duration: "Session",
      provider: "BorrowMyCar",
    },
    {
      name: "csrf_token",
      purpose: "Cross-site request forgery protection",
      type: "Essential",
      duration: "Session",
      provider: "BorrowMyCar",
    },
    {
      name: "lang_preference",
      purpose: "Remember selected language",
      type: "Functional",
      duration: "1 year",
      provider: "BorrowMyCar",
    },
    {
      name: "_ga",
      purpose: "Google Analytics tracking",
      type: "Analytics",
      duration: "2 years",
      provider: "Google",
    },
    {
      name: "_fbp",
      purpose: "Facebook Pixel tracking",
      type: "Marketing",
      duration: "90 days",
      provider: "Facebook",
    },
  ];

  const thirdPartyServices = [
    {
      name: "Google Analytics",
      purpose: "Website usage analytics",
      cookies: ["_ga", "_gid", "_gat"],
      privacy: "https://policies.google.com/privacy",
      optout: "https://tools.google.com/dlpage/gaoptout",
    },
    {
      name: "Google Maps",
      purpose: "Interactive maps and location services",
      cookies: ["NID", "CONSENT"],
      privacy: "https://policies.google.com/privacy",
      optout: "Via browser settings",
    },
    {
      name: "Stripe",
      purpose: "Payment processing",
      cookies: ["__stripe_mid", "__stripe_sid"],
      privacy: "https://stripe.com/privacy",
      optout: "Via browser settings",
    },
    {
      name: "Facebook Pixel",
      purpose: "Marketing and conversion tracking",
      cookies: ["_fbp", "fr"],
      privacy: "https://www.facebook.com/privacy/policy/",
      optout: "https://www.facebook.com/settings?tab=ads",
    },
  ];

  const handlePreferenceChange = (type) => {
    if (type === "essential") return; // Cannot disable essential cookies
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const savePreferences = () => {
    // In a real implementation, this would save to localStorage and update actual cookie consent
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    alert('Cookie preferences saved successfully!');
  };

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    alert('All cookies accepted!');
  };

  const rejectOptional = () => {
    const essentialOnly = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    setPreferences(essentialOnly);
    localStorage.setItem('cookiePreferences', JSON.stringify(essentialOnly));
    alert('Optional cookies rejected. Only essential cookies will be used.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Cookie className="h-10 w-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Cookie Policy
            </h1>
            <p className="text-xl opacity-90 mb-6">
              Learn about how we use cookies to improve your experience on BorrowMyCar
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm opacity-75">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Last updated: {lastUpdated}
              </div>
              <button className="hover:text-white cursor-pointer">
                <Download className="h-4 w-4 mr-1 inline" />
                Download Policy
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Are Cookies?
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              Cookies are small text files stored on your device when you visit our website. They help us 
              provide you with a better experience by remembering your preferences, keeping you logged in, 
              and understanding how you use our platform.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This Cookie Policy explains what cookies we use, why we use them, and how you can control them. 
              By using BorrowMyCar, you consent to our use of cookies as described in this policy.
            </p>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-6">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-orange-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900 mb-2">Your Control</h4>
                <p className="text-orange-800 text-sm">
                  You have full control over non-essential cookies. You can accept, reject, or customize 
                  your preferences at any time using the controls below or in your browser settings.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cookie Types */}
        <div className="grid gap-6 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Types of Cookies We Use
          </h2>
          
          {cookieTypes.map((cookie, index) => {
            const IconComponent = cookie.icon;
            const colorClasses = {
              blue: "bg-blue-50 border-blue-200 text-blue-600",
              green: "bg-green-50 border-green-200 text-green-600",
              purple: "bg-purple-50 border-purple-200 text-purple-600",
              orange: "bg-orange-50 border-orange-200 text-orange-600",
            };

            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${colorClasses[cookie.color]}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {cookie.title}
                      </h3>
                      <p className="text-gray-600">{cookie.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {cookie.required ? (
                      <div className="flex items-center text-gray-500">
                        <Info className="h-4 w-4 mr-2" />
                        <span className="text-sm">Required</span>
                      </div>
                    ) : (
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences[cookie.type]}
                          onChange={() => handlePreferenceChange(cookie.type)}
                          className="sr-only"
                        />
                        <div className={`w-12 h-6 rounded-full transition-colors ${
                          preferences[cookie.type] ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                            preferences[cookie.type] ? 'translate-x-6' : 'translate-x-0.5'
                          } mt-0.5`}></div>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Examples:</h4>
                    <ul className="space-y-1">
                      {cookie.examples.map((example, idx) => (
                        <li key={idx} className="text-gray-600 text-sm flex items-center">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Data Retention:</h4>
                    <p className="text-gray-600 text-sm">{cookie.retention}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cookie Management */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Manage Your Cookie Preferences
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={acceptAll}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors cursor-pointer"
            >
              <Check className="h-4 w-4 mr-2 inline" />
              Accept All Cookies
            </button>
            <button
              onClick={rejectOptional}
              className="bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4 mr-2 inline" />
              Reject Optional
            </button>
            <button
              onClick={savePreferences}
              className="border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-600 hover:text-white transition-colors cursor-pointer"
            >
              <Settings className="h-4 w-4 mr-2 inline" />
              Save Preferences
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Browser Controls</h4>
            <p className="text-blue-800 text-sm">
              You can also manage cookies through your browser settings. Most browsers allow you to 
              view, delete, and block cookies. Note that disabling cookies may affect website functionality.
            </p>
          </div>
        </div>

        {/* Detailed Cookie List */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Detailed Cookie Information
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Cookie Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Purpose</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Duration</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Provider</th>
                </tr>
              </thead>
              <tbody>
                {cookieDetails.map((cookie, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-mono text-sm text-gray-900">{cookie.name}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{cookie.purpose}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        cookie.type === 'Essential' ? 'bg-blue-100 text-blue-800' :
                        cookie.type === 'Functional' ? 'bg-green-100 text-green-800' :
                        cookie.type === 'Analytics' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {cookie.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{cookie.duration}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{cookie.provider}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Third-Party Services */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Third-Party Services
          </h2>
          <p className="text-gray-700 mb-6">
            We use third-party services that may set their own cookies. Here's information about 
            these services and how to opt out:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {thirdPartyServices.map((service, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {service.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{service.purpose}</p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-700 text-sm">Cookies:</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {service.cookies.map((cookie, idx) => (
                        <span key={idx} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono">
                          {cookie}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 text-sm">
                    <a 
                      href={service.privacy} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      <ExternalLink className="h-3 w-3 mr-1 inline" />
                      Privacy Policy
                    </a>
                    <span className="text-green-600">
                      <Eye className="h-3 w-3 mr-1 inline" />
                      Opt-out: {service.optout}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Questions About Cookies?
          </h2>
          <p className="text-gray-700 text-center mb-6">
            If you have questions about our use of cookies, please contact us:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">Privacy Team</h4>
              <p className="text-gray-600">privacy@borrowmycar.ae</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">General Support</h4>
              <p className="text-gray-600">support@borrowmycar.ae</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p className="mb-2">This Cookie Policy is effective from {lastUpdated}</p>
          <div className="flex items-center justify-center space-x-4">
            <a href="/privacy" className="text-orange-600 hover:text-orange-800 cursor-pointer">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="/terms" className="text-orange-600 hover:text-orange-800 cursor-pointer">
              Terms of Service
            </a>
            <span>•</span>
            <a href="/contact" className="text-orange-600 hover:text-orange-800 cursor-pointer">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cookies;