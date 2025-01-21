// Function to update neuron inputs dynamically based on number of hidden layers
function updateNeuronInputs() {
    const hiddenLayersInput = document.getElementById('hidden-layers');
    const neuronsInputsContainer = document.getElementById('neurons-inputs-container');
    const initialHiddenLayers = parseInt(hiddenLayersInput.value, 10);

    // Store existing values
    const existingInputs = Array.from(neuronsInputsContainer.querySelectorAll('input')).map(input => ({
        label: input.previousElementSibling.textContent,
        value: input.value,
        name: input.name,
    }));

    // Clear existing inputs
    neuronsInputsContainer.innerHTML = ''; 

    // Add new inputs
    for (let i = 0; i < initialHiddenLayers; i++) {
        const pairContainer = document.createElement('div');
        pairContainer.classList.add('pair-container');
        
        const label = document.createElement('label');
        label.textContent = 'Neurons';
        
        const input = document.createElement('input');
        input.type = 'number';
        input.name = 'neurons-layer-' + i;
        input.min = 1;
        input.max = 8;
        input.placeholder = 'Number of Neurons';

        // Check if there is an existing value for this layer
        const existingInput = existingInputs.find(inp => inp.name === input.name);
        if (existingInput) {
            input.value = existingInput.value;
        } else {
            // Default value if no existing input
            input.value = 3; 
        }

        // Attach event listener to each input to redraw the network on change
        input.addEventListener('change', drawNetwork);

        // Add increase button
        const increaseButton = document.createElement('button');
        increaseButton.type = 'button';
        increaseButton.className = 'in-de-buttons';
        increaseButton.textContent = '+';
        increaseButton.addEventListener('click', () => {
            input.value = Math.min(parseInt(input.value, 10) + 1, 8);
            drawNetwork();
        });

        // Add decrease button
        const decreaseButton = document.createElement('button');
        decreaseButton.type = 'button';
        decreaseButton.className = 'in-de-buttons';
        decreaseButton.textContent = '-';
        decreaseButton.addEventListener('click', () => {
            input.value = Math.max(parseInt(input.value, 10) - 1, 1);
            drawNetwork();
        });

        // Add flex container
        const flexContainer = document.createElement('div');
        flexContainer.classList.add('flex-container');
        // Append buttons and input to flex container
        flexContainer.appendChild(decreaseButton);
        flexContainer.appendChild(input);
        flexContainer.appendChild(increaseButton);
        // Append flex container and label to pair container
        pairContainer.appendChild(flexContainer);
        pairContainer.appendChild(label);
        // Append pair container to neurons inputs container
        neuronsInputsContainer.appendChild(pairContainer);
    }

    // Redraw the network
    drawNetwork();
};


// Draw Neural Network - function
function drawNetwork() {
    const hiddenLayersInput = document.getElementById('hidden-layers');
    const initialHiddenLayers = parseInt(hiddenLayersInput.value, 10);
    const neuronsPerLayer = Array.from(document.querySelectorAll('[name^="neurons-layer-"]')).map(input => parseInt(input.value, 10));

    if (neuronsPerLayer.includes(NaN)) {
        console.error('Please specify the number of neurons for each layer.');
        return;
    }

    const svg = d3.select("#network-svg");

    // Clear previous drawings
    svg.selectAll("*").remove(); 

    const svgElement = document.getElementById('network-svg');
    const width = svgElement.clientWidth;
    const height = svgElement.clientHeight;
   
    // Spacing between hidden layer, +2 for input and output layers
    const layerSpacing = width / (initialHiddenLayers + 2); 
    const neuronSpacing = height / 10.5;


    // Draw links
    for (let i = 0; i <= initialHiddenLayers; i++) {
        const neuronsInLayer = (i === 0) ? 1 : neuronsPerLayer[i - 1];
        const neuronsInNextLayer = (i === initialHiddenLayers) ? 10 : neuronsPerLayer[i];
        for (let j = 1; j <= neuronsInLayer; j++) {
            for (let k = 1; k <= neuronsInNextLayer; k++) {
                svg.append("line")
                    .attr("x1", layerSpacing * i + layerSpacing / 2)
                    .attr("y1", neuronSpacing * j)
                    .attr("x2", layerSpacing * (i + 1) + layerSpacing / 2)
                    .attr("y2", neuronSpacing * k)
                    .attr("stroke", "#315b7d")
                    .attr("stroke-width", 1);
            }
        }
    }

    // Draw neurons
    for (let i = 0; i <= initialHiddenLayers + 1; i++) {
        // Define the number of neurons for the input layer (1) and output layer (10)
        const neuronsInLayer = ((i === 0) ? 1 : neuronsPerLayer[i - 1]) || ((i === initialHiddenLayers + 1) ? 10 : neuronsPerLayer[i - 1]);
        for (let j = 1; j <= neuronsInLayer; j++) {
            if (i === 0 && j === 1) {
                // Append the dataset icon
                const serverIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="steelblue" class="bi bi-server" viewBox="0 0 14.5 16">
                    <path d="M1.333 2.667C1.333 1.194 4.318 0 8 0s6.667 1.194 6.667 2.667V4c0 1.473-2.985 2.667-6.667 2.667S1.333 5.473 1.333 4z"/>
                    <path d="M1.333 6.334v3C1.333 10.805 4.318 12 8 12s6.667-1.194 6.667-2.667V6.334a6.5 6.5 0 0 1-1.458.79C11.81 7.684 9.967 8 8 8s-3.809-.317-5.208-.876a6.5 6.5 0 0 1-1.458-.79z"/>
                    <path d="M14.667 11.668a6.5 6.5 0 0 1-1.458.789c-1.4.56-3.242.876-5.21.876-1.966 0-3.809-.316-5.208-.876a6.5 6.5 0 0 1-1.458-.79v1.666C1.333 14.806 4.318 16 8 16s6.667-1.194 6.667-2.667z"/>
                </svg>`;
                svg.append("foreignObject")
                    .attr("x", layerSpacing * i + layerSpacing / 2 - 10)
                    .attr("y", neuronSpacing * j - 10)
                    .attr("width", 49)
                    .attr("height", 50)
                    .html(serverIcon);
            } else {
                // Append the circle
                svg.append("circle")
                    .attr("cx", layerSpacing * i + layerSpacing / 2)
                    .attr("cy", neuronSpacing * j)
                    .attr("r", 11)
                    .attr("stroke", "#315b7d")
                    .attr("fill", "steelblue");
            }
        }
    }

};


// Initialise via DOM Load 
document.addEventListener('DOMContentLoaded', () => {
    updateNeuronInputs();
    drawNetwork();

    document.getElementById('hidden-layers').addEventListener('change', updateNeuronInputs);
    document.getElementById('increase-layers').addEventListener('click', () => {
        const hiddenLayersInput = document.getElementById('hidden-layers');
        hiddenLayersInput.value = Math.min(parseInt(hiddenLayersInput.value, 10) + 1, 6);
        updateNeuronInputs();
    });
    document.getElementById('decrease-layers').addEventListener('click', () => {
        const hiddenLayersInput = document.getElementById('hidden-layers');
        hiddenLayersInput.value = Math.max(parseInt(hiddenLayersInput.value, 10) - 1, 1);
        updateNeuronInputs();
    });
});




