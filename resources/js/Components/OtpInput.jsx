import { useState, useRef } from "react";

const OtpInput = ({ value, onChange }) => {
    const inputRefs = Array.from({ length: 6 }, () => useRef(null));

    const handleChange = (index, event) => {
        const newValue = event.target.value;

        if (/^\d$/.test(newValue) || newValue === "") {
            let newOtp = value.split("");
            newOtp[index] = newValue;
            const updatedOtp = newOtp.join("");
            onChange(updatedOtp);

            if (newValue !== "" && index < 5) {
                inputRefs[index + 1].current.focus();
            }
        }
    };

    const handleKeyDown = (index, event) => {
        if (event.key === "Backspace" && !value[index] && index > 0) {
            let newOtp = value.split("");
            newOtp[index - 1] = "";
            onChange(newOtp.join(""));
            inputRefs[index - 1].current.focus();
        }
    };

    return (
        <div className="flex justify-center gap-2">
            {Array(6).fill("").map((_, index) => (
                <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    value={value[index] || ""}
                    maxLength="1"
                    onChange={(e) => handleChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-md focus:border-pink-500 focus:outline-none"
                />
            ))}
        </div>
    );
};

export default OtpInput;
