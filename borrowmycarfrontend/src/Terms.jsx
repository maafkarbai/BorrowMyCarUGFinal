import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  Download,
  Printer,
  ExternalLink,
} from "lucide-react";

const Terms = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState(null);

  const lastUpdated = "January 15, 2024";

  const sections = [
    {
      id: "definitions",
      title: "1. Definitions and Interpretation",
      icon: FileText,
    },
    {
      id: "acceptance",
      title: "2. Acceptance of Terms",
      icon: CheckCircle,
    },
    {
      id: "platform",
      title: "3. Platform Description",
      icon: Shield,
    },
    {
      id: "registration",
      title: "4. User Registration and Account",
      icon: Calendar,
    },
    {
      id: "verification",
      title: "5. Identity Verification",
      icon: Shield,
    },
    {
      id: "booking",
      title: "6. Booking and Rental Process",
      icon: Calendar,
    },
    {
      id: "payment",
      title: "7. Payment Terms",
      icon: FileText,
    },
    {
      id: "insurance",
      title: "8. Insurance and Liability",
      icon: Shield,
    },
    {
      id: "responsibilities",
      title: "9. User Responsibilities",
      icon: AlertTriangle,
    },
    {
      id: "prohibited",
      title: "10. Prohibited Uses",
      icon: AlertTriangle,
    },
    {
      id: "cancellation",
      title: "11. Cancellation and Refunds",
      icon: Calendar,
    },
    {
      id: "privacy",
      title: "12. Privacy and Data Protection",
      icon: Shield,
    },
    {
      id: "intellectual",
      title: "13. Intellectual Property",
      icon: FileText,
    },
    {
      id: "limitation",
      title: "14. Limitation of Liability",
      icon: AlertTriangle,
    },
    {
      id: "governing",
      title: "15. Governing Law and Jurisdiction",
      icon: FileText,
    },
    {
      id: "termination",
      title: "16. Termination",
      icon: AlertTriangle,
    },
    {
      id: "amendments",
      title: "17. Amendments",
      icon: FileText,
    },
    {
      id: "contact",
      title: "18. Contact Information",
      icon: FileText,
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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Terms of Service
            </h1>
            <p className="text-xl opacity-90 mb-6">
              Please read these terms carefully before using BorrowMyCar
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm opacity-75">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Last updated: {lastUpdated}
              </div>
              <div className="flex items-center space-x-4">
                <button className="hover:text-white cursor-pointer">
                  <Download className="h-4 w-4 mr-1 inline" />
                  Download PDF
                </button>
                <button className="hover:text-white cursor-pointer">
                  <Printer className="h-4 w-4 mr-1 inline" />
                  Print
                </button>
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
                          ? "bg-indigo-50 text-indigo-600"
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
                <div className="prose max-w-none">
                  <p className="text-lg text-gray-700 leading-relaxed mb-6">
                    Welcome to BorrowMyCar, a peer-to-peer car sharing platform operated by BorrowMyCar FZ-LLC, 
                    a company incorporated under the laws of the United Arab Emirates. These Terms of Service 
                    ("Terms") govern your use of our platform, website, and mobile application.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-900 mb-2">Important Notice</h4>
                        <p className="text-amber-800 text-sm">
                          By accessing or using BorrowMyCar, you agree to be bound by these Terms. 
                          If you disagree with any part of these terms, you may not use our service.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Definitions */}
                <section id="definitions" className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    1. Definitions and Interpretation
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Key Terms:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li><strong>"Platform"</strong> - The BorrowMyCar website, mobile application, and related services</li>
                        <li><strong>"User"</strong> - Any person who creates an account or uses our Platform</li>
                        <li><strong>"Owner"</strong> - A User who lists their vehicle for rental on the Platform</li>
                        <li><strong>"Renter"</strong> - A User who books and rents a vehicle through the Platform</li>
                        <li><strong>"Vehicle"</strong> - Any car, motorcycle, or other motor vehicle listed on the Platform</li>
                        <li><strong>"Booking"</strong> - A confirmed reservation for a Vehicle rental period</li>
                        <li><strong>"Trip"</strong> - The period from Vehicle pickup to return</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Acceptance */}
                <section id="acceptance" className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    2. Acceptance of Terms
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    By registering for an account, accessing, or using the BorrowMyCar Platform, you acknowledge that:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 mt-4">
                    <li>You have read, understood, and agree to be bound by these Terms</li>
                    <li>You are at least 21 years old and legally capable of entering into contracts</li>
                    <li>You possess a valid driving license recognized in the UAE</li>
                    <li>All information provided during registration is accurate and complete</li>
                  </ul>
                </section>

                {/* Platform Description */}
                <section id="platform" className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    3. Platform Description
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    BorrowMyCar is an online marketplace that facilitates car sharing between private individuals. 
                    We provide the technology platform to connect Owners and Renters but are not a transportation 
                    company or car rental service.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Our Role:</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Facilitate connections between Users</li>
                      <li>• Process payments and hold security deposits</li>
                      <li>• Provide customer support and dispute resolution</li>
                      <li>• Maintain insurance coverage for all trips</li>
                      <li>• Verify user identities and driving records</li>
                    </ul>
                  </div>
                </section>

                {/* Registration */}
                <section id="registration" className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    4. User Registration and Account
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    To use BorrowMyCar, you must create an account by providing accurate and complete information. 
                    You are responsible for maintaining the confidentiality of your account credentials.
                  </p>
                  <h4 className="font-semibold text-gray-900 mb-2">Account Requirements:</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Valid email address and phone number</li>
                    <li>Government-issued photo identification</li>
                    <li>Valid driving license</li>
                    <li>Payment method verification</li>
                    <li>Profile photo (recommended)</li>
                  </ul>
                </section>

                {/* Verification */}
                <section id="verification" className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    5. Identity Verification
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    All Users must complete our verification process before booking or listing vehicles. 
                    This includes identity verification, driving record checks, and document validation.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">For Renters:</h4>
                      <ul className="text-green-800 text-sm space-y-1">
                        <li>• Emirates ID or Passport</li>
                        <li>• Valid UAE or International Driving License</li>
                        <li>• Driving record verification</li>
                        <li>• Credit/debit card verification</li>
                      </ul>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-medium text-purple-900 mb-2">For Owners:</h4>
                      <ul className="text-purple-800 text-sm space-y-1">
                        <li>• Vehicle registration documents</li>
                        <li>• Valid insurance policy</li>
                        <li>• Vehicle inspection (if required)</li>
                        <li>• Bank account verification</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Booking Process */}
                <section id="booking" className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    6. Booking and Rental Process
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Booking Process:</h4>
                      <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Browse available vehicles and select your preferred option</li>
                        <li>Choose your rental dates and review pricing details</li>
                        <li>Complete payment processing and any required deposits</li>
                        <li>Receive booking confirmation and owner contact details</li>
                        <li>Coordinate pickup location and time with the vehicle owner</li>
                        <li>Complete vehicle inspection at pickup</li>
                        <li>Return vehicle in same condition at agreed time and location</li>
                      </ol>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-900 mb-2">Important Notes:</h4>
                      <ul className="text-yellow-800 text-sm space-y-1">
                        <li>• Bookings are subject to owner approval (unless instant book is enabled)</li>
                        <li>• Late pickups may result in booking cancellation</li>
                        <li>• Vehicle condition must be documented at pickup and return</li>
                        <li>• Fuel level should be maintained throughout the rental period</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Payment Terms */}
                <section id="payment" className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    7. Payment Terms
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    All payments are processed securely through our platform. Renters are charged at the time 
                    of booking confirmation, while Owners receive payment after successful trip completion.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Pricing Components:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Base rental rate (set by Owner)</li>
                        <li>• BorrowMyCar service fee</li>
                        <li>• Insurance coverage fee</li>
                        <li>• Security deposit (refundable)</li>
                        <li>• Additional services (if selected)</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Accepted Payment Methods:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Credit cards (Visa, Mastercard, AMEX)</li>
                        <li>• Debit cards</li>
                        <li>• Digital wallets (Apple Pay, Google Pay)</li>
                        <li>• Bank transfers (for long-term rentals)</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Continue with remaining sections... */}
                <section id="insurance" className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    8. Insurance and Liability
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    BorrowMyCar provides comprehensive insurance coverage for all rental periods through our 
                    licensed insurance partners. This coverage protects both Owners and Renters during trips.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-medium text-blue-900 mb-3">Coverage Includes:</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Third-party liability up to AED 500,000</li>
                        <li>• Collision damage coverage</li>
                        <li>• Theft protection</li>
                        <li>• Fire and natural disaster coverage</li>
                      </ul>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• 24/7 roadside assistance</li>
                        <li>• Emergency towing services</li>
                        <li>• Replacement vehicle (if applicable)</li>
                        <li>• Medical expenses coverage</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Contact */}
                <section id="contact" className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    18. Contact Information
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">BorrowMyCar FZ-LLC</h4>
                        <div className="space-y-2 text-gray-700">
                          <p>Dubai Internet City</p>
                          <p>Building 3, Office 301</p>
                          <p>Dubai, United Arab Emirates</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Contact Details</h4>
                        <div className="space-y-2 text-gray-700">
                          <p>Email: legal@borrowmycar.ae</p>
                          <p>Phone: +971 4 123 4567</p>
                          <p>Support: support@borrowmycar.ae</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Effective Date */}
                <div className="border-t pt-8">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <p>Effective Date: {lastUpdated}</p>
                      <p>Version 2.1</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <a 
                        href="/privacy" 
                        className="text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        <ExternalLink className="h-4 w-4 mr-1 inline" />
                        Privacy Policy
                      </a>
                      <a 
                        href="/contact" 
                        className="text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        Contact Us
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

export default Terms;