# MobileNet

## Model
See [MobileNet-Summary.txt](https://github.com/html1101/Gun-Detection-GUI/Models/MobileNet_Info/MobileNet-Summary.txt) for specifications; MobileNet contains 27 convolutional layers (13 depthwise convolutional layers), 1 fully connected layer, and one SoftMax layer.

MobileNet uses depthwise separable convolutions (a single convolutional filter is applied to each channel, then convolved outputs are stacked) to reduce the number of parameters. It is designed to "effectively maximise accuracy while being mindful of the restricted resources for an on-device or embedded application" (source: https://medium.com/analytics-vidhya/image-classification-with-mobilenet-cc6fbb2cd470).

With **two** output classes, the model has **3,230,914** parameters, **3,209,026** of which are trainable.

## Model Preprocessing
MobileNet scales input values between -1 and 1, sample-wise. (Source: https://www.tensorflow.org/api_docs/python/tf/keras/applications/mobilenet/preprocess_input). MobileNet takes an input of shape (224, 224, 3).

## Results
