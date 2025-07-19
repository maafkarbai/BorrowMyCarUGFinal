import React from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Users,
  MapPin,
  Lightbulb,
  Target,
  TrendingUp,
  Award,
  Heart,
  Zap,
  Globe,
} from "lucide-react";

const Story = () => {
  const { t } = useTranslation();

  const timeline = [
    {
      year: "2020",
      title: "The Idea is Born",
      description: "Founded with a vision to make car sharing accessible and trusted across the UAE.",
      icon: Lightbulb,
    },
    {
      year: "2021",
      title: "Building the Platform",
      description: "Spent months developing our secure, user-friendly platform with local insights.",
      icon: Zap,
    },
    {
      year: "2022",
      title: "Launch in Dubai",
      description: "Officially launched in Dubai with 100 verified cars and 500 users.",
      icon: MapPin,
    },
    {
      year: "2023",
      title: "UAE Expansion",
      description: "Expanded to Abu Dhabi, Sharjah, and other emirates with 2,000+ cars.",
      icon: TrendingUp,
    },
    {
      year: "2024",
      title: "Market Leader",
      description: "Became the UAE's most trusted car-sharing platform with 10,000+ users.",
      icon: Award,
    },
  ];

  const milestones = [
    { number: "2020", label: "Year Founded" },
    { number: "10K+", label: "Active Users" },
    { number: "5K+", label: "Cars Listed" },
    { number: "7", label: "Cities Covered" },
    { number: "50K+", label: "Successful Bookings" },
    { number: "4.9", label: "Average Rating" },
  ];

  const challenges = [
    {
      challenge: "Building Trust",
      solution: "Implemented rigorous verification for both car owners and renters, plus comprehensive insurance coverage.",
      icon: Users,
    },
    {
      challenge: "Cultural Adaptation",
      solution: "Localized our platform for UAE culture, supporting Arabic language and local payment methods.",
      icon: Globe,
    },
    {
      challenge: "Safety Standards",
      solution: "Established strict car inspection protocols and 24/7 customer support for peace of mind.",
      icon: Award,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Our Story
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed opacity-90">
              The journey of building the UAE's most trusted car-sharing community.
            </p>
          </div>
        </div>
      </div>

      {/* Origin Story */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              How It All Started
            </h2>
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                In 2020, our founder Ahmed Al-Mansouri was frustrated by the limited and expensive car rental options in the UAE. As someone who only needed a car occasionally, buying one didn't make financial sense, yet traditional rentals were costly and inflexible.
              </p>
              <p>
                The idea struck during a conversation with his neighbor who mentioned his car sat unused 90% of the time. "What if people could share cars safely and conveniently?" Ahmed thought. That simple question sparked the creation of BorrowMyCar.
              </p>
              <p>
                We realized that the UAE, with its tech-savvy population and strong community values, was the perfect place to build a trusted car-sharing platform that would benefit both car owners and renters.
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Purpose
              </h3>
              <p className="text-gray-700 leading-relaxed">
                To create a sustainable, community-driven mobility solution that makes car access affordable while helping owners earn from their unused vehicles.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From a simple idea to the UAE's leading car-sharing platform.
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-green-200"></div>
            <div className="space-y-12">
              {timeline.map((item, index) => {
                const IconComponent = item.icon;
                const isEven = index % 2 === 0;
                return (
                  <div key={index} className={`flex items-center ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-1/2 ${isEven ? 'pr-8 text-right' : 'pl-8'}`}>
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="text-2xl font-bold text-green-600 mb-2">
                          {item.year}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="relative z-10 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <div className="w-1/2"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Key Milestones
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Numbers that reflect our growth and community impact.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                  {milestone.number}
                </div>
                <div className="text-gray-600 font-medium">{milestone.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Challenges & Solutions */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Challenges We Overcame
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Building trust in a new market required innovative solutions and unwavering commitment.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {challenges.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                    <IconComponent className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Challenge: {item.challenge}
                  </h3>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium text-green-600 mb-2">Our Solution:</h4>
                    <p className="text-gray-600 leading-relaxed">
                      {item.solution}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vision */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Looking Forward
              </h2>
              <div className="space-y-6 text-lg leading-relaxed opacity-90">
                <p>
                  We're just getting started. Our vision extends beyond car sharing to building a comprehensive mobility ecosystem for the UAE and the broader Middle East region.
                </p>
                <p>
                  We're working on exciting features like electric vehicle integration, carbon offset programs, and community events that bring our users together.
                </p>
                <p>
                  Join us as we continue to innovate and make mobility more sustainable, accessible, and community-driven.
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-10 rounded-2xl p-8">
                <Target className="h-20 w-20 mx-auto mb-6 opacity-80" />
                <h3 className="text-2xl font-bold mb-4">Our 2025 Goal</h3>
                <p className="text-lg opacity-90">
                  Become the Middle East's leading sustainable mobility platform with 50,000+ active users across 20 cities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Us CTA */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Be Part of Our Story
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Every user, every car owner, every successful booking adds to our story. Join thousands who've already chosen a smarter way to move.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors cursor-pointer"
            >
              Join Our Community
            </a>
            <a
              href="/contact"
              className="border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-600 hover:text-white transition-colors cursor-pointer"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Story;