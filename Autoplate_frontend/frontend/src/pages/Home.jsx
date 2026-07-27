import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import About from "./About";
import Contact from "./Contact";
import Footer from "../components/Footer";

const Home = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 },
  };

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.8, delay: 0.3 },
  };

  const fadeInDown = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 0.6 },
  };

  return (
    <div>
      <div className="relative min-h-[100dvh] flex items-center justify-center">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('/parkingbg.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black opacity-30"></div>
        </div>
        <div className="w-full min-h-[100dvh] flex items-center justify-center p-4">
          <div className="w-full max-w-[90vw] md:max-w-[800px] text-center flex flex-col items-center justify-center z-10 py-8">
            <motion.h1
              className="text-white uppercase text-[2rem] xs:text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem] leading-[1.2] font-title tracking-wide"
              {...fadeInUp}
            >
              <span className="inline-block mb-2 sm:mb-0 sm:mr-4">
                Effortless
              </span>
              <span className="relative inline-block mb-2">Parking</span>
              <span className="block">Management</span>
            </motion.h1>
            <motion.p
              className="text-white w-full max-w-[85vw] sm:max-w-2xl mt-4 mb-6 text-[0.875rem] xs:text-base sm:text-lg font-semibold font-paragraph leading-relaxed"
              {...fadeIn}
            >
              Welcome to our parking management system, where we streamline your
              parking experience. Our system records vehicle entries and exits,
              providing real-time availability updates. Sign in to manage your
              parking effortlessly and enjoy a hassle-free experience.
            </motion.p>

            <motion.div {...fadeInDown} className="mt-2 sm:mt-4">
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg transition duration-300 text-lg font-poppins font-bold"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 font-poppins">
            Why Choose Autoplate?
          </h2>
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 font-poppins">
                Real-time Updates
              </h3>
              <p className="text-gray-600 font-poppins">
                Get instant information on parking availability and vehicle
                status.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 font-poppins">
                Easy Management
              </h3>
              <p className="text-gray-600 font-poppins">
                Effortlessly manage your parking spaces and user accounts.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 font-poppins">
                Secure System
              </h3>
              <p className="text-gray-600 font-poppins">
                Rest easy knowing your data is protected with our secure
                infrastructure.
              </p>
            </div>
          </div>
        </div>
      </div>

      <About />
      <Contact />
      <Footer />
    </div>
  );
};

export default Home;
