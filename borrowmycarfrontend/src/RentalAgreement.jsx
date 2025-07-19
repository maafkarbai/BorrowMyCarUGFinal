import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Car,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  Download,
  Printer,
  Calendar,
} from "lucide-react";

const RentalAgreement = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState(null);

  const lastUpdated = "January 15, 2024";

  const sections = [
    {
      id: "overview",
      title: "Agreement Overview",
      icon: FileText,
    },
    {
      id: "parties",
      title: "Parties to the Agreement",
      icon: CheckCircle,
    },
    {
      id: "vehicle-details",
      title: "Vehicle Information",
      icon: Car,
    },
    {
      id: "rental-period",
      title: "Rental Period",
      icon: Clock,
    },
    {
      id: "pickup-return",
      title: "Pickup and Return",
      icon: MapPin,
    },
    {
      id: "payment-terms",
      title: "Payment and Deposits",
      icon: CreditCard,
    },
    {
      id: "insurance-coverage",
      title: "Insurance Coverage",
      icon: Shield,
    },
    {
      id: "renter-obligations",
      title: "Renter Obligations",
      icon: AlertTriangle,
    },
    {
      id: "owner-obligations",
      title: "Owner Obligations",
      icon: CheckCircle,
    },
    {
      id: "damages-violations",
      title: "Damages and Violations",
      icon: AlertTriangle,
    },
    {
      id: "termination",
      title: "Early Termination",
      icon: Clock,
    },
    {
      id: "dispute-resolution",
      title: "Dispute Resolution",
      icon: Shield,
    },
  ];

  const keyTerms = [
    {
      term: "Rental Period",
      definition: "The agreed time period from pickup to return of the vehicle",
      icon: Clock,
    },
    {
      term: "Security Deposit",
      definition: "Refundable amount held to cover potential damages or violations",
      icon: CreditCard,
    },
    {
      term: "Authorized Driver",
      definition: "Person listed in the agreement who is permitted to drive the vehicle",
      icon: CheckCircle,
    },
    {
      term: "Fair Use",
      definition: "Normal wear and tear expected during reasonable vehicle operation",
      icon: Car,
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
      <div className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Rental Agreement
            </h1>
            <p className="text-xl opacity-90 mb-6">
              Standard terms and conditions for all BorrowMyCar vehicle rentals
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm opacity-75">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Last updated: {lastUpdated}
              </div>
              <div className="flex items-center space-x-4">
                <button className="hover:text-white cursor-pointer">
                  <Download className="h-4 w-4 mr-1 inline" />
                  Download Agreement
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
                Agreement Sections
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
                          ? "bg-blue-50 text-blue-600"
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
                
                {/* Overview */}
                <section id="overview" className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Vehicle Rental Agreement Overview
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    This Rental Agreement governs the terms and conditions for vehicle rentals facilitated through 
                    the BorrowMyCar platform. By confirming a booking, both the Vehicle Owner and Renter agree to 
                    be bound by these terms.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-medium text-blue-900 mb-3">Agreement Formation</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• This agreement is formed when a booking is confirmed by the Owner</li>
                      <li>• BorrowMyCar acts as a facilitator and is not a party to the rental agreement</li>
                      <li>• The agreement is governed by UAE law and BorrowMyCar's Terms of Service</li>
                      <li>• Digital signatures and confirmations are legally binding</li>
                    </ul>
                  </div>
                </section>

                {/* Key Terms */}
                <section className="prose max-w-none">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Key Terms and Definitions</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {keyTerms.map((item, index) => {
                      const IconComponent = item.icon;
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <IconComponent className="h-5 w-5 text-blue-600 mr-2" />
                            <h4 className="font-semibold text-gray-900">{item.term}</h4>
                          </div>
                          <p className="text-gray-600 text-sm">{item.definition}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Parties */}
                <section id="parties" className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Parties to the Agreement
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h4 className="font-semibold text-green-900 mb-3">Vehicle Owner ("Owner")</h4>
                      <ul className="text-green-800 text-sm space-y-1">
                        <li>• Individual who owns the vehicle</li>
                        <li>• Verified member of BorrowMyCar platform</li>
                        <li>• Responsible for vehicle condition and legality</li>
                        <li>• Must provide accurate vehicle information</li>
                      </ul>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                      <h4 className="font-semibold text-purple-900 mb-3">Vehicle Renter ("Renter")</h4>
                      <ul className="text-purple-800 text-sm space-y-1">
                        <li>• Individual booking the vehicle rental</li>
                        <li>• Verified member with valid driving license</li>
                        <li>• Responsible for vehicle during rental period</li>
                        <li>• Must comply with all terms and conditions</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Vehicle Information */}
                <section id="vehicle-details" className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Vehicle Information Requirements
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    The Owner must provide accurate and complete information about the vehicle, including:
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Required Details:</h4>
                        <ul className="text-gray-700 space-y-1">
                          <li>• Make, model, and year</li>
                          <li>• License plate number</li>
                          <li>• Current mileage</li>
                          <li>• Fuel type and capacity</li>
                          <li>• Transmission type</li>
                          <li>• Seating capacity</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Documentation:</h4>
                        <ul className="text-gray-700 space-y-1">
                          <li>• Valid registration certificate</li>
                          <li>• Current insurance policy</li>
                          <li>• Mulkiya (ownership document)</li>
                          <li>• Recent inspection certificate</li>
                          <li>• Maintenance records (if requested)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Rental Period */}
                <section id="rental-period" className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Rental Period and Duration
                  </h2>
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h4 className="font-semibold text-blue-900 mb-3">Rental Terms:</h4>
                      <ul className="text-blue-800 space-y-2">
                        <li>• Minimum rental period: 3 hours</li>
                        <li>• Maximum rental period: 30 days (subject to owner approval)</li>
                        <li>• Grace period for return: 15 minutes</li>
                        <li>• Late return fees: AED 50 per hour or part thereof</li>
                        <li>• Rental period includes pickup and return time</li>
                      </ul>
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-medium text-amber-900 mb-2">Time Zone</h4>
                      <p className="text-amber-800 text-sm">
                        All times are in UAE Standard Time (UTC+4). Both parties must confirm pickup and return 
                        times to avoid confusion.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Pickup and Return */}
                <section id="pickup-return" className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Vehicle Pickup and Return Procedures
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Car className="h-5 w-5 mr-2 text-green-600" />
                        At Pickup
                      </h4>
                      <ul className="text-gray-700 space-y-2 text-sm">
                        <li>• Verify renter's identity and driving license</li>
                        <li>• Complete vehicle inspection checklist</li>
                        <li>• Document existing damages with photos</li>
                        <li>• Check fuel level and mileage</li>
                        <li>• Confirm emergency contact information</li>
                        <li>• Hand over keys and vehicle documents</li>
                      </ul>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                        At Return
                      </h4>
                      <ul className="text-gray-700 space-y-2 text-sm">
                        <li>• Return vehicle to agreed location on time</li>
                        <li>• Complete return inspection with owner</li>
                        <li>• Document vehicle condition with photos</li>
                        <li>• Return fuel to original level (±10%)</li>
                        <li>• Return all keys and documents</li>
                        <li>• Settle any additional charges</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Payment Terms */}
                <section id="payment-terms" className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Payment Terms and Security Deposits
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="bg-green-50 rounded-lg p-6">
                      <h4 className="font-semibold text-green-900 mb-3">Payment Structure:</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <ul className="text-green-800 space-y-1">
                          <li>• Rental fee: Charged at booking</li>
                          <li>• BorrowMyCar service fee: 15-20%</li>
                          <li>• Insurance fee: Included in service fee</li>
                          <li>• Security deposit: AED 500-2,000</li>
                        </ul>
                        <ul className="text-green-800 space-y-1">
                          <li>• Fuel costs: Renter responsibility</li>
                          <li>• Parking fees: Renter responsibility</li>
                          <li>• Traffic fines: Renter responsibility</li>
                          <li>• Additional driver fee: AED 25/day</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-900 mb-2">Security Deposit</h4>
                      <p className="text-yellow-800 text-sm mb-2">
                        The security deposit is authorized on your payment method but only charged if:
                      </p>
                      <ul className="text-yellow-800 text-sm space-y-1">
                        <li>• Vehicle is damaged during rental period</li>
                        <li>• Traffic violations are incurred</li>
                        <li>• Vehicle is returned unclean or with odors</li>
                        <li>• Additional mileage charges apply</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Insurance Coverage */}
                <section id="insurance-coverage" className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Insurance Coverage and Protection
                  </h2>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h4 className="font-semibold text-blue-900 mb-3">Comprehensive Coverage Includes:</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <ul className="text-blue-800 space-y-1">
                        <li>• Third-party liability (up to AED 500,000)</li>
                        <li>• Collision damage coverage</li>
                        <li>• Theft and vandalism protection</li>
                        <li>• Fire and natural disaster coverage</li>
                      </ul>
                      <ul className="text-blue-800 space-y-1">
                        <li>• 24/7 roadside assistance</li>
                        <li>• Emergency towing services</li>
                        <li>• Medical expenses (up to AED 50,000)</li>
                        <li>• Replacement vehicle (if available)</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-2">Coverage Exclusions:</h4>
                    <ul className="text-red-800 text-sm space-y-1">
                      <li>• Damages caused by reckless or negligent driving</li>
                      <li>• Driving under the influence of alcohol or drugs</li>
                      <li>• Using vehicle for illegal purposes</li>
                      <li>• Off-road driving (unless vehicle is suitable)</li>
                      <li>• Racing or competitive driving events</li>
                    </ul>
                  </div>
                </section>

                {/* Renter Obligations */}
                <section id="renter-obligations" className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Renter Responsibilities and Obligations
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-3">During Rental Period:</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <ul className="text-gray-700 space-y-1">
                          <li>• Drive safely and follow traffic laws</li>
                          <li>• Maintain vehicle in good condition</li>
                          <li>• Report any issues immediately</li>
                          <li>• Keep vehicle locked when unattended</li>
                          <li>• Use only approved fuel type</li>
                        </ul>
                        <ul className="text-gray-700 space-y-1">
                          <li>• Allow only authorized drivers</li>
                          <li>• Maintain insurance requirements</li>
                          <li>• Pay for fuel, parking, and tolls</li>
                          <li>• Return vehicle clean and undamaged</li>
                          <li>• Cooperate with owner and platform</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-900 mb-2">Prohibited Activities:</h4>
                      <ul className="text-red-800 text-sm space-y-1">
                        <li>• Subletting or sharing vehicle with unauthorized persons</li>
                        <li>• Using vehicle for commercial purposes (unless agreed)</li>
                        <li>• Smoking or vaping inside the vehicle</li>
                        <li>• Transporting pets (unless pre-approved)</li>
                        <li>• Modifying or altering vehicle in any way</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Contact */}
                <section className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Questions About This Agreement?
                  </h2>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-gray-700 mb-4">
                      If you have questions about this rental agreement, please contact us:
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Customer Support</h4>
                        <div className="space-y-2 text-gray-700">
                          <p>Email: support@borrowmycar.ae</p>
                          <p>Phone: +971 4 123 4567</p>
                          <p>Available: 24/7</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Legal Department</h4>
                        <div className="space-y-2 text-gray-700">
                          <p>Email: legal@borrowmycar.ae</p>
                          <p>Response: Within 24 hours</p>
                          <p>For complex legal matters</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Footer */}
                <div className="border-t pt-8">
                  <div className="text-center text-sm text-gray-500">
                    <p className="mb-2">This agreement is effective from {lastUpdated}</p>
                    <p>By booking a vehicle through BorrowMyCar, you agree to these terms and conditions.</p>
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

export default RentalAgreement;