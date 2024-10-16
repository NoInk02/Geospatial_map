from fastapi import FastAPI, File, UploadFile
import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
import soundfile as sf
import numpy as np
import io
from fastapi.middleware.cors import CORSMiddleware
import ffmpeg

# Set the path to ffmpeg manually if not in PATH

# Initialize FastAPI app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
# Function to load WAV file and convert to numpy array
import wave
from pydub import AudioSegment
import io


def load_wav(content):
    try:
        # Ensure file is read as a valid WAV
        

        
        input_file = io.BytesIO(content)

        # Convert the WebM audio to WAV using ffmpeg
        output_file = io.BytesIO()
        process = (
            ffmpeg
            .input('pipe:0')  # Use stdin as input
            .output('pipe:1', format='wav')  # Use stdout as output
            .run_async(pipe_stdin=True, pipe_stdout=True, pipe_stderr=True)
        )

        # Send the content of input_file to stdin and read stdout (WAV data)
        wav_data, _ = process.communicate(input=input_file.read())

        output_file.write(wav_data)
        
        output_file.seek(0)


        with wave.open(output_file, 'rb') as wf:
            sample_rate = wf.getframerate()
            n_channels = wf.getnchannels()
            audio_data = np.frombuffer(wf.readframes(wf.getnframes()), np.int16)

            # Convert stereo to mono if needed
            if n_channels > 1:
                audio_data = audio_data[::n_channels]  # Take the first channel

            audio_data = audio_data.astype(np.float32) / np.max(np.abs(audio_data))
            return audio_data, sample_rate
    except wave.Error as e:
        raise ValueError(f"Wave error: {e}")

# Set up model and processor for speech-to-text
device = "cuda:0" if torch.cuda.is_available() else "cpu"
torch_dtype = torch.float32

model_id = "openai/whisper-small"

model = AutoModelForSpeechSeq2Seq.from_pretrained(
    model_id, torch_dtype=torch_dtype, use_safetensors=True
)
model.to(device)

processor = AutoProcessor.from_pretrained(model_id)

pipe = pipeline(
    "automatic-speech-recognition",
    model=model,
    tokenizer=processor.tokenizer,
    feature_extractor=processor.feature_extractor,
    torch_dtype=torch_dtype,
    device=device,
)

# Define the API route for receiving a WAV file and returning the transcribed text
@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        # Load and process the uploaded audio file
        content=await file.read()
    
        audio_data, sample_rate = load_wav(content)

        # Prepare the audio data in the required format for the pipeline
        audio_input = {"raw": audio_data, "sampling_rate": sample_rate}

        # Use the pipeline to transcribe the audio
        result = pipe(audio_input)
        
        # Return the transcription result

#########add your code here, using the result["text"] which contains the speech transcript###################################

        return {"text": result["text"]}
    
    except Exception as e:
        return {"error": str(e)}