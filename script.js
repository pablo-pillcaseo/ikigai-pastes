// ============================================================
// VALIDATION HELPERS
// ============================================================

function flashValidation(element) {
  if (!element) return;
  element.classList.remove('validation-flash', 'validation-error');
  void element.offsetWidth;
  element.classList.add('validation-flash');
  element.addEventListener('animationend', () => {
    element.classList.remove('validation-flash');
  }, { once: true });
}

function addValidationError(element) {
  if (!element) return;
  element.classList.add('validation-error');
}

function clearValidationError(element) {
  if (!element) return;
  element.classList.remove('validation-error', 'validation-flash');
}

function clearCaseValidation(caseId) {
  const caseDiv = document.getElementById(caseId);
  if (!caseDiv) return;
  caseDiv.querySelectorAll('.validation-error, .validation-flash').forEach(el => {
    el.classList.remove('validation-error', 'validation-flash');
  });
} 

function watchForSelection(container) {
  if (!container || container._validationWatched) return;
  container._validationWatched = true;

  container.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('.color-swatch')) {
      clearValidationError(container);
    }
  });

  container.addEventListener('change', () => {
    clearValidationError(container);
  });
}

function checkSkippedFields(caseId) {
  const pocketDiv = document.getElementById(`pocket-options-${caseId}`);
  const sizeDiv = document.getElementById(`size-options-${caseId}`);
  const pocket = document.querySelector(`#pocket-options-${caseId} .selected`)?.innerText;
  const size = document.querySelector(`#size-options-${caseId} .selected`)?.innerText;

  const skipped = [];
  if (!pocket && pocketDiv) {
    flashValidation(pocketDiv);
    skipped.push(pocketDiv);
  }
  if (!size && sizeDiv) {
    flashValidation(sizeDiv);
    skipped.push(sizeDiv);
  }

  const countDiv = document.getElementById(`magnano-count-options-${caseId}`);
  if (pocket === 'MAGNANO' && size && countDiv && !magPocketCounts[caseId]) {
    flashValidation(countDiv);
    skipped.push(countDiv);
  }
  return skipped;
}

// ============================================================
// CASE MANAGEMENT
// ============================================================

let caseCounter = 0;
const cases = [];

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
    </div>

    <!-- Engravings -->
    <div id="engravings-${caseId}" class="engravings">
    </div>
    
    <hr>
  `;

  const removeButton = document.createElement('button');
  removeButton.className = 'emoji-button remove-button';
  removeButton.innerText = '❌';
  removeButton.onclick = () => removeCase(caseId);
  caseDiv.insertBefore(removeButton, caseDiv.firstChild);

  const pocketOptionsDiv = caseDiv.querySelector(`#pocket-options-${caseId}`);
  const pockets = ['NANO', 'MISSION', 'WEEKLY', 'AMPM', '2-WEEK', 'MAGNANO', 'MAG WEEKLY'];
  pockets.forEach(pocket => {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerText = pocket;
    button.onclick = () => {
      pocketOptionsDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
      clearValidationError(pocketOptionsDiv);
      updateSizeOptions(caseId, pocket);
      updateCaseType(caseId);
    };
    pocketOptionsDiv.appendChild(button);
  });

  document.getElementById('case-list').appendChild(caseDiv);
  cases.push(caseId);

  generateSizeButtons(caseId, ['XS', 'PILL', 'VITAMIN', 'VITAMIN XL', 'VITAMIN 2XL']);

  watchForSelection(pocketOptionsDiv);
  watchForSelection(caseDiv.querySelector(`#size-options-${caseId}`));

  updateCaseHeadings();
}

function generateSizeButtons(caseId, sizes) {
  const sizeOptionsDiv = document.getElementById(`size-options-${caseId}`);
  sizeOptionsDiv.innerHTML = '';
  sizes.forEach(size => {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerText = size;
    button.onclick = () => {
      sizeOptionsDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
      clearValidationError(sizeOptionsDiv);
      // MAGNANO pocket counts depend on size (PILL goes up to 5P, others 1P/2P)
      const pocket = document.querySelector(`#pocket-options-${caseId} .selected`)?.innerText;
      if (pocket === 'MAGNANO') {
        renderMagNanoCount(caseId);
      }
    };
    sizeOptionsDiv.appendChild(button);
  });
  watchForSelection(sizeOptionsDiv);
}

function updateSizeOptions(caseId, pocket) {
  if (pocket === 'MAGNANO' || pocket === 'MAG WEEKLY') {
    generateSizeButtons(caseId, ['PILL', 'VITAMIN', 'VITAMIN XL']);
  } else {
    generateSizeButtons(caseId, ['XS', 'PILL', 'VITAMIN', 'VITAMIN XL', 'VITAMIN 2XL']);
  }
}

function removeCase(caseId) {
  document.getElementById(caseId).remove();
  const index = cases.indexOf(caseId);
  if (index > -1) {
    cases.splice(index, 1);
  }
  delete magEntries[caseId];
  delete magEntryCounters[caseId];
  delete magModes[caseId];
  delete magPocketCounts[caseId];
  delete magWeeklyCounts[caseId];
  updateCaseHeadings();
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

  colorsDiv.innerHTML = '';
  engravingsDiv.innerHTML = '';

  if (!pocket) return;

  if (pocket === 'MAGNANO') {
    colorsDiv.innerHTML = `
      <div id="magnano-count-${caseId}" class="magnano-count" style="display:none;">
        <label><strong>Pockets:</strong></label>
        <div id="magnano-count-options-${caseId}" class="option-buttons"></div>
      </div>
    `;
    engravingsDiv.innerHTML = `
      <div class="mag-mode-toggle">
        <label><strong>Mode:</strong></label>
        <div class="option-buttons mag-mode-buttons">
          <button type="button" data-mode="single" onclick="setMagMode('${caseId}', 'single')">Single</button>
          <button type="button" data-mode="set" class="selected" onclick="setMagMode('${caseId}', 'set')">Set</button>
        </div>
      </div>
      <div class="mag-set" id="mag-set-${caseId}"></div>
      <button class="emoji-button mag-add-button" id="mag-add-btn-${caseId}" onclick="addMagEntry('${caseId}')" title="Add Mag Entry">➕</button>
    `;
    initMagSet(caseId, 7);
    renderMagNanoCount(caseId);

  } else if (pocket === 'MAG WEEKLY') {
    colorsDiv.innerHTML = `
      <label><strong>Case Count:</strong></label>
      <div id="mw-count-options-${caseId}" class="option-buttons"></div>
      <div id="mw-colors-${caseId}"></div>
    `;
    engravingsDiv.innerHTML = `
      <div id="mw-lids-${caseId}"></div>
      <div id="mw-pocket-${caseId}"></div>
      ${generateDOTWSelection(caseId)}
    `;
    setupDOTWSelection(caseId);
    generateMagWeeklyCountButtons(caseId);
    setMagWeeklyCount(caseId, magWeeklyCounts[caseId] || 1);

  } else if (pocket === 'AMPM' || pocket === '2-WEEK') {
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

    watchForSelection(document.getElementById(`first-color-options-${caseId}`));
    watchForSelection(document.getElementById(`second-color-options-${caseId}`));

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
    colorsDiv.innerHTML = `
      <label><strong>Color:</strong></label>
      <div id="color-options-${caseId}" class="color-swatches"></div>
    `;
    generateColorSwatches(`color-options-${caseId}`, `color-${caseId}`);
    watchForSelection(document.getElementById(`color-options-${caseId}`));

    let engravingsHTML = `
      <label>Lid Engraving:
        <input type="text" id="lid-${caseId}" placeholder="Optional">
      </label>
    `;
    if (pocket === 'MISSION') {
      engravingsHTML += generateMissionEngravingsSelection(caseId);
    } else if (pocket === 'NANO') {
      engravingsHTML += generateNanoPocketEngravingsSelection(caseId);
    } else {
      engravingsHTML += generateDOTWSelection(caseId);
    }
    engravingsDiv.innerHTML = engravingsHTML;
    if (pocket === 'MISSION') {
      setupMissionEngravingsSelection(caseId);
    } else if (pocket === 'NANO') {
      setupNanoPocketEngravingsSelection(caseId);
    } else {
      setupDOTWSelection(caseId);
    }
  }
}

