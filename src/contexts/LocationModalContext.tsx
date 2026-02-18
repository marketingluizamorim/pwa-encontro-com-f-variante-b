import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface LocationModalContextType {
    showLocationModal: boolean;
    setShowLocationModal: (v: boolean) => void;
    shakeModal: () => void;
    isShaking: boolean;
}

const LocationModalContext = createContext<LocationModalContextType>({
    showLocationModal: false,
    setShowLocationModal: () => { },
    shakeModal: () => { },
    isShaking: false,
});

export function LocationModalProvider({ children }: { children: ReactNode }) {
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [isShaking, setIsShaking] = useState(false);

    const shakeModal = useCallback(() => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
    }, []);

    return (
        <LocationModalContext.Provider value={{ showLocationModal, setShowLocationModal, shakeModal, isShaking }}>
            {children}
        </LocationModalContext.Provider>
    );
}

export function useLocationModal() {
    return useContext(LocationModalContext);
}
