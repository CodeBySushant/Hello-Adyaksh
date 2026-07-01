"use client";

import React from "react";
import Image from "next/image";

export function AdyakshCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#003893]/10 mb-16 overflow-hidden">
      <div className="flex flex-row items-stretch h-[400px]">
        {/* LEFT: Image */}
        <div className="w-[28%] h-full p-3">
          <div className="relative w-full h-full rounded-xl overflow-hidden shadow-md">
            {/* Image */}
            <Image
              src="/wardadyakshya.jpg"
              alt="Adyaksh"
              fill
              sizes="(max-width: 768px) 28vw, 320px"
              className="object-cover"
            />

            {/* Gradient overlay (appeal) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          </div>
        </div>

        {/* RIGHT: Content */}
        <div className="w-[72%] p-5 flex flex-col">
          <h3 className="text-xl md:text-2xl font-serif text-[#1f2937] font-semibold leading-tight">
            अरूण कुमार मण्डल
          </h3>

          <p className="text-sm md:text-base text-muted-foreground mt-1">
            गाउँपालिका अध्यक्ष, तिलाठी कोइलाडी गाउँपालिका
          </p>

          <div className="mt-4 space-y-2">
            <a className="text-sm md:text-base font-semibold text-[#003893] hover:underline block">
              गाउँपालिका अध्यक्षको सन्देश
            </a>
          </div>

          <blockquote className="mt-4 pl-4 border-l-4 border-[#003893]/40 text-sm md:text-base italic text-gray-700 leading-snug">
            "म तिलाठी कोइलाडी गाउँपालिकाको अध्यक्ष (गाउँपालिका अध्यक्ष)को रूपमा सेवा गर्न
            पाउँदा गर्व महसुस गर्दछु। मेरो उद्देश्य पारदर्शी शासन सुनिश्चित
            गर्नु, दिगो विकासलाई प्रवर्द्धन गर्नु र प्रत्येक नागरिकको जीवनस्तर
            सुधार गर्नु हो। म जनतासँग नजिकबाट सहकार्य गर्दै उनीहरूको समस्या
            बुझ्ने र व्यावहारिक समाधान खोज्नेमा विश्वास गर्छु। हामी सबै मिलेर
            समृद्ध, समावेशी र सुशासित गाउँपालिका निर्माण गर्न सक्छौं, जहाँ
            प्रत्येक व्यक्तिले अवसर र आधारभूत सेवाहरूमा पहुँच पाउनेछ।"
          </blockquote>
        </div>
      </div>
    </div>
  );
}
