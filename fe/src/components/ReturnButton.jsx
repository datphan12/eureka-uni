import React from "react";
import { left_arrow_icon } from "@assets";
import { twMerge } from "tailwind-merge";
import { useNavigate } from "react-router-dom";

const ReturnButton = ({ value, className, event }) => {
  const navigate = useNavigate();
  return (
    <div>
      <button
        onClick={() => {
          if (event) {
            event();
          } else {
            navigate(-1);
          }
        }}
        className={twMerge("flex justify-center items-center gap-x-2 cursor-pointer", className)}
      >
        <img src={left_arrow_icon} alt="icon" className="w-5 h-5" />
        <span>{value}</span>
      </button>
    </div>
  );
};

export default ReturnButton;
