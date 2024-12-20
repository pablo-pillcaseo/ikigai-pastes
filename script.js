let caseCounter = 0;
const cases = [];

let keyboardMode = false;
let activeCaseId = null;
let activeSection = null; // 'pocket', 'size', 'color', 'lid', 'first-lid', 'second-lid'
let colorInput = ''; // To capture color name input during keyboard navigation
let awaitingColorSelection = false; // Indicates if we're waiting for the user to press Enter to select a color

// Add event listener for keyboard shortcuts
document.addEventListener('keydown', (event) => {
  if (event.key === '=') {
    event.preventDefault();
    addCase();
    enterKeyboardMode();
  } else if (keyboardMode) {
    handleKeyboardInput(event);
  }
});

// Exit keyboard mode on any mouse click
document.addEventListener('click', () => {
  if (keyboardMode) {
    exitKeyboardMode();
  } else {
    // Ensure visual highlights are reset when using the mouse
    resetColorSwatches();
  }
});

function enterKeyboardMode() {
  keyboardMode = true;
  // Set the activeCaseId to the latest case added
  activeCaseId = `case-${caseCounter}`;
  activeSection = 'pocket';
  highlightActiveSection();
  scrollToActiveSection();
}

function exitKeyboardMode() {
  keyboardMode = false;
  activeCaseId = null;
  activeSection = null;
  colorInput = '';
  awaitingColorSelection = false; // Reset the flag
  removeHighlights();
  resetColorSwatches(); // Reset color swatch highlights

  // **Reset Custom Modifications Fields**
  cases.forEach(caseId => {
    const customModInput = document.getElementById(`custom-modifications-${caseId}`);
    if (customModInput) {
      customModInput.value = '';
    }
  });
}

function resetColorSwatches() {
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.classList.remove('match', 'first-match');
    swatch.style.opacity = '1'; // Reset opacity to 1
  });
  // Remove the 'single-match' class from any color options divs
  document.querySelectorAll('.color-swatches').forEach(div => {
    div.classList.remove('single-match');
  });
}

function highlightActiveSection() {
  removeHighlights();

  if (!activeCaseId || !activeSection) return;

  const caseDiv = document.getElementById(activeCaseId);

  switch (activeSection) {
    case 'pocket':
      const pocketOptionsDiv = caseDiv.querySelector(`#pocket-options-${activeCaseId}`);
      pocketOptionsDiv.classList.add('highlight');
      break;
    case 'size':
      const sizeOptionsDiv = caseDiv.querySelector(`#size-options-${activeCaseId}`);
      sizeOptionsDiv.classList.add('highlight');
      break;
    case 'color':
      const colorsDiv = caseDiv.querySelector(`#colors-${activeCaseId}`);
      colorsDiv.classList.add('highlight');
      if (awaitingColorSelection) {
        colorsDiv.classList.add('single-match');
      } else {
        colorsDiv.classList.remove('single-match');
      }
      break;
    case 'lid':
      const lidInput = caseDiv.querySelector(`#lid-${activeCaseId}`);
      lidInput.classList.add('highlight');
      lidInput.focus();
      break;
    case 'first-lid':
      const firstLidInput = caseDiv.querySelector(`#first-lid-${activeCaseId}`);
      firstLidInput.classList.add('highlight');
      firstLidInput.focus();
      break;
    case 'second-lid':
      const secondLidInput = caseDiv.querySelector(`#second-lid-${activeCaseId}`);
      secondLidInput.classList.add('highlight');
      secondLidInput.focus();
      break;
    case 'dotw':
      const dotwOptionsDiv = caseDiv.querySelector(`#dotw-options-${activeCaseId}`);
      dotwOptionsDiv.classList.add('highlight');
      const customModDiv = caseDiv.querySelector(`#custom-modifications-div-${activeCaseId}`);
      if (customModDiv) {
        customModDiv.classList.add('highlight');
      }
      break;
    case 'custom-modifications':
      const customModInput = caseDiv.querySelector(`#custom-modifications-${activeCaseId}`);
      customModInput.classList.add('highlight');
      customModInput.focus();
      break;
  }
}

function removeHighlights() {
  document.querySelectorAll('.highlight').forEach(element => {
    element.classList.remove('highlight');
    element.classList.remove('single-match');
  });
}

