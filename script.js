// script.js - Enhanced with Animal Icons

// ── Compatibility helper: rounded rectangle (replaces ctx.roundRect) ──
function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y,     x + w, y + r,     r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x,     y + h, x,     y + h - r, r);
    ctx.lineTo(x,     y + r);
    ctx.arcTo(x,     y,     x + r, y,         r);
    ctx.closePath();
}


// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    // Check if we're on the map page (index.html)
    if (document.getElementById('interactive-map')) {
        initInteractiveMap();
    }
    
    // Initialize dark mode if toggle exists
    if (document.getElementById('dark-mode-toggle')) {
        initDarkMode();
    }
    
    // Initialize search if search input exists
    if (document.getElementById('search-input')) {
        initSearch();
    }
});

// ========== ENHANCED INTERACTIVE MAP WITH ANIMAL ICONS ==========
function initInteractiveMap() {
    const canvas = document.getElementById('interactive-map');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = 1000;
    canvas.height = 600;
    
    // Draw beautiful map background
    drawBeautifulMap(ctx);
    
    // Draw all animal and place icons
    drawAllIcons(ctx);
    
    // Add click event to canvas
    canvas.addEventListener('click', handleMapClick);
    
    // Add hover effect
    canvas.addEventListener('mousemove', handleMapHover);
    canvas.addEventListener('mouseout', () => {
        document.getElementById('map-tooltip').style.display = 'none';
    });
    
    // Create tooltip element if it doesn't exist
    if (!document.getElementById('map-tooltip')) {
        const tooltip = document.createElement('div');
        tooltip.id = 'map-tooltip';
        tooltip.style.cssText = `
            position: fixed;
            background: rgba(30, 50, 28, 0.96);
            color: white;
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 13px;
            pointer-events: none;
            display: none;
            z-index: 10000;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            border: 1.5px solid rgba(111,170,94,0.5);
            max-width: 200px;
            word-wrap: break-word;
            font-family: 'DM Sans', Arial, sans-serif;
            line-height: 1.4;
        `;
        document.body.appendChild(tooltip);
    }
}

