# node-red-contrib-axis-host

When running [Node-RED on an Axis Device](https://pandosme.github.io/acap/node-red/2023/09/12/nodered-acap.html), these nodes provides bindings to resources in the device.  

## Events
Revice events detected in the Axis device.

## Camera
Capture a JPEG image from the Axis camera with user defined resolutions.  It is also possible to get a cropped part of the image.

## Trigger
Generate an event in the Axis device that can be used to trigger an action in the device or a VMS (Video Management System).  Three events are avaialbel. Event (value), State (true/false), and Data (Arbitrary string e.g. JSON)

## Objects
Analytics data of objects detected by the camera including bounding box and classification.  The output can be configured to recive detections, tracker, or paths.

## Change log

### 1.5.2 & 1.5.1
- Fixed falyr coordinates in Object Paths in the Axis Objects Node
- Updated Axis Host examples


### 1.5.0
- Updated for Node-RED-Installer ACAP version 4.5.0.  Do not install/upgrade unless you run version 4.5.0.

### 1.4.1
- Added support for radar including examples.

### 1.3.8
- Updated examples

### 1.3.7
- Fixed flaw in Object Detections Example

### 1.3.6
- Updated examples

### 1.3.5
- Fixed flaws in examples

### 1.3.4
- Updated examples

### 1.3.3
- Updated example Object Detection example

### 1.3.2
- Fixed a flaw in Object Path example

### 1.3.1
- Added examples for Object Detection, Tracker and Path

### 1.3.0
- Fixed bugs in image capture

### 1.1.7
- Added support for Objects attribute: color, bag, hat, face

