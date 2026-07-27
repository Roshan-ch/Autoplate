import React from "react";
import { FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";
import { FaPhoneAlt } from "react-icons/fa";

function Contact() {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>
      <div className="max-w-md w-full">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
          <div className="space-y-4">
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-blue-500 mr-3 flex-shrink-0" />
              <p>
                <strong>Address:</strong> Balkumari, Lalitpur, Nepal
              </p>
            </div>
            <div className="flex items-center">
              <FaPhoneAlt className="text-blue-500 mr-3 flex-shrink-0" />
              <p>
                <strong>Phone:</strong>
                <a
                  href="tel:+97798123345670"
                  className="text-blue-500 hover:underline ml-1"
                >
                  +977 98123345670
                </a>
              </p>
            </div>
            <div className="flex items-center">
              <FaEnvelope className="text-blue-500 mr-3 flex-shrink-0" />
              <p>
                <strong>Email:</strong>
                <a
                  href="mailto:info@autoplate.com"
                  className="text-blue-500 hover:underline ml-1"
                >
                  info@autoplate.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
