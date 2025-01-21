let globalUserID;

/* --- DOM Content Load = Start --- */

document.addEventListener('DOMContentLoaded', () => {
    // Display welcome pop-up4 message
    document.querySelector('.popup4').classList.remove('hidden4');
});

/* --- DOM Content Load = End --- */


/* --- Welcome Pop-up = Start --- */

function secondWelcomeMessage() {
    document.querySelector('.popup4').classList.add('hidden4');
    document.querySelector('.popup5').classList.remove('hidden5');
};

function thirdWelcomeMessage() {
    document.querySelector('.popup5').classList.add('hidden5');
    document.querySelector('.popup6').classList.remove('hidden6');
};


function closeWelcomeMessage() {
    document.querySelector('.popup6').classList.add('hidden6');
};

/* --- Welcome Pop-up = End --- */





/* --- Canvas Element = Start --- */

// Get the canvas element
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set the canvas dimensions based on its parent element
canvas.width = canvas.parentNode.clientWidth * 0.8;
canvas.height = canvas.parentNode.clientHeight * 0.8;

// Add event listeners to handle mouse events
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);

// Variables to track mouse state
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Function to handle mouse down event
function handleMouseDown(event) {
  isDrawing = true;
  [lastX, lastY] = [event.offsetX, event.offsetY];
}

// Function to handle mouse move event
function handleMouseMove(event) {
  if (!isDrawing) return;
  const currentX = event.offsetX;
  const currentY = event.offsetY;
  drawLine(lastX, lastY, currentX, currentY);
  [lastX, lastY] = [currentX, currentY];
}

// Function to handle mouse up event
function handleMouseUp() {
  isDrawing = false;
}

// Function to draw a line on the canvas
function drawLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.closePath();
}

// Get the submit button element
const submitButton = document.getElementById('submitButton');

// Get the reset button element
const resetButton = document.getElementById('resetButton');


// Function to clear the canvas
function resetCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

/* --- Canvas Element = End --- */


/* --- Train Model = Start --- */

const trainButton = document.getElementById('train-button');

// function to send a post request, sending data to the backend
function sendTrainRequest() {
    // Stop any existing calls to get the accuracy data
    stopAccCalling();

    //disable train button after clicking
    trainButton.disabled = true;
    //disable canvas submit button 
    submitButton.disabled = true;
    //disable canvas reset button
    resetButton.disabled = true;
    // Collect the information of the number of hidden layers, number of neurons per layer,
    // and the hyperparameters selected 
    // Get the number of hidden layers 
    const hLs = parseInt(document.getElementById('hidden-layers').value);
    // Get the number of neurons per layer and store them in an array
    const nIs = document.querySelectorAll('#neurons-inputs-container input[type="number"]');
    const nVs = Array.from(nIs).map(input => parseInt(input.value));
    // Get the selectd hyperparameters
    const eps = parseInt(document.querySelector('#epochs').value);
    const bS = parseInt(document.querySelector('#batch').value);
    const opt = document.querySelector('#optimizer').value;
    const lR = parseFloat(document.querySelector('#learning').value);

    // Show training screen
    document.querySelector('.popup1').classList.remove('hidden1');

    // Set the status of stillTraining to true
    stillTraining = true;
    // Start getting the accuracy data
    getAccData();

    $.ajax({
        type: 'POST',
        url: '/trainModel',
        contentType: 'application/json',
        data: JSON.stringify({
            hidden_layers: hLs,
            neurons_per_layer: nVs,
            epochs: eps,
            batch_size: bS,
            optimizer: opt,
            learning_rate: lR,
        }),
        success: function(response) {
            console.log(response);
            const accuracy = response.accuracy;
            globalUserID = response.userTicket
            // Stop getting the accuracy data
            stopAccCalling();
            // Hide loading pop-up screen
            document.querySelector('.popup1').classList.add('hidden1');
            // Assign accuracy value to pop-up screen
            document.getElementById('training-accuracy').textContent = accuracy;
            // Display accuracy pop-up screen
            document.querySelector('.popup2').classList.remove('hidden2');
            

            // Enable buttons again
            trainButton.disabled = false;
            submitButton.disabled = false;
            resetButton.disabled = false;
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
            console.error('Status:', status);
            console.error('Response:', xhr.responseText);

            // Hide loading screen even if there's an error
            document.querySelector('.popup1').classList.add('hidden1');


            // Enable buttons again
            trainButton.disabled = false;
            submitButton.disabled = false;
            resetButton.disabled = false;
        }

    });
    
    // enable the train button again
    trainButton.disabled = false;

    // reset the canvas
    resetCanvas();
};

let stillTraining = false;
let accGraph;



