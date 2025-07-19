import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState("");
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedRole) {
      navigate("/signup", { state: { role: selectedRole } });
    }
  };

  const roles = [
    {
      id: "renter",
      title: "I want to rent cars",
      description: "Browse and book cars from verified owners",
      icon: "🚗",
      features: [
        "Access to thousands of cars",
        "Flexible rental periods",
        "24/7 customer support",
        "Insurance coverage included"
      ]
    },
    {
      id: "owner",
      title: "I want to list my car",
      description: "Earn money by sharing your car with others",
      icon: "🔑",
      features: [
        "Earn passive income",
        "Set your own prices",
        "Control availability",
        "Verified renters only"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl shadow-lg flex items-center justify-center text-3xl mb-6">
            🚗
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to BorrowMyCar
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose how you'd like to get started with UAE's most trusted car sharing platform
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`relative bg-white rounded-2xl shadow-xl p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                selectedRole === role.id
                  ? "ring-4 ring-green-500 ring-opacity-50 bg-green-50"
                  : "hover:shadow-lg"
              }`}
            >
              {/* Selection Indicator */}
              {selectedRole === role.id && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">✓</span>
                </div>
              )}

              {/* Icon */}
              <div className="text-6xl mb-6 text-center">{role.icon}</div>

              {/* Title & Description */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {role.title}
                </h3>
                <p className="text-gray-600 text-lg">
                  {role.description}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                {role.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Selection Button */}
              <div className="mt-8">
                <button
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    selectedRole === role.id
                      ? "bg-green-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {selectedRole === role.id ? "Selected" : "Choose This Option"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className={`px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
              selectedRole
                ? "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Continue to Registration
          </button>
        </div>

        {/* Already have account link */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-semibold text-green-600 hover:text-green-700 hover:underline transition-colors cursor-pointer"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;