// ============================================================
// MAG DYNAMIC ENTRY MANAGEMENT
// ============================================================

const magEntries = {};
const magEntryCounters = {};
const magModes = {};
const magPocketCounts = {};

// PILL bodies go up to five pockets; the larger sizes are 1P or 2P only.
function magNanoCountOptions(size) {
  return size === 'PILL' ? ['1P', '2P', '3P', '4P', '5P'] : ['1P', '2P'];
}

function isMagNanoTwoPocket(caseId) {
  return magPocketCounts[caseId] === '2P';
}

function renderMagNanoCount(caseId) {
  const wrapper = document.getElementById(`magnano-count-${caseId}`);
  const container = document.getElementById(`magnano-count-options-${caseId}`);
  if (!wrapper || !container) return;

  const size = document.querySelector(`#size-options-${caseId} .selected`)?.innerText;
  container.innerHTML = '';

  if (!size) {
    wrapper.style.display = 'none';
    magPocketCounts[caseId] = null;
    refreshMagPocketModifier(caseId);
    return;
  }

  wrapper.style.display = '';
  const options = magNanoCountOptions(size);
  // A count carried over from a bigger size (e.g. 4P then switch to VITAMIN) no longer applies.
  if (!options.includes(magPocketCounts[caseId])) magPocketCounts[caseId] = null;

  options.forEach(option => {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerText = option;
    button.dataset.count = option;
    if (option === magPocketCounts[caseId]) button.classList.add('selected');
    button.onclick = () => {
      container.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
      magPocketCounts[caseId] = option;
      clearValidationError(container);
      refreshMagPocketModifier(caseId);
    };
    container.appendChild(button);
  });

  watchForSelection(container);
  refreshMagPocketModifier(caseId);
}

function initMagSet(caseId, count) {
  magEntries[caseId] = [];
  magEntryCounters[caseId] = 0;
  magModes[caseId] = count === 1 ? 'single' : 'set';
  for (let i = 0; i < count; i++) {
    addMagEntry(caseId);
  }
}

function setMagMode(caseId, mode) {
  magModes[caseId] = mode;
  const modeButtons = document.querySelectorAll(`#engravings-${caseId} .mag-mode-buttons button`);
  modeButtons.forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.mode === mode);
  });

  const magSetDiv = document.getElementById(`mag-set-${caseId}`);
  const addBtn = document.getElementById(`mag-add-btn-${caseId}`);

  if (mode === 'single') {
    magSetDiv.innerHTML = '';
    magEntries[caseId] = [];
    magEntryCounters[caseId] = 0;
    addMagEntry(caseId);
    addBtn.style.display = 'none';
  } else {
    magSetDiv.innerHTML = '';
    magEntries[caseId] = [];
    magEntryCounters[caseId] = 0;
    for (let i = 0; i < 7; i++) {
      addMagEntry(caseId);
    }
    addBtn.style.display = '';
  }
}

function refreshMagPocketModifier(caseId) {
  const entries = magEntries[caseId] || [];
  entries.forEach(entryId => {
    renderMagPocketModifier(caseId, entryId);
    updateMagSummary(caseId, entryId);
  });
}

function addMagEntry(caseId) {
  magEntryCounters[caseId] = (magEntryCounters[caseId] || 0) + 1;
  const entryId = magEntryCounters[caseId];
  if (!magEntries[caseId]) magEntries[caseId] = [];
  magEntries[caseId].push(entryId);

  const magSetDiv = document.getElementById(`mag-set-${caseId}`);
  const entryDiv = document.createElement('div');
  entryDiv.className = 'mag-entry';
  entryDiv.id = `mag-entry-${caseId}-${entryId}`;
  entryDiv.innerHTML = `
    <div class="mag-entry-header">
      <h4 class="mag-entry-title"></h4>
      <span class="mag-summary" id="mag-summary-${caseId}-${entryId}"></span>
      <span class="mag-toggle" id="mag-toggle-${caseId}-${entryId}">▼</span>
      <button class="mag-remove-btn" title="Remove this entry" onclick="event.stopPropagation(); removeMagEntry('${caseId}', ${entryId})">✕</button>
    </div>
    <div class="mag-entry-body" id="mag-body-${caseId}-${entryId}">
      <label><strong>Color:</strong></label>
      <div id="mag-color-options-${caseId}-${entryId}" class="color-swatches"></div>

      <label><strong>Lid Engraving:</strong></label>
      <div id="mag-lid-options-${caseId}-${entryId}" class="option-buttons mag-day-buttons"></div>
      <input type="text" id="mag-lid-custom-${caseId}-${entryId}" class="mag-custom-input" placeholder="Custom lid text" style="display:none;">

      <label><strong>Pocket Engraving:</strong></label>
      <div class="mag-pocket-engraving-row">
        <div id="mag-pocket-modifier-${caseId}-${entryId}" class="mag-pocket-modifier"></div>
        <div id="mag-pocket-options-${caseId}-${entryId}" class="option-buttons mag-day-buttons"></div>
      </div>
      <input type="text" id="mag-pocket-custom-${caseId}-${entryId}" class="mag-custom-input" placeholder="Custom pocket text" style="display:none;">
    </div>
  `;
  magSetDiv.appendChild(entryDiv);

  const header = entryDiv.querySelector('.mag-entry-header');
  header.addEventListener('click', (e) => {
    if (e.target.closest('.mag-remove-btn')) return;
    toggleMagEntry(caseId, entryId);
  });

  generateColorSwatches(`mag-color-options-${caseId}-${entryId}`, `mag-color-${caseId}-${entryId}`);
  generateMagEngravingOptions(`mag-lid-options-${caseId}-${entryId}`, caseId, entryId, 'lid');
  generateMagEngravingOptions(`mag-pocket-options-${caseId}-${entryId}`, caseId, entryId, 'pocket');
  
  renderMagPocketModifier(caseId, entryId);

  watchForSelection(document.getElementById(`mag-color-options-${caseId}-${entryId}`));

  updateMagHeadings(caseId);
}

