from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from pdf2image import convert_from_bytes
from PIL import Image
import cv2
import numpy as np
import google.generativeai as genai
import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from fastapi.middleware.cors import CORSMiddleware

# Function to read API key from a file
def read_api_key(file_path):
    with open(file_path, 'r') as file:
        return file.read().strip()

# Set Gemini API Key from secrets folder
api_key_path = os.path.join("Secrets", "gemini_api_key.txt")
api_key = read_api_key(api_key_path)
genai.configure(api_key=api_key)

# Ensure the directory for saving images exists
os.makedirs("saved_images", exist_ok=True)

# Initialize Firebase Admin SDK
cred = credentials.Certificate("Secrets/paper2digit-014e2f0f64ed.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

app = FastAPI()

origins = [
    "https://paper-2-digit.web.app",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def preprocess_image(image: Image) -> Image:
    # Convert the PIL image to a numpy array
    image_np = np.array(image)

    # Convert to grayscale
    gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)

    # Apply GaussianBlur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # Apply thresholding to get a binary image
    _, binary = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Find contours
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Assume the largest contour is the document
    largest_contour = max(contours, key=cv2.contourArea)

    # Get the bounding box of the largest contour
    x, y, w, h = cv2.boundingRect(largest_contour)

    # Crop the image to the bounding box
    cropped = image_np[y:y+h, x:x+w]

    # Convert back to PIL image
    processed_image = Image.fromarray(cropped)

    return processed_image

# Function to upload image to Gemini
def upload_to_gemini(image_path, mime_type="image/png"):
    """Uploads the given BytesIO object to Gemini."""
    file = genai.upload_file(image_path, mime_type=mime_type)
    return file


# Function to perform OCR using Gemini
def ocr_with_gemini(file, previous_json):
    generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 8192,
        "response_mime_type": "application/json",
    }

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config=generation_config,
        system_instruction="The attached image is a page of the handwritten answer script of a student. Your duty is to read the image and return the textual data in it. You should return the recognized text as a json object where it follows the schema of {“question_number”(int): “students_answer”(str) ; …} , please note that the question number must strictly be a integer value like 1, 4, 5, etc... and not values like q1), 1. ,etc... .\n\nYou would also be given the JSON of the so far read question text pairs. in case its empty it signifies none have been read so far (i.e you are just starting)\n\nWhile performing OCR keep the following in mind:\n1. If a word, or a sentence , or even a paragraph is striked or scribled out then ignore it and do not include it in the text.\n2. You are to use the context and other knowledge to accurately recognize the words\n3. If a part of the text in the page is a continuation of a previous question already in the JSON given to you, append this new text as continuation of the already existing text.\n4. If a answer doesn't have a question number with it then assign it a number unless it is not the continuation of an already existing question answer as mentioned above (in 3)\n",
    )

    chat_session = model.start_chat(
        history=[
            {
                "role": "user",
                "parts": [
                    file,
                    previous_json,
                ],
            },
            {
                "role": "model",
                "parts": [
                    "```json\n\n```",
                ],
            },
        ]
    )

    response = chat_session.send_message("Process the attached image.")
    return response.text

def eval_with_gemini(question, answer_key, student_answer):

    generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json",
    }

    model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    # safety_settings = Adjust safety settings
    # See https://ai.google.dev/gemini-api/docs/safety-settings
    system_instruction="You are the evalautor for an examination, you would be given the question, the answer key / marking scheme for that particualr question, and the students answers for that question. You're duty as an unbaised and knowledgable and great teacher of this subject is to grade teh students answers and probide valauble feedback on where they went wrong, where they could have imprvoed and their plus points (the structure and contents of the evaluation feedback is completly up to you)\n\nPlease make sure you return the output of your analysis as a JSON object of the schemea: {\n         grade: <grade>(int) ,\n         feedback: <feedback>(str),\n    }\n    .\n    .\n    .\n}\n\nit is importanat that the output you writen sticks to this structure and that values liek <question_number> and <grade> are strictly integer and not values like q1), 5marks etc... but rather like 1, 5.6 etc... ",
    )

    chat_session = model.start_chat(
    history=[
    ]
    )

    response = chat_session.send_message(f"Question: \"\"\"{question} \"\"\" ;\nAnswer Key / Marking Scheme: \"\"\"{answer_key} \"\"\" ;\nStudent's Answer: \"\"\" {student_answer}\"\"\" ;")
    return response.text
        
def gemini_sumarize_feedback(grades_feedback):
    feedback = ""
    for q in grades_feedback:
        feedback += f"Question {q}: {grades_feedback[q]['feedback']}\n"

    generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
    }

    model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    # safety_settings = Adjust safety settings
    # See https://ai.google.dev/gemini-api/docs/safety-settings
    system_instruction="Yoa are an Experienced And Knwoledgable Teacher / educator, you have just now graded and given feedback for the each answer return by the student, you would be presented with the the whole of the feedback you have given, summarize them into a few short sentedces to give theg studnet an overall idea of the important point before they may choose to see the detailed feedback report you had made earlier.\n\noutput back as a string",
    )

    chat_session = model.start_chat(
    history=[
    ]
    )

    response = chat_session.send_message(f"the detailed feedback you have already made: {feedback}")

    return response.text
    

