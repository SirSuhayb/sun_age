'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';
import { geocodeLocation, getTimezoneFromCoordinates, type GeocodingResult } from '~/lib/geocoding';
import { LocationAutocomplete } from '~/components/Soldash/LocationAutocomplete';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function CollectDataPage() {
  // Get birth date from solar profile if available
  const getSavedBirthDate = () => {
    try {
      const saved = localStorage.getItem('sunCycleBookmark');
      if (saved) {
        const data = JSON.parse(saved);
        console.log('Loaded sunCycleBookmark data:', data);
        if (data.birthDate && typeof data.birthDate === 'string') {
          console.log('Birth date format:', data.birthDate);
          // Check if it's already in YYYY-MM-DD format
          if (data.birthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return data.birthDate;
          }
          // Convert from MM/DD/YYYY to YYYY-MM-DD format
          const parts = data.birthDate.split('/');
          if (parts.length === 3) {
            const [month, day, year] = parts;
            // Ensure all parts exist and are strings
            if (month && day && year) {
              return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            }
          }
          // Try MM-DD-YYYY format
          const hyphenParts = data.birthDate.split('-');
          if (hyphenParts.length === 3 && hyphenParts[0].length === 2) {
            const [month, day, year] = hyphenParts;
            if (month && day && year) {
              return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading saved birth date:', error);
    }
    return '';
  };
  
  const [formData, setFormData] = useState({
    birthDate: getSavedBirthDate(),
    birthTime: '',
    birthLocation: '',
    timezone: 'auto'
  });

  const [locationData, setLocationData] = useState<GeocodingResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLocationChange = (value: string, suggestion?: any) => {
    setFormData(prev => ({ ...prev, birthLocation: value }));
    
    // If a suggestion was selected, store the location data
    if (suggestion) {
      setLocationData({
        latitude: parseFloat(suggestion.lat),
        longitude: parseFloat(suggestion.lon),
        timezone: 'auto', // Will be fetched later
        formattedAddress: suggestion.display_name
      });
    } else {
      setLocationData(null);
    }
    
    // Clear error
    if (errors.birthLocation) {
      setErrors(prev => ({ ...prev, birthLocation: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    }

    if (!formData.birthTime) {
      newErrors.birthTime = 'Birth time is required for accurate chart calculation';
    }

    if (!formData.birthLocation) {
      newErrors.birthLocation = 'Birth location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      let geoResult: GeocodingResult;
      
      // If we have location data from the autocomplete, use it
      if (locationData) {
        // Get timezone for the selected location
        const timezone = await getTimezoneFromCoordinates(locationData.latitude, locationData.longitude);
        geoResult = {
          ...locationData,
          timezone
        };
      } else {
        // Otherwise, geocode the manually entered location
        geoResult = await geocodeLocation(formData.birthLocation);
      }

      const birthData = {
        date: formData.birthDate,
        time: formData.birthTime,
        location: {
          city: formData.birthLocation.split(',')[0]?.trim() || formData.birthLocation,
          country: formData.birthLocation.split(',').pop()?.trim() || 'Unknown',
          latitude: geoResult.latitude,
          longitude: geoResult.longitude,
          timezone: geoResult.timezone
        }
      };

      // Save to localStorage for now
      localStorage.setItem('birthData', JSON.stringify(birthData));
      
      console.log('Birth data saved:', birthData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to chart generation page
      window.location.href = '/soldash/you/expand/chart';
    } catch (error) {
      console.error('Error submitting data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-[#FEFDF8] p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div className="flex items-center mb-8" variants={itemVariants}>
          <Link href="/soldash/you/expand" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-[#888]" />
          </Link>
          <h1 className="text-2xl font-serif font-semibold">Complete Your Sol Codex</h1>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div className="mb-8" variants={itemVariants}>
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#E6B13A] rounded-full flex items-center justify-center text-white text-sm font-bold">✓</div>
              <span className="ml-2 text-sm text-[#444]">Payment</span>
            </div>
            <div className="w-12 h-0.5 bg-[#E6B13A]"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#E6B13A] rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
              <span className="ml-2 text-sm text-[#444] font-semibold">Birth Details</span>
            </div>
            <div className="w-12 h-0.5 bg-[#D7D7D7]"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#D7D7D7] rounded-full flex items-center justify-center text-[#888] text-sm font-bold">3</div>
              <span className="ml-2 text-sm text-[#888]">Chart</span>
            </div>
          </div>
        </motion.div>

        {/* Main Form */}
        <motion.div 
          className="bg-white border border-[#D7D7D7] p-8 mb-6"
          variants={itemVariants}
        >
          <div className="text-center mb-8">
                          <h2 className="text-2xl font-serif font-semibold mb-2">Birth Information</h2>
              <p className="text-[#666] font-mono text-sm">
                Your exact birth details create the foundation for your Sol Codex
              </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Birth Date */}
            <motion.div variants={itemVariants}>
              <label className="block font-serif font-semibold text-[#444] mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Birth Date
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className={`w-full p-3 border ${errors.birthDate ? 'border-red-400' : 'border-[#D7D7D7]'} bg-[#FCF6E5] font-mono focus:outline-none focus:border-[#E6B13A]`}
                placeholder="Select your birth date"
              />
              {errors.birthDate && (
                <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>
              )}
            </motion.div>

            {/* Birth Time */}
            <motion.div variants={itemVariants}>
              <label className="block font-serif font-semibold text-[#444] mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Birth Time
              </label>
              <input
                type="time"
                value={formData.birthTime}
                onChange={(e) => handleInputChange('birthTime', e.target.value)}
                className={`w-full p-3 border ${errors.birthTime ? 'border-red-400' : 'border-[#D7D7D7]'} bg-[#FCF6E5] font-mono focus:outline-none focus:border-[#E6B13A]`}
                placeholder="Enter exact time (e.g., 14:30)"
              />
              {errors.birthTime && (
                <p className="text-red-500 text-sm mt-1">{errors.birthTime}</p>
              )}
              <p className="text-xs text-[#888] mt-1">
                Check your birth certificate for the most accurate time. If unknown, 12:00 PM is often used.
              </p>
            </motion.div>

            {/* Birth Location */}
            <motion.div variants={itemVariants}>
              <label className="block font-serif font-semibold text-[#444] mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Birth Location
              </label>
              <LocationAutocomplete
                value={formData.birthLocation}
                onChange={handleLocationChange}
                placeholder="Start typing your birth city..."
                error={errors.birthLocation}
              />
              <p className="text-xs text-[#888] mt-1">
                Select your birth city from the dropdown for accurate coordinates. Popular cities are shown when you click the field.
              </p>
            </motion.div>

            {/* Privacy Notice */}
            <motion.div 
              className="bg-[#FCF6E5] border border-[#E5E1D8] p-4 rounded-none"
              variants={itemVariants}
            >
                                <h4 className="font-serif font-semibold text-sm text-[#444] mb-2">Privacy & Security</h4>
                  <p className="text-xs text-[#666]">
                    Your birth information is encrypted and used solely to generate your personalized Sol Codex. 
                    We never share your personal data with third parties.
                  </p>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 ${isSubmitting ? 'bg-[#D7D7D7] cursor-not-allowed' : 'bg-[#E6B13A] hover:bg-[#D4A02A]'} text-black font-mono text-lg tracking-widest uppercase border-none transition-colors`}
              variants={itemVariants}
                                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                >
                  {isSubmitting ? 'Generating Your Codex...' : 'Generate My Sol Codex'}
            </motion.button>
          </form>
        </motion.div>

        {/* Back Link */}
        <motion.div className="text-center" variants={itemVariants}>
          <Link href="/soldash/you/expand" className="text-[#888] font-mono text-sm hover:text-[#666]">
            ← Back to Payment
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}