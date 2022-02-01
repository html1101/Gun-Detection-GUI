# ResNet50

## Model
See [MobileNet-Summary.txt](https://github.com/html1101/Gun-Detection-GUI/Models/MobileNet_Info/MobileNet-Summary.txt) for specifications; ResNet50 contains 48 convolutional layers, one MaxPool, and one average pooling layer.

MobileNet uses depthwise separable convolutions (a single convolutional filter is applied to each channel, then convolved outputs are stacked) to reduce the number of parameters. It requires 

With **two** output classes, the model has **23,591,810** parameters, **23,538,690** of which are trainable.