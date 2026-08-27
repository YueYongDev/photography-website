"use client";

import React, { useEffect, useState } from "react";
import { IoIosArrowUp } from "react-icons/io";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-4 right-4 md:bottom-7 md:right-7 border border-black/15 bg-white/85 text-black p-2.5 cursor-pointer transition-colors duration-200 hover:bg-white z-50 backdrop-blur-md"
        >
          <IoIosArrowUp className="size-5 md:size-5.5" />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;