function removeMagEntry(caseId, entryId) {
  const entries = magEntries[caseId];
  if (!entries || entries.length <= 1) return;
  const idx = entries.indexOf(entryId);
  if (idx > -1) entries.splice(idx, 1);
  const el = document.getElementById(`mag-entry-${caseId}-${entryId}`);
  if (el) el.remove();
  updateMagHeadings(caseId);
}

function updateMagHeadings(caseId) {
  const entries = magEntries[caseId] || [];
  const total = entries.length;
  const isSingle = magModes[caseId] === 'single';
  entries.forEach((entryId, idx) => {
    const title = document.querySelector(`#mag-entry-${caseId}-${entryId} .mag-entry-title`);
    if (title) {
      title.textContent = isSingle ? 'Mag (Single)' : `Mag ${idx + 1} of ${total}`;
    }
    const removeBtn = document.querySelector(`#mag-entry-${caseId}-${entryId} .mag-remove-btn`);
    if (removeBtn) {
      removeBtn.style.display = (total <= 1 || isSingle) ? 'none' : '';
    }
  });
}

function toggleMagEntry(caseId, entryId) {
  const body = document.getElementById(`mag-body-${caseId}-${entryId}`);
  const toggle = document.getElementById(`mag-toggle-${caseId}-${entryId}`);
  if (body.classList.contains('collapsed')) {
    body.classList.remove('collapsed');
    toggle.classList.remove('collapsed');
  } else {
    body.classList.add('collapsed');
    toggle.classList.add('collapsed');
  }
}

function renderMagPocketModifier(caseId, entryId) {
  const modifierDiv = document.getElementById(`mag-pocket-modifier-${caseId}-${entryId}`);
  if (!modifierDiv) return;
  modifierDiv.innerHTML = '';

  // AM/PM is not a case type: it is an optional pocket engraving on a 2P MAGNANO.
  if (!isMagNanoTwoPocket(caseId)) return;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'mag-ampm-toggle';
  toggle.id = `mag-pocket-ampm-toggle-${caseId}-${entryId}`;
  toggle.textContent = 'AM/PM';
  toggle.title = 'Prefix pocket engraving with AM/PM (combines with day if selected)';

  toggle.addEventListener('click', () => {
    const wasOff = !toggle.classList.contains('selected');
    toggle.classList.toggle('selected');

    const entries = magEntries[caseId] || [];
    // Propagate to remaining entries when first-entry toggles on and no others are toggled yet
    if (wasOff && entries.length > 1 && entries[0] === entryId && !magSeriesHasAmPmToggle(caseId)) {
      entries.slice(1).forEach(eid => {
        const t = document.getElementById(`mag-pocket-ampm-toggle-${caseId}-${eid}`);
        if (t) t.classList.add('selected');
        updateMagSummary(caseId, eid);
      });
    }
    updateMagSummary(caseId, entryId);
  });

  modifierDiv.appendChild(toggle);
}

function magSeriesHasAmPmToggle(caseId) {
  const entries = magEntries[caseId] || [];
  for (let i = 1; i < entries.length; i++) {
    const t = document.getElementById(`mag-pocket-ampm-toggle-${caseId}-${entries[i]}`);
    if (t && t.classList.contains('selected')) return true;
  }
  return false;
}

function isMagAmPmActive(caseId, entryId) {
  return document.getElementById(`mag-pocket-ampm-toggle-${caseId}-${entryId}`)?.classList.contains('selected') || false;
}

function generateMagEngravingOptions(containerId, caseId, entryId, type) {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const options = [...days, 'Custom', 'None'];

  const container = document.getElementById(containerId);
  container.innerHTML = '';

  options.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerText = option;
    button.dataset.option = option;

    button.addEventListener('click', () => {
      container.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');

      const customInput = document.getElementById(`mag-${type}-custom-${caseId}-${entryId}`);
      customInput.style.display = button.dataset.option === 'Custom' ? 'block' : 'none';

      const magDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const entries = magEntries[caseId] || [];
      if (entries.length > 1 && entries[0] === entryId && magDays.includes(button.dataset.option)) {
        if (!magSeriesHasSelections(caseId, type)) {
          autoFillMagDays(caseId, type, button.dataset.option);
        }
      }

      checkSkippedFields(caseId);
      updateMagSummary(caseId, entryId);
    });

    if (option === 'None') button.classList.add('selected');
    container.appendChild(button);
  });
}

function magSeriesHasSelections(caseId, type) {
  const entries = magEntries[caseId] || [];
  for (let i = 1; i < entries.length; i++) {
    const selected = document.querySelector(`#mag-${type}-options-${caseId}-${entries[i]} .selected`);
    if (selected && selected.dataset.option !== 'None') return true;
  }
  return false;
}

function magColorsHaveSelections(caseId) {
  const entries = magEntries[caseId] || [];
  for (let i = 1; i < entries.length; i++) {
    if (document.querySelector(`input[name="mag-color-${caseId}-${entries[i]}"]:checked`)) return true;
  }
  return false;
}

function autoFillMagColor(caseId, colorName) {
  const entries = magEntries[caseId] || [];
  for (let i = 1; i < entries.length; i++) {
    const eid = entries[i];
    const container = document.getElementById(`mag-color-options-${caseId}-${eid}`);
    if (!container) continue;
    const radio = container.querySelector(`input[value="${colorName}"]`);
    if (radio) {
      radio.checked = true;
      container.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      radio.closest('.color-swatch').classList.add('selected');
    }
    updateMagSummary(caseId, eid);
  }
}

function autoFillMagDays(caseId, type, startDay) {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const startIndex = days.indexOf(startDay);
  const entries = magEntries[caseId] || [];
  const propagateAmPm = type === 'pocket' && isMagAmPmActive(caseId, entries[0]);

  for (let i = 1; i < entries.length; i++) {
    const eid = entries[i];
    const dayIndex = (startIndex + i) % 7;
    const targetDay = days[dayIndex];
    const container = document.getElementById(`mag-${type}-options-${caseId}-${eid}`);
    if (!container) continue;

    container.querySelectorAll('button').forEach(btn => {
      btn.classList.remove('selected');
      if (btn.dataset.option === targetDay) btn.classList.add('selected');
    });

    const customInput = document.getElementById(`mag-${type}-custom-${caseId}-${eid}`);
    if (customInput) customInput.style.display = 'none';
    
    if (propagateAmPm) {
      const t = document.getElementById(`mag-pocket-ampm-toggle-${caseId}-${eid}`);
      if (t) t.classList.add('selected');
    }


    updateMagSummary(caseId, eid);
  }
}

