import { useTranslation } from "react-i18next";
import Logo from "./assets/BorrowMyCar.png";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: t("footer.aboutUs"), href: "/about" },
      { name: t("navigation.howItWorks"), href: "/how-it-works" },
      { name: t("footer.ourStory"), href: "/story" },
      { name: t("footer.careers"), href: "/careers" },
      { name: t("footer.contactUs"), href: "/contact" },
    ],
    services: [
      { name: t("footer.browseCars"), href: "/browse" },
      { name: t("footer.listYourCar"), href: "/list-car" },
      { name: t("navigation.myBookings"), href: "/my-bookings" },
      { name: t("footer.myListings"), href: "/my-listings" },
      { name: t("footer.helpCenter"), href: "/help" },
    ],
    legal: [
      { name: t("footer.termsOfService"), href: "/terms" },
      { name: t("footer.privacyPolicy"), href: "/privacy" },
      { name: t("footer.rentalAgreement"), href: "/rental-agreement" },
      { name: t("footer.insurancePolicy"), href: "/insurance" },
      { name: t("footer.refundPolicy"), href: "/refunds" },
    ],
    social: [
      {
        name: "Facebook",
        href: "https://facebook.com/borrowmycar",
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        ),
      },
      {
        name: "Instagram",
        href: "https://instagram.com/borrowmycar",
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.328-1.297C4.243 14.894 3.752 13.743 3.752 12.446c0-1.297.49-2.448 1.369-3.328.879-.879 2.031-1.369 3.328-1.369 1.297 0 2.448.49 3.328 1.369.879.879 1.369 2.031 1.369 3.328 0 1.297-.49 2.448-1.369 3.328-.88.807-2.031 1.297-3.328 1.297z" />
          </svg>
        ),
      },
      {
        name: "Twitter",
        href: "https://twitter.com/borrowmycar",
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
          </svg>
        ),
      },
      {
        name: "LinkedIn",
        href: "https://linkedin.com/company/borrowmycar",
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        ),
      },
    ],
  };

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="w-full bg-white border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <a href="/" className="inline-block cursor-pointer">
              <img
                src={Logo}
                alt="BorrowMyCar Logo"
                className="h-12 w-auto hover:opacity-80 transition-opacity"
              />
            </a>

            <h3 className="text-lg font-semibold text-gray-900">
              {t("footer.tagline")}
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed max-w-md">
              {t("footer.description")}
            </p>

            {/* Social Media Links */}
            <div className="flex space-x-4 pt-2">
              {footerLinks.social.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-green-600 transition-colors duration-200 cursor-pointer"
                  aria-label={`Follow us on ${social.name}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              {t("footer.company")}
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-green-600 transition-colors duration-200 cursor-pointer"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              {t("footer.services")}
            </h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-green-600 transition-colors duration-200 cursor-pointer"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              {t("footer.legal")}
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-green-600 transition-colors duration-200 cursor-pointer"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="max-w-md">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                {t("footer.stayUpdated")}
              </h4>
              <p className="text-sm text-gray-600">
                {t("footer.newsletterDescription")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 max-w-md w-full md:w-auto">
              <input
                type="email"
                placeholder={t("footer.emailPlaceholder")}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors text-sm"
              />
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap cursor-pointer">
                {t("footer.subscribe")}
              </button>
            </div>
          </div>
        </div>

        {/* Back to Top Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleScrollToTop}
            className="flex items-center cursor-pointer gap-2 bg-gray-100 hover:bg-green-600 hover:text-white text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200 group"
            aria-label="Scroll to top"
          >
            <span>{t("footer.backToTop")}</span>
            <svg
              className="w-4 h-4 transform group-hover:-translate-y-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <p className="text-sm text-gray-600">
                &copy; {currentYear} BorrowMyCar. {t("footer.allRightsReserved")}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <a
                  href="/terms"
                  className="hover:text-green-600 transition-colors cursor-pointer"
                >
                  {t("footer.terms")}
                </a>
                <span>•</span>
                <a
                  href="/privacy"
                  className="hover:text-green-600 transition-colors cursor-pointer"
                >
                  {t("footer.privacy")}
                </a>
                <span>•</span>
                <a
                  href="/cookies"
                  className="hover:text-green-600 transition-colors cursor-pointer"
                >
                  {t("footer.cookies")}
                </a>
                <span>•</span>
                <a
                  href="/sitemap"
                  className="hover:text-green-600 transition-colors cursor-pointer"
                >
                  Sitemap
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{t("footer.madeWithLove")}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
