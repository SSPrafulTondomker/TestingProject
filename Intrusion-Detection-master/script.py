#libraries
import face_recognition
import numpy as np
import requests
#database
import sqlite3
#image procesing libraries
import cv2
#script to uplod files
import merger as mg
import time
import datetime
#from gtts import gTTS  
import os

# speech to text conversion
def convertTextToSpeech(opt, name) :

    if opt == 1 :
        mytext = 'Welcome to ' + name + ' your entry has been recorded'
    else :
        mytext = 'Face Light detected you as a unknown or unauthorized'
    language = 'en'
    
    myobj = gTTS(text=mytext, lang=language, slow=False) 
    
    #run
    myobj.save("welcome.mp3") 
    os.system("mpg321 welcome.mp3")

# check if unknown face entry 
def check(unknown_frames, face_encoding) :
    
    #if empty
    if unknown_frames == [] :
        return True

    #find the distances with all frames
    matches = face_recognition.compare_faces(unknown_frames, face_encoding)
    face_distances = face_recognition.face_distance(unknown_frames, face_encoding)
    
    #pick the smallest distance 
    best_match_index = np.argmin(face_distances)
    print (matches[best_match_index])
    if matches[best_match_index]:
        return False
    return True

IP_Webcam = False

if IP_Webcam is True:
    video_capture = cv2.VideoCapture('http://192.168.1.100:8080/videofeed')  # IP Webcam
else:
    video_capture = cv2.VideoCapture(0)

#cached known faces for 2-mins duration
known_face_names = []
known_face_encodings = []

#database connections
db = sqlite3.connect('db.sqlite3')
print("Opened Database Successfully by FaceLight !!!")

cursor = db.cursor()

cursor.execute("SELECT * FROM sqlite_master WHERE name ='FACES' and type='table';")
chk = cursor.fetchone()

if chk is not None:
    data = cursor.execute("SELECT FACE_NAME, FACE_ENCODING FROM FACES")
else:
    print("There's no face entry in the Database !!")
    exit()

for row in data:
    known_face_names.append(row[0])
    known_face_encodings.append(np.frombuffer(row[1]))

#local variables, will be reset after every 2-mins
face_locations = []
face_encodings = []
face_names = []
process_this_frame = True
process_names = []
now = datetime.datetime.now()
process_min = now.minute
unknown_frames = []

#video starts
while True:

    #read
    ret, frame = video_capture.read()

    #resize
    small_frame = cv2.resize(frame, (0, 0), fx = 0.25, fy = 0.25)
    rgb_small_frame = small_frame[:, :, ::-1]


    if process_this_frame:

        #face location
        face_locations = face_recognition.face_locations(rgb_small_frame)
        
        #face encoding
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)


        face_names = []
        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
            name = "Unknown"

            face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
            best_match_index = np.argmin(face_distances)
            if matches[best_match_index]:
                name = known_face_names[best_match_index]

            face_names.append(name)

    #unset the process
    process_this_frame = not process_this_frame

    index = 0

    #looping through all the faces in one frame
    for (top, right, bottom, left), name in zip(face_locations, face_names):
        top *= 4
        right *= 4
        bottom *= 4
        left *= 4

        height, width, _ = frame.shape
        font = cv2.FONT_HERSHEY_DUPLEX

        nm = ""
        num = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
           
        for i in name :
            if i in num :
                break
            nm += i
        name = nm
        if name != "Unknown" :
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
            cv2.rectangle(frame, (left, bottom - 35), (right, bottom), (0, 255, 0), cv2.FILLED)
            cv2.putText(frame, 'Permission Granted !!', (int(width / 4), height - 50), font, 1.0, (255, 255, 255), 1, cv2.LINE_AA)
            cv2.putText(frame, name, (left + 6, bottom - 6), font, 1.0, (255, 255, 255), 1)
            
           
            if name not in process_names :
                #convertTextToSpeech(1, name)
                mg.record(name)
                process_names.append(name)
                time.sleep(1) 

        else :
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)
            cv2.rectangle(frame, (left, bottom - 35), (right, bottom), (0, 0, 255), cv2.FILLED)
            cv2.putText(frame, 'Permission Denied !!', (int(width / 4), height - 50), font, 1.0, (255, 255, 255), 1, cv2.LINE_AA)
            cv2.putText(frame, name, (left + 6, bottom - 6), font, 1.0, (255, 255, 255), 1)
            cv2.imwrite(name+".jpg", frame)
            if (len(face_locations) > 0) and (unknown_frames == [] or check(unknown_frames, face_encodings[index])):
                #convertTextToSpeech(2, "Permission Denied!!")
                unknown_frames.append(face_encodings[index])
                mg.intrudor()
                time.sleep(1) 
                
        # cv2.putText(frame, name, (left + 6, bottom - 6), font, 1.0, (255, 255, 255), 1)
        index += 1

    now = datetime.datetime.now()
    curr_min = now.minute
    if process_min > curr_min :
        process_min = 0
    if abs(curr_min-process_min) >= 1 :
        process_names = []
        process_min = curr_min

    cv2.imshow('Video', frame)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        print("Exited Operation !!")
        break
    

if IP_Webcam is not True:
    video_capture.release()
cv2.destroyAllWindows()