function updateMagSummary(caseId, entryId) {
  const summarySpan = document.getElementById(`mag-summary-${caseId}-${entryId}`);
  if (!summarySpan) return;

  const color = document.querySelector(`input[name="mag-color-${caseId}-${entryId}"]:checked`)?.value || '';
  const lidOption = document.querySelector(`#mag-lid-options-${caseId}-${entryId} .selected`)?.dataset.option || 'None';
  const pocketOption = document.querySelector(`#mag-pocket-options-${caseId}-${entryId} .selected`)?.dataset.option || 'None';

  let lidText = lidOption;
  if (lidOption === 'Custom') {
    lidText = document.getElementById(`mag-lid-custom-${caseId}-${entryId}`)?.value.trim() || 'Custom';
  }
  let pocketText = pocketOption;
  if (pocketOption === 'Custom') {
    pocketText = document.getElementById(`mag-pocket-custom-${caseId}-${entryId}`)?.value.trim() || 'Custom';
  }
  if (isMagAmPmActive(caseId, entryId) && pocketOption !== 'None') {
    pocketText = `AM/PM ${pocketText}`;
  } else if (isMagAmPmActive(caseId, entryId) && pocketOption === 'None') {
    pocketText = 'AM/PM';
  }

  const parts = [];
  if (color) parts.push(color);
  if (lidText && lidText !== 'None') parts.push(`Lid: ${lidText}`);
  if (pocketText && pocketText !== 'None') parts.push(`Pkt: ${pocketText}`);

  summarySpan.textContent = parts.join(' · ');
}

// ============================================================
// MAG WEEKLY (MAGNETIC WEEKLY CASES)
// ============================================================

const magWeeklyCounts = {};

const MAG_WEEKLY_PIECES = {
  1: ['Middle'],
  2: ['Left', 'Right'],
  3: ['Left', 'Middle', 'Right'],
  4: ['Left', 'Middle 1', 'Middle 2', 'Right']
};

const MAG_WEEKLY_POCKET_OPTIONS = {
  1: {
    daily: ['AM', 'PM', 'Noon', 'Eve'],
    weekly: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
  },
  2: {
    daily: ['AM + PM'],
    weekly: ['Week 1 + Week 2']
  },
  3: {
    daily: ['Morn + Noon + Night'],
    weekly: ['Week 1 + Week 2 + Week 3']
  },
  4: {
    daily: ['Morn + Noon + Eve + Bed'],
    weekly: ['Week 1 + Week 2 + Week 3 + Week 4']
  }
};

function magWeeklyPieces(caseId) {
  return MAG_WEEKLY_PIECES[magWeeklyCounts[caseId] || 1];
}

function generateMagWeeklyCountButtons(caseId) {
  const countDiv = document.getElementById(`mw-count-options-${caseId}`);
  if (!countDiv) return;
  countDiv.innerHTML = '';

  [1, 2, 3, 4].forEach(count => {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerText = String(count);
    button.dataset.count = count;
    button.onclick = () => setMagWeeklyCount(caseId, count);
    countDiv.appendChild(button);
  });
}

function setMagWeeklyCount(caseId, count) {
  const previousCount = magWeeklyCounts[caseId] || 0;

  // Preserve what the user already picked so changing the count is not destructive
  const keptColors = [];
  const keptLids = [];
  for (let i = 0; i < previousCount; i++) {
    keptColors.push(document.querySelector(`input[name="mw-color-${caseId}-${i}"]:checked`)?.value || '');
    keptLids.push(document.getElementById(`mw-lid-${caseId}-${i}`)?.value || '');
  }

  magWeeklyCounts[caseId] = count;

  document.querySelectorAll(`#mw-count-options-${caseId} button`).forEach(btn => {
    btn.classList.toggle('selected', Number(btn.dataset.count) === count);
  });

  renderMagWeeklyColors(caseId);
  renderMagWeeklyLids(caseId);
  renderMagWeeklyPocketEngraving(caseId);

  for (let i = 0; i < count; i++) {
    if (keptColors[i]) selectMagWeeklyColor(caseId, i, keptColors[i]);
    const lidInput = document.getElementById(`mw-lid-${caseId}-${i}`);
    if (lidInput && keptLids[i]) lidInput.value = keptLids[i];
  }
}

function renderMagWeeklyColors(caseId) {
  const colorsDiv = document.getElementById(`mw-colors-${caseId}`);
  if (!colorsDiv) return;
  const pieces = magWeeklyPieces(caseId);

  colorsDiv.innerHTML = pieces.map((piece, i) => `
    <label><strong>${pieces.length === 1 ? 'Color' : `${piece} Color`}:</strong></label>
    <div id="mw-color-options-${caseId}-${i}" class="color-swatches"></div>
  `).join('');

  pieces.forEach((piece, i) => {
    const containerId = `mw-color-options-${caseId}-${i}`;
    generateColorSwatches(containerId, `mw-color-${caseId}-${i}`);

    const container = document.getElementById(containerId);
    watchForSelection(container);

    // First piece auto-fills the rest, but only while none of them are set yet
    container.addEventListener('change', (e) => {
      checkSkippedFields(caseId);
      if (i === 0 && pieces.length > 1 && !magWeeklyColorsHaveSelections(caseId)) {
        autoFillMagWeeklyColor(caseId, e.target.value);
      }
    });
  });
}

function magWeeklyColorsHaveSelections(caseId) {
  const pieces = magWeeklyPieces(caseId);
  for (let i = 1; i < pieces.length; i++) {
    if (document.querySelector(`input[name="mw-color-${caseId}-${i}"]:checked`)) return true;
  }
  return false;
}

function selectMagWeeklyColor(caseId, index, colorName) {
  const container = document.getElementById(`mw-color-options-${caseId}-${index}`);
  if (!container) return;
  const radio = container.querySelector(`input[value="${colorName}"]`);
  if (!radio) return;
  radio.checked = true;
  container.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
  radio.closest('.color-swatch').classList.add('selected');
  clearValidationError(container);
}

function autoFillMagWeeklyColor(caseId, colorName) {
  const pieces = magWeeklyPieces(caseId);
  for (let i = 1; i < pieces.length; i++) {
    selectMagWeeklyColor(caseId, i, colorName);
  }
}

function renderMagWeeklyLids(caseId) {
  const lidsDiv = document.getElementById(`mw-lids-${caseId}`);
  if (!lidsDiv) return;
  const pieces = magWeeklyPieces(caseId);

  lidsDiv.innerHTML = pieces.map((piece, i) => `
    <label>${piece} Lid Engraving:
      <input type="text" id="mw-lid-${caseId}-${i}" placeholder="Optional">
    </label>
  `).join('');
}

