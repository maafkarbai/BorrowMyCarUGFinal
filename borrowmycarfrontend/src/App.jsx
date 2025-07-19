import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import CarListingSection from "./CarListingSection";

const App = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>BorrowMyCar | {t("navigation.home")}</title>
      </Helmet>
      <div className="min-h-screen">
        <div className="min-h-fit">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {t("home.welcomeTitle")}
            </h1>
            <p className="mt-2 text-gray-600">
              {t("home.welcomeSubtitle")}
            </p>
          </div>
          <CarListingSection />
        </div>
      </div>
    </>
  );
};

export default App;
