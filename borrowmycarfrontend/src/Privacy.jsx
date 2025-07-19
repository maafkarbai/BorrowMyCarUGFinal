import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Shield,
  Eye,
  Lock,
  Database,
  Share2,
  Settings,
  Download,
  Trash2,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Calendar,
} from "lucide-react";

const Privacy = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState(null);

  const lastUpdated = "January 15, 2024";

  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      icon: Shield,
    },
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: Database,
    },
    {
      id: "information-use",
      title: "How We Use Your Information",
      icon: Settings,
    },
    {
      id: "information-sharing",
      title: "Information Sharing",
      icon: Share2,
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: Lock,
    },
    {
      id: "data-retention",
      title: "Data Retention",
      icon: Database,
    },
    {
      id: "user-rights",
      title: "Your Rights",
      icon: Eye,
    },
    {
      id: "cookies",
      title: "Cookies and Tracking",
      icon: Settings,
    },
    {
      id: "third-parties",
      title: "Third-Party Services",
      icon: ExternalLink,
    },
    {
      id: "international",
      title: "International Transfers",
      icon: Share2,
    },
    {
      id: "children",
      title: "Children's Privacy",
      icon: Shield,
    },
    {
      id: "changes",
      title: "Policy Changes",
      icon: Settings,
    },
    {
      id: "contact",
      title: "Contact Information",
      icon: Mail,
    },
  ];

  const dataTypes = [
    {
      category: "Personal Information",
      icon: Eye,
      items: [
        "Full name and contact details",
        "Date of birth and nationality",
        "Government-issued ID documents",
        "Profile photos and verification images",
      ],
    },
    {
      category: "Driving Information",
      icon: Shield,
      items: [
        "Driving license details",
        "Driving history and records",
        "Previous traffic violations",
        "Insurance information",
      ],
    },
    {
      category: "Financial Data",
      icon: Lock,
      items: [
        "Payment method information",
        "Billing and transaction history",
        "Bank account details (for payouts)",
        "Credit score information (where applicable)",
      ],
    },
    {
      category: "Usage Data",
      icon: Database,
      items: [
        "App usage patterns and preferences",
        "Device information and IP address",
        "Location data during trips",
        "Communication within the platform",
      ],
    },
  ];

  const userRights = [
    {
      right: "Access",
      description: "Request a copy of your personal data",
      icon: Eye,
    },
    {
      right: "Correction",
      description: "Update or correct inaccurate information",
      icon: Settings,
    },
    {
      right: "Deletion",
      description: "Request deletion of your data",
      icon: Trash2,
    },
    {
      right: "Portability",
      description: "Receive your data in a transferable format",
      icon: Download,
    },
    {
      right: "Objection",
      description: "Object to certain data processing activities",
      icon: AlertTriangle,
    },
    {
      right: "Restriction",
      description: "Limit how we process your data",
      icon: Lock,
    },
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-10 w-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl opacity-90 mb-6">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm opacity-75">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Last updated: {lastUpdated}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Table of Contents
              </h3>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                        activeSection === section.id
                          ? "bg-green-50 text-green-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <IconComponent className="h-4 w-4 mr-2 inline" />
                      {section.title}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-8 space-y-12">
                
                {/* Introduction */}
                <section id="introduction" className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Introduction
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    At BorrowMyCar, we respect your privacy and are committed to protecting your personal information. 
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
                    you use our car-sharing platform.
                  </p>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900 mb-2">Our Commitment</h4>
                        <ul className="text-green-800 text-sm space-y-1">
                          <li>• We collect only the information necessary to provide our services</li>
                          <li>• We use industry-standard security measures to protect your data</li>
                          <li>• We never sell your personal information to third parties</li>
                          <li>• We comply with UAE data protection laws and international standards</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Information Collection */}
                <section id="information-collection" className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Information We Collect
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {dataTypes.map((type, index) => {
                      const IconComponent = type.icon;
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                              <IconComponent className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">{type.category}</h3>
                          </div>
                          <ul className="space-y-2 text-gray-700 text-sm">
                            {type.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <h4 className="font-medium text-blue-900 mb-2">Automatic Information Collection</h4>
                    <p className="text-blue-800 text-sm">
                      We automatically collect certain information when you use our platform, including device 
                      information, usage patterns, and location data during trips for safety and service optimization.
                    </p>
                  </div>
                </section>

                {/* Information Use */}
                <section id="information-use" className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    How We Use Your Information
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Primary Uses:</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <ul className="space-y-2 text-gray-700">
                          <li>• Verify your identity and eligibility</li>
                          <li>• Process bookings and payments</li>
                          <li>• Facilitate communication between users</li>
                          <li>• Provide customer support</li>
                        </ul>
                        <ul className="space-y-2 text-gray-700">
                          <li>• Ensure platform safety and security</li>
                          <li>• Improve our services and user experience</li>
                          <li>• Send important notifications and updates</li>
                          <li>• Comply with legal requirements</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-medium text-amber-900 mb-2">Marketing Communications</h4>
                      <p className="text-amber-800 text-sm">
                        We may send you promotional emails about new features, special offers, or relevant updates. 
                        You can opt out of marketing communications at any time through your account settings or 
                        unsubscribe links in emails.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Data Security */}
                <section id="data-security" className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Data Security
                  </h2>
                  
                  <p className="text-gray-700 leading-relaxed mb-6">
                    We implement comprehensive security measures to protect your personal information against 
                    unauthorized access, alteration, disclosure, or destruction.
                  </p>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="h-8 w-8 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Encryption</h4>
                      <p className="text-gray-600 text-sm">
                        All data is encrypted in transit and at rest using industry-standard protocols.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="h-8 w-8 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Access Control</h4>
                      <p className="text-gray-600 text-sm">
                        Strict access controls ensure only authorized personnel can access your data.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Database className="h-8 w-8 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Regular Audits</h4>
                      <p className="text-gray-600 text-sm">
                        We conduct regular security audits and vulnerability assessments.
                      </p>
                    </div>
                  </div>
                </section>

                {/* User Rights */}
                <section id="user-rights" className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Your Privacy Rights
                  </h2>
                  
                  <p className="text-gray-700 leading-relaxed mb-6">
                    You have several rights regarding your personal information. You can exercise these rights 
                    by contacting us or using the tools in your account settings.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    {userRights.map((right, index) => {
                      const IconComponent = right.icon;
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <IconComponent className="h-5 w-5 text-green-600 mr-3" />
                            <h4 className="font-semibold text-gray-900">{right.right}</h4>
                          </div>
                          <p className="text-gray-600 text-sm">{right.description}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                    <h4 className="font-medium text-green-900 mb-2">How to Exercise Your Rights</h4>
                    <p className="text-green-800 text-sm mb-3">
                      To exercise any of these rights, please contact our Data Protection Officer at privacy@borrowmycar.ae 
                      or use the privacy settings in your account.
                    </p>
                    <p className="text-green-800 text-sm">
                      We will respond to your request within 30 days and may require verification of your identity 
                      before processing certain requests.
                    </p>
                  </div>
                </section>

                {/* Cookies */}
                <section id="cookies" className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Cookies and Tracking Technologies
                  </h2>
                  
                  <p className="text-gray-700 leading-relaxed mb-6">
                    We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, 
                    and provide personalized content.
                  </p>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Types of Cookies We Use:</h4>
                      <ul className="grid md:grid-cols-2 gap-2 text-gray-700 text-sm">
                        <li>• Essential cookies (required for platform functionality)</li>
                        <li>• Performance cookies (help us improve our services)</li>
                        <li>• Preference cookies (remember your settings)</li>
                        <li>• Marketing cookies (deliver relevant advertisements)</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Managing Cookies</h4>
                      <p className="text-blue-800 text-sm">
                        You can control cookie settings through your browser preferences or our cookie management tool. 
                        Note that disabling certain cookies may affect platform functionality.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Contact Information */}
                <section id="contact" className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Contact Information
                  </h2>
                  
                  <p className="text-gray-700 leading-relaxed mb-6">
                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                  </p>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Data Protection Officer</h4>
                        <div className="space-y-2 text-gray-700">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-500" />
                            <span>privacy@borrowmycar.ae</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-500" />
                            <span>+971 4 123 4567</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Mailing Address</h4>
                        <div className="text-gray-700">
                          <p>BorrowMyCar FZ-LLC</p>
                          <p>Dubai Internet City</p>
                          <p>Building 3, Office 301</p>
                          <p>Dubai, United Arab Emirates</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Footer */}
                <div className="border-t pt-8">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <p>Effective Date: {lastUpdated}</p>
                      <p>Version 2.1</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <a 
                        href="/terms" 
                        className="text-sm text-green-600 hover:text-green-800 cursor-pointer"
                      >
                        <ExternalLink className="h-4 w-4 mr-1 inline" />
                        Terms of Service
                      </a>
                      <a 
                        href="/cookies" 
                        className="text-sm text-green-600 hover:text-green-800 cursor-pointer"
                      >
                        Cookie Policy
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;