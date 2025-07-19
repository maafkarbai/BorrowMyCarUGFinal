import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Car,
  CreditCard,
  Shield,
  Users,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

const Help = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const categories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: BookOpen,
      description: "Learn the basics of using BorrowMyCar",
      articles: [
        "How to create an account",
        "Account verification process",
        "Understanding user roles",
        "First-time booking guide",
      ],
    },
    {
      id: "booking",
      title: "Booking & Rentals",
      icon: Car,
      description: "Everything about booking and managing rentals",
      articles: [
        "How to book a car",
        "Cancellation policy",
        "Modifying your booking",
        "What to do during pickup",
        "Returning the car",
      ],
    },
    {
      id: "payment",
      title: "Payments & Pricing",
      icon: CreditCard,
      description: "Payment methods, pricing, and billing",
      articles: [
        "Accepted payment methods",
        "Understanding pricing",
        "Security deposits",
        "Refunds and disputes",
        "Payment troubleshooting",
      ],
    },
    {
      id: "safety",
      title: "Safety & Insurance",
      icon: Shield,
      description: "Stay safe and protected during your rental",
      articles: [
        "Insurance coverage",
        "Accident procedures",
        "Emergency contacts",
        "Reporting damage",
        "Safety guidelines",
      ],
    },
    {
      id: "listing",
      title: "Listing Your Car",
      icon: Users,
      description: "For car owners who want to earn money",
      articles: [
        "How to list your car",
        "Setting competitive prices",
        "Managing availability",
        "Communicating with renters",
        "Maximizing earnings",
      ],
    },
  ];

  const faqs = [
    {
      category: "general",
      question: "How does BorrowMyCar work?",
      answer: "BorrowMyCar is a peer-to-peer car sharing platform where car owners can rent out their vehicles to verified users. Simply browse available cars, book one that fits your needs, pick it up from the owner, and return it when you're done.",
    },
    {
      category: "booking",
      question: "How do I book a car?",
      answer: "To book a car: 1) Search for cars in your area, 2) Select your preferred vehicle and dates, 3) Review the booking details and total cost, 4) Complete payment, 5) Communicate with the owner for pickup details.",
    },
    {
      category: "booking",
      question: "Can I cancel my booking?",
      answer: "Yes, you can cancel your booking. Cancellation policies vary by owner, but generally: Free cancellation up to 24 hours before pickup, 50% refund for cancellations within 24 hours, no refund for cancellations after pickup time.",
    },
    {
      category: "payment",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit and debit cards (Visa, Mastercard, American Express), as well as cash on pickup for select vehicles. All online payments are processed securely through Stripe.",
    },
    {
      category: "payment",
      question: "When will I be charged?",
      answer: "Your payment method will be charged immediately upon booking confirmation. Security deposits (if applicable) are pre-authorized but only charged if there are damages or violations.",
    },
    {
      category: "safety",
      question: "Am I insured when driving a borrowed car?",
      answer: "Yes, all rentals include comprehensive insurance coverage that protects both the renter and car owner. This includes liability, collision, and comprehensive coverage up to AED 500,000.",
    },
    {
      category: "safety",
      question: "What should I do if there's an accident?",
      answer: "In case of an accident: 1) Ensure everyone's safety, 2) Call emergency services if needed, 3) Contact our 24/7 support line, 4) Take photos of the scene and damages, 5) Don't admit fault, 6) Follow our insurance procedures.",
    },
    {
      category: "listing",
      question: "How much can I earn by listing my car?",
      answer: "Earnings depend on your car's make, model, location, and availability. On average, owners earn AED 800-2,500 per month. Our pricing tool helps you set competitive rates based on market demand.",
    },
    {
      category: "listing",
      question: "Is my car protected when I rent it out?",
      answer: "Absolutely. All renters are verified, and comprehensive insurance covers your vehicle during rentals. We also provide 24/7 roadside assistance and have strict policies against misuse.",
    },
  ];

  const quickActions = [
    {
      title: "Report an Issue",
      description: "Having problems with your rental?",
      icon: AlertTriangle,
      action: "Report Now",
      color: "red",
    },
    {
      title: "Emergency Support",
      description: "Need immediate assistance?",
      icon: Phone,
      action: "Call Now",
      color: "blue",
    },
    {
      title: "Live Chat",
      description: "Chat with our support team",
      icon: MessageCircle,
      action: "Start Chat",
      color: "green",
    },
  ];

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Help Center
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed opacity-90 mb-8">
              Find answers to your questions and get the help you need.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for help articles, FAQs, or topics..."
                  className="block w-full pl-12 pr-4 py-4 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:ring-opacity-50 outline-none text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            const colorClasses = {
              red: "bg-red-50 border-red-200 text-red-600 hover:bg-red-100",
              blue: "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100",
              green: "bg-green-50 border-green-200 text-green-600 hover:bg-green-100",
            };
            
            return (
              <div
                key={index}
                className={`p-6 border rounded-xl transition-colors cursor-pointer ${colorClasses[action.color]}`}
              >
                <div className="flex items-center mb-4">
                  <IconComponent className="h-6 w-6 mr-3" />
                  <h3 className="text-lg font-semibold">{action.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{action.description}</p>
                <button className={`font-medium hover:underline cursor-pointer`}>
                  {action.action} →
                </button>
              </div>
            );
          })}
        </div>

        {/* Help Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Browse by Category
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <div
                  key={category.id}
                  className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                        <IconComponent className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {category.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {category.description}
                        </p>
                      </div>
                      <ChevronDown 
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          expandedCategory === category.id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    
                    {expandedCategory === category.id && (
                      <div className="border-t pt-4">
                        <ul className="space-y-2">
                          {category.articles.map((article, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-600 hover:text-purple-600 cursor-pointer">
                              <ChevronRight className="h-4 w-4 mr-2" />
                              {article}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className="font-medium text-gray-900">
                    {faq.question}
                  </span>
                  <ChevronDown 
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      expandedFAQ === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 pb-4 border-t border-gray-100">
                    <p className="text-gray-600 leading-relaxed pt-4">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFAQs.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600">
                Try different keywords or browse our categories above.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">
            Still Need Help?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Our support team is here to help you 24/7. Get in touch through any of these channels.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <Phone className="h-8 w-8 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Phone Support</h3>
              <p className="text-sm opacity-90 mb-4">Available 24/7</p>
              <a 
                href="tel:+97141234567" 
                className="text-white hover:text-gray-200 font-medium cursor-pointer"
              >
                +971 4 123 4567
              </a>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <Mail className="h-8 w-8 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-sm opacity-90 mb-4">Response within 24 hours</p>
              <a 
                href="mailto:support@borrowmycar.ae" 
                className="text-white hover:text-gray-200 font-medium cursor-pointer"
              >
                support@borrowmycar.ae
              </a>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <MessageCircle className="h-8 w-8 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-sm opacity-90 mb-4">Instant support</p>
              <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer">
                Start Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;