import { useState, useEffect } from 'react';
import { GLOBAL_FACTORS } from '../data/mockRealData';

export function useRealTimeData() {
  const [factors, setFactors] = useState(GLOBAL_FACTORS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRealData() {
      try {
        // Fetch real exchange rate (USD to THB)
        const exchangeRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const exchangeData = await exchangeRes.json();
        const thbRate = exchangeData.rates.THB;

        // Create updated factors object
        const updatedFactors = {
          ...factors,
          currency: {
            ...factors.currency,
            value: Number(thbRate.toFixed(2)),
            trend: thbRate > 33.39 ? "+ อ่อนค่า" : "- แข็งค่า",
            isUp: thbRate > 33.39
          }
        };

        // You could also fetch Weather API here (e.g., Open-Meteo)
        // const weatherRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=7.0&longitude=100.4&current_weather=true');
        // const weatherData = await weatherRes.json();
        
        // Update the global object so other components not using the hook still get the new value (hacky but works for demo)
        GLOBAL_FACTORS.currency.value = Number(thbRate.toFixed(2));
        GLOBAL_FACTORS.currency.trend = updatedFactors.currency.trend;
        GLOBAL_FACTORS.currency.isUp = updatedFactors.currency.isUp;

        setFactors(updatedFactors);
      } catch (error) {
        console.error("Failed to fetch real-time data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRealData();
  }, []);

  return { factors, isLoading };
}
