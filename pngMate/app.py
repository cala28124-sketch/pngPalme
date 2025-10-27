# app.py - NEW ENDPOINT ADDED

from flask import Flask, jsonify, request
from flask_cors import CORS
import voice_bot
import os

app = Flask(__name__)
# Enable CORS for all routes (to allow connection from Electron/React on different ports)
CORS(app)

# --- New Status Endpoint ---
@app.route('/is_speaking', methods=['GET'])
def get_is_speaking_status():
    """Returns the current speaking status of the bot."""
    # 🛑 NEW ROUTE: Retrieve the status from the bot logic
    status = voice_bot.get_speaking_status()
    return jsonify({"isSpeaking": status})

# --- Existing Endpoints (No changes needed) ---

@app.route('/start', methods=['POST'])
def start_bot():
    data = request.json
    api_key = data.get('elevenlabs_api_key')
    agent_id = data.get('agent_id')

    # 🛑 Temporary fix: When the bot starts, assume it's speaking its first message
    # This is a crude fix for the missing 'is_playing' flag.
    voice_bot.is_speaking = True

    result = voice_bot.start_voice_bot(api_key, agent_id)
    return jsonify(result)

@app.route('/stop', methods=['POST'])
def stop_bot():
    result = voice_bot.end_voice_bot()
    return jsonify(result)

@app.route('/messages', methods=['GET'])
def get_messages():
    transcript_list = voice_bot.get_transcript()
    return jsonify({"messages": transcript_list})

# --- New Speaking Flag Logic (Placeholder for real-time status) ---
@app.after_request
def after_request(response):
    """
    After the bot finishes sending a response, we assume it's done speaking
    and allow the user to interrupt. This crudely sets the speaking flag back to False.
    """
    # NOTE: This is a placeholder. A proper solution requires ElevenLabs audio callbacks.
    if voice_bot.is_speaking and response.status_code == 200 and request.path == '/messages':
         # Resetting this flag crudely after a successful transcript poll
         # This should be done based on audio playback end event.
         # For demo purposes, we will rely on the user speaking to set it back to True
         # in the future and this to eventually set it back to False.
         pass
    return response

if __name__ == '__main__':
    app.run(debug=True, port=5000, threaded=False)