function drawBeautifulMap(ctx) {
    // All coordinates are in 1000x600 logical space

    // ── Background: lush green park ──
    const bgGrad = ctx.createLinearGradient(0, 0, 1000, 600);
    bgGrad.addColorStop(0,   '#5a9e4a');
    bgGrad.addColorStop(0.5, '#4e9140');
    bgGrad.addColorStop(1,   '#3d7a32');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1000, 600);

    // ── Grass texture patches (lighter/darker) ──
    const grassPatches = [
        {x:0,   y:0,   w:300, h:200, c:'rgba(255,255,255,0.04)'},
        {x:600, y:100, w:400, h:200, c:'rgba(0,0,0,0.05)'},
        {x:100, y:350, w:350, h:250, c:'rgba(255,255,255,0.03)'},
        {x:550, y:350, w:450, h:250, c:'rgba(0,0,0,0.04)'},
    ];
    grassPatches.forEach(p => {
        ctx.fillStyle = p.c;
        ctx.fillRect(p.x, p.y, p.w, p.h);
    });

    // ── Lake (central) ──
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(500, 300, 130, 75, -0.15, 0, Math.PI * 2);
    const lakeGrad = ctx.createRadialGradient(490, 290, 10, 500, 300, 130);
    lakeGrad.addColorStop(0,   '#5bc8f5');
    lakeGrad.addColorStop(0.6, '#29a8d8');
    lakeGrad.addColorStop(1,   '#1a7fa8');
    ctx.fillStyle = lakeGrad;
    ctx.fill();
    // Lake shimmer
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.ellipse(490 + i*6, 288 + i*4, 30 - i*4, 6 - i, -0.1, 0, Math.PI);
        ctx.stroke();
    }
    // Lake border
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(500, 300, 130, 75, -0.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // ── Sandy paths network ──
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Path shadow
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 28;
    drawPathNetwork(ctx);

    // Path fill
    ctx.strokeStyle = '#d4b483';
    ctx.lineWidth = 22;
    drawPathNetwork(ctx);

    // Path centre line (lighter)
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 8;
    ctx.setLineDash([20, 14]);
    drawPathNetwork(ctx);
    ctx.setLineDash([]);

    // ── Zoo entrance arch at bottom-centre ──
    ctx.save();
    ctx.strokeStyle = '#8B5E3C';
    ctx.lineWidth = 6;
    ctx.fillStyle = '#a0714a';
    ctx.beginPath();
    roundRect(ctx, 455, 555, 90, 45, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ENTRANCE', 500, 582);
    ctx.restore();

    // ── Decorative trees / bushes ──
    const treePositions = [
        {x:30,  y:80},  {x:80,  y:160}, {x:30,  y:280},
        {x:960, y:100}, {x:940, y:220}, {x:970, y:360},
        {x:120, y:490}, {x:200, y:555}, {x:820, y:510},
        {x:900, y:555}, {x:480, y:70},  {x:560, y:60},
        {x:30,  y:470}, {x:970, y:470},
    ];
    treePositions.forEach(t => drawMapTree(ctx, t.x, t.y));

    // ── Zone labels (subtle background tints) ──
    const zones = [
        {x:50,  y:30,  w:280, h:200, label:'NORTH AFRICA',   c:'rgba(200,160,80,0.08)'},
        {x:670, y:30,  w:300, h:220, label:'ASIA ZONE',      c:'rgba(80,160,80,0.08)'},
        {x:50,  y:370, w:260, h:200, label:'AFRICA WILD',    c:'rgba(160,80,40,0.08)'},
        {x:700, y:350, w:280, h:220, label:'DISCOVERY ZONE', c:'rgba(60,120,180,0.08)'},
    ];
    zones.forEach(z => {
        ctx.fillStyle = z.c;
        ctx.beginPath();
        roundRect(ctx, z.x, z.y, z.w, z.h, 16);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(z.label, z.x + 12, z.y + 20);
    });
}

function drawPathNetwork(ctx) {
    // Main ring road around lake
    ctx.beginPath();
    ctx.moveTo(150, 80);
    ctx.bezierCurveTo(150, 50, 850, 50, 850, 80);
    ctx.bezierCurveTo(950, 80, 950, 520, 850, 540);
    ctx.bezierCurveTo(750, 570, 250, 570, 150, 540);
    ctx.bezierCurveTo(50, 520, 50, 80, 150, 80);
    ctx.stroke();

    // Cross paths through middle
    ctx.beginPath();
    ctx.moveTo(150, 80);
    ctx.lineTo(500, 220);
    ctx.lineTo(850, 80);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(150, 540);
    ctx.lineTo(500, 390);
    ctx.lineTo(850, 540);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(500, 220);
    ctx.lineTo(500, 390);
    ctx.stroke();

    // Entrance path
    ctx.beginPath();
    ctx.moveTo(500, 570);
    ctx.lineTo(500, 600);
    ctx.stroke();
}

function drawMapTree(ctx, x, y) {
    // Shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(x + 4, y + 4, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Trunk
    ctx.fillStyle = '#7a5030';
    ctx.fillRect(x - 4, y - 16, 8, 22);
    // Canopy layers
    const shades = ['#2d6e22', '#3a8a2a', '#4aa035'];
    shades.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(x, y - 18 - i * 10, 14 - i * 1, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.restore();
}

function drawCloud(ctx, x, y) {
    // kept for compatibility but not called in new map
}

function drawTree(ctx, x, y) {
    // kept for compatibility but not called in new map
}


function drawAllIcons(ctx) {
    const locations = getAllLocations();
    
    locations.forEach(loc => {
        const isAnimal = zooData.animals.includes(loc);
        
        // Draw icon background
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        
        // Draw platform/base
        ctx.beginPath();
        ctx.ellipse(loc.coords.x, loc.coords.y + 15, 20, 10, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fill();
        
        // Draw colored background circle
        ctx.beginPath();
        ctx.arc(loc.coords.x, loc.coords.y, 25, 0, Math.PI * 2);
        
        const gradient = ctx.createRadialGradient(
            loc.coords.x - 5, loc.coords.y - 5, 5,
            loc.coords.x, loc.coords.y, 30
        );
        
        if (isAnimal) {
            gradient.addColorStop(0, '#FFB74D');
            gradient.addColorStop(1, '#F57C00');
        } else {
            gradient.addColorStop(0, '#64B5F6');
            gradient.addColorStop(1, '#1976D2');
        }
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // White border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw animal/place emoji
        ctx.font = '35px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Android Emoji", "EmojiOne Color", "Twemoji Mozilla", sans-serif';
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(loc.icon, loc.coords.x, loc.coords.y - 2);
        
        // Draw label BELOW the pin with a backing pill for readability
        const labelText = loc.name;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const lw = ctx.measureText(labelText).width;
        const lx = loc.coords.x;
        const ly = loc.coords.y + 32;  // below the icon
        // Pill background
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(20,40,18,0.72)';
        ctx.beginPath();
        roundRect(ctx, lx - lw/2 - 5, ly - 2, lw + 10, 17, 6);
        ctx.fill();
        // Label text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(labelText, lx, ly);
    });
    
    ctx.shadowBlur = 0;
}

function handleMapClick(event) {
    const canvas = document.getElementById('interactive-map');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;
    
    // Check if clicked on any icon
    const locations = getAllLocations();
    const tolerance = 40; // pixels (larger for emoji icons)
    
    for (let loc of locations) {
        const distance = Math.sqrt(
            Math.pow(mouseX - loc.coords.x, 2) + 
            Math.pow(mouseY - loc.coords.y, 2)
        );
        
        if (distance < tolerance) {
            // Navigate to the page
            window.location.href = loc.page;
            return;
        }
    }
}

function handleMapHover(event) {
    const canvas = document.getElementById('interactive-map');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;
    
    // Check if hovering over any icon
    const locations = getAllLocations();
    const tolerance = 40; // pixels
    const tooltip = document.getElementById('map-tooltip');
    
    let hovered = false;
    
    for (let loc of locations) {
        const distance = Math.sqrt(
            Math.pow(mouseX - loc.coords.x, 2) + 
            Math.pow(mouseY - loc.coords.y, 2)
        );
        
        if (distance < tolerance) {
            // Show tooltip
            tooltip.style.display = 'block';
            const isAnimal = zooData.animals.includes(loc);
            const type = isAnimal ? 'Animal' : 'Attraction';
            
            tooltip.innerHTML =
                '<strong style="font-size:14px;display:block;margin-bottom:3px;">' + loc.name + '</strong>' +
                '<span style="font-size:11px;color:#a8d89a;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px;">' + type + '</span>' +
                '<span style="font-size:12px;color:rgba(255,255,255,.75);">' + loc.description + '</span>';

            // Smart positioning — keep inside viewport
            const tx = Math.min(event.clientX + 16, window.innerWidth  - 220);
            const ty = Math.max(event.clientY - 80,  10);
            tooltip.style.left = tx + 'px';
            tooltip.style.top  = ty + 'px';

            canvas.style.cursor = 'pointer';
            hovered = true;
            return;
        }
    }
    
    if (!hovered) {
        tooltip.style.display = 'none';
        canvas.style.cursor = 'default';
    }
}

// ========== DARK MODE ==========
function initDarkMode() {
    const toggle = document.getElementById('dark-mode-toggle');
    
    // Check for saved preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        toggle.checked = true;
    }
    
    toggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'false');
        }
        
        // Redraw map if it exists
        if (document.getElementById('interactive-map')) {
            const canvas = document.getElementById('interactive-map');
            const ctx = canvas.getContext('2d');
            drawBeautifulMap(ctx);
            drawAllIcons(ctx);
        }
    });
}

