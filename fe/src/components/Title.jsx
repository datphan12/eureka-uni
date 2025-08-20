import React from "react";
import { twMerge } from "tailwind-merge";

const Title = ({ value, className }) => {
  return <p className={twMerge("text-2xl font-bold", className)}>{value}</p>;
};

export default Title;
