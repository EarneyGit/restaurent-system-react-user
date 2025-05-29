import React from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsAndConditionsPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen relative xl:pt-10 md:pt-5 pt-3 font-sans">
      {/* Background Layer */}
      <div className="absolute inset-0">
        <img
          src="/bg-home.png"
          alt="background"
          className="w-full h-full object-cover opacity-50 blur-sm"
        />
        <div className="absolute inset-0 bg-black/85 rounded-xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleBack}
          className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Go back"
        >
          <X size={24} className="text-white" />
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Terms & Conditions
          </h1>
          <p className="text-white/80 text-lg">
            Please read our terms and privacy policy carefully
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Part 1 - Terms of Use */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              PART 1 - Terms of Use
            </h2>

            <div className="space-y-6 text-white/80">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  AVAILABILITY AND DELIVERY
                </h3>
                <p>
                  We will do our best to fulfil any order within the delivery
                  time specified during the checkout process. Unfortunately
                  things do not always go to plan and factors, such as weather
                  and traffic conditions, may occasionally prevent us from
                  achieving this. We will inform you if we become aware of an
                  unexpected delay.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  CANCELLATION
                </h3>
                <p>
                  Orders may be cancelled up to the point the order is
                  dispatched for delivery. Once delivery of an order is made we
                  cannot cancel or refund the order. Cancellations must be made
                  by telephoning the shop. See the Contact Page for the number.
                  We reserve the right to cancel any order, before or after
                  acceptance, and will notify you immediately of any such
                  cancellation.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  COMPLAINTS
                </h3>
                <p>
                  All complaints will be investigated on an individual basis. We
                  will take appropriate action as a result of our findings and
                  any refund will be made at our discretion.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  PRICE AND PAYMENT
                </h3>
                <p>
                  The price of any Products will be as quoted on our website and
                  mobile app may vary from time to time, except in cases of
                  obvious error. Prices include VAT. Prices are liable to change
                  at any time, but changes will not affect orders placed that
                  you have already paid for.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  HANDLING FEE
                </h3>
                <p>
                  In addition to the price for the ordered items and, if
                  relevant, delivery, we will charge a small handling fee for
                  each order placed on the Service. The handling fee applicable
                  will be added as a admin/service fee and may be combined with
                  any fees also charged by the restaurant.
                </p>
              </div>
            </div>
          </div>

          {/* Part 2 - Privacy Policy */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              PART 2 - Privacy Policy
            </h2>

            <div className="space-y-6 text-white/80">
              <p>
                In this privacy policy, you can learn more about how we process
                your personal data in various situations. We provide you with
                this information as we are required to do so under the EU
                General Data Protection Regulation (the GDPR).
              </p>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Data Collection
                </h3>
                <p>
                  We collect and process your personal data for several
                  purposes, including:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li>Your use of the website (cookies etc.)</li>
                  <li>Distribution of marketing material</li>
                  <li>Communication with you</li>
                  <li>Your use of the customer portal</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Your Rights
                </h3>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li>Right of access to your personal data</li>
                  <li>Right to rectification of inaccurate data</li>
                  <li>Right to erasure ('right to be forgotten')</li>
                  <li>Right to data portability</li>
                  <li>Right to object to processing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage;