function renderMagWeeklyPocketEngraving(caseId) {
  const pocketDiv = document.getElementById(`mw-pocket-${caseId}`);
  if (!pocketDiv) return;
  const options = MAG_WEEKLY_POCKET_OPTIONS[magWeeklyCounts[caseId] || 1];

  const row = (label, id, values, extra = '') => `
    <label>${label}:</label>
    <div id="${id}" class="option-buttons mag-day-buttons">
      ${values.map(v => `<button type="button" data-option="${v}">${v}</button>`).join('')}
      ${extra}
    </div>
  `;

  pocketDiv.innerHTML = `
    <label><strong>Pocket Engraving:</strong></label>
    ${row('Daily', `mw-pocket-daily-${caseId}`, options.daily,
      `<button type="button" data-option="None" class="selected">None</button>`)}
    ${row('Weekly', `mw-pocket-weekly-${caseId}`, options.weekly)}
    <label>Custom:</label>
    <input type="text" id="mw-pocket-custom-${caseId}" class="mag-custom-input"
           style="width: 360px; max-width: 100%;"
           placeholder="Type here, e.g. Breakfast + Lunch + Dinner">
  `;

  const customInput = document.getElementById(`mw-pocket-custom-${caseId}`);

  // A preset and custom text are mutually exclusive: picking a preset drops the text
  pocketDiv.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      pocketDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
      customInput.value = '';
      checkSkippedFields(caseId);
    });
  });

  // Typing is what selects custom; clearing the box falls back to None
  customInput.addEventListener('input', () => {
    const hasText = customInput.value.trim() !== '';
    pocketDiv.querySelectorAll('button').forEach(btn => {
      btn.classList.toggle('selected', !hasText && btn.dataset.option === 'None');
    });
  });
}

function magWeeklyPocketTokens(caseId) {
  const custom = document.getElementById(`mw-pocket-custom-${caseId}`)?.value.trim() || '';
  const selected = document.querySelector(`#mw-pocket-${caseId} .selected`)?.dataset.option;

  // Custom text wins; typing already cleared any preset selection
  const raw = custom || (selected && selected !== 'None' ? selected : '');
  if (!raw) return [];

  const tokens = raw.split('+').map(token => token.trim()).filter(Boolean);

  // A single value with no "+" goes on every piece
  const pieceCount = magWeeklyPieces(caseId).length;
  if (tokens.length === 1 && pieceCount > 1) return Array(pieceCount).fill(tokens[0]);

  return tokens;
}

// ============================================================
// DOTW SELECTION
// ============================================================

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
        checkSkippedFields(caseId);
      });
      if (button.getAttribute('data-day') === 'None') {
        button.classList.add('selected');
      }
    });
  }
}

// ============================================================
// NANO POCKET ENGRAVINGS
// ============================================================

function generateNanoPocketEngravingsSelection(caseId) {
  const options = ['AM','PM','LUNCH','EXTRA','SUN','MON','TUE','WED','THU','FRI','SAT','None'];
  let html = `<label><strong>Nano In-Pocket Engraving:</strong></label>
  <div id="nano-pocket-engraving-options-${caseId}" class="option-buttons nano-pocket-engraving-buttons">`;
  options.forEach(option => {
    html += `<button type="button" data-option="${option}">${option}</button>`;
  });
  html += `</div>`;
  return html;
}

function setupNanoPocketEngravingsSelection(caseId) {
  const nanoOptionsDiv = document.getElementById(`nano-pocket-engraving-options-${caseId}`);
  if (!nanoOptionsDiv) return;

  const buttons = nanoOptionsDiv.querySelectorAll('button');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
      checkSkippedFields(caseId);
    });
    if (button.getAttribute('data-option') === 'None') {
      button.classList.add('selected');
    }
  });
}

// ============================================================
// MISSION ENGRAVINGS
// ============================================================

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
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        buttons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        checkSkippedFields(caseId);
      });
      if (button.getAttribute('data-option') === 'None') {
        button.classList.add('selected');
      }
    });
  }
}

// ============================================================
// COLOR SWATCHES
// ============================================================

function generateColorSwatches(containerId, inputName) {
  const colors = getColors();
  const container = document.getElementById(containerId);
  container.innerHTML = '';

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
    } else if (color.isSmearedSplatter) {
      swatch.style.backgroundColor = color.code;
      const gradients = [];
      color.splatterColors.forEach((splatterColor, index) => {
        const angle = 45 + (index * 30);
        const offset = index * 15;
        gradients.push(`linear-gradient(${angle}deg, transparent ${offset}%, ${splatterColor} ${offset + 10}%, ${splatterColor} ${offset + 20}%, transparent ${offset + 30}%)`);
      });
      gradients.push(`radial-gradient(ellipse at 20% 50%, ${color.splatterColors[0]} 0%, transparent 40%)`);
      gradients.push(`radial-gradient(ellipse at 70% 30%, ${color.splatterColors[1] || color.splatterColors[0]} 0%, transparent 35%)`);
      gradients.push(`radial-gradient(ellipse at 50% 80%, ${color.splatterColors[0]} 0%, transparent 30%)`);
      swatch.style.backgroundImage = gradients.join(', ');
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
      allSwatches.forEach(s => s.classList.remove('selected'));
      label.classList.add('selected');

      clearValidationError(container);

      const caseIdMatch = containerId.match(/(?:color-options-|first-color-options-|second-color-options-)(case-\d+)/);
      if (caseIdMatch) {
        checkSkippedFields(caseIdMatch[1]);
      }

      const match = inputName.match(/^mag-color-(case-\d+)-(\d+)$/);
      if (match) {
        const matchCaseId = match[1];
        const matchEntryNum = parseInt(match[2]);
        updateMagSummary(matchCaseId, matchEntryNum);

        checkSkippedFields(matchCaseId);

        const entries = magEntries[matchCaseId] || [];
        if (entries.length > 1 && entries[0] === matchEntryNum && !magColorsHaveSelections(matchCaseId)) {
          autoFillMagColor(matchCaseId, color.name);
        }
      }
    });

    container.appendChild(label);
  });
}

