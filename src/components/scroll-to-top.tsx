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
        <div
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 md:bottom-8 md:right-8 bg-black/60 hover:bg-black text-white p-2 md:p-3 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 z-50"
        >
          <IoIosArrowUp className="size-5 md:size-5.5" />
        </div>
      )}
    </>
  );
};

export default ScrollToTop;
