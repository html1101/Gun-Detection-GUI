# Run model on a given RTSP feed.

# 1) Imports
import sys
import tensorflow as tf
import cv2
import numpy as np
from camera import Camera
from os.path import exists
from datetime import datetime
import os, threading
from flask import Response, Flask, render_template, request

# To exchange output frame and lock for thread-safe exchanges.
outputFrame = None
lock = threading.Lock()
# initialize a flask object
app = Flask(__name__)

# If the past N frames predict X% gun, then log.
N_frames = 10
log_amount = 0.8
logList = []
logCache = []
os.environ["CUDA_VISIBLE_DEVICES"]="-1"

# Input a given model given.
arguments = sys.argv

assert len(arguments) >= 3, F"Only {len(arguments)} passed in; at least 3 arguments necessary."

# Now it's time to create the list of models.
models = {
    "InceptionV3": tf.keras.applications.InceptionV3,
    "Xception": tf.keras.applications.Xception,
    "MobileNet": tf.keras.applications.MobileNet,
    "ResNet50": tf.keras.applications.ResNet50
}

# Now check the model being passed in is valid.
assert arguments[1] in models, F"Model passed in, {arguments[1]}, is not valid."
model = arguments[1]

# If Inception or Xception, image size is (299, 299, 3)
image_width = 224
image_height = 224

if model in ("InceptionV3", "Xception"):
    image_width = 299
    image_height = 299
if model == "MobileNet":
    # Use the following preprocessing
    preprocess = tf.keras.applications.mobilenet.preprocess_input

# Now check that we have existing weights for this model.
assert exists(os.path.dirname(__file__) + F"/{model}_weights/checkpoint"), F"This model (./{model}_weights/checkpoint) has not been trained yet."

# Okay, now let's listen in to this feed.
print(F"Listening to RTSP feed: {arguments[2]}")
rtsp_url = arguments[2]

# Create model.
print(F"Creating model {model}.")
nn_model = models[model](input_shape=(image_width,image_height,3), weights=None, include_top=True, classes=2)

checkpoint_path = os.path.dirname(__file__) + F"/{model}_weights/{model}.ckpt"

nn_model.load_weights(checkpoint_path)
print("Successfully loaded weights!")

# Make sure port exists and is a number.
try:
    port = int(arguments[3])
except:
    assert False, F"Port passed, {arguments[3]} does not exist or is not a number."

# Default threshold 0.5.
threshold = 0.5
if len(arguments) >= 5:
    threshold = float(arguments[4])
    assert threshold >= 0 and threshold <= 1, "Threshold given is not within range."

# Use OpenCV + camera.py to keep an eye on this feed.
vid_1 = cv2.VideoCapture(rtsp_url)
vid_1.set(cv2.CAP_PROP_FPS, 30)

vid = Camera(vid_1, "Window")

ret, frame = vid.read()

@app.route("/")
def video_feed():
    # Return response + specific MIME type
    return Response(streamImage(),
        mimetype = "multipart/x-mixed-replace; boundary=frame")

@app.route("/changeThresh")
def changeThresh():
    global threshold
    new_thresh = request.args.get("threshold")
    try:
        threshold = float(new_thresh)
        print(F"Changed threshold value to: {threshold}.")
        return F"Changed threshold value to {threshold}."
    except:
        # New thresh is not int
        print(F"Invalid threshold value: {new_thresh}")
        return F"Invalid threshold value: {new_thresh}."

@app.route("/getLog")
def getLog():
    global logList
    
    # Return a list of the logs, separated by newlines
    return "<br>".join(logList)


def streamImage():
    global outputFrame, lock

    while True:
        with lock:
            if outputFrame is None:
                continue
            
            # Encode in JPEG format
            (flag, encodedImage) = cv2.imencode(".jpg", outputFrame)

            # Ensure frame successfully encoded
            if not flag:
                continue

        yield(b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + 
        bytearray(encodedImage) + b'\r\n')

def detect_guns():
    global vid, outputFrame, lock, logCache

    while True:
        # Read from RTSP feed
        ret, frame = vid.read()
        
        if not frame is None:
            new_frame = np.expand_dims(preprocess(cv2.resize(frame, (image_width, image_height))), axis=0)
            # Run through model
            result = nn_model.predict(new_frame)[0]
            # print(F"GUN | {result[0]}" if result[0] >= threshold else F"NO GUN | {result[0]}, {result[1]}")
            if result[0] >= threshold:
                # This is a gun, log it
                logCache.append(1)
            else:
                logCache.append(0)
            # Get last N logs
            logCache = logCache[-N_frames:]
            # Check percent
            print(F"Percent frames with guns: {sum(logCache) / N_frames} {logCache}")
            if sum(logCache) / N_frames > log_amount:
                logList.append(F"GUN detected at {datetime.today()}")
                logCache = [0 for i in range(N_frames)]

            frame = cv2.putText(
                frame,
                F"GUN ({round(result[0] * 100) / 100})" if result[0] >= threshold else F"No gun ({round(result[1] * 100) / 100})",
                (50, int(vid_1.get(cv2.CAP_PROP_FRAME_HEIGHT) - 70)),
                cv2.FONT_HERSHEY_SIMPLEX,
                4,
                (0, 0 if result[0] >= threshold else 255, 255 if result[0] >= threshold else 0),
                3
            )
            frame = cv2.putText(
                frame,
                F"{datetime.today()}",
                (50, int(vid_1.get(cv2.CAP_PROP_FRAME_HEIGHT) - 180)),
                cv2.FONT_HERSHEY_SIMPLEX,
                2,
                (255, 255, 255),
                3
            )

            with lock:
                outputFrame = frame.copy()

if __name__ == '__main__':
    # Create thread where we continuously detect guns
	t = threading.Thread(target=detect_guns)
	t.daemon = True
	t.start()

	# Start little Flask app that hosts our video at /
	app.run(host="127.0.0.1", port=port, debug=True,
		threaded=True, use_reloader=False)

vid.release()

cv2.destroyAllWindows()