function scrollToActiveSection() {
  if (!activeCaseId || !activeSection) return;

  const caseDiv = document.getElementById(activeCaseId);

  let elementToScrollTo = null;

  switch (activeSection) {
    case 'pocket':
      elementToScrollTo = caseDiv.querySelector(`#pocket-options-${activeCaseId}`);
      break;
    case 'size':
      elementToScrollTo = caseDiv.querySelector(`#size-options-${activeCaseId}`);
      break;
    case 'color':
      elementToScrollTo = caseDiv.querySelector(`#colors-${activeCaseId}`);
      break;
    case 'lid':
      elementToScrollTo = caseDiv.querySelector(`#lid-${activeCaseId}`);
      break;
    case 'first-lid':
      elementToScrollTo = caseDiv.querySelector(`#first-lid-${activeCaseId}`);
      break;
    case 'second-lid':
      elementToScrollTo = caseDiv.querySelector(`#second-lid-${activeCaseId}`);
      break;
    case 'dotw':
      elementToScrollTo = caseDiv.querySelector(`#dotw-options-${activeCaseId}`);
      const customModDiv = caseDiv.querySelector(`#custom-modifications-div-${activeCaseId}`);
      if (customModDiv) {
        elementToScrollTo = customModDiv;
      }
      break;
  }

  if (elementToScrollTo) {
    elementToScrollTo.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function handleKeyboardInput(event) {
  if (!activeCaseId || !activeSection) return;

  switch (activeSection) {
    case 'pocket':
      handlePocketSelection(event);
      break;
    case 'size':
      handleSizeSelection(event);
      break;
    case 'color':
      handleColorSelection(event);
      break;
    case 'lid':
    case 'first-lid':
    case 'second-lid':
      // Allow typing in lid engraving inputs
      if (event.key === 'Enter') {
        event.preventDefault();
        moveToNextSection();
      }
      break;
    case 'dotw':
      handleDOTWSelection(event);
      break;
  }
}

function handlePocketSelection(event) {
  const key = event.key.toLowerCase();
  let selectedPocketIndex = -1;

  if (key === '1' || key === 'j') selectedPocketIndex = 0;
  else if (key === '2' || key === 'k') selectedPocketIndex = 1;
  else if (key === '3' || key === 'l') selectedPocketIndex = 2;
  else if (key === '4' || key === ';') selectedPocketIndex = 3;
  else if (key === '5' || key === "'") selectedPocketIndex = 4;

  if (selectedPocketIndex !== -1) {
    const pocketOptionsDiv = document.querySelector(`#pocket-options-${activeCaseId}`);
    const pocketButtons = pocketOptionsDiv.querySelectorAll('button');
    pocketButtons.forEach(btn => btn.classList.remove('selected'));
    pocketButtons[selectedPocketIndex].classList.add('selected');
    updateCaseType(activeCaseId);
    activeSection = 'size';
    highlightActiveSection();
    scrollToActiveSection();
  }
}

function handleSizeSelection(event) {
  const key = event.key.toLowerCase();
  let selectedSizeIndex = -1;

  if (key === '1' || key === 'j') selectedSizeIndex = 0;
  else if (key === '2' || key === 'k') selectedSizeIndex = 1;
  else if (key === '3' || key === 'l') selectedSizeIndex = 2;

  if (selectedSizeIndex !== -1) {
    const sizeOptionsDiv = document.querySelector(`#size-options-${activeCaseId}`);
    const sizeButtons = sizeOptionsDiv.querySelectorAll('button');
    sizeButtons.forEach(btn => btn.classList.remove('selected'));
    sizeButtons[selectedSizeIndex].classList.add('selected');
    activeSection = 'color';
    highlightActiveSection();
    scrollToActiveSection();
  }
}

function handleColorSelection(event) {
  const key = event.key;

  if (awaitingColorSelection) {
    // Only accept 'Enter' or 'Backspace' when awaiting color selection
    if (key === 'Enter') {
      const matches = filterColors(colorInput);
      if (matches.length > 0) {
        selectColor(matches[0].name);
        awaitingColorSelection = false;
        moveToNextSection();
      }
    } else if (key === 'Backspace') {
      colorInput = colorInput.slice(0, -1);
      highlightMatchingColors();
    }
    // Ignore other keys
    return;
  }

  // If the key is 'Enter' and we're not awaiting color selection, do nothing
  if (key === 'Enter') {
    return;
  }

  if (key.length === 1 && /^[a-zA-Z0-9 ]$/.test(key)) {
    colorInput += key;
    highlightMatchingColors();
  } else if (key === 'Backspace') {
    colorInput = colorInput.slice(0, -1);
    highlightMatchingColors();
  }
}

function handleDOTWSelection(event) {
  // For this implementation, keyboard navigation for DOTW can be handled as needed.
  // Since DOTW selection is done via buttons, you might want to allow arrow keys or other shortcuts.
  // For simplicity, we'll handle 'Enter' to select the currently highlighted DOTW option.

  if (event.key === 'Enter') {
    event.preventDefault();
    // Assuming that one DOTW option is highlighted or focused, simulate a click.
    const caseDiv = document.getElementById(activeCaseId);
    const selectedButton = caseDiv.querySelector(`#dotw-options-${activeCaseId} .selected`);
    if (selectedButton) {
      // Move to Custom Modifications section
      activeSection = 'custom-modifications';
      highlightActiveSection();
      scrollToActiveSection();
    }
  }
}

function moveToNextSection() {
  if (activeSection === 'pocket') {
    activeSection = 'size';
  } else if (activeSection === 'size') {
    activeSection = 'color';
  } else if (activeSection === 'color') {
    const pocket = document.querySelector(`#pocket-options-${activeCaseId} .selected`)?.innerText;
    if (pocket === 'AMPM' || pocket === '2-WEEK') {
      const firstColorSelected = document.querySelector(`input[name="first-color-${activeCaseId}"]:checked`);
      const secondColorSelected = document.querySelector(`input[name="second-color-${activeCaseId}"]:checked`);
      if (!firstColorSelected) {
        // First color just selected, now move to second color
        colorInput = ''; // Reset color input
        awaitingColorSelection = false;
        highlightActiveSection();
        scrollToActiveSection();
        // Remain in 'color' section to filter second color
        return;
      } else if (!secondColorSelected) {
        // Second color not selected yet, remain in 'color' section
        colorInput = ''; // Ensure color input is reset
        awaitingColorSelection = false;
        highlightActiveSection();
        scrollToActiveSection();
        return;
      } else {
        // Both colors selected, move to DOTW
        activeSection = 'dotw';
      }
    } else {
      // For other cases, move to DOTW
      activeSection = 'dotw';
    }
  } else if (activeSection === 'lid' || activeSection === 'first-lid' || activeSection === 'second-lid') {
    const pocket = document.querySelector(`#pocket-options-${activeCaseId} .selected`)?.innerText;
    if (pocket === 'AMPM' || pocket === '2-WEEK') {
      activeSection = 'dotw';
    } else {
      // For other cases, process is complete
      exitKeyboardMode();
    }
  } else if (activeSection === 'dotw') {
    // After DOTW, move to Custom Modifications
    activeSection = 'custom-modifications';
  } else if (activeSection === 'custom-modifications') {
    // After Custom Modifications, process is complete
    exitKeyboardMode();
  } else {
    exitKeyboardMode();
  }

  highlightActiveSection();
  scrollToActiveSection();
}

function filterColors(input) {
  input = input.toLowerCase();
  const colors = getColors();
  return colors.filter(color => color.name.toLowerCase().includes(input));
}

function getColors() {
  return [
    { name: 'Matte Black', code: '#000000' },
    { name: 'Aluminum', code: '#E0DFCB' },
    { name: 'Navy Blue', code: '#4883E8' },
    { name: 'Forest Green', code: '#899D7A' },
    { name: 'Designer Red', code: '#EB5047' },
    { name: 'Ikigai Orange', code: '#EB7114' },
    { name: 'Golden Rice', code: '#F8B40E' },
    { name: 'Emerald Green', code: '#34C87E' },
    { name: 'Bahama Blue', code: '#00D3E8' },
    { name: 'Purple Punch', code: '#CE55C4' },
    { name: 'Pink Panther', code: '#E967A6' },
    { name: 'Rose Gold', code: '#FFCAC4' },
    { name: 'Mellow Yellow', code: '#FFE331' },
    { name: 'Coffee', code: '#4B3621' },
    { name: 'Gunmetal', code: '#2A3439' },
    {
      name: 'Black + Blue Splatter',
      code: '#000000',
      isSplatter: true,
      splatterColors: ['#00D3E8'],
    },
    {
      name: 'Disco Splatter',
      code: '#CE55C4',
      isSplatter: true,
      splatterColors: ['#00D3E8'],
    },
    {
    name: 'Fire + Ice Splatter',
    code: '#EB5047', // Designer Red background
    isSplatter: true,
    splatterColors: ['#E0DFCB', '#4883E8'], // Aluminum and Navy Blue splatter colors
    },

  ];
}

function highlightMatchingColors() {
  const matches = filterColors(colorInput);
  const caseDiv = document.getElementById(activeCaseId);
  let colorOptionsDiv = null;

  const pocket = document.querySelector(`#pocket-options-${activeCaseId} .selected`)?.innerText;

  if (pocket === 'AMPM' || pocket === '2-WEEK') {
    const firstColorInput = document.querySelector(`input[name="first-color-${activeCaseId}"]:checked`);
    if (!firstColorInput) {
      // Selecting first color
      colorOptionsDiv = document.getElementById(`first-color-options-${activeCaseId}`);
    } else {
      // Selecting second color
      colorOptionsDiv = document.getElementById(`second-color-options-${activeCaseId}`);
    }
  } else {
    colorOptionsDiv = document.getElementById(`color-options-${activeCaseId}`);
  }

  const colorSwatches = colorOptionsDiv.querySelectorAll('.color-swatch');

  colorSwatches.forEach(swatch => {
    const colorName = swatch.querySelector('.color-name').innerText.toLowerCase();
    if (colorName.includes(colorInput.toLowerCase())) {
      swatch.classList.add('match');
      swatch.style.opacity = '1';
    } else {
      swatch.classList.remove('match');
      swatch.style.opacity = '0.3';
    }
  });

  // Remove previous 'first-match' class
  colorSwatches.forEach(swatch => swatch.classList.remove('first-match'));

  if (matches.length === 1) {
    // Only one match remains
    awaitingColorSelection = true;
    const firstMatch = colorOptionsDiv.querySelector('.color-swatch.match');
    if (firstMatch) {
      firstMatch.classList.add('first-match');
    }
    // Add 'single-match' class to color options div
    colorOptionsDiv.classList.add('single-match');
    highlightActiveSection();
  } else {
    awaitingColorSelection = false;
    // Remove 'single-match' class if more than one match
    colorOptionsDiv.classList.remove('single-match');
    highlightActiveSection();
  }
}

function selectColor(colorName) {
  const caseDiv = document.getElementById(activeCaseId);
  let colorOptionsDiv = null;
  let inputName = '';

  const pocket = document.querySelector(`#pocket-options-${activeCaseId} .selected`)?.innerText;

  if (pocket === 'AMPM' || pocket === '2-WEEK') {
    const firstColorInput = document.querySelector(`input[name="first-color-${activeCaseId}"]:checked`);
    if (!firstColorInput) {
      // Selecting first color
      colorOptionsDiv = document.getElementById(`first-color-options-${activeCaseId}`);
      inputName = `first-color-${activeCaseId}`;
    } else {
      // Selecting second color
      colorOptionsDiv = document.getElementById(`second-color-options-${activeCaseId}`);
      inputName = `second-color-${activeCaseId}`;
    }
  } else {
    colorOptionsDiv = document.getElementById(`color-options-${activeCaseId}`);
    inputName = `color-${activeCaseId}`;
  }

  const colorInputElement = colorOptionsDiv.querySelector(`input[value="${colorName}"]`);
  if (colorInputElement) {
    colorInputElement.checked = true;
    colorInputElement.dispatchEvent(new Event('change'));
    // Reset color input and highlights
    colorInput = '';
    resetColorSwatches();
  }
}

function addCase() {
  caseCounter++;
  const caseId = `case-${caseCounter}`;
  const caseDiv = document.createElement('div');
  caseDiv.id = caseId;

  caseDiv.innerHTML = `
    <h3></h3>

    <!-- Pocket Selection -->
    <div>
      <label><strong>Pocket:</strong></label>
      <div id="pocket-options-${caseId}" class="option-buttons"></div>
    </div>

    <!-- Size Selection -->
    <div>
      <label><strong>Size:</strong></label>
      <div id="size-options-${caseId}" class="option-buttons"></div>
    </div>

    <!-- Color Selection -->
    <div id="colors-${caseId}">
      <!-- Color swatches will be generated here -->
    </div>

    <!-- Engravings -->
    <div id="engravings-${caseId}" class="engravings">
      <!-- Engraving inputs will be generated here -->
    </div>
    
    <hr>
  `;
  
  const removeButton = document.createElement('button');
  removeButton.className = 'emoji-button remove-button';
  removeButton.innerText = '❌';
  removeButton.onclick = () => removeCase(caseId);
  caseDiv.insertBefore(removeButton, caseDiv.firstChild);

  // Generate buttons for Pocket options
  const pocketOptionsDiv = caseDiv.querySelector(`#pocket-options-${caseId}`);
  const pockets = ['NANO', 'MISSION', 'WEEKLY', 'AMPM', '2-WEEK'];
  pockets.forEach(pocket => {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerText = pocket;
    button.onclick = () => {
      // Remove 'selected' class from other buttons
      pocketOptionsDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
      updateCaseType(caseId);
    };
    pocketOptionsDiv.appendChild(button);
  });

  // Generate buttons for Size options
  const sizeOptionsDiv = caseDiv.querySelector(`#size-options-${caseId}`);
  const sizes = ['PILL', 'VITAMIN', 'VITAMIN XL'];
  sizes.forEach(size => {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerText = size;
    button.onclick = () => {
      sizeOptionsDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
    };
    sizeOptionsDiv.appendChild(button);
  });

  document.getElementById('case-list').appendChild(caseDiv);
  cases.push(caseId);

  updateCaseHeadings(); // Update headings after adding a case
}

function removeCase(caseId) {
  document.getElementById(caseId).remove();
  const index = cases.indexOf(caseId);
  if (index > -1) {
    cases.splice(index, 1);
  }

  updateCaseHeadings(); // Update headings after removing a case
}

function updateCaseHeadings() {
  cases.forEach((caseId, index) => {
    const caseDiv = document.getElementById(caseId);
    if (caseDiv) {
      const heading = caseDiv.querySelector('h3');
      if (heading) {
        heading.innerText = `Case ${index + 1}`;
      }
    }
  });
}

function updateCaseType(caseId) {
  const pocket = document.querySelector(`#pocket-options-${caseId} .selected`)?.innerText;
  const colorsDiv = document.getElementById(`colors-${caseId}`);
  const engravingsDiv = document.getElementById(`engravings-${caseId}`);

  // Clear previous inputs
  colorsDiv.innerHTML = '';
  engravingsDiv.innerHTML = '';

  if (!pocket) return; // Exit if no pocket selected

  if (pocket === 'AMPM' || pocket === '2-WEEK') {
    // Adjust labels based on the pocket type
    const firstLabel = pocket === 'AMPM' ? 'AM Color' : 'RIGHT & TOP Color';
    const secondLabel = pocket === 'AMPM' ? 'PM Color' : 'LEFT & BOTTOM Color';
    const firstLidLabel = pocket === 'AMPM' ? 'AM Left Lid Engraving' : 'RIGHT & TOP Lid Engraving';
    const secondLidLabel = pocket === 'AMPM' ? 'PM Right Lid Engraving' : 'LEFT & BOTTOM Lid Engraving';

    colorsDiv.innerHTML = `
      <label><strong>${firstLabel}:</strong></label>
      <div id="first-color-options-${caseId}" class="color-swatches"></div>
      <label><strong>${secondLabel}:</strong></label>
      <div id="second-color-options-${caseId}" class="color-swatches"></div>
    `;
    generateColorSwatches(`first-color-options-${caseId}`, `first-color-${caseId}`);
    generateColorSwatches(`second-color-options-${caseId}`, `second-color-${caseId}`);

    engravingsDiv.innerHTML = `
      <label>${firstLidLabel}:
        <input type="text" id="first-lid-${caseId}" placeholder="Optional">
      </label>
      <label>${secondLidLabel}:
        <input type="text" id="second-lid-${caseId}" placeholder="Optional">
      </label>
    `;
    engravingsDiv.innerHTML += generateDOTWSelection(caseId);
    setupDOTWSelection(caseId);

    // Add the event listener for the "Enter" key on the first lid input
    const firstLidInput = document.getElementById(`first-lid-${caseId}`);
    const secondLidInput = document.getElementById(`second-lid-${caseId}`);

    firstLidInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        secondLidInput.focus();
      }
    });
  } else {
    // Other cases: one color and optional engravings
    colorsDiv.innerHTML = `
      <label><strong>Color:</strong></label>
      <div id="color-options-${caseId}" class="color-swatches"></div>
    `;
    generateColorSwatches(`color-options-${caseId}`, `color-${caseId}`);

    let engravingsHTML = `
      <label>Lid Engraving:
        <input type="text" id="lid-${caseId}" placeholder="Optional">
      </label>
    `;
    if (pocket !== 'MISSION' && pocket !== 'NANO') {
      engravingsHTML += generateDOTWSelection(caseId);
    }
    engravingsDiv.innerHTML = engravingsHTML;
    setupDOTWSelection(caseId);
  }
}

