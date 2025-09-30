// src/components/Header.js
import Image from "next/image";

export default function Header() {
  return (
    <div className="flex items-center justify-center py-4 sm:py-6 px-4 border-b border-gray-700 bg-[#3a3a47]/95 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Replace text with logo */}
        <Image
          src="/sakuralabs_logo.png"
          alt="Sakura Labs Logo"
          width={150}  // adjust size
          height={150} // adjust size
          priority
        />

        {/* Optional spacer / subtitle */}
        <span className="text-white text-lg sm:text-xl font-light">
          Testing Playground
        </span>
      </div>
    </div>
  );
}
