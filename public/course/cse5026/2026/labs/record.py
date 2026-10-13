import pyaudio
import numpy as np
import wave
import time  # For countdown timing

def record_microphone_pyaudio(
    duration=5, 
    sample_rate=44100, 
    channels=1, 
    output_file="recording_pyaudio.wav",
    countdown_seconds=3  # Countdown duration before recording starts
):
    """
    Record audio from the microphone using PyAudio with a countdown timer.
    
    Args:
        duration (int): Recording duration in seconds.
        sample_rate (int): Sample rate (Hz).
        channels (int): 1 for mono, 2 for stereo.
        output_file (str): Path to save the WAV file.
        countdown_seconds (int): Seconds for pre-recording countdown.
    """
    # --------------------------
    # Countdown before recording
    # --------------------------
    print("Get ready to record...")
    for i in range(countdown_seconds, 0, -1):
        print(f"{i}...", end=" ", flush=True)  # Print without newline
        time.sleep(1)  # Wait 1 second between counts
    print("\nRecording started!")  # Final message to indicate start

    # --------------------------
    # Audio recording setup
    # --------------------------
    chunk = 1024  # Frames per buffer
    format = pyaudio.paInt16  # 16-bit resolution
    p = pyaudio.PyAudio()

    # Open microphone stream
    stream = p.open(
        format=format,
        channels=channels,
        rate=sample_rate,
        input=True,
        frames_per_buffer=chunk
    )

    frames = []  # To store recorded audio chunks

    # --------------------------
    # Record for specified duration
    # --------------------------
    try:
        # Calculate total chunks needed for the duration
        total_chunks = int(sample_rate / chunk * duration)
        
        for _ in range(total_chunks):
            data = stream.read(chunk)
            frames.append(data)

    except KeyboardInterrupt:
        # Handle manual stop (Ctrl+C)
        print("\nRecording stopped early by user.")
    finally:
        # Stop and close the stream
        stream.stop_stream()
        stream.close()
        p.terminate()

    print("Recording finished!")

    # --------------------------
    # Save to WAV file
    # --------------------------
    wf = wave.open(output_file, 'wb')
    wf.setnchannels(channels)
    wf.setsampwidth(p.get_sample_size(format))
    wf.setframerate(sample_rate)
    wf.writeframes(b''.join(frames))
    wf.close()

    # Convert to numpy array (for processing)
    audio_data = np.frombuffer(b''.join(frames), dtype=np.int16).astype(np.float32) / 32767.0
    return audio_data, sample_rate

# Example usage
if __name__ == "__main__":
    # Record for 5 seconds with a 3-second countdown
    audio_data, sr = record_microphone_pyaudio(
        duration=5,
        output_file="recording.wav",
        countdown_seconds=3  # Customize countdown length here
    )
    print(f"Recorded {len(audio_data)} samples at {sr} Hz")