function generateDOTWSelection(caseId) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'None'];
  let dotwHTML = `<label><strong>Start Day of the Week (DOTW):</strong></label>
  <div id="dotw-options-${caseId}" class="option-buttons dotw-buttons">`;
  days.forEach(day => {
    dotwHTML += `<button type="button" data-day="${day}">${day}</button>`;
  });
  dotwHTML += `</div>
  
  <div id="custom-modifications-div-${caseId}" class="custom-modifications">
    <label>Custom Modifications:
      <input type="text" id="custom-modifications-${caseId}" placeholder="Optional" list="custom-mod-options-${caseId}">
      <datalist id="custom-mod-options-${caseId}">
        <option value="No AM/PM on DOTW">
        <option value="No WEEK1/WEEK2 on DOTW">
        <option value="PM Left Side/AM Right Side">
        <option value="WEEK1 Bottom & Left/WEEK2 Top & Right">
        <option value="DOTW in different language = ">
      </datalist>
    </label>
  </div>
  `;
  return dotwHTML;
}

function setupDOTWSelection(caseId) {
  const dotwOptionsDiv = document.getElementById(`dotw-options-${caseId}`);
  if (dotwOptionsDiv) {
    const buttons = dotwOptionsDiv.querySelectorAll('button');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        buttons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');

        // After selecting DOTW, move to Custom Modifications
        activeSection = 'custom-modifications';
        highlightActiveSection();
        scrollToActiveSection();
      });

      // Select 'None' by default
      if (button.getAttribute('data-day') === 'None') {
        button.classList.add('selected');
      }
    });
  }
}