// function to get the accuracy values of the model during training
function getAccData() {
    // condition to check if the model is still training 
    if (!stillTraining) return;

    $.ajax({
        type: 'GET',
        url: '/accData',
        success: function(response) {
            const accData = response.accuracyData;
            console.log("The Accuracy Data is: ",accData);
            // Take the accuracy data and plot it on a graph
            const xValues = Array.from({length: accData.length}, (x, i) => i+1);
            const yValues = Array.from(accData, (x) => x*100);

            if (accGraph) {
                accGraph.destroy();
            }

            accGraph = new Chart("accGraph", {
                type: "line",
                data: {
                  labels: xValues,
                  datasets: [{
                    label: "Accuracy",
                    backgroundColor:"#4c7aaf",
                    borderColor: "#4c7aaf",
                    fill: false,
                    data: yValues,
                    tension: 0.1,
                  }]
                },
                options: {
                    animation: {
                        duration: 0,
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "Epochs",
                                color: "#4c7aaf",   
                                font: {
                                    size: 24,     
                                    weight: "normal",
                                    family: "'Montserrat', sans-serif"
                                }
                            }
                        },
                        y: {
                            min: 0,
                            max: 100,
                            title: {
                                display: true,
                                text: "Accuracy (%)",
                                color: "#4c7aaf",   
                                font: {
                                    size: 24,     
                                    weight: "normal",
                                    family: "'Montserrat', sans-serif"
                                }
                            }
                        },
                    },
                },
              });

            if (stillTraining) {
                // Repeat getAccData function after 1 seconds
                setTimeout(getAccData, 1000); 
            }
        },
        error: function(xhr, status, error) {
            console.error('Error getting Accuracy Data:', error);
            console.error('Status:', status);
            console.error('Response:', xhr.responseText);

            // Optionally, stop getting the accuracy data on error or handle the error
            stillTraining = false;
        },
    })
};

function stopAccCalling() {
    stillTraining = false;
    console.log("Accuracy Data Calling Off");
};


function closeTrainingResults() {
    document.querySelector('.popup2').classList.add('hidden2');
};


/* --- Train Model = End --- */


/* --- Evaluate Model = Start --- */


function evaluateModel() {
    //disable train button after clicking
    trainButton.disabled = true;
    //disable canvas submit button 
    submitButton.disabled = true;
    //disable canvas reset button
    resetButton.disabled = true;

    // Show evaluating screen
    document.querySelector('.popup9').classList.remove('hidden9');

    // Get Canvas Data
    const canvasData = canvas.toDataURL('image/png');
    console.log(canvasData);

    // Get User ID from Session Storage
    const idTicket = globalUserID;
    console.log('User ID:', idTicket);

    $.ajax({
        type: 'POST',
        url: '/evaluateModel',
        contentType: 'application/json',
        data: JSON.stringify({
            canvasData: canvasData,
            idTicket: idTicket,
        }),
        success: function(response) {
            // as well as logging the response, store the contents of it as variables to display in the UI
            let accuracy = response.accuracy;
            let identifiedValue = response.identifiedValue;
            console.log('Identified Value: ', identifiedValue, 'Accuracy: ', accuracy);
            // Hide evaluating screen
            document.querySelector('.popup9').classList.add('hidden9');
            // Assign indentified value to pop-up screen
            document.getElementById('indentified-value').textContent = identifiedValue;
            // Display evaluation pop-up screen
            document.querySelector('.popup3').classList.remove('hidden3');

            // Enable buttons again
            trainButton.disabled = false;
            submitButton.disabled = false;
            resetButton.disabled = false;
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
            console.error('Status:', status);
            console.error('Response:', xhr.responseText);

            // Enable buttons again
            trainButton.disabled = false;
            submitButton.disabled = false;
            resetButton.disabled = false;
        }
    });
    
};


function closeEvaluationResults() {
    document.querySelector('.popup3').classList.add('hidden3');
    resetCanvas();
};

/* --- Evaluate Model = End --- */


/* --- Info Pop-up = Start --- */

function openInfoMessage() {
    document.querySelector('.popup7').classList.remove('hidden7');
};

function nextInfoMessage() {
    document.querySelector('.popup7').classList.add('hidden7');
    document.querySelector('.popup8').classList.remove('hidden8');
};

function closeInfoMessage() {
    document.querySelector('.popup8').classList.add('hidden8');
};

/* --- Info Pop-up = End --- */

/* --- Questionnaire Link = Start --- */

function openQuestionnaire() {
    // open a new tab with a link to the Google Form 
    window.open("https://docs.google.com/forms/d/e/1FAIpQLSf-kzPrL8adprTFP6j0fYwodEBsuJYUX9uupSG_zLT4VmavjQ/viewform?usp=sf_link", '_blank');
}

/* --- Questionnaire Link = End --- */



