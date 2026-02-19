// planner.js
// Visit Planner Functionality

// Current selected locations
let selectedLocations = [];
let currentRoute = [];
let savedPlans = [];

// Initialize planner when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('locations-grid')) {
        loadSavedPlans();
        displayLocationGrid('all');
        displayTourRecommendations();
    }
});

// ========== TAB SWITCHING ==========
function switchPlannerTab(tabName, btn) {
    // Update tab buttons
    document.querySelectorAll('.planner-tab').forEach(tab => tab.classList.remove('active'));
    if (btn) btn.classList.add('active');

    // Update tab content
    document.querySelectorAll('.planner-tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + '-tab').classList.add('active');

    // If switching to route tab, generate route
    if (tabName === 'route' && selectedLocations.length > 0) {
        generateRoute();
    }
}

// ========== LOCATION SELECTION ==========
function displayLocationGrid(filter = 'all') {
    const grid = document.getElementById('locations-grid');
    grid.innerHTML = '';
    
    let locations = [];
    if (filter === 'animals') {
        locations = zooData.animals;
    } else if (filter === 'places') {
        locations = zooData.places;
    } else if (filter === 'restaurant') {
        locations = zooData.places.filter(p => p.type === 'restaurant' || p.type === 'cafe');
    } else {
        locations = getAllLocations();
    }
    
    locations.forEach(loc => {
        const isSelected = selectedLocations.some(l => l.id === loc.id);
        
        const item = document.createElement('div');
        item.className = `location-item ${isSelected ? 'selected' : ''}`;
        item.onclick = () => toggleLocation(loc);
        
        item.innerHTML = `
            <div class="icon">${loc.icon}</div>
            <h4>${loc.name}</h4>
            <div class="time">⏱️ ${loc.viewTime || 10} min</div>
            <span class="check">✓</span>
        `;
        
        grid.appendChild(item);
    });
    
    updateSelectionSummary();
}

function filterPlannerCategory(category, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    displayLocationGrid(category);
}

function toggleLocation(location) {
    const index = selectedLocations.findIndex(l => l.id === location.id);
    
    if (index === -1) {
        // Add location
        selectedLocations.push(location);
    } else {
        // Remove location
        selectedLocations.splice(index, 1);
    }
    
    // Refresh grid to show selection
    const activeFilter = document.querySelector('.filter-btn.active')?.innerText.toLowerCase() || 'all';
    displayLocationGrid(activeFilter);
}

function updateSelectionSummary() {
    document.getElementById('selected-count').textContent = selectedLocations.length;
    
    const totalTime = selectedLocations.reduce((sum, loc) => {
        return sum + (loc.viewTime || 10);
    }, 0);
    
    document.getElementById('estimated-time').textContent = totalTime;
}

// ========== TOUR RECOMMENDATIONS ==========
function displayTourRecommendations() {
    const container = document.getElementById('tour-cards');
    if (!container) return;
    
    container.innerHTML = '';
    
    recommendedTours.forEach((tour, index) => {
        const card = document.createElement('div');
        card.className = 'tour-card';
        card.onclick = () => loadTour(tour);
        
        card.innerHTML = `
            <h4>${tour.name}</h4>
            <p>${tour.description}</p>
            <div class="duration">⏱️ ${tour.duration} minutes</div>
            <span class="difficulty ${tour.difficulty.toLowerCase()}">${tour.difficulty}</span>
        `;
        
        container.appendChild(card);
    });
}

function loadTour(tour) {
    // Get full location objects for tour
    selectedLocations = tour.locations.map(id => {
        return getLocationById(id);
    }).filter(loc => loc); // Remove any undefined
    
    // Refresh grid
    displayLocationGrid('all');
    
    // Switch to route tab
    switchPlannerTab('route');
}

// ========== ROUTE GENERATION ==========
function generateRoute() {
    if (selectedLocations.length === 0) {
        alert('Please select at least one location to visit');
        return;
    }
    
    // Simple route optimization - start with first selected, then find nearest each time
    const unvisited = [...selectedLocations];
    currentRoute = [];
    
    // Start with first location
    let current = unvisited.shift();
    currentRoute.push(current);
    
    // Greedy algorithm - always go to nearest unvisited location
    while (unvisited.length > 0) {
        let nearestIndex = 0;
        let nearestDistance = getWalkingTime(current, unvisited[0]);
        
        for (let i = 1; i < unvisited.length; i++) {
            const distance = getWalkingTime(current, unvisited[i]);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIndex = i;
            }
        }
        
        current = unvisited[nearestIndex];
        currentRoute.push(current);
        unvisited.splice(nearestIndex, 1);
    }
    
    displayRoute();
    drawRouteMap();
}

function getWalkingTime(loc1, loc2) {
    // Default walking time if not specified
    return 5; // Simple version - always 5 minutes between locations
}

