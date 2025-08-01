'use client';
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  city?: string;
  state?: string;
  country?: string;
  importance: number;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string, suggestion?: LocationSuggestion) => void;
  placeholder?: string;
  error?: string;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Enter your birth city",
  error
}) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Popular cities for quick access
  const popularCities = [
    { display_name: "New York, NY, USA", lat: "40.7128", lon: "-74.0060" },
    { display_name: "Los Angeles, CA, USA", lat: "34.0522", lon: "-118.2437" },
    { display_name: "Chicago, IL, USA", lat: "41.8781", lon: "-87.6298" },
    { display_name: "Philadelphia, PA, USA", lat: "39.9526", lon: "-75.1652" },
    { display_name: "London, United Kingdom", lat: "51.5074", lon: "-0.1278" },
    { display_name: "Paris, France", lat: "48.8566", lon: "2.3522" },
    { display_name: "Tokyo, Japan", lat: "35.6762", lon: "139.6503" }
  ];

  // Search for locations using Nominatim API
  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Solara App'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const formattedSuggestions = data
          .filter((item: any) => 
            // Filter for cities, towns, villages
            ['city', 'town', 'village', 'municipality', 'suburb'].includes(item.type) ||
            item.class === 'place'
          )
          .map((item: any) => ({
            display_name: formatDisplayName(item),
            lat: item.lat,
            lon: item.lon,
            city: item.address?.city || item.address?.town || item.address?.village,
            state: item.address?.state,
            country: item.address?.country,
            importance: item.importance
          }))
          .sort((a: LocationSuggestion, b: LocationSuggestion) => b.importance - a.importance);

        setSuggestions(formattedSuggestions);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format display name for better readability
  const formatDisplayName = (item: any) => {
    const parts = [];
    
    if (item.address?.city) parts.push(item.address.city);
    else if (item.address?.town) parts.push(item.address.town);
    else if (item.address?.village) parts.push(item.address.village);
    else if (item.name) parts.push(item.name);
    
    if (item.address?.state) parts.push(item.address.state);
    if (item.address?.country) parts.push(item.address.country);
    
    return parts.join(', ');
  };

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSelectedIndex(-1);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    if (newValue.trim()) {
      setShowDropdown(true);
      searchTimeoutRef.current = setTimeout(() => {
        searchLocations(newValue);
      }, 300);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    onChange(suggestion.display_name, suggestion);
    setSuggestions([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show popular cities when focused with empty input
  useEffect(() => {
    if (showDropdown && !value.trim() && suggestions.length === 0) {
      setSuggestions(popularCities.map(city => ({
        ...city,
        importance: 1
      })));
    }
  }, [showDropdown, value, suggestions.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#666] w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-12 pr-4 py-3 border ${
            error ? 'border-red-500' : 'border-[#E5E1D8]'
          } bg-white focus:outline-none focus:border-[#E6B13A] transition-colors`}
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin text-[#E6B13A]" />
        )}
      </div>

      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white border border-[#E5E1D8] shadow-lg max-h-60 overflow-y-auto"
          >
            {!value.trim() && (
              <div className="px-4 py-2 text-xs font-mono uppercase tracking-wide text-[#888] border-b border-[#E5E1D8]">
                Popular Cities
              </div>
            )}
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={`${suggestion.lat}-${suggestion.lon}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  index === selectedIndex
                    ? 'bg-[#FCF6E5] text-black'
                    : 'hover:bg-[#FCF6E5]'
                }`}
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-[#E6B13A] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{suggestion.display_name}</div>
                    <div className="text-xs text-[#666] mt-1">
                      {suggestion.lat}, {suggestion.lon}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="text-red-500 text-sm mt-1">{error}</div>
      )}
    </div>
  );
};