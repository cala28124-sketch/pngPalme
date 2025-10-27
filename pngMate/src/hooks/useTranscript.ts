// src/hooks/useTranscript.ts
import { useState, useEffect } from 'react';

// Define the expected structure of a single message
export interface Message {
  sender: 'User' | 'Bot';
  text: string;
}

// Define the structure of the Flask response (from app.py's /messages)
interface TranscriptResponse {
  messages: Message[];
}

const API_URL = 'http://localhost:5000/messages'; // The GET endpoint in your Flask server

export function useTranscript(isBotRunning: boolean, pollInterval: number = 1000) {
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchTranscript = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Type the parsed data explicitly
        const data: TranscriptResponse = await response.json();
        setTranscript(data.messages);
        setError(null);
      } catch (err) {
        console.error('Transcript fetch error:', err);
        setError('Failed to load transcript from server.');
      }
    };

    // Start polling ONLY when the bot is running
    if (isBotRunning) {
      // Fetch immediately on start
      fetchTranscript();

      // Set up the polling interval (e.g., fetch every 1 second)
      intervalId = setInterval(fetchTranscript, pollInterval);
    } else {
      // Clear the transcript when the bot stops to reset the UI
      setTranscript([]);
    }

    // Cleanup: This runs when the component unmounts or before re-running the effect
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isBotRunning, pollInterval]); // Effect re-runs when isBotRunning changes

  return { transcript, error };
}
