// src/components/CarCard.js
"use client";
import { useState } from "react";

export default function CarCard({ car }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-[#2a2a35] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 hover:bg-[#323240] transition-colors">
      <div className="w-full sm:w-32 h-32 sm:h-24 bg-white rounded-lg flex-shrink-0 overflow-hidden relative">
        {car?.imageUrl && !imageError ? (
          <img
            src={car.imageUrl}
            alt={`${car.Brand || car.brand} ${car.Model || car.model}`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 11l1.5-4.5h11L19 11m-1.5 5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-9 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
              <path d="M5 11h14l-1.5 5h-11L5 11z"/>
              <path d="M7 11V8.5h10V11"/>
            </svg>
          </div>
        )}
      </div>
      
      <div className="flex-1 text-center sm:text-left">
        <h3 className="text-xl font-medium mb-1">
          {(car.Brand || car.brand) || ''} {(car.Model || car.model) || ''}
        </h3>
        <p className="text-gray-300 text-sm mb-2 line-clamp-2">
          {car.Description || car.description}
        </p>
        <p className="text-2xl font-light text-white">
          {car.Price || car.price}
        </p>
      </div>
    </div>
  );
}