function generateColorSwatches(containerId, inputName) {
  const colors = getColors();

const container = document.getElementById(containerId);
  container.innerHTML = ''; // Clear any existing swatches

  colors.forEach(color => {
    const label = document.createElement('label');
    label.classList.add('color-swatch');

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = inputName;
    input.value = color.name;

    const swatch = document.createElement('span');
    swatch.classList.add('swatch');

    if (color.isSplatter) {
      swatch.style.backgroundColor = color.code;

      const totalLayers = 3; // Set the total number of layers for consistent density
      const splatterColors = [];

      // Repeat splatter colors to fill all layers
      for (let i = 0; i < totalLayers; i++) {
        const colorIndex = i % color.splatterColors.length;
        splatterColors.push(color.splatterColors[colorIndex]);
      }

      const splatterGradients = [];
      const backgroundPositions = [];
      const backgroundSizes = [];

      splatterColors.forEach((splatterColor, index) => {
        // Create the radial-gradient for this splatter color
        splatterGradients.push(`radial-gradient(${splatterColor} 15%, transparent 20%)`);

        // Calculate position offsets to distribute dots evenly
        const positionOffset = (index * 10) % 30;
        backgroundPositions.push(`${positionOffset}px ${positionOffset}px`);

        // Set consistent background size for all layers
        backgroundSizes.push('20px 20px');
      });

      // Join the arrays to create CSS strings
      swatch.style.backgroundImage = splatterGradients.join(', ');
      swatch.style.backgroundPosition = backgroundPositions.join(', ');
      swatch.style.backgroundSize = backgroundSizes.join(', ');
    } else {
      swatch.style.backgroundColor = color.code;
    }

    const colorName = document.createElement('span');
    colorName.classList.add('color-name');
    colorName.innerText = color.name;

    label.appendChild(input);
    label.appendChild(swatch);
    label.appendChild(colorName);

    // Handle selection styling and autofocus
    input.addEventListener('change', () => {
      const allSwatches = container.querySelectorAll('.color-swatch');
      allSwatches.forEach(swatch => swatch.classList.remove('selected'));
      label.classList.add('selected');

      // Determine which lid engraving input to focus based on the inputName
      let inputType, caseId;
      if (inputName.startsWith('first-color-')) {
        inputType = 'first';
        caseId = inputName.substring('first-color-'.length);
      } else if (inputName.startsWith('second-color-')) {
        inputType = 'second';
        caseId = inputName.substring('second-color-'.length);
      } else if (inputName.startsWith('color-')) {
        inputType = 'single';
        caseId = inputName.substring('color-'.length);
      }

      if (!caseId) return; // Safety check

      const pocket = document.querySelector(`#pocket-options-${caseId} .selected`)?.innerText;

      if (pocket === 'AMPM' || pocket === '2-WEEK') {
        const firstLidInput = document.getElementById(`first-lid-${caseId}`);
        const secondLidInput = document.getElementById(`second-lid-${caseId}`);

        const firstLidValue = firstLidInput.value.trim();
        const secondLidValue = secondLidInput.value.trim();

        const firstColorSelected = document.querySelector(`input[name="first-color-${caseId}"]:checked`);
        const secondColorSelected = document.querySelector(`input[name="second-color-${caseId}"]:checked`);

        if (inputType === 'second' && firstColorSelected && secondColorSelected && !firstLidValue && !secondLidValue) {
          // Workflow 1: Both colors selected, both lids empty, focus on first lid
          firstLidInput.focus();
        } else {
          // Focus on the corresponding lid engraving input
          if (inputType === 'first') {
            firstLidInput.focus();
          } else if (inputType === 'second') {
            secondLidInput.focus();
          }
        }
      } else {
        // For other cases, focus on the lid engraving input
        document.getElementById(`lid-${caseId}`)?.focus();
      }
    });

    container.appendChild(label);
  });
}