function displayRoute() {
    const container = document.getElementById('route-steps');
    container.innerHTML = '';
    
    let totalWalkTime = 0;
    let totalViewTime = 0;
    
    currentRoute.forEach((loc, index) => {
        const viewTime = loc.viewTime || 10;
        totalViewTime += viewTime;
        
        const stepDiv = document.createElement('div');
        stepDiv.className = 'route-step';
        
        let walkInfo = '';
        if (index < currentRoute.length - 1) {
            const walkTime = getWalkingTime(loc, currentRoute[index + 1]);
            totalWalkTime += walkTime;
            walkInfo = `<span class="route-step-walk">🚶 ${walkTime} min walk</span>`;
        }
        
        stepDiv.innerHTML = `
            <div class="route-step-number">${index + 1}</div>
            <div class="route-step-icon">${loc.icon}</div>
            <div class="route-step-info">
                <strong>${loc.name}</strong>
                <div class="route-step-time">⏱️ View time: ${viewTime} min</div>
            </div>
            ${walkInfo}
        `;
        
        container.appendChild(stepDiv);
    });
    
    // Update summary
    document.getElementById('total-walk-time').textContent = totalWalkTime;
    document.getElementById('total-view-time').textContent = totalViewTime;
    document.getElementById('total-duration').textContent = totalWalkTime + totalViewTime;
}

function drawRouteMap() {
    const canvas = document.getElementById('route-map');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#7cb342';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (currentRoute.length === 0) return;
    
    // Draw path between locations
    ctx.beginPath();
    ctx.strokeStyle = '#ff5722';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 5]);
    
    const startPoint = currentRoute[0].coords;
    ctx.moveTo(startPoint.x, startPoint.y);
    
    for (let i = 1; i < currentRoute.length; i++) {
        ctx.lineTo(currentRoute[i].coords.x, currentRoute[i].coords.y);
    }
    ctx.stroke();
    
    // Draw markers
    ctx.setLineDash([]);
    currentRoute.forEach((loc, index) => {
        // Draw marker
        ctx.beginPath();
        ctx.arc(loc.coords.x, loc.coords.y, 12, 0, Math.PI * 2);
        
        // Color based on type
        const isAnimal = zooData.animals.includes(loc);
        ctx.fillStyle = isAnimal ? '#ff9800' : '#2196f3';
        ctx.fill();
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw number
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(index + 1, loc.coords.x, loc.coords.y);
    });
}

// ========== SAVE/LOAD PLANS ==========
function saveCurrentPlan() {
    const planName = document.getElementById('plan-name').value || 'My Zoo Visit';
    const visitDate = document.getElementById('visit-date').value || new Date().toISOString().split('T')[0];
    const visitorCount = document.getElementById('visitor-count').value || 2;
    const notes = document.getElementById('notes').value || '';
    
    const plan = {
        id: Date.now(),
        name: planName,
        date: visitDate,
        visitors: visitorCount,
        notes: notes,
        locations: selectedLocations.map(l => l.id),
        route: currentRoute.map(l => l.id),
        created: new Date().toISOString()
    };
    
    // Get existing plans
    let savedPlans = JSON.parse(localStorage.getItem('zooPlans') || '[]');
    savedPlans.push(plan);
    
    // Save to localStorage
    localStorage.setItem('zooPlans', JSON.stringify(savedPlans));
    
    alert('Plan saved successfully!');
    loadSavedPlans();
    switchPlannerTab('save');
}

function loadSavedPlans() {
    const container = document.getElementById('saved-plans-list');
    if (!container) return;
    
    const savedPlans = JSON.parse(localStorage.getItem('zooPlans') || '[]');
    container.innerHTML = '';
    
    if (savedPlans.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#666;">No saved plans yet</p>';
        return;
    }
    
    savedPlans.reverse().forEach(plan => {
        const planDiv = document.createElement('div');
        planDiv.className = 'saved-plan-item';
        
        const locationCount = plan.locations.length;
        const date = new Date(plan.date).toLocaleDateString();
        
        planDiv.innerHTML = `
            <div class="saved-plan-info">
                <h4>${plan.name}</h4>
                <p>📅 ${date} | 👥 ${plan.visitors} visitors | 📍 ${locationCount} locations</p>
                ${plan.notes ? `<small>📝 ${plan.notes}</small>` : ''}
            </div>
            <div class="saved-plan-actions">
                <button class="btn-load" onclick="loadPlan(${plan.id})">Load</button>
                <button class="btn-delete" onclick="deletePlan(${plan.id})">Delete</button>
            </div>
        `;
        
        container.appendChild(planDiv);
    });
}

function loadPlan(planId) {
    const savedPlans = JSON.parse(localStorage.getItem('zooPlans') || '[]');
    const plan = savedPlans.find(p => p.id === planId);
    
    if (plan) {
        // Load locations
        selectedLocations = plan.locations.map(id => getLocationById(id)).filter(l => l);
        
        // Load route if available
        if (plan.route) {
            currentRoute = plan.route.map(id => getLocationById(id)).filter(l => l);
        }
        
        // Update UI
        displayLocationGrid('all');
        
        // Fill form with plan details
        document.getElementById('plan-name').value = plan.name;
        document.getElementById('visit-date').value = plan.date;
        document.getElementById('visitor-count').value = plan.visitors;
        document.getElementById('notes').value = plan.notes || '';
        
        // Switch to select tab
        switchPlannerTab('select');
        
        alert('Plan loaded successfully!');
    }
}

function deletePlan(planId) {
    if (confirm('Are you sure you want to delete this plan?')) {
        let savedPlans = JSON.parse(localStorage.getItem('zooPlans') || '[]');
        savedPlans = savedPlans.filter(p => p.id !== planId);
        localStorage.setItem('zooPlans', JSON.stringify(savedPlans));
        loadSavedPlans();
    }
}