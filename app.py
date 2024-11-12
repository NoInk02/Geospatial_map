from fastapi import FastAPI, File, UploadFile
import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
import soundfile as sf
import numpy as np
import io
from fastapi.middleware.cors import CORSMiddleware
import ffmpeg



from opencage.geocoder import OpenCageGeocode

key = '0188553be00944a0954333a31eae57d9'
geocoder = OpenCageGeocode(key)

import nltk
from nltk.corpus import stopwords
import re
from transformers import BertTokenizer, BertModel
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

sentenceModel = SentenceTransformer('paraphrase-MiniLM-L6-v2')
target_actions = {
    "zoom_in": ["zoom in", "magnify", "enlarge"],
    "zoom_out": ["zoom out", "minimize"],
    "directions": ["find directions", "navigate", "directions"],
    "search": ["search", "look for"],
    "reset": ["reset","clear"],
    "switch": ["switch","change", "view"]
}
target_embeddings = {key: sentenceModel.encode(phrases) for key, phrases in target_actions.items()}

def get_best_match(command):
    command_embedding = sentenceModel.encode(command)
    best_match = None
    highest_similarity = 0.0
    
    for action, embeddings in target_embeddings.items():
        # Calculate similarity for each target action's embedding list
        similarities = [cosine_similarity([command_embedding], [embed])[0][0] for embed in embeddings]
        max_similarity = max(similarities)
        
        if max_similarity > highest_similarity:
            highest_similarity = max_similarity
            best_match = action
    
    return best_match, highest_similarity

from sklearn.metrics.pairwise import cosine_similarity

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

model_id = "openai/whisper-small.en"


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
map_types = ["osm", "street", "satellite"]
def check_presence(sentence):
    # Check if any map type is present and return the matched one
    for map_type in map_types:
        if map_type in sentence.lower():
            return map_type  # Return True and the found map type
    return None  # Return False if no map type is found

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

        ner = pipeline("ner", grouped_entities=True)
        ner_results = ner(result['text'])

        places=[]
        coords=[]
        best_match, similarity = get_best_match(result['text'])
        for entity in ner_results:
            # Check if the entity type is a location
            if entity['entity_group'] == 'LOC':
                locresult = geocoder.geocode(entity['word'])
                if locresult:
                    location = locresult[0]['geometry']
                    print(location)
                    places.append(entity['word'])

                    coords.append(location)
            else:
                
                
                print(f"Skipping non-location entity: {entity['word']}")
        
        if(similarity>=0.2):
            if(len(places) == 0) :
                if(best_match=='switch' ):
                    map_type = check_presence(result['text'])
                    return{"text": result["text"],"command":best_match,"map_type":map_type}
                return{"text": result["text"],"command":best_match}
            
            else:
                return{"text": result["text"],"command":best_match,"coords":coords}
        else:
            return{"text":result['text'],"command":'invalid'}
     
    
    except Exception as e:
        return {"error": str(e)}