function generateAndCopyNotes() {
  let notes = '';
  let hasError = false;

  cases.forEach((caseId, index) => {
    const caseNumber = index + 1;

    const pocket = document.querySelector(`#pocket-options-${caseId} .selected`)?.innerText || '';
    const size = document.querySelector(`#size-options-${caseId} .selected`)?.innerText || '';

    if (!pocket || !size) {
      alert(`Please select both Pocket and Size for Case ${caseNumber}.`);
      hasError = true;
      return;
    }

    const isAMPM = pocket === 'AMPM';
    const isTwoWeek = pocket === '2-WEEK';

    if (isAMPM || isTwoWeek) {
      const firstColor = document.querySelector(`input[name="first-color-${caseId}"]:checked`)?.value;
      const secondColor = document.querySelector(`input[name="second-color-${caseId}"]:checked`)?.value;

      if (!firstColor || !secondColor) {
        alert(`Please select both colors for Case ${caseNumber}.`);
        hasError = true;
        return;
      }

      const firstLid = document.getElementById(`first-lid-${caseId}`)?.value.trim();
      const secondLid = document.getElementById(`second-lid-${caseId}`)?.value.trim();

      const customModifications = document.getElementById(`custom-modifications-${caseId}`)?.value.trim();

      const dotwSelectedButton = document.querySelector(`#dotw-options-${caseId} .selected`);
      const dotw = dotwSelectedButton ? dotwSelectedButton.getAttribute('data-day') : 'None';

      // Adjust labels based on the pocket type
      const firstNoteLabel = isAMPM ? 'AM LEFT LID' : 'RIGHT & TOP';
      const secondNoteLabel = isAMPM ? 'PM RIGHT LID' : 'LEFT & BOTTOM';

      // Capitalize colors
      const firstColorUpper = firstColor.toUpperCase();
      const secondColorUpper = secondColor.toUpperCase();

      // Generate notes for first part
      notes += `${caseNumber}) ${pocket} ${size} / ${firstNoteLabel} / ${firstColorUpper}`;
      if (firstLid) {
        notes += ` = LID = ${firstLid}`;
      }
      notes += `\n`;

      // Generate notes for second part
      notes += `${caseNumber}) ${pocket} ${size} / ${secondNoteLabel} / ${secondColorUpper}`;
      if (secondLid) {
        notes += ` = LID = ${secondLid}`;
      }
      notes += `\n`;

      // **Append DOTW with "Modified" and Custom Modifications**
      if (dotw && dotw !== 'None') {
        notes += `${caseNumber}) ${pocket} ${size} = DOTW = Modified *${dotw}*`;
        if (customModifications) {
          notes += ` (${customModifications})`;
        }
        notes += `\n`;
      }
    } else {
      const color = document.querySelector(`input[name="color-${caseId}"]:checked`)?.value;

      if (!color) {
        alert(`Please select a color for Case ${caseNumber}.`);
        hasError = true;
        return;
      }

      const lid = document.getElementById(`lid-${caseId}`)?.value.trim();
      const dotwSelectedButton = document.querySelector(`#dotw-options-${caseId} .selected`);
      const dotw = dotwSelectedButton ? dotwSelectedButton.getAttribute('data-day') : 'None';

      // Capitalize color
      const colorUpper = color.toUpperCase();

      // Base note without lid engraving
      notes += `${caseNumber}) ${pocket} ${size} / ${colorUpper}`;
      
      // Append lid engraving if provided
      if (lid) {
        notes += ` = LID = ${lid}`;
      }
      
      notes += `\n`;

      // **Append DOTW with "Modified" and Custom Modifications (if applicable)**
      if (dotw && dotw !== 'None') {
        const customModifications = document.getElementById(`custom-modifications-${caseId}`)?.value.trim();
        notes += `${caseNumber}) ${pocket} ${size} / ${colorUpper} = DOTW = Modified *${dotw}*`;
        if (customModifications) {
          notes += ` (${customModifications})`;
        }
        notes += `\n`;
      }
    }
  });

  if (!hasError) {
    if (notes === '') {
      notes = 'No notes to display.';
    }
    // Display the generated notes (optional)
    document.getElementById('notes-output').innerText = notes;

    // Copy the notes to clipboard without any alerts
    navigator.clipboard.writeText(notes).catch(err => {
      console.error('Failed to copy notes to clipboard:', err);
    });
  }
}

// --- Tab Switching Functionality ---
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        // Remove 'active' class from all buttons and hide all tab contents
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');

        // Add 'active' class to clicked button and show corresponding tab content
        button.classList.add('active');
        const tabContentId = button.getAttribute('data-tab');
        document.getElementById(tabContentId).style.display = 'block';
    });
});

// Set the initial active tab
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('engravings').style.display = 'block';
});

