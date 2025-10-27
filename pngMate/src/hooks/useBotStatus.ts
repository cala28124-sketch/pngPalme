// src/hooks/useBotStatus.ts - FIXED EXPORT

import { useState, useEffect } from 'react';

// Define the structure of the Flask response
interface StatusResponse {
    isSpeaking: boolean;
}

const API_URL = 'http://localhost:5000/is_speaking';

// 🛑 FIX: Changed to DEFAULT EXPORT
export default function useBotStatus(isBotRunning: boolean, pollInterval: number = 250) {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchStatus = async () => {
      // Only fetch if the main bot session is running
      if (!isBotRunning) {
          setIsSpeaking(false);
          return;
      }

      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: StatusResponse = await response.json();
        setIsSpeaking(data.isSpeaking);
        setError(null);

      } catch (err) {
        console.error('Bot status fetch error:', err);
        setError('Failed to fetch bot status.');
      }
    };

    if (isBotRunning) {
      intervalId = setInterval(fetchStatus, pollInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isBotRunning, pollInterval]);

  return { isSpeaking, error };
}
