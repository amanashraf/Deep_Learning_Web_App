# mnist model
import os
import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.datasets import fetch_openml
#from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.datasets import mnist
from tensorflow.keras.layers import Dense, Flatten
from tensorflow.keras.callbacks import Callback
import tensorflow.keras.optimizers
from PIL import Image
import pickle

class accRecorder(Callback):
        def __init__(self, accuracy_list):
            self.accuracyList = accuracy_list
        def on_epoch_end(self, epoch, logs=None):
            accuracy = logs["accuracy"]
            if accuracy is not None:
                self.accuracyList.append(accuracy)
                print(f"Accuracy List: {self.accuracyList}") 

class MNISTModel():

    def __init__(self, num_hidden_layers=2, neurons_per_layer_list=[4,4], epochs=10, batch_size=20, optimizer_name="adam", learning_rate=0.001, kernel_initializer="glorot_uniform", userID=None):

        # Define hyperparameters
        self.num_hidden_layers = num_hidden_layers
        self.neurons_per_layer_list = neurons_per_layer_list
        self.epochs = epochs
        self.batch_size = batch_size
        self.optimizer_name = optimizer_name
        self.learning_rate = learning_rate
        self.kernel_initializer = kernel_initializer
        self.userID = userID
        self.accuracyList = []

        # Load and split the MNIST dataset
        (self.X_train, self.y_train), (self.X_test, self.y_test) = mnist.load_data()
        
        # Preprocess data 
        # Normalise pixel values to the range [0, 1]
        self.X_train = self.X_train.astype("float32") / 255.0
        self.X_test = self.X_test.astype("float32") / 255.0
        # Reshape the data to have a single channel
        self.X_train = self.X_train.reshape((self.X_train.shape[0], -1))
        self.X_test = self.X_test.reshape((self.X_test.shape[0], -1))
        # One-hot encode labels 
        self.y_train_encoded = to_categorical(self.y_train)
        self.y_test_encoded = to_categorical(self.y_test)

    def train_save_model(self):

        # Print the user ID
        print(f"User ID: {self.userID}")
        # Print the hyperparameter values being used for training
        print("Training with the following hyperparameters:")
        print(f"Number of hidden layers: {self.num_hidden_layers}")
        print(f"Neurons per layer: {self.neurons_per_layer_list}")
        print(f"Epochs: {self.epochs}")
        print(f"Batch size: {self.batch_size}")
        print(f"Optimizer name: {self.optimizer_name}")
        print(f"Learning rate: {self.learning_rate}")

        # Create the optimizer object with the specified learning rate
        optimizer = getattr(tensorflow.keras.optimizers, self.optimizer_name)(learning_rate=self.learning_rate)

        # Create an instance of the AccuracyLogger class
        accList = accRecorder(self.accuracyList)

        # Create the model
        self.model = Sequential()
        self.model.add(Flatten(input_shape=(28 * 28,)))
        for i, num_neurons in enumerate(self.neurons_per_layer_list):
            self.model.add(Dense(num_neurons, activation="relu", kernel_initializer=self.kernel_initializer))
        self.model.add(Dense(10, activation='softmax'))
        self.model.compile(loss='categorical_crossentropy', optimizer=optimizer, metrics=['accuracy'])

        # Train the model   
        self.model.fit(self.X_train, self.y_train_encoded, epochs=self.epochs, batch_size=self.batch_size, callbacks=[accList])

        # Save the model 
        if not os.path.exists("mlModel"):
            os.makedirs("mlModel")
        self.model.save(f"mlModel/model{self.userID}.keras", overwrite=True)

        loss, accuracy = self.model.evaluate(self.X_test, self.y_test_encoded)
        test_acc = "{:.1f}%".format(accuracy * 100)
        return loss, test_acc, self.userID


    def evaluate_model(self, image_array, idTicket):
        print(f"Evaluating model for User ID: {idTicket}")
        # Load trained model
        model = tensorflow.keras.models.load_model(f"mlModel/model{idTicket}.keras")

        # Evaluate the model on the test set
        loss, accuracy = model.evaluate(self.X_test, self.y_test_encoded)
        print("Test Accuracy: {:.1f}%".format(accuracy * 100), "Loss: {:.2f}".format(loss))
        # Predict the value of the image, using the trained model, by finding the probability of each output
        ValueProbabilities = model.predict(image_array)
        # Select the value with the highest probability
        identifiedValue = int(np.argmax(ValueProbabilities))
        print("IdentifiedValue:", identifiedValue)
        return "{:.0f}".format(identifiedValue) , "{:.1f}%".format(accuracy * 100)



        
    def displayUserID(self):
        print(f"User ID for this instance: {self.user_id}")


    def clearAssignededUserIDs(cl4ss):
        # Clear all assigned user IDs (resetting the set)
        cl4ss.assignedUserIDs.clear()
        print("All user IDs have been cleared.")



if __name__ == "__main__":
    # Train the model
    model = MNISTModel()