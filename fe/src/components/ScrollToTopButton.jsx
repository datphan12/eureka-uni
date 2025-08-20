import React, { useEffect, useState } from "react";
import { arrow_up } from "@assets";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 80) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      className={`fixed bottom-24 md:bottom-14 right-2 md:right-8 z-50 bg-white rounded-full border p-2 border-[#CCC]/60 cursor-pointer hover:border-[#CCC]/80 hover:shadow-md hover:-translate-y-0.5 ${
        isVisible
          ? "opacity-100"
          : "opacity-0 pointer-events-none"
      }`}
      onClick={scrollToTop}
    >
      <img src={arrow_up} alt="arrow up icon" />
    </button>
  );
};

export default ScrollToTopButton;
