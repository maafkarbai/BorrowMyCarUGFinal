import React from "react";
import { useTranslation } from "react-i18next";
import {
  Shield,
  Car,
  Heart,
  Phone,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  CreditCard,
  Zap,
} from "lucide-react";

const Insurance = () => {
  const { t } = useTranslation();

  const coverageTypes = [
    {
      title: "Third-Party Liability",
      coverage: "Up to AED 500,000",
      description: "Covers bodily injury and property damage to third parties",
      icon: Users,
      color: "blue",
    },
    {
      title: "Collision Coverage",
      coverage: "Full vehicle value",
      description: "Covers damage to the rental vehicle from accidents",
      icon: Car,
      color: "green",
    },
    {
      title: "Comprehensive Coverage",
      coverage: "Theft, fire, vandalism",
      description: "Protection against non-collision related damages",
      icon: Shield,
      color: "purple",
    },
    {
      title: "Medical Expenses",
      coverage: "Up to AED 50,000",
      description: "Medical costs for injuries sustained during rental",
      icon: Heart,
      color: "red",
    },
  ];

  const emergencySteps = [
    {
      step: "1",
      title: "Ensure Safety",
      description: "Move to a safe location and check for injuries",
      icon: AlertTriangle,
    },
    {
      step: "2", 
      title: "Call Emergency Services",
      description: "Call 999 if there are injuries or major damage",
      icon: Phone,
    },
    {
      step: "3",
      title: "Contact BorrowMyCar",
      description: "Call our 24/7 emergency line: +971 4 555 1234",
      icon: Phone,
    },
    {
      step: "4",
      title: "Document the Scene",
      description: "Take photos and gather witness information",
      icon: FileText,
    },
    {
      step: "5",
      title: "Complete Reports",
      description: "File police report and insurance claim",
      icon: CheckCircle,
    },
  ];

  const partnerInsurers = [
    {
      name: "Al Sagr National Insurance",
      logo: "🏢",
      coverage: "Primary comprehensive coverage",
      rating: "A+ Rated",
    },
    {
      name: "Emirates Insurance Company",
      logo: "🏛️", 
      coverage: "Third-party liability",
      rating: "A Rated",
    },
    {
      name: "Dubai Islamic Insurance",
      logo: "🕌",
      coverage: "Sharia-compliant coverage options",
      rating: "A- Rated",
    },
  ];

  const claimProcess = [
    {
      title: "Report Incident",
      description: "Contact us immediately via app or phone",
      timeframe: "Within 24 hours",
      icon: Phone,
    },
    {
      title: "Assessment",
      description: "Insurance adjuster evaluates damage",
      timeframe: "1-2 business days",
      icon: FileText,
    },
    {
      title: "Approval",
      description: "Claim approved and repair authorized",
      timeframe: "2-3 business days",
      icon: CheckCircle,
    },
    {
      title: "Resolution",
      description: "Repairs completed or compensation paid",
      timeframe: "5-10 business days",
      icon: Zap,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-10 w-10" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Insurance Coverage
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed opacity-90">
              Comprehensive protection for every rental, giving you peace of mind on the road.
            </p>
          </div>
        </div>
      </div>

      {/* Coverage Overview */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Complete Protection Coverage
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every BorrowMyCar rental includes comprehensive insurance coverage through our licensed partners.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {coverageTypes.map((coverage, index) => {
            const IconComponent = coverage.icon;
            const colorClasses = {
              blue: "bg-blue-100 text-blue-600 border-blue-200",
              green: "bg-green-100 text-green-600 border-green-200", 
              purple: "bg-purple-100 text-purple-600 border-purple-200",
              red: "bg-red-100 text-red-600 border-red-200",
            };

            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[coverage.color]}`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {coverage.title}
                </h3>
                <div className="text-2xl font-bold text-green-600 mb-3">
                  {coverage.coverage}
                </div>
                <p className="text-gray-600 text-sm">
                  {coverage.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* What's Covered */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              What's Covered
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Accident Damage</h4>
                  <p className="text-gray-600 text-sm">Collision damage to your rental vehicle</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Theft Protection</h4>
                  <p className="text-gray-600 text-sm">Full vehicle replacement if stolen</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Third-Party Liability</h4>
                  <p className="text-gray-600 text-sm">Coverage for damage to other vehicles and property</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Medical Expenses</h4>
                  <p className="text-gray-600 text-sm">Medical costs for injuries during rental</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Roadside Assistance</h4>
                  <p className="text-gray-600 text-sm">24/7 emergency towing and breakdown support</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              What's Not Covered
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Reckless Driving</h4>
                  <p className="text-gray-600 text-sm">Damages from negligent or reckless driving</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">DUI/DWI</h4>
                  <p className="text-gray-600 text-sm">Driving under influence of alcohol or drugs</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Unauthorized Use</h4>
                  <p className="text-gray-600 text-sm">Using vehicle for illegal activities</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Racing Events</h4>
                  <p className="text-gray-600 text-sm">Competitive racing or speed contests</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Personal Items</h4>
                  <p className="text-gray-600 text-sm">Personal belongings left in the vehicle</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Procedures */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Emergency Procedures
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow these steps in case of an accident or emergency during your rental.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {emergencySteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="text-center">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <IconComponent className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mt-12">
            <div className="text-center">
              <h3 className="text-xl font-bold text-red-900 mb-4">
                24/7 Emergency Hotline
              </h3>
              <div className="flex items-center justify-center space-x-8">
                <div>
                  <div className="text-3xl font-bold text-red-600">+971 4 555 1234</div>
                  <div className="text-red-800 text-sm">Available 24/7 for emergencies</div>
                </div>
                <div className="h-12 w-px bg-red-300"></div>
                <div>
                  <div className="text-lg font-semibold text-red-900">Emergency Services</div>
                  <div className="text-red-800 text-sm">Call 999 for police/ambulance</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Claims Process */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple Claims Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've streamlined our claims process to get you back on the road quickly.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {claimProcess.map((process, index) => {
              const IconComponent = process.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {process.title}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {process.description}
                  </p>
                  <div className="text-sm font-medium text-blue-600">
                    {process.timeframe}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Insurance Partners */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted Insurance Partners
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We work with UAE's leading insurance companies to provide you with the best coverage.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {partnerInsurers.map((partner, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">{partner.logo}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {partner.name}
                </h3>
                <p className="text-gray-600 mb-3">
                  {partner.coverage}
                </p>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {partner.rating}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Insurance FAQs
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm divide-y">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Is insurance included in every rental?
              </h3>
              <p className="text-gray-600">
                Yes, comprehensive insurance coverage is automatically included in every BorrowMyCar rental at no additional cost. This includes third-party liability, collision coverage, theft protection, and medical expenses.
              </p>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Do I need to pay a deductible?
              </h3>
              <p className="text-gray-600">
                There's no deductible for most covered incidents. However, the security deposit may be used to cover any damages that fall outside the insurance coverage or for traffic violations.
              </p>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Can I use my own insurance instead?
              </h3>
              <p className="text-gray-600">
                While you can have your own insurance, BorrowMyCar's coverage is mandatory for all rentals to ensure both renters and owners are properly protected. Your personal insurance may provide additional coverage.
              </p>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What happens if I'm not at fault in an accident?
              </h3>
              <p className="text-gray-600">
                Our insurance will handle the claim regardless of fault. If you're not at fault, we'll work to recover costs from the at-fault party's insurance. You won't be charged anything from your security deposit.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Drive with Confidence
          </h2>
          <p className="text-xl mb-8 opacity-90">
            With our comprehensive insurance coverage, you can focus on enjoying your trip while we handle the protection.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/browse"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Browse Cars
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors cursor-pointer"
            >
              Have Questions?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insurance;