function getColors() {
  return [
    { name: 'Matte Black', code: '#000000' },
    { name: 'Aluminum', code: '#E0DFCB' },
    { name: 'Titanium', code: '#8A8B87' },
    { name: 'Stainless Steel', code: '#C0C5C9' },
    { name: 'Navy Blue', code: '#4883E8' },
    { name: 'Forest Green', code: '#899D7A' },
    { name: 'Designer Red', code: '#EB5047' },
    { name: 'Ikigai Orange', code: '#EB7114' },
    { name: 'Mango', code: '#FFB347' },
    { name: 'Golden Rice', code: '#F8B40E' },
    { name: 'Emerald Green', code: '#34C87E' },
    { name: 'Bahama Blue', code: '#00D3E8' },
    { name: 'Purple Punch', code: '#CE55C4' },
    { name: 'Pink Panther', code: '#E967A6' },
    { name: 'Rose Gold', code: '#FFCAC4' },
    { name: 'Coffee', code: '#4B3621' },
    { name: 'Gunmetal', code: '#2A3439' },
    { name: 'Indigo', code: '#3631CC' },
    { name: 'Teal', code: '#008080' },
    { name: 'Lavender', code: '#C6B7E2' },
    { name: 'Maroon', code: '#800020' },
    {
      name: 'Cherry Blossom',
      code: '#00D3E8',
      isSplatter: true,
      splatterColors: ['#FFB7C5', '#E0DFCB']
    },
    { name: 'Pastel Green', code: '#B4E7CE' },
    { name: 'Sky Blue', code: '#87CEEB' },
    {
      name: 'Camo',
      code: '#899D7A',
      isSplatter: true,
      splatterColors: ['#FFCAC4', '#000000', '#4B3621']
    },
    {
      name: 'Milky Way',
      code: '#87CEEB',
      isSmearedSplatter: true,
      splatterColors: ['#9DD9DD', '#E0DFCB']
    },
    {
      name: 'Black + Blue Splatter',
      code: '#000000',
      isSplatter: true,
      splatterColors: ['#00D3E8']
    },
    {
      name: 'Black + Gold Splatter',
      code: '#000000',
      isSplatter: true,
      splatterColors: ['#FFD700']
    },
    {
      name: 'Disco Splatter',
      code: '#CE55C4',
      isSplatter: true,
      splatterColors: ['#00D3E8']
    },
    {
      name: 'Dancing Dragon',
      code: '#EB5047',
      isSmearedSplatter: true,
      splatterColors: ['#F8B40E']
    },
    {
      name: 'Watercolor',
      code: '#E0DFCB',
      isSmearedSplatter: true,
      splatterColors: ['#D64C8B', '#4883E8', '#F8D34E']
    },
    {
      name: 'Cotton Candy',
      code: '#FFCAC4',
      isSplatter: true,
      splatterColors: ['#E967A6', '#87CEEB', '#CE55C4']
    },
    {
      name: 'Black + Red Splatter',
      code: '#000000',
      isSplatter: true,
      splatterColors: ['#EB5047']
    },
    {
      name: 'Acqua Splatter',
      code: '#87CEEB',
      isSplatter: true,
      splatterColors: ['#4883E8', '#FFFFFF']
    },
    {
      name: 'Blood Moon',
      code: '#000000',
      isSmearedSplatter: true,
      splatterColors: ['#EB5047', '#E0DFCB']
    },
    {
      name: 'Desert Rain',
      code: '#EB7114',
      isSplatter: true,
      splatterColors: ['#EB5047', '#4883E8']
    },
    {
      name: 'Reptile Stripes',
      code: '#C9A84C',
      isSmearedSplatter: true,
      splatterColors: ['#4A9E8A', '#2D7A6B']
    },
    {
      name: 'Dark Blue', code: '#0A1F5C'
    },
  ];
}

// ============================================================
// GENERATE AND COPY NOTES (with visual validation)
// ============================================================

