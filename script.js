let caseCounter = 0;
const cases = [];

// --- Removed Keyboard Input Logic ---

// Add event listener for mouse click (if needed for other UI resets)
// (No keyboard input is handled)

// Create a new case
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

// Update the case UI based on the selected pocket
function updateCaseType(caseId) {
  const pocket = document.querySelector(`#pocket-options-${caseId} .selected`)?.innerText;
  const colorsDiv = document.getElementById(`colors-${caseId}`);
  const engravingsDiv = document.getElementById(`engravings-${caseId}`);

  // Clear previous inputs
  colorsDiv.innerHTML = '';
  engravingsDiv.innerHTML = '';

  if (!pocket) return; // Exit if no pocket selected

  if (pocket === 'AMPM' || pocket === '2-WEEK') {
    // For AMPM / 2-WEEK cases: two color selections and two lid engraving inputs
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
      ${generateDOTWSelection(caseId)}
    `;
    setupDOTWSelection(caseId);
  } else {
    // For other cases: one color selection and optional lid engraving input
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
    // For Mission cases, add custom pocket engraving options
    if (pocket === 'MISSION') {
      engravingsHTML += generateMissionEngravingsSelection(caseId);
    } else if (pocket !== 'NANO') {
      engravingsHTML += generateDOTWSelection(caseId);
    }
    engravingsDiv.innerHTML = engravingsHTML;
    if (pocket === 'MISSION') {
      setupMissionEngravingsSelection(caseId);
    } else if (pocket !== 'NANO') {
      setupDOTWSelection(caseId);
    }
  }
}

// Generate the DOTW (Days of the Week) selection (used for non–MISSION cases)
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
        <option value="AM/PM on (2-pack)">
        <option value="No WEEK1/WEEK2 on DOTW">
        <option value="WEEK1/WEEK2 for (2-pack)">
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
      });
      // Select 'None' by default
      if (button.getAttribute('data-day') === 'None') {
        button.classList.add('selected');
      }
    });
  }
}

// Generate Mission Engravings options for Mission cases
function generateMissionEngravingsSelection(caseId) {
  const options = ['AM-LUNCH-PM', 'FRI-SAT-SUN', 'AM-PM-EXTRA', 'BREAKFAST-LUNCH-DINNER'];
  let html = `<label><strong>Mission Engravings Options:</strong></label>
  <div id="mission-engraving-options-${caseId}" class="option-buttons mission-engraving-buttons">`;
  options.forEach(option => {
    html += `<button type="button" data-option="${option}">${option}</button>`;
  });
  html += `</div>`;
  return html;
}

function setupMissionEngravingsSelection(caseId) {
  const missionOptionsDiv = document.getElementById(`mission-engraving-options-${caseId}`);
  if (missionOptionsDiv) {
    const buttons = missionOptionsDiv.querySelectorAll('button');
    // Set "None" as default if available
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        buttons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
      });
      if (button.getAttribute('data-option') === 'None') {
        button.classList.add('selected');
      }
    });
  }
}

// Generate color swatches (shared by all cases)
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
      const totalLayers = 3;
      const splatterColors = [];
      for (let i = 0; i < totalLayers; i++) {
        const colorIndex = i % color.splatterColors.length;
        splatterColors.push(color.splatterColors[colorIndex]);
      }
      const splatterGradients = [];
      const backgroundPositions = [];
      const backgroundSizes = [];
      splatterColors.forEach((splatterColor, index) => {
        splatterGradients.push(`radial-gradient(${splatterColor} 15%, transparent 20%)`);
        const positionOffset = (index * 10) % 30;
        backgroundPositions.push(`${positionOffset}px ${positionOffset}px`);
        backgroundSizes.push('20px 20px');
      });
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

    input.addEventListener('change', () => {
      const allSwatches = container.querySelectorAll('.color-swatch');
      allSwatches.forEach(swatch => swatch.classList.remove('selected'));
      label.classList.add('selected');
      // Focus handling (if needed) can be added here
    });

    container.appendChild(label);
  });
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
    { name: 'Indigo', code: '#3631CC'},
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
      code: '#EB5047',
      isSplatter: true,
      splatterColors: ['#E0DFCB', '#4883E8'],
    },
  ];
}

// --- Generate and Copy Notes ---
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

      const firstNoteLabel = isAMPM ? 'AM LEFT LID' : 'RIGHT & TOP';
      const secondNoteLabel = isAMPM ? 'PM RIGHT LID' : 'LEFT & BOTTOM';

      notes += `${caseNumber}) ${pocket} ${size} / ${firstNoteLabel} / ${firstColor.toUpperCase()}`;
      if (firstLid) {
        notes += ` = LID = ${firstLid}`;
      }
      notes += `\n`;

      notes += `${caseNumber}) ${pocket} ${size} / ${secondNoteLabel} / ${secondColor.toUpperCase()}`;
      if (secondLid) {
        notes += ` = LID = ${secondLid}`;
      }
      notes += `\n`;

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
      const colorUpper = color.toUpperCase();

      notes += `${caseNumber}) ${pocket} ${size} / ${colorUpper}`;
      if (lid) {
        notes += ` = LID = ${lid}`;
      }
      notes += `\n`;

      // For Mission cases, output the selected Mission Engravings option.
      if (pocket === 'MISSION') {
        const missionOption = document.querySelector(`#mission-engraving-options-${caseId} .selected`)?.getAttribute('data-option');
        if (missionOption) {
          notes += `${caseNumber}) ${pocket} ${size} / ${colorUpper} = POCKETS = ${missionOption}\n`;
        }
      } else {
        const dotwSelectedButton = document.querySelector(`#dotw-options-${caseId} .selected`);
        const dotw = dotwSelectedButton ? dotwSelectedButton.getAttribute('data-day') : 'None';
        if (dotw && dotw !== 'None') {
          const customModifications = document.getElementById(`custom-modifications-${caseId}`)?.value.trim();
          notes += `${caseNumber}) ${pocket} ${size} / ${colorUpper} = DOTW = *${dotw}*`;
          if (customModifications) {
            notes += ` (${customModifications})`;
          }
          notes += `\n`;
        }
      }
    }
  });

  if (!hasError) {
    if (notes === '') {
      notes = 'No notes to display.';
    }
    document.getElementById('notes-output').innerText = notes;
    navigator.clipboard.writeText(notes).catch(err => {
      console.error('Failed to copy notes to clipboard:', err);
    });
  }
}

