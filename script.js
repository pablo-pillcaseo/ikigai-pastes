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
        // Both colors selected, move to first lid engraving
        activeSection = 'first-lid';
      }
    } else {
      // For other cases, move to lid engraving
      activeSection = 'lid';
    }
  } else if (activeSection === 'lid' || activeSection === 'first-lid') {
    const pocket = document.querySelector(`#pocket-options-${activeCaseId} .selected`)?.innerText;
    if (pocket === 'AMPM' || pocket === '2-WEEK') {
      activeSection = 'second-lid';
    } else {
      // For other cases, process is complete
      exitKeyboardMode();
    }
  } else if (activeSection === 'second-lid') {
    // For multi-lid cases, after second lid engraving
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
    {
      name: 'Black + Blue Splatter',
      code: '#000000',
      isSplatter: true,
      splatterColor: '#00D3E8',
    },
    {
      name: 'Disco Splatter',
      code: '#CE55C4',
      isSplatter: true,
      splatterColor: '#00D3E8',
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
  const sizes = ['PILL', 'VITAMIN', ' VITAMIN XL'];
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
  dotwHTML += `</div>`;
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
      });

      // Select 'None' by default
      if (button.getAttribute('data-day') === 'None') {
        button.classList.add('selected');
      }
    });
  }
}

function generateColorSwatches(containerId, inputName) {
  const colors = [
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
    {
      name: 'Black + Blue Splatter',
      code: '#000000',
      isSplatter: true,
      splatterColor: '#00D3E8',
    },
    {
      name: 'Disco Splatter',
      code: '#CE55C4',
      isSplatter: true,
      splatterColor: '#00D3E8',
    },
  ];

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
        swatch.style.backgroundImage = `radial-gradient(${color.splatterColor} 20%, transparent 20%), radial-gradient(${color.splatterColor} 20%, transparent 20%)`;
        swatch.style.backgroundPosition = '0 0, 10px 10px';
        swatch.style.backgroundSize = '20px 20px';
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

      // Append DOTW if not 'None' and if applicable
      if (dotw && dotw !== 'None') {
        notes += `${caseNumber}) ${pocket} ${size} = DOTW = *${dotw}*\n`;
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

      // Append DOTW if not 'None'
      if (dotw && dotw !== 'None') {
        notes += `${caseNumber}) ${pocket} ${size} / ${colorUpper} = DOTW = *${dotw}*\n`;
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
