import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Calendar,
  DollarSign,
  FileText,
  MessageCircle,
  Shield,
  Info,
} from "lucide-react";

const Refunds = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("policy");

  const refundTiers = [
    {
      timeframe: "More than 24 hours before pickup",
      refund: "100%",
      fees: "No fees",
      color: "green",
      icon: CheckCircle,
    },
    {
      timeframe: "24 hours to 2 hours before pickup",
      refund: "50%",
      fees: "50% cancellation fee",
      color: "yellow",
      icon: Clock,
    },
    {
      timeframe: "Less than 2 hours before pickup",
      refund: "0%",
      fees: "No refund",
      color: "red",
      icon: AlertCircle,
    },
    {
      timeframe: "After pickup time",
      refund: "0%",
      fees: "Full charge + late fee",
      color: "red",
      icon: AlertCircle,
    },
  ];

  const refundReasons = [
    {
      reason: "Standard Cancellation",
      description: "Cancelling due to change of plans",
      policy: "Based on timing (see schedule above)",
      processing: "1-3 business days",
    },
    {
      reason: "Owner Cancellation",
      description: "Owner cancels the booking",
      policy: "100% refund + AED 50 inconvenience credit",
      processing: "1-2 business days",
    },
    {
      reason: "Vehicle Issues",
      description: "Car breakdown or safety concerns",
      policy: "100% refund + replacement vehicle",
      processing: "Immediate/same day",
    },
    {
      reason: "Platform Error",
      description: "Technical issues or double booking",
      policy: "100% refund + AED 100 credit",
      processing: "Same day",
    },
    {
      reason: "Force Majeure",
      description: "Natural disasters, government restrictions",
      policy: "100% refund (case by case)",
      processing: "3-5 business days",
    },
  ];

  const refundProcess = [
    {
      step: "1",
      title: "Request Cancellation",
      description: "Cancel through app or contact support",
      icon: MessageCircle,
    },
    {
      step: "2",
      title: "Review & Approve",
      description: "We review your cancellation request",
      icon: FileText,
    },
    {
      step: "3",
      title: "Calculate Refund",
      description: "Refund amount calculated based on policy",
      icon: DollarSign,
    },
    {
      step: "4",
      title: "Process Payment",
      description: "Refund sent to original payment method",
      icon: CreditCard,
    },
  ];

  const faqs = [
    {
      question: "How long do refunds take to appear in my account?",
      answer: "Refunds typically appear within 3-5 business days, depending on your bank or payment provider. Credit card refunds may take longer than debit card or digital wallet refunds.",
    },
    {
      question: "Can I get a refund if the car doesn't match the description?",
      answer: "Yes, if the vehicle significantly differs from the listing (different model, major undisclosed damage, etc.), you're entitled to a full refund plus a replacement vehicle if available.",
    },
    {
      question: "What if I need to cancel due to a medical emergency?",
      answer: "We understand emergencies happen. Contact our support team with documentation (medical certificate, etc.) and we'll review your case for potential policy exceptions.",
    },
    {
      question: "Do refunds include the service fee?",
      answer: "Yes, when you're eligible for a refund, it includes the full amount you paid including our service fee. Only payment processing fees (typically under AED 5) may be non-refundable.",
    },
    {
      question: "Can I cancel a booking that's already started?",
      answer: "You can end a rental early, but refunds for unused time are only provided in exceptional circumstances (vehicle breakdown, safety issues, etc.) and are subject to review.",
    },
  ];

  const disputeProcess = [
    {
      title: "Contact Support",
      description: "Reach out within 24 hours of the incident",
      timeframe: "Immediate",
    },
    {
      title: "Provide Documentation", 
      description: "Submit photos, receipts, and evidence",
      timeframe: "Within 48 hours",
    },
    {
      title: "Investigation",
      description: "Our team reviews all evidence",
      timeframe: "3-5 business days",
    },
    {
      title: "Resolution",
      description: "Decision made and refund processed if applicable",
      timeframe: "1-2 business days",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="h-10 w-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Refund Policy
            </h1>
            <p className="text-xl opacity-90 mb-6">
              Clear, fair refund terms that protect both renters and car owners
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-2 mb-8">
          <div className="flex space-x-1">
            {[
              { id: "policy", label: "Refund Policy", icon: FileText },
              { id: "process", label: "Refund Process", icon: RefreshCw },
              { id: "disputes", label: "Disputes", icon: Shield },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Refund Policy Tab */}
        {activeTab === "policy" && (
          <div className="space-y-12">
            {/* Cancellation Schedule */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Cancellation & Refund Schedule
              </h2>
              <div className="grid gap-6">
                {refundTiers.map((tier, index) => {
                  const IconComponent = tier.icon;
                  const colorClasses = {
                    green: "bg-green-50 border-green-200 text-green-700",
                    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
                    red: "bg-red-50 border-red-200 text-red-700",
                  };

                  return (
                    <div key={index} className={`border rounded-xl p-6 ${colorClasses[tier.color]}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <IconComponent className="h-6 w-6 mr-4" />
                          <div>
                            <h3 className="text-lg font-semibold">
                              {tier.timeframe}
                            </h3>
                            <p className="text-sm opacity-75">{tier.fees}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">{tier.refund}</div>
                          <div className="text-sm opacity-75">refund</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Refund Scenarios */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Refund Scenarios
              </h2>
              <div className="space-y-6">
                {refundReasons.map((reason, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {reason.reason}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {reason.description}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Policy</h4>
                        <p className="text-gray-600 text-sm">{reason.policy}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Processing Time</h4>
                        <p className="text-gray-600 text-sm">{reason.processing}</p>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Notes */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Important Notes
                </h3>
                <ul className="text-blue-800 text-sm space-y-2">
                  <li>• All times are based on UAE Standard Time</li>
                  <li>• Refunds are processed to the original payment method</li>
                  <li>• No-shows are charged the full amount plus fees</li>
                  <li>• Service fees are refunded when eligible</li>
                  <li>• Bank processing times may vary</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Protection for Owners
                </h3>
                <ul className="text-green-800 text-sm space-y-2">
                  <li>• Compensation for last-minute cancellations</li>
                  <li>• Protection against frequent cancellers</li>
                  <li>• Fair dispute resolution process</li>
                  <li>• Automatic payout on successful rentals</li>
                  <li>• Support for genuine emergencies</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Refund Process Tab */}
        {activeTab === "process" && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How Refunds Work
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our streamlined refund process ensures you get your money back quickly and fairly.
              </p>
            </div>

            {/* Process Steps */}
            <div className="grid md:grid-cols-4 gap-6">
              {refundProcess.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div key={index} className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <IconComponent className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
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

            {/* Refund Methods */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Refund Methods & Timeframes
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Credit/Debit Cards</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Timeframe:</strong> 3-5 business days</p>
                    <p><strong>Fee:</strong> None</p>
                    <p><strong>Note:</strong> May take longer during holidays</p>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Digital Wallets</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Timeframe:</strong> 1-2 business days</p>
                    <p><strong>Fee:</strong> None</p>
                    <p><strong>Note:</strong> Fastest refund method</p>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Bank Transfer</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Timeframe:</strong> 1-3 business days</p>
                    <p><strong>Fee:</strong> AED 10 (for international)</p>
                    <p><strong>Note:</strong> Used for large amounts</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h3>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      {faq.question}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Disputes Tab */}
        {activeTab === "disputes" && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Dispute Resolution
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Fair and transparent process for resolving payment disputes.
              </p>
            </div>

            {/* Dispute Process */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Dispute Process
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                {disputeProcess.map((step, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h4>
                    <p className="text-gray-600 text-sm mb-2">
                      {step.description}
                    </p>
                    <div className="text-blue-600 text-sm font-medium">
                      {step.timeframe}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Disputes */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Common Dispute Types
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Damage Claims</h4>
                      <p className="text-gray-600 text-sm">Disputes about vehicle damage or repair costs</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Late Fees</h4>
                      <p className="text-gray-600 text-sm">Disagreements about late return charges</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CreditCard className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Overcharges</h4>
                      <p className="text-gray-600 text-sm">Unexpected charges or billing errors</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 text-purple-500 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Service Issues</h4>
                      <p className="text-gray-600 text-sm">Vehicle not as described or service problems</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Resolution Outcomes
                </h3>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900">Full Refund</h4>
                    <p className="text-green-800 text-sm">Complete refund when dispute is valid</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900">Partial Refund</h4>
                    <p className="text-blue-800 text-sm">Proportional refund based on circumstances</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900">Credit Applied</h4>
                    <p className="text-yellow-800 text-sm">Account credit for future bookings</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">No Refund</h4>
                    <p className="text-gray-600 text-sm">When evidence doesn't support claim</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">
            Need Help with a Refund?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Our support team is here to help with any refund questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Contact Support
            </a>
            <a
              href="mailto:refunds@borrowmycar.ae"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors cursor-pointer"
            >
              Email Refunds Team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Refunds;