// --- Tab Switching Functionality ---
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
    button.classList.add('active');
    const tabContentId = button.getAttribute('data-tab');
    document.getElementById(tabContentId).style.display = 'block';
  });
});

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('engravings').style.display = 'block';
});

// --- SKU Lookup Functionality ---
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
    "3_pack": [
      { "name": "Triple Pack Case", "keyword": "BPC-3PCB", "pockets": "weekly", "size": "pill" }
    ],
    "monthly": [
      { "name": "Monthly Bundle Case", "keyword": "BPC-MPCB", "pockets": "weekly", "size": "vitamin" }
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
      caseTypeOptionsDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
      handleCaseTypeSelection(type);
    });
    caseTypeOptionsDiv.appendChild(button);
  });
}

generateCaseTypeButtons();

function handleCaseTypeSelection(caseType) {
  const skuOptionsDiv = document.getElementById('sku-options');
  skuOptionsDiv.innerHTML = '';
  document.getElementById('sku-output').value = '';

  if (caseType === 'others') {
    generateCaseSelection(caseType);
  } else if (caseType === 'combo_pack') {
    generateComboPackSelection();
  } else if (caseType === '3_pack') {
    generateThreePackSelection();
  } else if (caseType === 'monthly') {
    generateMonthlySelection();
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
  const validPockets = ['mission', 'weekly'];

  ['case1', 'case2'].forEach((caseKey, index) => {
    const caseNumber = index + 1;
    const skuCases = skuData.cases['single'].filter(c => validPockets.includes(c.pockets));

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
    if (caseKey === 'case2') {
      const case1Pocket = document.querySelector('#combo-case1-pocket-options .selected')?.dataset.pocket;
      const case1Size = document.querySelector('#combo-case1-size-options .selected')?.dataset.size;
      if (case1Pocket && case1Size && selectedPocket === case1Pocket && size === case1Size) {
        button.disabled = true;
        button.classList.add('disabled');
      }
    }
    sizeOptionsDiv.appendChild(button);
  });
}

function generateThreePackSelection() {
  const skuOutput = document.getElementById('sku-output');
  const skuCase = skuData.cases['3_pack'][0];
  skuOutput.value = skuCase.keyword;
}

function generateMonthlySelection() {
  const skuOutput = document.getElementById('sku-output');
  const skuCase = skuData.cases['monthly'][0];
  skuOutput.value = skuCase.keyword;
}

function updateCase2SizeOptions() {
  const case2SelectedPocket = document.querySelector('#combo-case2-pocket-options .selected')?.dataset.pocket;
  if (case2SelectedPocket) {
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
      const selectedPocket = document.querySelector('#sku-options .option-buttons button.selected')?.dataset.pocket;
      const selectedSize = document.querySelector('#size-container .option-buttons button.selected')?.dataset.size;
      updateSKU(caseType, selectedPocket, selectedSize);
    });
    sidesOptionsDiv.appendChild(button);
  });
  sidesOptionsDiv.querySelector('button[data-side="both"]').classList.add('selected');
  sidesContainer.appendChild(sidesLabel);
  sidesContainer.appendChild(sidesOptionsDiv);
  skuOptionsDiv.appendChild(sidesContainer);
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
      matchingCase = skuCases.find(c =>
        c.pockets === selectedPocket &&
        c.size === selectedSize &&
        (!c.name.toLowerCase().includes('left side') && !c.name.toLowerCase().includes('right side'))
      );
    } else {
      matchingCase = skuCases.find(c =>
        c.pockets === 'ampm' &&
        c.size === selectedSize &&
        c.name.toLowerCase().includes(selectedSide) &&
        (selectedPocket === 'ampm' || (c.note && c.note.includes('Can be used for 2-Week')))
      );
    }
  } else {
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
    navigator.clipboard.writeText(sku).catch(err => {
      console.error('Could not copy SKU: ', err);
    });
  }
}
