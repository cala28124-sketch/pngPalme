// App.tsx - Simplified Logic for Real-time Status

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-nested-ternary */
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react'; // 🛑 REMOVED useEffect import
import TextBox from '../components/TextBox';

import idle from '../../assets/images/idle.jpg';
import listening from '../../assets/images/listening.jpg';
import speaking from '../../assets/images/speaking.jpg';
import VoiceBotButton from '../components/VoiceBotButton';

import { useTranscript } from '../hooks/useTranscript';
import useBotStatus from '../hooks/useBotStatus';

import './App.css';

function Hello() {
  const [isBotRunning, setIsBotRunning] = useState<boolean>(false);

  const { transcript, error } = useTranscript(isBotRunning, 1000);
  const { isSpeaking } = useBotStatus(isBotRunning, 250);

  // The image will now rely entirely on the polled 'isSpeaking' state.

  // 4. FORMAT CONTENT: No change needed here
  const transcriptString = transcript
    .map((msg) => `${msg.sender}: ${msg.text}`)
    .join('\n');

  const displayContent =
    error ||
    transcriptString ||
    'Click "Start" to begin your conversation with Anthony, someone with a knack for finance who is your friend for everything related!';

  // 5. STATUS IMAGE: Direct conditional logic based on 'isSpeaking'
  // If isSpeaking is true, show 'speaking' image.
  const statusImage = isBotRunning ? (isSpeaking ? speaking : listening) : idle;

  return (
    <div className="Hello">
      <div className="floating-group">
        <div className="button-stack">
          <div className="drag-region">
            <img width="200" alt="icon" src={statusImage} />
          </div>
          <div style={{ marginTop: 12 }}>
            <VoiceBotButton
              isBotRunning={isBotRunning}
              setIsBotRunning={setIsBotRunning}
              elevenlabsApiKey="sk_c85117b16db81879e98f19fc5e7834f9691d4a1cd6119b5e"
              agentId="agent_1901k8f903wkf08tzhfdazj9gj9f"
            />
          </div>
        </div>

        {/* Display Transcript */}
        <TextBox>{displayContent}</TextBox>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
