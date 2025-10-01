// src/components/CarModal.js
"use client";
import { useEffect } from "react";

export default function CarModal({ car, isOpen, onClose }) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !car) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#2a2a35] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="sticky top-0 bg-[#2a2a35] border-b border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">
            {car.Brand} {car.Model}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-[#3a3a45]"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Car Image */}
        {car.imageUrl && (
          <div className="w-full h-64 bg-gray-800 relative">
            <img
              src={car.imageUrl}
              alt={`${car.Brand} ${car.Model}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}

        {/* Car Details */}
        <div className="p-6 space-y-6">
          {/* Price */}
          <div className="flex items-center justify-between border-b border-gray-700 pb-4">
            <span className="text-gray-400 text-lg">Price</span>
            <span className="text-3xl font-semibold text-white">₹{car.Price?.toLocaleString()}</span>
          </div>

          {/* Description */}
          {car.Description && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
              <p className="text-gray-300 leading-relaxed">{car.Description}</p>
            </div>
          )}

          {/* Specifications Grid */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Specifications</h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Year" value={car.Year} />
              <DetailRow label="Fuel Type" value={car.Fuel_Type} />
              <DetailRow label="Transmission" value={car.Transmission} />
              <DetailRow label="Mileage" value={car.Mileage ? `${car.Mileage} km/l` : "N/A"} />
              <DetailRow label="Engine" value={car.Engine ? `${car.Engine} cc` : "N/A"} />
              <DetailRow label="Power" value={car.Power ? `${car.Power} bhp` : "N/A"} />
              <DetailRow label="Seats" value={car.Seats} />
              <DetailRow label="Owner Type" value={car.Owner_Type} />
              <DetailRow
                label="Kilometers Driven"
                value={car.Kilometers_Driven ? `${car.Kilometers_Driven?.toLocaleString()} km` : "N/A"}
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="flex gap-3 pt-4">
            <button
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
              onClick={() => alert("Contact feature coming soon!")}
            >
              Contact Seller
            </button>
            <button
              className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl font-medium hover:bg-[#3a3a45] transition-colors"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  if (!value || value === "N/A") {
    return (
      <div className="bg-[#1a1a1f] p-3 rounded-lg">
        <p className="text-gray-500 text-sm mb-1">{label}</p>
        <p className="text-gray-600 font-medium">N/A</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1f] p-3 rounded-lg">
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-white font-medium">{value}</p>
    </div>
  );
}
