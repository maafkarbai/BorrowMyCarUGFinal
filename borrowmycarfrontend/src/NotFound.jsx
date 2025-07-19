import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(3); // Initial countdown value

  useEffect(() => {
    // Set up the interval to decrement the countdown every second
    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    // Set up the timeout to navigate after the countdown completes
    const timeout = setTimeout(() => {
      navigate('/');
    }, 3000); // Fixed timeout to 3 seconds

    // Cleanup function to clear the interval and timeout when the component unmounts
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate]); // Removed secondsLeft from dependencies

  return (
    <div className="m-auto flex justify-center items-center h-screen">
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-green-600">404 </span>{t("notFound.title")}
        </h1>
        <p className="text-lg mb-4">{t("notFound.description")}</p>
        <p className="text-sm text-gray-500 mb-8">
          {t("notFound.redirecting")} {secondsLeft} {secondsLeft !== 1 ? t("notFound.seconds") : t("notFound.second")}...
        </p>
        <Link to="/" className="bg-green-600 text-white p-4 hover:bg-green-700">
          {t("notFound.goHome")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
