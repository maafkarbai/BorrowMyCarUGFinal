import { Helmet } from "react-helmet-async";
import CarListingSection from "./CarListingSection";

const BrowseCars = () => {
  return (
    <>
      <Helmet>
        <title>Browse Cars - BorrowMyCar</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Find Your Perfect Car
          </h1>
          <CarListingSection />
        </div>
      </div>
    </>
  );
};

export default BrowseCars;