def fetch_question_paper_and_marking_scheme(classroom_code, test_code):
    doc_ref = db.collection('classrooms').document(classroom_code).collection('tests').document(test_code)
    doc = doc_ref.get()
    if doc.exists:
        data = doc.to_dict()
        question_paper = data.get('question_paper', {})
        marking_scheme = data.get('marking_scheme', {})
        return question_paper, marking_scheme
    else:
        raise ValueError("Classroom code or test code not found in Firebase.")

"""
Arguments: classroom_code, test_code, answer_paper.pdf;
Returns: Graded Score, and Feedback;

-> the classrom_code and test_code are used to identify the question paper and the marking scheme
-> the answer_paper.pdf is 
        ->converted to a set of images (using pdf2images),
        ->the images are processed to align the paper borders forming a scan like effect (using OpenCV), 
        ->This set of images  are passed to Gemmini Vision to extract text.

-> the extracted text is compared with the marking scheme to generate the score and feedback.
"""
@app.post("/uploadanswerscript/")
async def upload_answer_script(
    classroom_code: str = Form(...),
    test_code: str = Form(...),
    answer_script: UploadFile = File(...)
):
    try:
        """
        # Placeholder for where you would read the question paper and marking scheme
        question_paper = {'1':{"Question": "What was the reaction of St. Thomas when he came to know that the other disciples had seen the risen Lord? How did Jesus fulfill the wish of St. Thomas? What did St. Thomas do when he saw the risen Jesus?",
                             "Marks": 5,},}
        marking_scheme = {'1':'''Unless I see the marks of the nails in his hands, and put my finger in the mark of the nails and my hand in his side, I will not believe [Jn. 20:25]. Eight days later when the disciples were indoors, Thomas was also with them. The doors were closed. Jesus came, stood in their midst and said, “Peace to you”. Then He said to Thomas, “Put your finger here and see my hands. Reach out your hand and put it in my side.Do not doubt, but believe” [Jn. 20:26-28]. Immediately he saw the risen Jesus, Thomas said “My Lord, My God”.''', }
        """

        # Fetch question paper and marking scheme from Firebase
        question_paper, marking_scheme = fetch_question_paper_and_marking_scheme(classroom_code, test_code)
        '''
        print("Question_paper: ")
        print(type(question_paper))
        print(question_paper)
        print("")
        print("Marking_scheme: ")
        print(type(marking_scheme))
        print(marking_scheme) '''
        
        
        '''Converting pdf to images'''
        # Read the uploaded PDF file
        pdf_bytes = await answer_script.read()

        # Convert the PDF to a list of images
        images = convert_from_bytes(pdf_bytes)

        # Prepare the images for OCR processing and save them to disk
        image_file_list = []
        for i, image in enumerate(images):
            # Preprocess the image
            processed_image = preprocess_image(image)
            image_path = f"saved_images/page_{i + 1}.png"
            processed_image.save(image_path, format="PNG")
            #Upload to gemmni:
            file = upload_to_gemini(image_path, mime_type="image/png")
            image_file_list.append(file)

        # Initialize question_answer_json
        question_answer_json = """{}"""

        # Process each image buffer with Gemini OCR
        for image_file in image_file_list:
            # Perform OCR and update question_answer_json
            ocr_result = ocr_with_gemini(image_file, question_answer_json)
            question_answer_json = ocr_result

        # Convert the JSON string to a Python dictionary
        question_answer_json = json.loads(question_answer_json)
        #print(question_answer_json['1'])

        # Evaluate the answers using Gemini
        grades_feedback = {}
        for q in question_answer_json:
            gemmini_eval = eval_with_gemini(question_paper[q], marking_scheme[q], question_answer_json[q])
            grades_feedback[q] = json.loads(gemmini_eval)
        
        #print(grades_feedback)
       # return {"testing": "testing"}
    
        # Calculating total score using sum with type conversion
        total_score = sum(float(grades_feedback[q]["grade"]) for q in grades_feedback)


        # Creating Summary of feedback:
        summary_feedback = gemini_sumarize_feedback(grades_feedback)

        response = {
            "score": total_score,
            "feedback": summary_feedback,
            "ocr_result": question_answer_json,
            "grades_feedback": grades_feedback
        }
        return response
    except Exception as e:
        return JSONResponse(content={"message": f"An error occurred: {str(e)}"}, status_code=500)

@app.post("/add_test/")
async def add_test(
    classroom_code: str = Form(...),
    test_code: str = Form(...),
    question_paper: str = Form(...),
    marking_scheme: str = Form(...)
):
    try:
        # Parse the input JSON strings

        question_paper_dict = json.loads(question_paper)
        marking_scheme_dict = json.loads(marking_scheme)

        # Prepare the data to be written to Firestore
        data = {
            'question_paper': question_paper_dict,
            'marking_scheme': marking_scheme_dict
        }

        # Write to Firestore
        doc_ref = db.collection('classrooms').document(classroom_code).collection('tests').document(test_code)
        doc_ref.set(data)

        return {"message": "Test data successfully added to Firestore"}
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
