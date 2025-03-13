# from fastapi import FastAPI, File, UploadFile
# import torch
# from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
# import soundfile as sf
# import numpy as np
# import io
# from fastapi.middleware.cors import CORSMiddleware
# import ffmpeg

# from dotenv import load_dotenv
# import os
# load_dotenv()

# from opencage.geocoder import OpenCageGeocode

# key = os.getenv('GEOCODER_API_KEY')
# geocoder = OpenCageGeocode(key)

# import nltk
# from nltk.corpus import stopwords
# import re
# from transformers import BertTokenizer, BertModel
# from sklearn.metrics.pairwise import cosine_similarity
# from sentence_transformers import SentenceTransformer

# sentenceModel = SentenceTransformer('paraphrase-MiniLM-L6-v2')
# target_actions = {
#     "zoom_in": ["zoom in", "magnify", "enlarge"],
#     "zoom_out": ["zoom out", "minimize"],
#     "directions": ["find directions", "navigate", "directions"],
#     "search": ["search", "look for"],
#     "reset": ["reset","clear"],
#     "switch": ["switch","change", "view"]
# }
# target_embeddings = {key: sentenceModel.encode(phrases) for key, phrases in target_actions.items()}

# def get_best_match(command):
#     command_embedding = sentenceModel.encode(command)
#     best_match = None
#     highest_similarity = 0.0
    
#     for action, embeddings in target_embeddings.items():
#         # Calculate similarity for each target action's embedding list
#         similarities = [cosine_similarity([command_embedding], [embed])[0][0] for embed in embeddings]
#         max_similarity = max(similarities)
        
#         if max_similarity > highest_similarity:
#             highest_similarity = max_similarity
#             best_match = action
    
#     return best_match, highest_similarity

# from sklearn.metrics.pairwise import cosine_similarity

# # Set the path to ffmpeg manually if not in PATH

# # Initialize FastAPI app
# app = FastAPI()
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"]
# )
# # Function to load WAV file and convert to numpy array
# import wave
# from pydub import AudioSegment
# import io


# def load_wav(content):
#     try:
#         # Ensure file is read as a valid WAV
        

        
#         input_file = io.BytesIO(content)

#         # Convert the WebM audio to WAV using ffmpeg
#         output_file = io.BytesIO()
#         process = (
#             ffmpeg
#             .input('pipe:0')  # Use stdin as input
#             .output('pipe:1', format='wav')  # Use stdout as output
#             .run_async(pipe_stdin=True, pipe_stdout=True, pipe_stderr=True)
#         )

#         # Send the content of input_file to stdin and read stdout (WAV data)
#         wav_data, _ = process.communicate(input=input_file.read())

#         output_file.write(wav_data)
        
#         output_file.seek(0)


#         with wave.open(output_file, 'rb') as wf:
#             sample_rate = wf.getframerate()
#             n_channels = wf.getnchannels()
#             audio_data = np.frombuffer(wf.readframes(wf.getnframes()), np.int16)

#             # Convert stereo to mono if needed
#             if n_channels > 1:
#                 audio_data = audio_data[::n_channels]  # Take the first channel

#             audio_data = audio_data.astype(np.float32) / np.max(np.abs(audio_data))
#             return audio_data, sample_rate
#     except wave.Error as e:
#         raise ValueError(f"Wave error: {e}")

# # Set up model and processor for speech-to-text
# device = "cuda:0" if torch.cuda.is_available() else "cpu"
# torch_dtype = torch.float32

# model_id = "distil-whisper/distil-medium.en"


# model = AutoModelForSpeechSeq2Seq.from_pretrained(
#     model_id, torch_dtype=torch_dtype, use_safetensors=True
# )
# model.to(device)

# processor = AutoProcessor.from_pretrained(model_id)

# pipe = pipeline(
#     "automatic-speech-recognition",
#     model=model,
#     tokenizer=processor.tokenizer,
#     feature_extractor=processor.feature_extractor,
#     torch_dtype=torch_dtype,
#     device=device,
# )
# map_types = ["osm", "street", "satellite"]
# def check_presence(sentence):
#     # Check if any map type is present and return the matched one
#     for map_type in map_types:
#         if map_type in sentence.lower():
#             return map_type  # Return True and the found map type
#     return None  # Return False if no map type is found

