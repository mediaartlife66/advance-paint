/**
 * Advance Paint Modules Controller
 * Runs separate core sub-functions cleanly using parent state engines.
 */

function initPhotoAssessment() {
  const dropZone = document.getElementById('drag-drop-zone');
  const fileInput = document.getElementById('photo-file-input');
  if (!dropZone) return;

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, e => e.preventDefault());
  });

  dropZone.addEventListener('drop', (e) => {
    handleIncomingFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', (e) => {
    handleIncomingFiles(e.target.files);
  });
}

function handleIncomingFiles(files) {
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const photoObj = { id: 'img_' + Date.now() + Math.random(), base64: event.target.result, name: file.name };
      window.AdvancePaintState.assessment.uploadedPhotos.push(photoObj);
      renderPhotoPreviews();
    };
    reader.readAsDataURL(file);
  });
}

function renderPhotoPreviews() {
  const container = document.getElementById('photo-preview-grid');
  if (!container) return;
  container.innerHTML = '';
  window.AdvancePaintState.assessment.uploadedPhotos.forEach((photo) => {
    const div = document.createElement('div');
    div.className = 'ag-card';
    div.style.padding = '12px';
    div.innerHTML = `
      <img src="${photo.base64}" style="width:100%; height:120px; object-fit:cover; border-radius:6px; margin-bottom:8px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.75rem; color:var(--text-muted); text-overflow:ellipsis; overflow:hidden; white-space:nowrap; max-width:100px;">${photo.name}</span>
        <button onclick="removeUploadedPhoto('${photo.id}')" style="background:none; border:none; color:#FF5A5F; cursor:pointer; font-size:0.8rem;">Remove</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function removeUploadedPhoto(id) {
  window.AdvancePaintState.assessment.uploadedPhotos = window.AdvancePaintState.assessment.uploadedPhotos.filter(p => p.id !== id);
  renderPhotoPreviews();
}

function saveAssessmentForm() {
  window.AdvancePaintState.assessment.propertyType = document.getElementById('prop-type').value;
  window.AdvancePaintState.assessment.interiorExterior = document.getElementById('int-ext').value;
  window.AdvancePaintState.assessment.notes = document.getElementById('assessment-notes').value;
  switchActiveView('visualizer');
  initVisualizerModule();
}

function initVisualizerModule() {
  const canvas = document.getElementById('visualizer-canvas');
  const paletteContainer = document.getElementById('visualizer-palette');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const currentPhotos = window.AdvancePaintState.assessment.uploadedPhotos;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (currentPhotos.length > 0) {
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = currentPhotos[0].base64;
  } else {
    ctx.fillStyle = '#111C3A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px sans-serif';
    ctx.fillText('Upload images via Assessment module to display custom canvas surfaces', 60, 150);
  }

  paletteContainer.innerHTML = '';
  window.AdvancePaintConfig.AVAILABLE_PALETTE.forEach(color => {
    const node = document.createElement('div');
    node.style.width = '36px';
    node.style.height = '36px';
    node.style.borderRadius = '50%';
    node.style.backgroundColor = color.hex;
    node.style.cursor = 'pointer';
    node.style.border = window.AdvancePaintState.visualizer.selectedColor.hex === color.hex ? '3px solid #FFFFFF' : '1px solid rgba(255,255,255,0.2)';
    node.addEventListener('click', () => {
      window.AdvancePaintState.visualizer.selectedColor = color;
      initVisualizerModule();
    });
    paletteContainer.appendChild(node);
  });
}

function applyVisualizerTint() {
  const canvas = document.getElementById('visualizer-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  window.AdvancePaintState.visualizer.history.push(canvas.toDataURL());
  
  const color = window.AdvancePaintState.visualizer.selectedColor.hex;
  const opacity = window.AdvancePaintState.visualizer.sensitivity / 200;
  
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);
  ctx.globalAlpha = 1.0;
  ctx.globalCompositeOperation = 'source-over';
}

function undoVisualizerAction() {
  if (window.AdvancePaintState.visualizer.history.length === 0) return;
  const previousStateData = window.AdvancePaintState.visualizer.history.pop();
  const canvas = document.getElementById('visualizer-canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
  img.src = previousStateData;
}

function downloadVisualizerResult() {
  const canvas = document.getElementById('visualizer-canvas');
  const link = document.createElement('a');
  link.download = 'advance-paint-preview.png';
  link.href = canvas.toDataURL();
  link.click();
}

function runEstimatorCalculations() {
  const wallAreaInput = parseFloat(document.getElementById('input-wall-area').value) || 0;
  const coats = parseInt(document.getElementById('input-coats').value) || 2;

  const totalLiters = Math.ceil(wallAreaInput * coats * window.AdvancePaintConfig.LITERS_PER_SQ_METER);
  const calculatedCost = totalLiters * window.AdvancePaintConfig.PRICE_PER_LITER_NZD;

  window.AdvancePaintState.estimator.wallArea = wallAreaInput;
  window.AdvancePaintState.estimator.coatCount = coats;
  window.AdvancePaintState.estimator.calculatedLiters = totalLiters;
  window.AdvancePaintState.estimator.estimatedCost = calculatedCost;

  document.getElementById('out-liters').textContent = totalLiters + " L";
  document.getElementById('out-cost').textContent = "$" + calculatedCost.toFixed(2) + " NZD";
}

function renderAIReportModule() {
  const targetReportBox = document.getElementById('ai-report-rendering-box');
  if (!targetReportBox) return;

  targetReportBox.innerHTML = `<p style="color:var(--text-muted)">Querying APA core vision model nodes...</p>`;
  
  window.AdvancePaintServices.generateAIReport(window.AdvancePaintState.assessment).then(report => {
    targetReportBox.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:16px;">
        <div class="ag-card">
          <h4 style="color:var(--teal-primary)">Verified Contextual Data</h4>
          <p style="margin-top:8px; font-size:0.9rem;">Substrate Profile: \${report.verifiedData.substrateType}</p>
          <p style="font-size:0.9rem;">Identified Total Target Area: ~\${report.verifiedData.squareMetersEstimate} m²</p>
        </div>
        <div class="ag-card">
          <h4 style="color:var(--emerald-success)">Predictive AI Recommendations</h4>
          <ul style="margin-top:8px; padding-left:16px; font-size:0.85rem; color:var(--text-muted)">
            \${report.aiRecommendations.map(rec => `<li style="margin-bottom:4px;">\${rec}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  });
}

