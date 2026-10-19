import React from 'react';
import { motion } from 'framer-motion';
import { Map as MapIcon, ChevronRight } from 'lucide-react';
import useMapStore from '../../store/useMapStore';

const MAHARASHTRA_CITIES = [
    { name: 'Mumbai', coords: [72.8777, 19.0760], zoom: 12 },
    { name: 'Pune', coords: [73.8567, 18.5204], zoom: 13 },
    { name: 'Nagpur', coords: [79.0882, 21.1458], zoom: 12 },
    { name: 'Thane', coords: [72.9781, 19.2183], zoom: 13 },
    { name: 'Nashik', coords: [73.7898, 19.9975], zoom: 13 },
    { name: 'Chhatrapati Sambhaji Nagar', coords: [75.3433, 19.8762], zoom: 13 },
    { name: 'Solapur', coords: [75.9064, 17.6599], zoom: 12 },
    { name: 'Amravati', coords: [77.7523, 20.9320], zoom: 12 },
    { name: 'Kolhapur', coords: [74.2433, 16.7050], zoom: 13 },
    { name: 'Navi Mumbai', coords: [73.0297, 19.0330], zoom: 13 }
];

const RegionSelector = () => {
    const { setViewport } = useMapStore();

    return (
        <div className="region-selector-container">
            <h4 className="section-title">
                <MapIcon size={16} />
                Maharashtra Regions
            </h4>
            <div className="city-grid">
                {MAHARASHTRA_CITIES.map((city) => (
                    <motion.button
                        key={city.name}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        className="city-pill"
                        onClick={() => setViewport(city.coords, city.zoom)}
                    >
                        <span>{city.name}</span>
                        <ChevronRight size={14} className="pill-arrow" />
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default RegionSelector;