# # Define the API route for receiving a WAV file and returning the transcribed text
# @app.post("/transcribe/")
# async def transcribe_audio(file: UploadFile = File(...)):
#     try:
#         # Load and process the uploaded audio file
#         content=await file.read()
    
#         audio_data, sample_rate = load_wav(content)

#         # Prepare the audio data in the required format for the pipeline
#         audio_input = {"raw": audio_data, "sampling_rate": sample_rate}

#         # Use the pipeline to transcribe the audio
#         result = pipe(audio_input)
        
#         # Return the transcription result

# #########add your code here, using the result["text"] which contains the speech transcript###################################

#         ner = pipeline("ner", grouped_entities=True)
#         ner_results = ner(result['text'])

#         places=[]
#         coords=[]
#         best_match, similarity = get_best_match(result['text'])
#         for entity in ner_results:
#             # Check if the entity type is a location
#             if entity['entity_group'] == 'LOC':
#                 locresult = geocoder.geocode(entity['word'])
#                 if locresult:
#                     location = locresult[0]['geometry']
#                     print(location)
#                     places.append(entity['word'])

#                     coords.append(location)
#             else:
                
                
#                 print(f"Skipping non-location entity: {entity['word']}")
        
#         if(similarity>=0.2):
#             if(len(places) == 0) :
#                 if(best_match=='switch' ):
#                     map_type = check_presence(result['text'])
#                     return{"text": result["text"],"command":best_match,"map_type":map_type}
#                 return{"text": result["text"],"command":best_match}
            
#             else:
#                 return{"text": result["text"],"command":best_match,"coords":coords}
#         else:
#             return{"text":result['text'],"command":'invalid'}
     
    
#     except Exception as e:
#         return {"error": str(e)}
# @app.on_event("shutdown")
# async def shutdown_event():
#     global model, pipe
#     try:
#         model.cpu()
#     except Exception as e:
#         print("Error moving model to CPU:", e)
#     finally:
#         del model
#         del pipe
#         torch.cuda.empty_cache()
#         print("Cleaned up CUDA resources.")


from fastapi import FastAPI, File, UploadFile
import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
import soundfile as sf
import numpy as np
import io
from fastapi.middleware.cors import CORSMiddleware
import ffmpeg

from dotenv import load_dotenv
import os
load_dotenv()

from opencage.geocoder import OpenCageGeocode

key = os.getenv('GEOCODER_API_KEY')
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
    "switch": ["switch","change", "view"],
    "show_places": ["show", "find", "locate", "search for", "where is"]
}
target_embeddings = {key: sentenceModel.encode(phrases) for key, phrases in target_actions.items()}

# Define OSM features mapping for common place categories
osm_features = {
    "hospital": {"amenity": ["hospital"], "healthcare": ["hospital"], "building": ["hospital"]},
    "restaurant": {"amenity": ["restaurant", "fast_food", "cafe", "food_court"]},
    "cafe": {"amenity": ["cafe"]},
    "shop": {"shop": ["supermarket", "convenience", "mall", "department_store"]},
    "atm": {"amenity": ["atm"], "atm": ["yes"]},
    "bank": {"amenity": ["bank"]},
    "school": {"amenity": ["school"], "building": ["school"]},
    "college": {"amenity": ["college", "university"]},
    "park": {"leisure": ["park", "garden"]},
    "pharmacy": {"amenity": ["pharmacy"], "shop": ["pharmacy"]},
    "cinema": {"amenity": ["cinema"]},
    "gym": {"leisure": ["fitness_centre"], "amenity": ["gym"]},
    "gas_station": {"amenity": ["fuel"]},
    "hotel": {"tourism": ["hotel", "motel", "hostel"]},
    "police": {"amenity": ["police"]},
    "post_office": {"amenity": ["post_office"]},
    "bus_stop": {"highway": ["bus_stop"]},
    "parking": {"amenity": ["parking"]},
    "library": {"amenity": ["library"]}
}

