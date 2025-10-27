# voice_bot.py - FINAL VERSION WITH SPEAKING DURATION FIX

import os
import threading
from threading import Timer # 🛑 NEW IMPORT for delayed status reset
from elevenlabs.client import ElevenLabs
from elevenlabs.conversational_ai.conversation import Conversation
from elevenlabs.conversational_ai.default_audio_interface import DefaultAudioInterface

# Global variables to hold the active session state
active_conversation: Conversation | None = None
active_audio_interface = None
conversation_transcript = []
transcript_lock = threading.Lock()

# Global status flag
is_speaking: bool = False

# 🛑 NEW GLOBAL CONSTANT: Estimate reading speed in seconds per character (s/char)
READING_SPEED_S_PER_CHAR = 0.05

# --- Helper Function for Delayed Reset ---

def reset_speaking_status():
    """Resets the speaking flag globally after the calculated delay."""
    global is_speaking
    is_speaking = False
    print("Speaking status reset to False after estimated duration.")

# --- Conversation Callbacks ---

def log_user_transcript(text: str):
    """Callback triggered when the user finishes speaking."""
    global is_speaking

    # Assume the bot will immediately start generating a response
    is_speaking = True

    with transcript_lock:
        conversation_transcript.append({"sender": "User", "text": text})
        print(f"Transcript Logged - User: {text}")

def log_bot_response(text: str):
    """Callback triggered when the bot finishes speaking a full response."""
    # DO NOT set is_speaking = False here! The timer will handle it.

    with transcript_lock:
        conversation_transcript.append({"sender": "Bot", "text": text})
        print(f"Transcript Logged - Bot: {text}")

    # 🛑 CRITICAL FIX: Calculate estimated speaking time and set a Timer
    if text:
        # Calculate delay based on text length
        delay_seconds = len(text) * READING_SPEED_S_PER_CHAR

        # Ensure a minimum delay (e.g., 1 second) for very short responses
        if delay_seconds < 1.0:
            delay_seconds = 1.0

        print(f"Estimated speaking duration: {delay_seconds:.2f} seconds.")

        # Start the Timer to call reset_speaking_status after the delay
        timer = Timer(delay_seconds, reset_speaking_status)
        timer.start()

# ---------------------------------------------------------------------------------

def start_voice_bot(api_key, agent_id):
    """Initializes and starts the ElevenLabs Conversational AI agent."""
    global active_conversation
    global active_audio_interface
    global conversation_transcript
    global is_speaking

    if active_conversation is not None:
        return {"status": "error", "message": "Conversation is already running"}

    try:
        with transcript_lock:
            conversation_transcript.clear()

        is_speaking = False

        # The client will raise an error if the API key is invalid (401 error)
        client = ElevenLabs(api_key=api_key)

        audio_interface = DefaultAudioInterface()
        active_audio_interface = audio_interface

        # Fixed Conversation initialization (bypassing old config errors)
        conversation = Conversation(
            client=client,
            agent_id=agent_id,
            requires_auth=True,
            audio_interface=audio_interface,

            callback_user_transcript=log_user_transcript,
            callback_agent_response=log_bot_response,
        )

        conversation.start_session()

        active_conversation = conversation

        # Assume an initial greeting, so set speaking status to True
        is_speaking = True

        return {"status": "started", "message": "Conversation session started successfully"}

    except Exception as e:
        # Log the full error to help debug startup failures
        print(f"Error during voice bot startup: {e}")

        active_conversation = None
        if active_audio_interface:
            try:
                active_audio_interface.close()
            except:
                pass
        active_audio_interface = None

        # Attempt to parse the ElevenLabs API error message if available
        error_msg = str(e)
        if "Invalid API key" in error_msg:
             return {"status": "error", "message": "Startup failed: Invalid ElevenLabs API key."}

        return {"status": "error", "message": f"Startup failed: {e}"}


def end_voice_bot():
    """Gracefully ends the active conversation session."""
    global active_conversation
    global active_audio_interface
    global is_speaking

    if active_conversation is not None:
        try:
            active_conversation.end_session()
        except Exception as e:
            print(f"Warning: Error encountered during session termination: {e}")

        if active_audio_interface:
            try:
                active_audio_interface.close()
            except Exception:
                 pass

        active_conversation = None
        active_audio_interface = None
        is_speaking = False # Reset status on end

        return {"status": "ended", "message": "Conversation session ended"}
    else:
        return {"status": "error", "message": "No active conversation to end"}

def get_transcript():
    """Returns the current conversation transcript."""
    global conversation_transcript
    return conversation_transcript

def get_speaking_status():
    """Returns the speaking status flag for the frontend."""
    global is_speaking
    return is_speaking