function renderQuoteSummaryModule() {
  const container = document.getElementById('quote-summary-panel');
  if (!container) return;

  const state = window.AdvancePaintState;
  container.innerHTML = `
    <div class="ag-card" style="margin-bottom:20px;">
      <h3 style="margin-bottom:12px; font-size:1.1rem;">Project Information Matrix Summary</h3>
      <p style="font-size:0.9rem;"><strong>Target Scope:</strong> \${state.assessment.propertyType} (\${state.assessment.interiorExterior} surfaces)</p>
      <p style="font-size:0.9rem;"><strong>Selected Pipeline Palette:</strong> \${state.visualizer.selectedColor.name} (\${state.visualizer.selectedColor.hex})</p>
      <p style="font-size:0.9rem;"><strong>Calculated Material Volume:</strong> \${state.estimator.calculatedLiters} Liters ($Layout \${state.estimator.estimatedCost.toFixed(2)} NZD projection)</p>
      <p style="font-size:0.9rem; color:var(--text-muted); margin-top:8px;"><strong>Uploaded Attachments count:</strong> \${state.assessment.uploadedPhotos.length} images mapped</p>
    </div>
  `;
}

function submitFinalQuoteRequest(e) {
  if (e) e.preventDefault();
  const alertContainer = document.getElementById('quote-api-status-banner');
  
  window.AdvancePaintState.customerDetails = {
    name: document.getElementById('cust-name').value,
    email: document.getElementById('cust-email').value,
    phone: document.getElementById('cust-phone').value,
    address: document.getElementById('cust-addr').value
  };

  const payload = {
    state: window.AdvancePaintState,
    timestamp: new Date().toISOString()
  };

  alertContainer.innerHTML = `<span class="badge badge-running">Dispatching payload request...</span>`;

  window.AdvancePaintServices.submitQuoteRequest(payload).then(res => {
    if (res.success) {
      alertContainer.innerHTML = `
        <div class="ag-card" style="border-color:var(--emerald-success); text-align:center;">
          <h3 style="color:var(--emerald-success)">Quote Request Dispatched</h3>
          <p style="font-size:0.9rem; margin-top:4px;">Reference Token: <strong>\${res.referenceId}</strong></p>
          <p style="color:var(--text-muted); font-size:0.8rem; margin-top:4px;">Our advancepaint.co.nz estimation team will contact you shortly.</p>
        </div>
      `;
    }
  });
}