function generateAndCopyNotes() {
  let notes = '';
  let hasError = false;
  const errorElements = [];

  cases.forEach((caseId, index) => {
    const caseNumber = index + 1;
    const pocketDiv = document.getElementById(`pocket-options-${caseId}`);
    const sizeDiv = document.getElementById(`size-options-${caseId}`);
    const pocket = document.querySelector(`#pocket-options-${caseId} .selected`)?.innerText || '';
    const size = document.querySelector(`#size-options-${caseId} .selected`)?.innerText || '';

    if (!pocket) {
      errorElements.push(pocketDiv);
      hasError = true;
    }
    if (!size) {
      errorElements.push(sizeDiv);
      hasError = true;
    }

    if (!pocket || !size) return;

    const isAMPM = pocket === 'AMPM';
    const isTwoWeek = pocket === '2-WEEK';
    const isMagNano = pocket === 'MAGNANO';
    const isMagWeekly = pocket === 'MAG WEEKLY';

    if (isMagNano) {
      const pocketCount = magPocketCounts[caseId];
      if (!pocketCount) {
        errorElements.push(document.getElementById(`magnano-count-options-${caseId}`));
        hasError = true;
        return;
      }

      const entries = magEntries[caseId] || [];
      const total = entries.length;
      const isSingleMode = magModes[caseId] === 'single';

      entries.forEach((entryId, entryIdx) => {
        const colorContainer = document.getElementById(`mag-color-options-${caseId}-${entryId}`);
        const color = document.querySelector(`input[name="mag-color-${caseId}-${entryId}"]:checked`)?.value;
        if (!color) {
          const body = document.getElementById(`mag-body-${caseId}-${entryId}`);
          const toggle = document.getElementById(`mag-toggle-${caseId}-${entryId}`);
          if (body && body.classList.contains('collapsed')) {
            body.classList.remove('collapsed');
            toggle.classList.remove('collapsed');
          }
          errorElements.push(colorContainer);
          hasError = true;
          return;
        }

        const lidOption = document.querySelector(`#mag-lid-options-${caseId}-${entryId} .selected`)?.dataset.option || 'None';
        const pocketOption = document.querySelector(`#mag-pocket-options-${caseId}-${entryId} .selected`)?.dataset.option || 'None';

        let lidText = '';
        if (lidOption === 'Custom') {
          lidText = document.getElementById(`mag-lid-custom-${caseId}-${entryId}`)?.value.trim() || '';
        } else if (lidOption !== 'None') {
          lidText = lidOption;
        }

        let pocketText = '';
        if (pocketOption === 'Custom') {
          pocketText = document.getElementById(`mag-pocket-custom-${caseId}-${entryId}`)?.value.trim() || '';
        } else if (pocketOption !== 'None') {
          pocketText = pocketOption;
        }
        if (isMagAmPmActive(caseId, entryId)) {
          pocketText = pocketText ? `AM/PM ${pocketText}` : 'AM/PM';
        }

        if (isSingleMode) {
          notes += `${caseNumber}) MAGNANO ${size} ${pocketCount} / ${color.toUpperCase()}`;
        } else {
          notes += `${caseNumber}) MAGNANO ${size} ${pocketCount} [${entryIdx + 1}/${total}] / ${color.toUpperCase()}`;
        }
        if (lidText) notes += ` = LID = ${lidText}`;
        if (pocketText) notes += ` = POCKET = ${pocketText}`;
        notes += `\n`;
      });

    } else if (isMagWeekly) {
      const pieces = magWeeklyPieces(caseId);
      const tokens = magWeeklyPocketTokens(caseId);

      const colors = pieces.map((piece, i) => {
        const color = document.querySelector(`input[name="mw-color-${caseId}-${i}"]:checked`)?.value;
        if (!color) {
          errorElements.push(document.getElementById(`mw-color-options-${caseId}-${i}`));
          hasError = true;
        }
        return color;
      });

      if (colors.some(color => !color)) return;

      pieces.forEach((piece, i) => {
        const lid = document.getElementById(`mw-lid-${caseId}-${i}`)?.value.trim();
        notes += `${caseNumber}) ${pocket} ${size} / ${piece.toUpperCase()} / ${colors[i].toUpperCase()}`;
        if (lid) notes += ` = LID = ${lid}`;
        if (tokens[i]) notes += ` = POCKET = ${tokens[i].toUpperCase()}`;
        notes += `\n`;
      });

      const dotwSelectedButton = document.querySelector(`#dotw-options-${caseId} .selected`);
      const dotw = dotwSelectedButton ? dotwSelectedButton.getAttribute('data-day') : 'None';
      if (dotw && dotw !== 'None') {
        const customModifications = document.getElementById(`custom-modifications-${caseId}`)?.value.trim();
        notes += `${caseNumber}) ${pocket} ${size} = DOTW = *${dotw}*`;
        if (customModifications) notes += ` (${customModifications})`;
        notes += `\n`;
      }

    } else if (isAMPM || isTwoWeek) {
      const firstColorContainer = document.getElementById(`first-color-options-${caseId}`);
      const secondColorContainer = document.getElementById(`second-color-options-${caseId}`);
      const firstColor = document.querySelector(`input[name="first-color-${caseId}"]:checked`)?.value;
      const secondColor = document.querySelector(`input[name="second-color-${caseId}"]:checked`)?.value;

      if (!firstColor) {
        errorElements.push(firstColorContainer);
        hasError = true;
      }
      if (!secondColor) {
        errorElements.push(secondColorContainer);
        hasError = true;
      }
      if (!firstColor || !secondColor) return;

      const firstLid = document.getElementById(`first-lid-${caseId}`)?.value.trim();
      const secondLid = document.getElementById(`second-lid-${caseId}`)?.value.trim();
      const customModifications = document.getElementById(`custom-modifications-${caseId}`)?.value.trim();

      const dotwSelectedButton = document.querySelector(`#dotw-options-${caseId} .selected`);
      const dotw = dotwSelectedButton ? dotwSelectedButton.getAttribute('data-day') : 'None';

      const firstNoteLabel = isAMPM ? 'AM LEFT LID' : 'RIGHT & TOP';
      const secondNoteLabel = isAMPM ? 'PM RIGHT LID' : 'LEFT & BOTTOM';

      notes += `${caseNumber}) ${pocket} ${size} / ${firstNoteLabel} / ${firstColor.toUpperCase()}`;
      if (firstLid) notes += ` = LID = ${firstLid}`;
      notes += `\n`;

      notes += `${caseNumber}) ${pocket} ${size} / ${secondNoteLabel} / ${secondColor.toUpperCase()}`;
      if (secondLid) notes += ` = LID = ${secondLid}`;
      notes += `\n`;

      if (dotw && dotw !== 'None') {
        notes += `${caseNumber}) ${pocket} ${size} = DOTW *${dotw}*`;
        if (customModifications) notes += ` (${customModifications})`;
        notes += `\n`;
      }
    } else {
      const colorContainer = document.getElementById(`color-options-${caseId}`);
      const color = document.querySelector(`input[name="color-${caseId}"]:checked`)?.value;
      if (!color) {
        errorElements.push(colorContainer);
        hasError = true;
        return;
      }

      const lid = document.getElementById(`lid-${caseId}`)?.value.trim();
      const colorUpper = color.toUpperCase();

      notes += `${caseNumber}) ${pocket} ${size} / ${colorUpper}`;
      if (lid) notes += ` = LID = ${lid}`;
      notes += `\n`;

      if (pocket === 'MISSION') {
        const missionOption =
          document.querySelector(`#mission-engraving-options-${caseId} .selected`)
            ?.getAttribute('data-option');
        if (missionOption && missionOption !== 'None') {
          notes += `${caseNumber}) ${pocket} ${size} / ${colorUpper} = POCKETS = ${missionOption}\n`;
        }
      } else if (pocket === 'NANO') {
        const nanoPocketOption =
          document.querySelector(`#nano-pocket-engraving-options-${caseId} .selected`)
            ?.getAttribute('data-option');
        if (nanoPocketOption && nanoPocketOption !== 'None') {
          notes += `${caseNumber}) ${pocket} ${size} / ${colorUpper} = POCKETS = ${nanoPocketOption}\n`;
        }
      } else {
        const dotwSelectedButton = document.querySelector(`#dotw-options-${caseId} .selected`);
        const dotw = dotwSelectedButton ? dotwSelectedButton.getAttribute('data-day') : 'None';
        if (dotw && dotw !== 'None') {
          const customModifications = document.getElementById(`custom-modifications-${caseId}`)?.value.trim();
          notes += `${caseNumber}) ${pocket} ${size} / ${colorUpper} = DOTW = *${dotw}*`;
          if (customModifications) notes += ` (${customModifications})`;
          notes += `\n`;
        }
      }
    }
  });

  if (hasError) {
    errorElements.forEach(el => addValidationError(el));
    if (errorElements.length > 0) {
      errorElements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  if (notes === '') notes = 'No notes to display.';
  document.getElementById('notes-output').innerText = notes;

  navigator.clipboard.writeText(notes).catch(err => {
    console.error('Failed to copy notes to clipboard:', err);
  });
}

// ============================================================
// TAB SWITCHING
// ============================================================

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

// ============================================================
// SKU LOOKUP
// ============================================================

const skuData = {
  "cases": {
    "single": [
      { "name": "Nano Pill Case", "keyword": "SPC-NPC", "pockets": "nano", "size": "pill" },
      { "name": "Nano Vitamin Case", "keyword": "SPC-NVC", "pockets": "nano", "size": "vitamin" },
      { "name": "MagNano 1P Pill Case", "keyword": "SPC-MGN1P", "pockets": "magnano", "size": "pill", "count": "1P" },
      { "name": "MagNano 2P Pill Case", "keyword": "SPC-MGN2P", "pockets": "magnano", "size": "pill", "count": "2P" },
      { "name": "MagNano 1P Vitamin Case", "keyword": "SPC-MGN1V", "pockets": "magnano", "size": "vitamin", "count": "1P" },
      { "name": "MagNano 2P Vitamin Case", "keyword": "SPC-MGN2V", "pockets": "magnano", "size": "vitamin", "count": "2P" },
      { "name": "Mission Pill Case", "keyword": "SPC-MPC", "pockets": "mission", "size": "pill" },
      { "name": "Mission Vitamin Case", "keyword": "SPC-MVC", "pockets": "mission", "size": "vitamin" },
      { "name": "Weekly XS Case", "keyword": "SPC-WXSPC", "pockets": "weekly", "size": "xs" },
      { "name": "Weekly Pill Case", "keyword": "SPC-WPC", "pockets": "weekly", "size": "pill" },
      { "name": "Weekly Vitamin Case", "keyword": "SPC-WVC", "pockets": "weekly", "size": "vitamin" },
      { "name": "Weekly Vitamin XL Case", "keyword": "SPC-WVXC", "pockets": "weekly", "size": "vitamin xl" },
      { "name": "Weekly Vitamin 2XL Case", "keyword": "SPC-WV2XC", "pockets": "weekly", "size": "vitamin 2xl" },
      { "name": "Weekly AM-PM Pill Case", "keyword": "BPC-WAPPC2", "pockets": "ampm", "size": "pill" },
      { "name": "Weekly AM-PM Vitamin Case", "keyword": "BPC-WAC2", "pockets": "ampm", "size": "vitamin" },
      { "name": "Weekly AM-PM Vitamin XL Case", "keyword": "BPC-WAPVX2", "pockets": "ampm", "size": "vitamin xl" },
      { "name": "AM - Left Side (Vitamin)", "keyword": "SPC-WVALS", "pockets": "ampm", "size": "vitamin", "note": "Can be used for 2-Week Vitamin" },
      { "name": "PM - Right Side (Vitamin)", "keyword": "SPC-WVPRS", "pockets": "ampm", "size": "vitamin", "note": "Can be used for 2-Week Vitamin" },
      { "name": "AM Pill - Left Side", "keyword": "SPC-WVAPLS", "pockets": "ampm", "size": "pill", "note": "Can be used for 2-Week Pill" },
      { "name": "PM Pill - Right Side", "keyword": "SPC-WVPPRS", "pockets": "ampm", "size": "pill", "note": "Can be used for 2-Week Pill" },
      { "name": "AM Vitamin XL - Left Side", "keyword": "SPC-HC-WVXALS", "pockets": "ampm", "size": "vitamin xl" },
      { "name": "PM Vitamin XL - Right Side", "keyword": "SPC-HC-WVXPRS", "pockets": "ampm", "size": "vitamin xl" },
      { "name": "2-Week Pill Case", "keyword": "BPC-2WPC", "pockets": "2-week", "size": "pill" },
      { "name": "2-Week Vitamin Case", "keyword": "BPC-2WVC", "pockets": "2-week", "size": "vitamin" },
      { "name": "2-Week Vitamin XL Case", "keyword": "BPC-2WVXLC2", "pockets": "2-week", "size": "vitamin xl" },
      { "name": "2-Week Vitamin XL - Left Side", "keyword": "SPC-HC-VXL1TRC", "pockets": "2-week", "size": "vitamin xl" },
      { "name": "2-Week Vitamin XL - Right Side", "keyword": "SPC-HC-VXL2BLC", "pockets": "2-week", "size": "vitamin xl" }
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
  if (existingSizeContainer) existingSizeContainer.remove();

  const existingSidesContainer = skuOptionsDiv.querySelector('#sides-container');
  if (existingSidesContainer) existingSidesContainer.remove();

  const existingCountContainer = skuOptionsDiv.querySelector('#count-container');
  if (existingCountContainer) existingCountContainer.remove();

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
      } else if (selectedPocket === 'magnano') {
        generateCountOptions(skuOptionsDiv, selectedPocket, caseType, size);
      } else {
        const existingSidesContainer = skuOptionsDiv.querySelector('#sides-container');
        if (existingSidesContainer) existingSidesContainer.remove();
        const existingCountContainer = skuOptionsDiv.querySelector('#count-container');
        if (existingCountContainer) existingCountContainer.remove();
        updateSKU(caseType, selectedPocket, size);
      }
    });
    sizeOptionsDiv.appendChild(button);
  });

  sizeContainer.appendChild(sizeLabel);
  sizeContainer.appendChild(sizeOptionsDiv);
  skuOptionsDiv.appendChild(sizeContainer);
}

