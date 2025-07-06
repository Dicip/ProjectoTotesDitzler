
"use client";

import { useState, useEffect } from "react";

function tryParse(value: string) {
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    
    // This effect runs only on the client, after initial render
    useEffect(() => {
        try {
            const item = window.localStorage.getItem(key);
            // Initialize from localStorage or use initialValue
            const value = item ? tryParse(item) : initialValue;
            setStoredValue(value);
            // If not in localStorage, set it
            if (item === null) {
                window.localStorage.setItem(key, JSON.stringify(initialValue));
            }
        } catch (error) {
            console.error(error);
            setStoredValue(initialValue);
        }
    }, [key, initialValue]);

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
}
