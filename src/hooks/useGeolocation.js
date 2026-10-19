import { useEffect } from 'react';
import useMapStore from '../store/useMapStore';

const useGeolocation = () => {
    const { setUserLocation } = useMapStore();

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            console.error("Geolocation is not supported by this browser.");
            return;
        }

        const handleSuccess = (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
        };

        const handleError = (error) => {
            console.error("Error obtaining geolocation:", error.message);
        };

        // Get initial position
        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });

        // Watch for changes
        const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });

        return () => navigator.geolocation.clearWatch(watchId);
    }, [setUserLocation]);
};

export default useGeolocation;
