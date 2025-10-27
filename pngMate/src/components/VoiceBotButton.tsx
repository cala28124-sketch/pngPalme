/* eslint-disable no-nested-ternary */
/* eslint-disable react/button-has-type */
// VoiceBotButton.tsx - FULL FIX FOR 415 ERROR

import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

const API_URL = 'http://localhost:5000';

interface BotResponse {
  status: string;
  message: string;
  conversation_id?: string;
}

// 🔑 1. UPDATED PROPS INTERFACE: ASSUME API KEY AND AGENT ID ARE PASSED HERE
interface VoiceBotButtonProps {
  isBotRunning: boolean;
  setIsBotRunning: Dispatch<SetStateAction<boolean>>;
  elevenlabsApiKey: string;
  agentId: string;
}

function VoiceBotButton({
  isBotRunning,
  setIsBotRunning,
  elevenlabsApiKey, // 🛑 NEW: Destructured configuration data
  agentId, // 🛑 NEW: Destructured configuration data
}: VoiceBotButtonProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const handleToggleBot = async (): Promise<void> => {
    setLoading(true);
    setMessage('');

    const endpoint: string = isBotRunning ? '/stop' : '/start';

    // 🛑 NEW: Define the request body only for the START endpoint
    const requestBody = {
      elevenlabs_api_key: elevenlabsApiKey,
      agent_id: agentId,
    };

    // 🛑 NEW: Define headers only for the POST requests
    const headers = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        // 🛑 CRITICAL FIX: Add headers and body ONLY for the /start endpoint
        headers: isBotRunning ? undefined : headers, // Add headers only for START
        body: isBotRunning ? undefined : JSON.stringify(requestBody), // Add body only for START
      });

      if (!response.ok) {
        // Log the full response status and text for debugging
        const errorText = await response.text();
        console.error(`Backend Error (${response.status}): ${errorText}`);

        // Custom message for the 415 error
        if (response.status === 415) {
          setMessage(
            '415 Error: Server expects JSON data. Check API key/Agent ID input.',
          );
        }

        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: BotResponse = await response.json();

      if (data.status === 'started') {
        setIsBotRunning(true);
        setMessage('Bot Started! Speak into your microphone.');
      } else if (data.status === 'ended') {
        setIsBotRunning(false);
        setMessage('Bot Stopped. Click to restart.');
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Bot control failed:', error);
      setMessage(`Connection Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // ... (rest of the render function is unchanged)
  return (
    <button
      onClick={handleToggleBot}
      disabled={loading}
      style={{ backgroundColor: isBotRunning ? '#cc0000' : '#00cc00' }}
    >
      {loading ? '...' : isBotRunning ? 'End Conversation' : 'Start'}
      {message && (
        <div style={{ fontSize: '0.8em', marginTop: '5px' }}>{message}</div>
      )}
    </button>
  );
}

export default VoiceBotButton;