// Counts are derived from the SKU table, so only combinations that have a real
// keyword are offered (e.g. VITAMIN currently exists as 2P only).
function generateCountOptions(skuOptionsDiv, selectedPocket, caseType, selectedSize) {
  const existingCountContainer = skuOptionsDiv.querySelector('#count-container');
  if (existingCountContainer) existingCountContainer.remove();

  const skuCases = skuData.cases[caseType];
  const counts = [...new Set(skuCases
    .filter(c => c.pockets === selectedPocket && c.size === selectedSize && c.count)
    .map(c => c.count))];

  const countContainer = document.createElement('div');
  countContainer.id = 'count-container';
  const countLabel = document.createElement('label');
  countLabel.innerHTML = '<strong>Pockets:</strong>';
  const countOptionsDiv = document.createElement('div');
  countOptionsDiv.className = 'option-buttons';

  counts.forEach(count => {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerText = count;
    button.dataset.count = count;
    button.addEventListener('click', () => {
      countOptionsDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
      updateSKU(caseType, selectedPocket, selectedSize);
    });
    countOptionsDiv.appendChild(button);
  });

  countContainer.appendChild(countLabel);
  countContainer.appendChild(countOptionsDiv);
  skuOptionsDiv.appendChild(countContainer);

  if (counts.length === 1) countOptionsDiv.querySelector('button').classList.add('selected');
  updateSKU(caseType, selectedPocket, selectedSize);
}

function generateSidesOptions(skuOptionsDiv, selectedPocket, caseType) {
  const existingSidesContainer = skuOptionsDiv.querySelector('#sides-container');
  if (existingSidesContainer) existingSidesContainer.remove();

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
      // Prefer a side SKU that natively belongs to the selected pocket.
      // This is what makes the dedicated 2-Week Vitamin XL side SKUs resolve correctly.
      matchingCase = skuCases.find(c =>
        c.pockets === selectedPocket &&
        c.size === selectedSize &&
        c.name.toLowerCase().includes(selectedSide)
      );
      // Fallback: 2-Week sides that historically reuse an AMPM SKU (Pill, Vitamin).
      if (!matchingCase && selectedPocket === '2-week') {
        matchingCase = skuCases.find(c =>
          c.pockets === 'ampm' &&
          c.size === selectedSize &&
          c.name.toLowerCase().includes(selectedSide) &&
          c.note && c.note.includes('Can be used for 2-Week')
        );
      }
    }
  } else if (selectedPocket === 'magnano') {
    const selectedCount = document.querySelector('#count-container .option-buttons button.selected')?.dataset.count;
    if (!selectedCount) {
      document.getElementById('sku-output').value = '';
      return;
    }
    matchingCase = skuCases.find(c =>
      c.pockets === selectedPocket && c.size === selectedSize && c.count === selectedCount
    );
  } else {
    matchingCase = skuCases.find(c => c.pockets === selectedPocket && c.size === selectedSize);
  }

  if (matchingCase) {
    document.getElementById('sku-output').value = matchingCase.keyword;
  } else {
    document.getElementById('sku-output').value = 'No matching SKU found';
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