# Function to process natural language into OSM feature keys
def get_place_type(query):
    query = query.lower()
    
    # Direct match attempt
    for place_type, _ in osm_features.items():
        if place_type in query:
            return place_type
            
    # Handle common synonyms
    if any(term in query for term in ["gas", "petrol", "fuel"]):
        return "gas_station"
    elif any(term in query for term in ["food", "eat"]):
        return "restaurant"
    elif any(term in query for term in ["movie", "theatre", "theater"]):
        return "cinema"
    elif any(term in query for term in ["coffee"]):
        return "cafe"
    elif any(term in query for term in ["store", "mall", "shopping"]):
        return "shop"
    elif any(term in query for term in ["medicine", "drug", "chemist"]):
        return "pharmacy"
    elif any(term in query for term in ["hotel", "motel", "stay", "lodging"]):
        return "hotel"
    elif any(term in query for term in ["university", "school", "education"]):
        if "college" in query or "university" in query:
            return "college"
        return "school"
    elif any(term in query for term in ["workout", "fitness", "exercise"]):
        return "gym"
    elif any(term in query for term in ["hospital", "clinic", "doctor", "medical", "healthcare"]):
        return "hospital"
        
    # If no match found
    return None

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

model_id = "distil-whisper/distil-medium.en"

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
    return None  # Return False if no map type is found

# Define the API route for receiving a WAV file and returning the transcribed text
@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        # Load and process the uploaded audio file
        content = await file.read()
    
        audio_data, sample_rate = load_wav(content)

        # Prepare the audio data in the required format for the pipeline
        audio_input = {"raw": audio_data, "sampling_rate": sample_rate}

        # Use the pipeline to transcribe the audio
        result = pipe(audio_input)
        
        # Process the transcription result
        ner = pipeline("ner", grouped_entities=True)
        ner_results = ner(result['text'])

        places = []
        coords = []
        best_match, similarity = get_best_match(result['text'])
        
        # Process "show_places" command specially
        place_type = None
        if best_match == "show_places" and similarity >= 0.2:
            # Try to extract what kind of place the user is looking for
            place_type = get_place_type(result['text'])
        
        # Process named locations from NER
        for entity in ner_results:
            # Check if the entity type is a location
            if entity['entity_group'] == 'LOC':
                locresult = geocoder.geocode(entity['word'])
                if locresult:
                    location = locresult[0]['geometry']
                    places.append(entity['word'])
                    coords.append(location)
            else:
                print(f"Skipping non-location entity: {entity['word']}")
        
        if similarity >= 0.2:
            if best_match == 'switch':
                map_type = check_presence(result['text'])
                return {"text": result["text"], "command": best_match, "map_type": map_type}
            elif best_match == 'show_places':
                # If we identified a place type to search for
                if place_type:
                    # If we have coordinates (from a named location), use those
                    if len(coords) > 0:
                        return {
                            "text": result["text"],
                            "command": best_match,
                            "place_type": place_type,
                            "coords": coords,
                            "place_names": places
                        }
                    else:
                        # No specific location mentioned - use user's current location
                        return {
                            "text": result["text"],
                            "command": best_match,
                            "place_type": place_type
                        }
                else:
                    # Couldn't determine what places to show
                    return {
                        "text": result["text"],
                        "command": "invalid",
                        "error": "Could not determine what places to show"
                    }
            elif len(places) == 0:
                return {"text": result["text"], "command": best_match}
            else:
                return {"text": result["text"], "command": best_match, "coords": coords}
        else:
            return {"text": result['text'], "command": 'invalid'}
     
    except Exception as e:
        return {"error": str(e)}

@app.on_event("shutdown")
async def shutdown_event():
    global model, pipe
    try:
        model.cpu()
    except Exception as e:
        print("Error moving model to CPU:", e)
    finally:
        del model
        del pipe
        torch.cuda.empty_cache()
        print("Cleaned up CUDA resources.")