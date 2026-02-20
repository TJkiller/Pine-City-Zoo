// Current selected locations
let selectedLocations = [];
let currentRoute = [];
let savedPlans = [];

// The logical coordinate space used in data.js
const LOGICAL_W = 1000;
const LOGICAL_H = 600;

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

    // If switching to route tab, generate and draw route
    if (tabName === 'route') {
        if (selectedLocations.length > 0) {
            generateRoute();
        }
        // Always redraw the map when switching to route tab
        // (handles case where canvas was hidden during first render)
        setTimeout(drawRouteMap, 50);
    }
}

// ========== LOCATION SELECTION ==========
function displayLocationGrid(filter) {
    // Normalise filter text (handles button innerText like "All", "Animals" etc.)
    if (!filter) filter = 'all';
    filter = filter.trim().toLowerCase();

    const grid = document.getElementById('locations-grid');
    grid.innerHTML = '';

    let locations = [];
    if (filter === 'animals') {
        locations = zooData.animals;
    } else if (filter === 'places') {
        locations = zooData.places;
    } else if (filter === 'restaurant' || filter === 'dining') {
        locations = zooData.places.filter(p => p.type === 'restaurant' || p.type === 'cafe');
    } else {
        locations = getAllLocations();
    }

    locations.forEach(loc => {
        const isSelected = selectedLocations.some(l => l.id === loc.id);

        const item = document.createElement('div');
        item.className = 'location-item' + (isSelected ? ' selected' : '');
        item.onclick = () => toggleLocation(loc);

        item.innerHTML =
            '<div class="icon">' + loc.icon + '</div>' +
            '<h4>' + loc.name + '</h4>' +
            '<div class="time"><i class="fa-regular fa-clock"></i> ' + (loc.viewTime || 10) + ' min</div>' +
            '<span class="check"><i class="fa-solid fa-check"></i></span>';

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
        selectedLocations.push(location);
    } else {
        selectedLocations.splice(index, 1);
    }

    // Re-render grid keeping the active filter
    const activeBtn = document.querySelector('.filter-btn.active');
    const activeFilter = activeBtn ? activeBtn.dataset.filter || activeBtn.innerText : 'all';
    displayLocationGrid(activeFilter);
}

function updateSelectionSummary() {
    document.getElementById('selected-count').textContent = selectedLocations.length;

    const totalTime = selectedLocations.reduce(function(sum, loc) {
        return sum + (loc.viewTime || 10);
    }, 0);

    document.getElementById('estimated-time').textContent = totalTime;
}

// ========== TOUR RECOMMENDATIONS ==========
function displayTourRecommendations() {
    const container = document.getElementById('tour-cards');
    if (!container) return;

    container.innerHTML = '';

    recommendedTours.forEach(function(tour) {
        const card = document.createElement('div');
        card.className = 'tour-card';
        card.onclick = function() { loadTour(tour); };

        card.innerHTML =
            '<h4>' + tour.name + '</h4>' +
            '<p>' + tour.description + '</p>' +
            '<div class="tour-meta">' +
              '<span class="tour-duration"><i class="fa-regular fa-clock"></i> ' + tour.duration + ' min</span>' +
              '<span class="difficulty-badge ' + tour.difficulty.toLowerCase() + '">' + tour.difficulty + '</span>' +
            '</div>';

        container.appendChild(card);
    });
}

function loadTour(tour) {
    selectedLocations = tour.locations
        .map(function(id) { return getLocationById(id); })
        .filter(function(loc) { return !!loc; });

    displayLocationGrid('all');
    switchPlannerTab('route', document.getElementById('tab-btn-route'));
}

// ========== ROUTE GENERATION ==========
function generateRoute() {
    if (selectedLocations.length === 0) {
        alert('Please select at least one location to visit');
        return;
    }

    // Greedy nearest-neighbour route
    const unvisited = selectedLocations.slice();
    currentRoute = [];

    let current = unvisited.shift();
    currentRoute.push(current);

    while (unvisited.length > 0) {
        let nearestIndex = 0;
        let nearestDist = getWalkingTime(current, unvisited[0]);

        for (let i = 1; i < unvisited.length; i++) {
            const d = getWalkingTime(current, unvisited[i]);
            if (d < nearestDist) {
                nearestDist = d;
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
    // Euclidean distance in logical space → rough minutes
    if (!loc1 || !loc2 || !loc1.coords || !loc2.coords) return 5;
    const dx = loc1.coords.x - loc2.coords.x;
    const dy = loc1.coords.y - loc2.coords.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // 1000-unit map ≈ 1 km; rough pace ~200 units/min
    return Math.max(2, Math.round(dist / 80));
}

function displayRoute() {
    const container = document.getElementById('route-steps');
    container.innerHTML = '';

    let totalWalkTime = 0;
    let totalViewTime = 0;

    currentRoute.forEach(function(loc, index) {
        const viewTime = loc.viewTime || 10;
        totalViewTime += viewTime;

        const stepDiv = document.createElement('div');
        stepDiv.className = 'route-step';

        let walkInfo = '';
        if (index < currentRoute.length - 1) {
            const walkTime = getWalkingTime(loc, currentRoute[index + 1]);
            totalWalkTime += walkTime;
            walkInfo = '<span class="route-step-walk"><i class="fa-solid fa-person-walking"></i> ' + walkTime + ' min walk</span>';
        }

        stepDiv.innerHTML =
            '<div class="route-step-number">' + (index + 1) + '</div>' +
            '<div class="route-step-icon">' + loc.icon + '</div>' +
            '<div class="route-step-info">' +
              '<strong>' + loc.name + '</strong>' +
              '<div class="route-step-time"><i class="fa-regular fa-clock"></i> View: ' + viewTime + ' min</div>' +
            '</div>' +
            walkInfo;

        container.appendChild(stepDiv);
    });

    document.getElementById('total-walk-time').textContent = totalWalkTime;
    document.getElementById('total-view-time').textContent = totalViewTime;
    document.getElementById('total-duration').textContent = totalWalkTime + totalViewTime;
}

// ========== ROUTE MAP DRAWING ==========
// KEY FIX: coords in data.js live in a 1000×600 logical space.
// The canvas is physically smaller. We must SCALE every coord so it
// maps into the actual canvas pixel dimensions — otherwise markers
// whose logical x > canvas.width or y > canvas.height are invisible.

function drawRouteMap() {
    const canvas = document.getElementById('route-map');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Use device pixel ratio for sharp rendering on retina screens
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayW = canvas.offsetWidth || 800;
    const displayH = Math.round(displayW * (350 / 800)); // keep 800:350 ratio

    canvas.width  = displayW * dpr;
    canvas.height = displayH * dpr;
    canvas.style.width  = displayW + 'px';
    canvas.style.height = displayH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const W = displayW;
    const H = displayH;

    // --- Scale factor: logical 1000×600 → canvas W×H ---
    const PAD = 36; // padding so markers at edges aren't clipped
    const scaleX = (W - PAD * 2) / LOGICAL_W;
    const scaleY = (H - PAD * 2) / LOGICAL_H;

    function toCanvas(lx, ly) {
        return {
            x: PAD + lx * scaleX,
            y: PAD + ly * scaleY
        };
    }

    // ── Background ──
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#2d5a27');
    bg.addColorStop(1, '#4a7c42');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle grid lines for depth
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let x = PAD; x < W - PAD; x += (W - PAD * 2) / 8) {
        ctx.beginPath(); ctx.moveTo(x, PAD); ctx.lineTo(x, H - PAD); ctx.stroke();
    }
    for (let y = PAD; y < H - PAD; y += (H - PAD * 2) / 6) {
        ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke();
    }

    // ── Empty state ──
    if (currentRoute.length === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '500 14px DM Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Select locations to see your route', W / 2, H / 2);
        return;
    }

    // ── Route path ──
    // Shadow under path
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    ctx.setLineDash([10, 6]);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    currentRoute.forEach(function(loc, i) {
        const p = toCanvas(loc.coords.x, loc.coords.y);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.restore();

    // ── Draw all locations as faint ghost markers so user can see the whole map ──
    const allLocs = getAllLocations();
    allLocs.forEach(function(loc) {
        if (!loc.coords) return;
        const p = toCanvas(loc.coords.x, loc.coords.y);
        const isInRoute = currentRoute.some(function(r) { return r.id === loc.id; });
        if (isInRoute) return; // drawn properly below

        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fill();
    });

    // ── Draw route markers ──
    currentRoute.forEach(function(loc, index) {
        if (!loc.coords) return;
        const p = toCanvas(loc.coords.x, loc.coords.y);
        const isAnimal = zooData.animals.some(function(a) { return a.id === loc.id; });
        const markerColor = isAnimal ? '#c89b3c' : '#2176ae';

        // Outer glow ring
        ctx.beginPath();
        ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fill();

        // Main marker circle with shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = markerColor;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();

        // Number label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold ' + (index + 1 > 9 ? '11' : '13') + 'px DM Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(index + 1, p.x, p.y);

        // Location name label below marker
        const label = loc.name.length > 12 ? loc.name.substring(0, 11) + '…' : loc.name;
        const labelY = p.y + 22;

        // Label background pill
        const labelW = ctx.measureText(label).width + 12;
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        // Manual rounded rect for label bg
        const lx = p.x - labelW / 2;
        const ly = labelY - 8;
        const lh = 16;
        const lr = 4;
        ctx.beginPath();
        ctx.moveTo(lx + lr, ly);
        ctx.lineTo(lx + labelW - lr, ly);
        ctx.quadraticCurveTo(lx + labelW, ly, lx + labelW, ly + lr);
        ctx.lineTo(lx + labelW, ly + lh - lr);
        ctx.quadraticCurveTo(lx + labelW, ly + lh, lx + labelW - lr, ly + lh);
        ctx.lineTo(lx + lr, ly + lh);
        ctx.quadraticCurveTo(lx, ly + lh, lx, ly + lh - lr);
        ctx.lineTo(lx, ly + lr);
        ctx.quadraticCurveTo(lx, ly, lx + lr, ly);
        ctx.closePath();
        ctx.fill();

        // Label text
        ctx.fillStyle = '#fff';
        ctx.font = '500 10px DM Sans, sans-serif';
        ctx.fillText(label, p.x, labelY);
    });

    // ── Legend ──
    ctx.setLineDash([]);
    const legends = [
        { color: '#c89b3c', label: 'Animal' },
        { color: '#2176ae', label: 'Place'  }
    ];
    legends.forEach(function(item, i) {
        const lx = W - 90;
        const ly = 12 + i * 18;
        ctx.beginPath();
        ctx.arc(lx, ly + 5, 5, 0, Math.PI * 2);
        ctx.fillStyle = item.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.font = '500 10px DM Sans, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.label, lx + 9, ly + 5);
    });
}

// ========== SAVE/LOAD PLANS ==========
function saveCurrentPlan() {
    const planName = document.getElementById('plan-name').value.trim() || 'My Zoo Visit';
    const visitDate = document.getElementById('visit-date').value || new Date().toISOString().split('T')[0];
    const visitorCount = parseInt(document.getElementById('visitor-count').value) || 2;
    const notes = document.getElementById('notes').value.trim();

    const plan = {
        id: Date.now(),
        name: planName,
        date: visitDate,
        visitors: visitorCount,
        notes: notes,
        locations: selectedLocations.map(function(l) { return l.id; }),
        route: currentRoute.map(function(l) { return l.id; }),
        created: new Date().toISOString()
    };

    let plans = JSON.parse(localStorage.getItem('zooPlans') || '[]');
    plans.push(plan);
    localStorage.setItem('zooPlans', JSON.stringify(plans));

    // Show success without blocking alert
    const btn = document.querySelector('[onclick="saveCurrentPlan()"]');
    if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
        btn.style.background = 'var(--green-light)';
        setTimeout(function() {
            btn.innerHTML = orig;
            btn.style.background = '';
        }, 2000);
    }

    loadSavedPlans();
}

function loadSavedPlans() {
    const container = document.getElementById('saved-plans-list');
    if (!container) return;

    const plans = JSON.parse(localStorage.getItem('zooPlans') || '[]');
    container.innerHTML = '';

    if (plans.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px; color:var(--text-secondary);">No saved plans yet. Generate a route and save it!</p>';
        return;
    }

    plans.slice().reverse().forEach(function(plan) {
        const planDiv = document.createElement('div');
        planDiv.className = 'saved-plan-item';

        const date = new Date(plan.date).toLocaleDateString('en-ZA', { year:'numeric', month:'short', day:'numeric' });

        planDiv.innerHTML =
            '<div class="saved-plan-info">' +
              '<h4>' + plan.name + '</h4>' +
              '<p>' +
                '<span><i class="fa-regular fa-calendar"></i> ' + date + '</span>' +
                '<span><i class="fa-solid fa-users"></i> ' + plan.visitors + ' visitors</span>' +
                '<span><i class="fa-solid fa-location-dot"></i> ' + plan.locations.length + ' stops</span>' +
              '</p>' +
              (plan.notes ? '<small><i class="fa-regular fa-note-sticky"></i> ' + plan.notes + '</small>' : '') +
            '</div>' +
            '<div class="saved-plan-actions">' +
              '<button class="btn-load" onclick="loadPlan(' + plan.id + ')"><i class="fa-solid fa-upload"></i> Load</button>' +
              '<button class="btn-delete" onclick="deletePlan(' + plan.id + ')"><i class="fa-solid fa-trash"></i></button>' +
            '</div>';

        container.appendChild(planDiv);
    });
}

function loadPlan(planId) {
    const plans = JSON.parse(localStorage.getItem('zooPlans') || '[]');
    const plan = plans.find(function(p) { return p.id === planId; });

    if (!plan) return;

    selectedLocations = plan.locations
        .map(function(id) { return getLocationById(id); })
        .filter(function(l) { return !!l; });

    if (plan.route && plan.route.length) {
        currentRoute = plan.route
            .map(function(id) { return getLocationById(id); })
            .filter(function(l) { return !!l; });
    }

    document.getElementById('plan-name').value = plan.name;
    document.getElementById('visit-date').value = plan.date;
    document.getElementById('visitor-count').value = plan.visitors;
    document.getElementById('notes').value = plan.notes || '';

    displayLocationGrid('all');
    switchPlannerTab('select', document.getElementById('tab-btn-select'));
}

function deletePlan(planId) {
    if (!confirm('Delete this plan?')) return;
    let plans = JSON.parse(localStorage.getItem('zooPlans') || '[]');
    plans = plans.filter(function(p) { return p.id !== planId; });
    localStorage.setItem('zooPlans', JSON.stringify(plans));
    loadSavedPlans();
}

// Redraw route map if window resizes (canvas needs new dimensions)
window.addEventListener('resize', function() {
    if (document.getElementById('route-tab') &&
        document.getElementById('route-tab').classList.contains('active')) {
        drawRouteMap();
    }
});