// --- SKU Lookup Functionality ---
// Load JSON data
const skuData = {
  "cases": {
    "single": [
      { "name": "Nano Pill Case", "keyword": "SPC-NPC", "pockets": "nano", "size": "pill" },
      { "name": "Nano Vitamin Case", "keyword": "SPC-NVC", "pockets": "nano", "size": "vitamin" },
      { "name": "Mission Pill Case", "keyword": "SPC-MPC", "pockets": "mission", "size": "pill" },
      { "name": "Mission Vitamin Case", "keyword": "SPC-MVC", "pockets": "mission", "size": "vitamin" },
      { "name": "Weekly Pill Case", "keyword": "SPC-WPC", "pockets": "weekly", "size": "pill" },
      { "name": "Weekly Vitamin Case", "keyword": "SPC-WVC", "pockets": "weekly", "size": "vitamin" },
      { "name": "Weekly Vitamin XL Case", "keyword": "SPC-WVXC", "pockets": "weekly", "size": "vitamin xl" },
      { "name": "Weekly AM-PM Pill Case", "keyword": "BPC-WAPPC2", "pockets": "ampm", "size": "pill" },
      { "name": "Weekly AM-PM Vitamin Case", "keyword": "BPC-WAC2", "pockets": "ampm", "size": "vitamin" },
      { "name": "AM - Left Side (Vitamin)", "keyword": "SPC-WVALS", "pockets": "ampm", "size": "vitamin", "note": "Can be used for 2-Week Vitamin" },
      { "name": "PM - Right Side (Vitamin)", "keyword": "SPC-WVPRS", "pockets": "ampm", "size": "vitamin", "note": "Can be used for 2-Week Vitamin" },
      { "name": "AM Pill - Left Side", "keyword": "SPC-WVAPLS", "pockets": "ampm", "size": "pill", "note": "Can be used for 2-Week Pill" },
      { "name": "PM Pill - Right Side", "keyword": "SPC-WVPPRS", "pockets": "ampm", "size": "pill", "note": "Can be used for 2-Week Pill" },
      { "name": "2-Week Pill Case", "keyword": "BPC-2WPC", "pockets": "2-week", "size": "pill" },
      { "name": "2-Week Vitamin Case", "keyword": "BPC-2WVC", "pockets": "2-week", "size": "vitamin" }
    ],
    "2_pack": [
      { "name": "Nano Pill Cases (2-Pack)", "keyword": "BPC-NPC2", "pockets": "nano", "size": "pill" },
      { "name": "Nano Vitamin Cases (2-Pack)", "keyword": "BPC-NVC2", "pockets": "nano", "size": "vitamin" },
      { "name": "Mission Pill Cases (2-Pack)", "keyword": "BPC-MPC2", "pockets": "mission", "size": "pill" },
      { "name": "Mission Vitamin Cases (2-Pack)", "keyword": "BPC-MVC2", "pockets": "mission", "size": "vitamin" },
      { "name": "Weekly Pill Cases (2-Pack)", "keyword": "BPC-WPC2", "pockets": "weekly", "size": "pill" },
      { "name": "Weekly Vitamin Cases (2-Pack)", "keyword": "BPC-WVC2", "pockets": "weekly", "size": "vitamin" },
      { "name": "Weekly Vitamin XL Cases (2-Pack)", "keyword": "BPC-WVXC2", "pockets": "weekly", "size": "vitamin xl" }
    ],
    "combo_pack": [
      {
        "name": "Mission Vitamin + Mission Pill Cases (Combo Pack)",
        "keyword": "BPC-MPMVCCP",
        "case1": { "pockets": "mission", "size": "vitamin" },
        "case2": { "pockets": "mission", "size": "pill" }
      },
      {
        "name": "Weekly Pill + Mission Pill Cases (Combo Pack)",
        "keyword": "BPC-WPMPCCP",
        "case1": { "pockets": "weekly", "size": "pill" },
        "case2": { "pockets": "mission", "size": "pill" }
      },
      {
        "name": "Weekly Pill + Mission Vitamin Cases (Combo Pack)",
        "keyword": "BPC-WPMVCCP",
        "case1": { "pockets": "weekly", "size": "pill" },
        "case2": { "pockets": "mission", "size": "vitamin" }
      },
      {
        "name": "Weekly Vitamin + Weekly Pill Case (Combo Pack)",
        "keyword": "BPC-WVWPCCP",
        "case1": { "pockets": "weekly", "size": "vitamin" },
        "case2": { "pockets": "weekly", "size": "pill" }
      },
      {
        "name": "Weekly Vitamin XL + Weekly Pill Cases (Combo Pack)",
        "keyword": "BPC-WVXWPCCP",
        "case1": { "pockets": "weekly", "size": "vitamin xl" },
        "case2": { "pockets": "weekly", "size": "pill" }
      },
      {
        "name": "Weekly Vitamin + Mission Pill Cases (Combo Pack)",
        "keyword": "BPC-WVMPCCP",
        "case1": { "pockets": "weekly", "size": "vitamin" },
        "case2": { "pockets": "mission", "size": "pill" }
      },
      {
        "name": "Weekly Vitamin + Mission Vitamin Cases (Combo Pack)",
        "keyword": "BPC-WVMVCCP",
        "case1": { "pockets": "weekly", "size": "vitamin" },
        "case2": { "pockets": "mission", "size": "vitamin" }
      },
      {
        "name": "Weekly Vitamin XL + Weekly Vitamin Cases (Combo Pack)",
        "keyword": "BPC-WVXWVCCP",
        "case1": { "pockets": "weekly", "size": "vitamin xl" },
        "case2": { "pockets": "weekly", "size": "vitamin" }
      },
      {
        "name": "Weekly Vitamin XL + Mission Pill Cases (Combo Pack)",
        "keyword": "BPC-WVXMPCCP",
        "case1": { "pockets": "weekly", "size": "vitamin xl" },
        "case2": { "pockets": "mission", "size": "pill" }
      },
      {
        "name": "Weekly Vitamin XL + Mission Vitamin Cases (Combo Pack)",
        "keyword": "BPC-WVXMVCCP",
        "case1": { "pockets": "weekly", "size": "vitamin xl" },
        "case2": { "pockets": "mission", "size": "vitamin" }
      }
    ],
    "others": [
      { "name": "CS - Lid Engraving", "keyword": "ENG-LID" },
      { "name": "CS - In Pockets Engraving - Days of the Week", "keyword": "ENG-DOTW" },
      { "name": "Body Replacement", "keyword": "REP-BOD" },
      { "name": "Lid Replacement", "keyword": "REP-LID" },
      { "name": "Ball Plunger Replacement", "keyword": "REP-BPL" }
    ]
  }
};

// Generate buttons for Case Types
function generateCaseTypeButtons() {
    const caseTypes = Object.keys(skuData.cases);
    const caseTypeOptionsDiv = document.getElementById('sku-case-type-options');
    caseTypeOptionsDiv.innerHTML = '';
    caseTypes.forEach(type => {
        const button = document.createElement('button');
        button.type = 'button';
        button.innerText = type.replace('_', ' ').toUpperCase();
        button.dataset.type = type;
        button.addEventListener('click', () => {
            // Remove 'selected' class from other buttons
            caseTypeOptionsDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            handleCaseTypeSelection(type);
        });
        caseTypeOptionsDiv.appendChild(button);
    });
}

// Call this function on page load
generateCaseTypeButtons();

function handleCaseTypeSelection(caseType) {
    const skuOptionsDiv = document.getElementById('sku-options');
    skuOptionsDiv.innerHTML = '';
    document.getElementById('sku-output').value = '';

    if (caseType === 'others') {
        generateCaseSelection(caseType);
    } else if (caseType === 'combo_pack') {
        generateComboPackSelection();
    } else {
        generatePocketSizeOptions(caseType);
    }
}

function generateCaseSelection(caseType) {
    const skuCases = skuData.cases[caseType];
    const skuOptionsDiv = document.getElementById('sku-options');

    const label = document.createElement('label');
    label.innerHTML = '<strong>Select Case:</strong>';
    const caseOptionsDiv = document.createElement('div');
    caseOptionsDiv.className = 'option-buttons';
    skuCases.forEach(c => {
        const button = document.createElement('button');
        button.type = 'button';
        button.innerText = c.name;
        button.dataset.keyword = c.keyword;
        button.addEventListener('click', () => {
            // Remove 'selected' class from other buttons
            caseOptionsDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            document.getElementById('sku-output').value = c.keyword;
        });
        caseOptionsDiv.appendChild(button);
    });
    skuOptionsDiv.appendChild(label);
    skuOptionsDiv.appendChild(caseOptionsDiv);
}

