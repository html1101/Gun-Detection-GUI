# Run model on a given RTSP feed.

# 1) Imports
import sys
import tensorflow as tf
import cv2
import numpy as np
from camera import Camera
from os.path import exists
import os

os.environ["CUDA_VISIBLE_DEVICES"]="-1"

# Input a given model given.
arguments = sys.argv

assert len(arguments) >= 3, F"Only {len(arguments)} passed in; at least 3 arguments necessary."

# Now it's time to create the list of models.
models = {
    "InceptionV3": tf.keras.applications.InceptionV3,
    "VGG16": tf.keras.applications.VGG16,
    "VGG19": tf.keras.applications.VGG19,
    "Xception": tf.keras.applications.Xception,
    "MobileNetV3Large": tf.keras.applications.MobileNetV3Large,
    "MobileNet": tf.keras.applications.MobileNet
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
assert exists(F"./{model}_weights/checkpoint"), F"This model (./{model}_weights/checkpoint) has not been trained yet."

# Okay, now let's listen in to this feed.
print(F"Listening to RTSP feed: {arguments[2]}")
rtsp_url = arguments[2]

# Create model.
print(F"Creating model {model}.")
nn_model = models[model](input_shape=(image_width,image_height,3), weights=None, include_top=True, classes=2)

checkpoint_path = F"{model}_weights/{model}.ckpt"

nn_model.load_weights(checkpoint_path)
print("Successfully loaded weights!")

# Use OpenCV + camera.py to keep an eye on this feed.
vid = cv2.VideoCapture(rtsp_url)
vid.set(cv2.CAP_PROP_FPS, 15)

vid = Camera(vid, "Window")

ret, frame = vid.read()

while True:
    # Read from RTSP feed
    ret, frame = vid.read()
    frame = cv2.resize(frame, (image_width, image_height))

    new_frame = np.expand_dims(preprocess(frame), axis=0)
    # Run through model
    result = nn_model.predict(new_frame)[0]
    print(F"GUN DETECTED, {result[0]}" if np.argmax(result) == 0 else F"Unable to detect gun, {result[0]}, {result[1]}")

    frame = cv2.putText(
        frame,
        F"GUN ({round(result[0] * 100) / 100})" if np.argmax(result) == 0 else F"No gun ({round(result[1] * 100) / 100})",
        (10,50),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (0, 0, 0),
        3
    )
    # Display resulting frame
    cv2.imshow("Window", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

vid.release()

cv2.destroyAllWindows()