// ========== SEARCH ==========
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        
        const locations = getAllLocations();
        const matches = locations.filter(loc => 
            loc.name.toLowerCase().includes(query) ||
            loc.description.toLowerCase().includes(query)
        );
        
        if (matches.length > 0) {
            displaySearchResults(matches, searchResults);
        } else {
            searchResults.innerHTML = '<div class="search-result-item" style="padding:15px; text-align:center;">No results found</div>';
            searchResults.style.display = 'block';
        }
    });
    
    // Hide results when clicking outside
    document.addEventListener('click', function(event) {
        if (!searchInput.contains(event.target) && !searchResults.contains(event.target)) {
            searchResults.style.display = 'none';
        }
    });
}

function displaySearchResults(matches, container) {
    container.innerHTML = '';
    container.style.display = 'block';

    // icon map using Font Awesome classes
    const iconMap = {
        elephant: 'fa-solid fa-hippo', giraffe: 'fa-solid fa-horse-head',
        lion: 'fa-solid fa-cat', panda: 'fa-solid fa-paw',
        koala: 'fa-solid fa-paw', gorilla: 'fa-solid fa-paw',
        monkey: 'fa-solid fa-paw', gemsbok: 'fa-solid fa-horse',
        warthog: 'fa-solid fa-paw', amphitheatre: 'fa-solid fa-masks-theater',
        insect: 'fa-solid fa-bug', monkeytrail: 'fa-solid fa-person-hiking',
        lostforest: 'fa-solid fa-tree', mospizza: 'fa-solid fa-pizza-slice',
        dinezoo: 'fa-solid fa-utensils', wilshop: 'fa-solid fa-mug-hot'
    };

    matches.slice(0, 5).forEach(match => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        const faClass = iconMap[match.id] || 'fa-solid fa-paw';
        item.innerHTML = `
            <a href="${match.page}">
                <div class="sri-icon"><i class="${faClass}"></i></div>
                <div>
                    <strong>${match.name}</strong>
                    <small>${match.description}</small>
                </div>
            </a>
        `;
        container.appendChild(item);
    });
}

// ========== UTILITY FUNCTIONS ==========
function getAllLocations() {
    return [...zooData.animals, ...zooData.places];
}

function getLocationById(id) {
    return getAllLocations().find(loc => loc.id === id);
}