function generateComboPackSelection() {
    const skuOptionsDiv = document.getElementById('sku-options');
    skuOptionsDiv.innerHTML = '';

    // Valid pockets for combo packs (exclude 'nano', 'ampm', '2-week')
    const validPockets = ['mission', 'weekly'];

    ['case1', 'case2'].forEach((caseKey, index) => {
        const caseNumber = index + 1;
        const skuCases = skuData.cases['single'].filter(c => validPockets.includes(c.pockets));

        // Pocket Selection for Case X
        const pocketLabel = document.createElement('label');
        pocketLabel.innerHTML = `<strong>Case ${caseNumber} - Pocket:</strong>`;
        const pocketOptionsDiv = document.createElement('div');
        pocketOptionsDiv.className = 'option-buttons';
        pocketOptionsDiv.id = `combo-${caseKey}-pocket-options`;

        const pockets = [...new Set(skuCases.map(c => c.pockets))];

        pockets.forEach(pocket => {
            const button = document.createElement('button');
            button.type = 'button';
            button.innerText = pocket.toUpperCase();
            button.dataset.pocket = pocket;
            button.addEventListener('click', () => {
                pocketOptionsDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                handleComboPocketSelection(caseKey, pocket);

                if (caseKey === 'case1') {
                    updateCase2SizeOptions();
                }
            });
            pocketOptionsDiv.appendChild(button);
        });

        // Size Selection for Case X
        const sizeContainer = document.createElement('div');
        sizeContainer.id = `combo-${caseKey}-size-container`;

        const sizeLabel = document.createElement('label');
        sizeLabel.innerHTML = `<strong>Case ${caseNumber} - Size:</strong>`;

        const sizeOptionsDiv = document.createElement('div');
        sizeOptionsDiv.className = 'option-buttons';
        sizeOptionsDiv.id = `combo-${caseKey}-size-options`;

        sizeContainer.appendChild(sizeLabel);
        sizeContainer.appendChild(sizeOptionsDiv);

        skuOptionsDiv.appendChild(pocketLabel);
        skuOptionsDiv.appendChild(pocketOptionsDiv);
        skuOptionsDiv.appendChild(sizeContainer);
    });
}

function handleComboPocketSelection(caseKey, selectedPocket) {
    const skuCases = skuData.cases['single'];
    const sizeOptionsDiv = document.getElementById(`combo-${caseKey}-size-options`);
    sizeOptionsDiv.innerHTML = '';

    document.getElementById('sku-output').value = '';

    const availableCases = skuCases.filter(c => c.pockets === selectedPocket);
    const sizes = [...new Set(availableCases.map(c => c.size))];

    sizes.forEach(size => {
        const button = document.createElement('button');
        button.type = 'button';
        button.innerText = size.toUpperCase();
        button.dataset.size = size;
        button.addEventListener('click', () => {
            sizeOptionsDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');

            if (caseKey === 'case1') {
                updateCase2SizeOptions();
            } else {
                checkComboSKU();
            }
        });

        // Now, if this is Case 2, we may need to disable this size option if the combination matches Case 1
        if (caseKey === 'case2') {
            const case1Pocket = document.querySelector('#combo-case1-pocket-options .selected')?.dataset.pocket;
            const case1Size = document.querySelector('#combo-case1-size-options .selected')?.dataset.size;

            if (case1Pocket && case1Size) {
                if (selectedPocket === case1Pocket && size === case1Size) {
                    // Disable this size option
                    button.disabled = true;
                    button.classList.add('disabled');
                }
            }
        }

        sizeOptionsDiv.appendChild(button);
    });
}

function updateCase2SizeOptions() {
    const case2SelectedPocket = document.querySelector('#combo-case2-pocket-options .selected')?.dataset.pocket;
    if (case2SelectedPocket) {
        // Regenerate size options for Case 2
        handleComboPocketSelection('case2', case2SelectedPocket);
    }
}

function checkComboSKU() {
    const skuOutput = document.getElementById('sku-output');
    skuOutput.value = '';

    const case1Pocket = document.querySelector('#combo-case1-pocket-options .selected')?.dataset.pocket;
    const case1Size = document.querySelector('#combo-case1-size-options .selected')?.dataset.size;
    const case2Pocket = document.querySelector('#combo-case2-pocket-options .selected')?.dataset.pocket;
    const case2Size = document.querySelector('#combo-case2-size-options .selected')?.dataset.size;

    if (case1Pocket && case1Size && case2Pocket && case2Size) {
        if (case1Pocket === case2Pocket && case1Size === case2Size) {
            skuOutput.value = 'Cannot select identical cases.';
            return;
        }
        const comboPacks = skuData.cases['combo_pack'];
        const matchingCombo = comboPacks.find(combo => {
            const matchCase1 = combo.case1.pockets === case1Pocket && combo.case1.size === case1Size;
            const matchCase2 = combo.case2.pockets === case2Pocket && combo.case2.size === case2Size;
            const matchCase1Reverse = combo.case1.pockets === case2Pocket && combo.case1.size === case2Size;
            const matchCase2Reverse = combo.case2.pockets === case1Pocket && combo.case2.size === case1Size;
            return (matchCase1 && matchCase2) || (matchCase1Reverse && matchCase2Reverse);
        });

        if (matchingCombo) {
            skuOutput.value = matchingCombo.keyword;
        } else {
            skuOutput.value = 'No matching SKU found';
        }
    }
}

function generatePocketSizeOptions(caseType) {
    const skuCases = skuData.cases[caseType];
    const skuOptionsDiv = document.getElementById('sku-options');
    skuOptionsDiv.innerHTML = '';

    // Create Pocket Selection
    const pocketLabel = document.createElement('label');
    pocketLabel.innerHTML = '<strong>Pocket:</strong>';
    const pocketOptionsDiv = document.createElement('div');
    pocketOptionsDiv.className = 'option-buttons';

    const pockets = [...new Set(skuCases.map(c => c.pockets))];

    pockets.forEach(pocket => {
        const button = document.createElement('button');
        button.type = 'button';
        button.innerText = pocket.toUpperCase();
        button.dataset.pocket = pocket;
        button.addEventListener('click', () => {
            pocketOptionsDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            handlePocketSelection(caseType, pocket);
        });
        pocketOptionsDiv.appendChild(button);
    });

    skuOptionsDiv.appendChild(pocketLabel);
    skuOptionsDiv.appendChild(pocketOptionsDiv);
}

