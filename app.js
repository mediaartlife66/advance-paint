/**
 * Advance Paint MVP Core Engine
 * Architecture state and service placeholders optimized for advancepaint.co.nz
 */

window.AdvancePaintState = {
  currentView: 'home',
  assessment: {
    propertyType: 'Residential',
    interiorExterior: 'Both',
    notes: '',
    uploadedPhotos: []
  },
  visualizer: {
    selectedColor: { name: 'Teal Twilight', hex: '#00B4D8' },
    surface: 'Walls',
    sensitivity: 50,
    history: []
  },
  estimator: {
    wallArea: 0,
    coatCount: 2,
    calculatedLiters: 0,
    estimatedCost: 0
  },
  customerDetails: {
    name: '',
    email: '',
    phone: '',
    address: ''
  }
};

window.AdvancePaintConfig = {
  LITERS_PER_SQ_METER: 0.16,
  PRICE_PER_LITER_NZD: 45.00,
  AVAILABLE_PALETTE: [
    { name: 'Midnight Sapphire', hex: '#0B132B' },
    { name: 'Teal Twilight', hex: '#00B4D8' },
    { name: 'Emerald Horizon', hex: '#06D6A0' },
    { name: 'Soft Cyan Accent', hex: '#90E0EF' },
    { name: 'Pure Chalk White', hex: '#FFFFFF' }
  ]
};

window.AdvancePaintServices = {
  submitQuoteRequest: async (completePayload) => {
    console.log("[API Outbound Payload] Sending to Cloudflare Worker endpoint...", completePayload);
    return new Promise((resolve) => setTimeout(() => resolve({ success: true, referenceId: "AP-NZ-" + Math.floor(Math.random() * 90000 + 10000) }), 1200));
  },
  generateAIReport: async (assessmentData) => {
    console.log("[AI Framework Trigger] Simulating structural computer-vision analysis parsing...");
    return new Promise((resolve) => setTimeout(() => resolve({
      verifiedData: { squareMetersEstimate: 142, substrateType: "Weatherboard & Plaster Gyp" },
      aiRecommendations: ["Apply structural premium primer on exposed north-facing wood substrate surfaces.", "Teal Twilight accent recommendations calculated for deep lighting entry zones."]
    }), 1500));
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initGlobalViewRouter();
  initDynamicGlowShaders();
});

function initGlobalViewRouter() {
  const routerLinks = document.querySelectorAll('[data-route]');
  routerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = link.getAttribute('data-route');
      switchActiveView(targetView);
    });
  });
}

function switchActiveView(viewId) {
  window.AdvancePaintState.currentView = viewId;
  
  document.querySelectorAll('[data-view-panel]').forEach(panel => {
    if (panel.getAttribute('data-view-panel') === viewId) {
      panel.style.display = 'block';
      panel.classList.add('fade-in-view');
    } else {
      panel.style.display = 'none';
      panel.classList.remove('fade-in-view');
    }
  });

  document.querySelectorAll('[data-route]').forEach(el => {
    if (el.getAttribute('data-route') === viewId) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  if (viewId === 'report') renderAIReportModule();
  if (viewId === 'quote') renderQuoteSummaryModule();
}

function initDynamicGlowShaders() {
  document.body.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.ag-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--glow-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--glow-y', `${e.clientY - rect.top}px`);
  });
}