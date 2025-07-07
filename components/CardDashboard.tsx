"use client";

import Image from "next/image";

type FileCardProps = {
  icon: string;
  size: string;
  types: string;
  updated: string;
};

export default function CardDashboard({
  icon = "/assets/icons/video.svg",
  size = "20 GB",
  types = "Video, Audio",
  updated = "10:15am, 10 Oct",
}: FileCardProps) {
  return (
    <div className="relative w-[220px] rounded-2xl bg-gray-50 p-4 pt-10 mt-6 shadow-sm">
      {/* Wave SVG */}
      <svg
        viewBox="0 0 220 80"
        className="absolute top-0 left-0 w-full h-auto"
        preserveAspectRatio="none"
      >
        <path
          d="M0,40 C40,90 140,0 220,40 L220,0 L0,0 Z"
          fill="#f8fafc"
        />
      </svg>

      {/* Icon */}
      <div className="absolute -top-6 left-4 w-[67px] h-[67px] rounded-full bg-emerald-400 flex items-center justify-center shadow-md">
        <Image src={icon} alt="icon" width={30} height={30} />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-2">
        <p className="text-right font-semibold text-gray-800">{size}</p>
        <p className="text-center font-medium text-gray-800">{types}</p>
        <hr className="border-t border-gray-200" />
        <p className="text-center text-sm text-gray-400">Last update</p>
        <p className="text-center text-sm font-medium text-gray-700">{updated}</p>
      </div>
    </div>
  );
}