function handlePocketSelection(caseType, selectedPocket) {
    const skuCases = skuData.cases[caseType];
    const skuOptionsDiv = document.getElementById('sku-options');

    const existingSizeContainer = skuOptionsDiv.querySelector('#size-container');
    if (existingSizeContainer) {
        existingSizeContainer.remove();
    }
  
    const existingSidesContainer = skuOptionsDiv.querySelector('#sides-container');
    if (existingSidesContainer) {
        existingSidesContainer.remove();
    }

    document.getElementById('sku-output').value = '';

    const availableCases = skuCases.filter(c => c.pockets === selectedPocket);
    let sizes = [...new Set(availableCases.map(c => c.size))];

    const sizeContainer = document.createElement('div');
    sizeContainer.id = 'size-container';

    const sizeLabel = document.createElement('label');
    sizeLabel.innerHTML = '<strong>Size:</strong>';

    const sizeOptionsDiv = document.createElement('div');
    sizeOptionsDiv.className = 'option-buttons';

    sizes.forEach(size => {
        const button = document.createElement('button');
        button.type = 'button';
        button.innerText = size.toUpperCase();
        button.dataset.size = size;
        button.addEventListener('click', () => {
            sizeOptionsDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');

            if (selectedPocket === 'ampm' || selectedPocket === '2-week') {
                generateSidesOptions(skuOptionsDiv, selectedPocket, caseType);
            } else {
                // Remove sides options if they exist
                const existingSidesContainer = skuOptionsDiv.querySelector('#sides-container');
                if (existingSidesContainer) {
                    existingSidesContainer.remove();
                }
                updateSKU(caseType, selectedPocket, size);
            }
        });
        sizeOptionsDiv.appendChild(button);
    });

    sizeContainer.appendChild(sizeLabel);
    sizeContainer.appendChild(sizeOptionsDiv);

    skuOptionsDiv.appendChild(sizeContainer);
}

function generateSidesOptions(skuOptionsDiv, selectedPocket, caseType) {
    // Remove existing sides container if any
    const existingSidesContainer = skuOptionsDiv.querySelector('#sides-container');
    if (existingSidesContainer) {
        existingSidesContainer.remove();
    }

    const sidesContainer = document.createElement('div');
    sidesContainer.id = 'sides-container';

    const sidesLabel = document.createElement('label');
    sidesLabel.innerHTML = '<strong>Sides:</strong>';

    const sidesOptionsDiv = document.createElement('div');
    sidesOptionsDiv.className = 'option-buttons';

    const sides = ['Both', 'Left Side', 'Right Side'];

    sides.forEach(side => {
        const button = document.createElement('button');
        button.type = 'button';
        button.innerText = side;
        button.dataset.side = side.toLowerCase();
        button.addEventListener('click', () => {
            sidesOptionsDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');

            // After side selection, update SKU
            const selectedPocket = document.querySelector('#sku-options .option-buttons button.selected')?.dataset.pocket;
            const selectedSize = document.querySelector('#size-container .option-buttons button.selected')?.dataset.size;
            updateSKU(caseType, selectedPocket, selectedSize);
        });

        sidesOptionsDiv.appendChild(button);
    });

    // Default to 'Both' selected
    sidesOptionsDiv.querySelector('button[data-side="both"]').classList.add('selected');

    sidesContainer.appendChild(sidesLabel);
    sidesContainer.appendChild(sidesOptionsDiv);

    skuOptionsDiv.appendChild(sidesContainer);

    // After generating sides options, update SKU with default selection
    const selectedSize = document.querySelector('#size-container .option-buttons button.selected')?.dataset.size;
    updateSKU(caseType, selectedPocket, selectedSize);
}

function updateSKU(caseType, selectedPocket, selectedSize) {
    const skuCases = skuData.cases[caseType];

    let matchingCase;

    if (selectedPocket === 'ampm' || selectedPocket === '2-week') {
        const selectedSide = document.querySelector('#sides-container .option-buttons button.selected')?.dataset.side;

        if (!selectedSide) {
            document.getElementById('sku-output').value = '';
            return;
        }

        if (selectedSide === 'both') {
            // For 'Both', find the SKU where pockets is selectedPocket, size is selectedSize, and name does not include 'Left Side' or 'Right Side'
            matchingCase = skuCases.find(c =>
                c.pockets === selectedPocket &&
                c.size === selectedSize &&
                (!c.name.toLowerCase().includes('left side') && !c.name.toLowerCase().includes('right side'))
            );
        } else {
            // For 'Left Side' or 'Right Side', find the SKU where pockets is 'ampm', size is selectedSize, and name includes 'Left Side' or 'Right Side' accordingly
            // Also include SKUs with notes indicating they can be used for '2-Week' if selectedPocket is '2-week'
            matchingCase = skuCases.find(c =>
                c.pockets === 'ampm' && // For side SKUs, the pocket is 'ampm' in SKU data
                c.size === selectedSize &&
                c.name.toLowerCase().includes(selectedSide) &&
                (selectedPocket === 'ampm' || (c.note && c.note.includes('Can be used for 2-Week')))
            );
        }
    } else {
        // For other pockets
        matchingCase = skuCases.find(c => c.pockets === selectedPocket && c.size === selectedSize);
    }

    if (matchingCase) {
        document.getElementById('sku-output').value = matchingCase.keyword;
    } else {
        document.getElementById('sku-output').value = 'No matching SKU found';
    }
}

function checkComboSKU() {
    const skuOutput = document.getElementById('sku-output');
    skuOutput.value = '';

    const case1Pocket = document.querySelector('#combo-case1-pocket-options .selected')?.dataset.pocket;
    const case1Size = document.querySelector('#combo-case1-size-options .selected')?.dataset.size;
    const case2Pocket = document.querySelector('#combo-case2-pocket-options .selected')?.dataset.pocket;
    const case2Size = document.querySelector('#combo-case2-size-options .selected')?.dataset.size;

    if (case1Pocket && case1Size && case2Pocket && case2Size) {
        const comboPacks = skuData.cases['combo_pack'];
        const matchingCombo = comboPacks.find(combo => {
            const matchCase1 = combo.case1.pockets === case1Pocket && combo.case1.size === case1Size;
            const matchCase2 = combo.case2.pockets === case2Pocket && combo.case2.size === case2Size;
            const matchCase1Reverse = combo.case1.pockets === case2Pocket && combo.case1.size === case2Size;
            const matchCase2Reverse = combo.case2.pockets === case1Pocket && combo.case2.size === case1Size;
            return (matchCase1 && matchCase2) || (matchCase1Reverse && matchCase2Reverse);
        });

        if (matchingCombo) {
            skuOutput.value = matchingCombo.keyword;
        } else {
            skuOutput.value = 'No matching SKU found';
        }
    }
}

function copySKU() {
    const sku = document.getElementById('sku-output').value;
    if (sku && sku !== 'No matching SKU found') {
        navigator.clipboard.writeText(sku).then(() => {
        }).catch(err => {
            console.error('Could not copy SKU: ', err);
        });
    }
}
