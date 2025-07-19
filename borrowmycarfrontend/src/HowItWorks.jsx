import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Search,
  Car,
  Calendar,
  Shield,
  CreditCard,
  Key,
  CheckCircle,
  Users,
  Clock,
  MapPin,
  Star,
  ArrowRight,
  Phone,
  MessageCircle,
  AlertTriangle,
  Award,
  Smartphone,
} from "lucide-react";

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState("renter");

  const renterSteps = [
    {
      step: 1,
      icon: Search,
      title: "Browse & Search",
      description: "Search thousands of verified cars across the UAE",
      details: [
        "Filter by location, price, car type, and availability",
        "View detailed photos, specifications, and owner ratings",
        "Read reviews from previous renters",
        "Compare prices and features instantly",
      ],
      image: "🔍",
    },
    {
      step: 2,
      icon: Calendar,
      title: "Book Your Ride",
      description: "Select dates and confirm your booking instantly",
      details: [
        "Choose your rental dates and duration",
        "See instant pricing with no hidden fees",
        "Secure booking with instant confirmation",
        "Flexible cancellation options available",
      ],
      image: "📅",
    },
    {
      step: 3,
      icon: CreditCard,
      title: "Secure Payment",
      description: "Pay safely with our encrypted payment system",
      details: [
        "Two convenient payment options: Credit/debit card or cash on pickup",
        "Bank-level security with SSL encryption",
        "Hold deposit released after safe return",
        "Transparent pricing with detailed breakdown",
      ],
      image: "💳",
    },
    {
      step: 4,
      icon: Key,
      title: "Pick Up & Drive",
      description: "Meet the owner and start your journey",
      details: [
        "Meet at agreed location with flexible timing",
        "Quick vehicle inspection with owner",
        "Receive keys and vehicle documents",
        "24/7 support throughout your rental",
      ],
      image: "🔑",
    },
  ];

  const ownerSteps = [
    {
      step: 1,
      icon: Car,
      title: "List Your Car",
      description: "Create your car listing in minutes",
      details: [
        "Upload high-quality photos of your vehicle",
        "Set your availability and pricing",
        "Add detailed description and features",
        "Verification process ensures quality listings",
      ],
      image: "🚗",
    },
    {
      step: 2,
      icon: Users,
      title: "Get Verified",
      description: "Complete verification for trusted listings",
      details: [
        "Submit required documents (Emirates ID, License)",
        "Vehicle inspection and documentation",
        "Background check and identity verification",
        "Approved listings get priority visibility",
      ],
      image: "✅",
    },
    {
      step: 3,
      icon: Calendar,
      title: "Receive Bookings",
      description: "Accept or decline booking requests",
      details: [
        "Instant notifications for new bookings",
        "Review renter profiles and ratings",
        "Accept bookings with one click",
        "Set automatic approval for verified renters",
      ],
      image: "📱",
    },
    {
      step: 4,
      icon: CreditCard,
      title: "Earn Money",
      description: "Get paid automatically after each rental",
      details: [
        "Automatic payment processing",
        "Competitive earning potential",
        "Weekly payouts to your bank account",
        "Detailed earnings reports and analytics",
      ],
      image: "💰",
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Insurance Coverage",
      description: "Comprehensive insurance protection for all rentals",
      benefits: [
        "Third-party liability coverage",
        "Collision damage protection",
        "Theft protection included",
        "24/7 roadside assistance",
      ],
    },
    {
      icon: CheckCircle,
      title: "Verified Community",
      description: "All users undergo thorough verification",
      benefits: [
        "ID and license verification",
        "Background checks for owners",
        "Rating system for accountability",
        "Trusted community of 50,000+ users",
      ],
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer assistance",
      benefits: [
        "Instant chat support",
        "Emergency helpline",
        "Multilingual support team",
        "Quick resolution guarantee",
      ],
    },
    {
      icon: Smartphone,
      title: "Easy-to-Use Platform",
      description: "Intuitive interface designed for everyone",
      benefits: [
        "Mobile-responsive design",
        "One-click booking process",
        "Real-time notifications",
        "Seamless user experience",
      ],
    },
  ];

  const faqs = [
    {
      question: "What documents do I need to rent a car?",
      answer:
        "You need a valid UAE driving license, Emirates ID or passport, and a credit card for security deposit. International visitors need an International Driving Permit along with their home country license.",
    },
    {
      question: "How does the insurance work?",
      answer:
        "All rentals include comprehensive insurance coverage including third-party liability, collision damage, and theft protection. There's a security deposit that covers any deductibles, which is released after safe return of the vehicle.",
    },
    {
      question: "Can I extend my rental period?",
      answer:
        "Yes, you can extend your rental if the car is available. Simply contact the owner through our platform or reach out to customer support. Additional charges will apply based on the daily rate.",
    },
    {
      question: "What happens if the car breaks down?",
      answer:
        "All rentals include 24/7 roadside assistance. Contact our emergency helpline and we'll arrange immediate help. If the issue is due to mechanical failure, we'll provide a replacement vehicle or full refund.",
    },
    {
      question: "How much can I earn as a car owner?",
      answer:
        "Earnings vary based on your car type, location, and availability. On average, owners earn AED 100-300 per day. Popular cars in Dubai and Abu Dhabi tend to have higher demand and better earning potential.",
    },
    {
      question: "Is my car protected when rented out?",
      answer:
        "Yes, comprehensive insurance covers your vehicle during rentals. All renters are verified and rated. You can set your own approval criteria and decline bookings if needed.",
    },
  ];

  const stats = [
    { number: "50,000+", label: "Happy Users", icon: "👥" },
    { number: "5,000+", label: "Available Cars", icon: "🚗" },
    { number: "7", label: "Emirates Covered", icon: "🇦🇪" },
    { number: "4.8/5", label: "Average Rating", icon: "⭐" },
  ];

  return (
    <>
      <Helmet>
        <title>How It Works - BorrowMyCar | UAE Car Rental Platform</title>
        <meta
          name="description"
          content="Learn how BorrowMyCar works for renters and car owners. Simple steps to rent a car or earn money by listing your vehicle in the UAE."
        />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900">
                How <span className="text-green-600">BorrowMyCar</span> Works
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Whether you want to rent a car or earn money with your vehicle,
                our platform makes it simple, safe, and secure.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl mb-2">{stat.icon}</div>
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                      {stat.number}
                    </div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <nav className="flex space-x-8">
                {[
                  { id: "renter", label: "For Renters", icon: "🚗" },
                  { id: "owner", label: "For Car Owners", icon: "💰" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Steps Section */}
        <div className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {activeTab === "renter"
                  ? "Rent a Car in 4 Easy Steps"
                  : "Start Earning with Your Car"}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {activeTab === "renter"
                  ? "Get behind the wheel of your perfect car in minutes"
                  : "Turn your parked car into a money-making asset"}
              </p>
            </div>

            <div className="space-y-16">
              {(activeTab === "renter" ? renterSteps : ownerSteps).map(
                (step, index) => (
                  <div
                    key={step.step}
                    className={`flex flex-col lg:flex-row items-center gap-12 ${
                      index % 2 === 1 ? "lg:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Content */}
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <step.icon className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                          {step.step}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                          {step.title}
                        </h3>
                        <p className="text-lg text-gray-600 mb-6">
                          {step.description}
                        </p>

                        <ul className="space-y-3">
                          {step.details.map((detail, idx) => (
                            <li
                              key={idx}
                              className="flex items-start space-x-3"
                            >
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Visual */}
                    <div className="flex-1 flex justify-center">
                      <div className="w-64 h-64 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center text-8xl shadow-lg">
                        {step.image}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* CTA */}
            <div className="text-center mt-16">
              <Link
                to={activeTab === "renter" ? "/browse" : "/auth"}
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {activeTab === "renter"
                  ? "Start Browsing Cars"
                  : "List Your Car Now"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-50 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Why Choose BorrowMyCar?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We provide the safest, most convenient car sharing experience in
                the UAE
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                    <feature.icon className="h-6 w-6 text-green-600" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>

                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li
                        key={idx}
                        className="flex items-start space-x-2 text-sm text-gray-700"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Get answers to common questions about our platform
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Still Have Questions?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Our support team is here to help you 24/7. Get in touch and we'll
              respond within minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="tel:+971800266669"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-white hover:bg-white hover:text-green-600 rounded-lg font-medium transition-colors"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call +971 800 BORROW
              </a>
              <a
                href="mailto:support@borrowmycar.ae"
                className="inline-flex items-center px-6 py-3 bg-white text-green-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Email Support
              </a>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of satisfied users across the UAE
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/browse"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
              >
                Browse Cars
                <Search className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-green-600 text-lg font-medium rounded-lg text-green-600 bg-white hover:bg-green-50 transition-colors"
              >
                List Your Car
                <Car className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HowItWorks;
