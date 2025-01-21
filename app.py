from flask import Flask, render_template, request, jsonify, session
from mlModel.mnistModel import MNISTModel
import json
import time
import random
import logging
import io
import base64
import os
import cv2
from PIL import Image, ImageOps

import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.datasets import fetch_openml
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.models import Sequential
from tensorflow.keras.datasets import mnist
from tensorflow.keras.layers import Dense, Flatten
import tensorflow.keras.optimizers

app = Flask(__name__)
app.secret_key = XXXXXXXXXXXX
model = MNISTModel()

SAVE_FOLDER = 'static/images'
os.makedirs(SAVE_FOLDER, exist_ok=True)

assignedIDs = set()
modelInst = None

class mnistInstManager:
    def __init__(self):
        self.mnistModelInst = None

def assignUserID():
    for userID in range(1, 1001):
        if userID not in assignedIDs:
            assignedIDs.add(userID)
            return userID
    raise ValueError("All Users have been assigned an ID.")

@app.route("/")
def index():
    if "userID" not in session:
        session["userID"] = assignUserID()
    userID = assignUserID()
    print(f"Assigned Users: {assignedIDs}")
    return render_template("index.html")


@app.route("/trainModel", methods=["POST"])
def trainModel():
    try:
        userID = session.get("userID")

        data = request.get_json()
        hidden_layers = data["hidden_layers"]
        neurons_per_layer = data["neurons_per_layer"]
        epochs = data["epochs"]
        batch_size = data["batch_size"]
        optimizer = data["optimizer"]
        learning_rate = data["learning_rate"]

        global modelInst

        modelInst = mnistInstManager()
       
        # Create a new instance of the MNISTModel class
        modelInst.mnistModelInst = MNISTModel(num_hidden_layers=hidden_layers, neurons_per_layer_list=neurons_per_layer, epochs=epochs, batch_size=batch_size, optimizer_name=optimizer, learning_rate=learning_rate, userID=userID)

        print(f"AccuracyList Before: {modelInst.mnistModelInst.accuracyList}")

        # Train and save the model
        loss, accuracy, idTicket = modelInst.mnistModelInst.train_save_model()
        #loss, accuracy, idTicket = model.train_save_model()
    
        print(f"AccuracyList After: {modelInst.mnistModelInst.accuracyList}")

        # Return a response to the frontend
        return jsonify({"message": "Data received successfully!", "accuracy" : accuracy, "userTicket": idTicket})
    except Exception as e:
        app.logger.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 400


@app.route("/accData", methods=['GET'])
def transferAccData():

    print("About to try looping")
    try:
        # Loop through the accuracyList and send it to the frontend
        if modelInst:
            # Get the accuracy data from the model
            data = modelInst.mnistModelInst.accuracyList
            print(f"Sending data...{data}")
            return jsonify({"accuracyData": data})
        else:
            # Return an empty list if the modelInst doesn't exist - meaning the model hasn't been trained yet
            return jsonify({"accuracyData": []})
    except Exception as e:
        app.logger.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 1000



@app.route("/evaluateModel", methods=["POST"])
def evaluateModel():
    try:
        # Load canvas data and store in variable
        data = request.get_json()
        canvas_data = data["canvasData"]
        sentID = data["idTicket"]


        if canvas_data:
            # Remove the prefix 'data:image/png;base64,' from the canvas data and decode the base64-encoded image data into bytes
            image_data = base64.b64decode(canvas_data.split(',')[1])
            # Convert the bytes into a file object and convert it to an image object
            image = Image.open(io.BytesIO(image_data))

            # save the image as a png file
            image.save(os.path.join(SAVE_FOLDER, f'processed_image{sentID}.png'))

            # Greyscale the image
            grey_image = image.convert('L')
            
            # Resize the image to 28x28 pixels
            resized_image = grey_image.resize((28, 28))

            image_array = np.array(resized_image).astype('float32') / 255.0
            image_array = image_array.reshape((1, 28 * 28))

            # Create a new instance of the MNISTModel class 
            model = MNISTModel(userID=sentID)

            # Run canvas_image as an argument through evaluate_model(self, image) to evaluate the model
            identifiedValue, accuracy = model.evaluate_model(image_array=image_array, idTicket=sentID)
            #print("identifiedValue:", identifiedValue, "accuracy:", accuracy)

            return jsonify({"message": "Data received successfully!", "identifiedValue" : identifiedValue, "accuracy" : accuracy})

        else:
            return jsonify({'error': 'No image data provided'}), 400 
    except Exception as e:
        app.logger.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 400

    

if __name__ == "__main__":
    app.run(debug=True)
