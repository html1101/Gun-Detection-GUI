# Summary
In the past 24 hours, 32 people have been shot and gravely injured or killed in the U.S. Gun violence is a major issue and is continuing to get worse. The number of school shootings per decade has exploded, with 400 more mass shootings occurring in the past decade than 30 years ago; with the current political climate, it has been impossible to make progress towards gun restriction, making effective gun detection methods for high risk areas such as schools and churches essential. The researchers propose an effective, real-time, high accuracy AI based system for detecting guns that works with almost any existing surveillance system and on commodity hardware. The system offers detection of weapons using state-of-the-art AI based image classification models InceptionV3, Xception, ResNet50, MobileNet, and RetinaNet, as well as the real-time object detection model YOLOv5 trained on custom data compiled from various sources. The researchers found that models using depthwise-separable convolutions produced an average validation accuracy of 95%, and tended to produce strongly positive Cohen Kappa scores, suggesting that reducing the number of parameters tends to facilitate effective learning, increase model prediction speed, and alleviate overfitting as was seen with the larger models such as MobileNetV3 Large. To the researchers’ knowledge, this is the only fully-fledged gun detection system designed to work on top of existing surveillance cameras.
<br><br>
The researchers are providing this as open-source in the hope that this helps further development on gun violence mitigation strategies and makes a difference in the world.

# Getting Started
## Requirements
To run this software, you must first have [NodeJS](https://nodejs.org/en/download/) and [Python](https://www.python.org/downloads/) downloaded.
<br><br>
Next, the necessary NodeJS and Python packages can be installed with the following commands in your OS's command line:

```
user@computer:/PATH/Gun-Detection-GUI> npm install
user@computer:/PATH/Gun-Detection-GUI> cd Models
user@computer:/PATH/Gun-Detection-GUI> pip3 -r requirements.txt
```


## Starting the GUI
The GUI can be started with ```npm start```.

## Issues?
If you want to train your own custom data or want access to the full dataset and weights, contact us at [GunDetectionGUI@gmail.com](mailto://gundetectiongui@gmail.com) and we will respond within 24 hours.

If you have a cool new idea for a new feature, or suspect you found a bug, submit a bug request [here](https://github.com/html1101/Gun-Detection-GUI/issues)!