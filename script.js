// script.js - Enhanced with Animal Icons

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
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 12px 20px;
            border-radius: 30px;
            font-size: 14px;
            pointer-events: none;
            display: none;
            z-index: 1000;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            border: 2px solid white;
            white-space: nowrap;
            font-family: Arial, sans-serif;
        `;
        document.body.appendChild(tooltip);
    }
}

function drawBeautifulMap(ctx) {
    const canvas = ctx.canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);
    
    // Draw sun
    ctx.beginPath();
    ctx.arc(850, 80, 50, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = '#FFA500';
    ctx.shadowBlur = 30;
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Draw clouds
    drawCloud(ctx, 200, 100);
    drawCloud(ctx, 500, 150);
    drawCloud(ctx, 700, 80);
    
    // Draw ground gradient
    const groundGradient = ctx.createLinearGradient(0, canvas.height * 0.5, 0, canvas.height);
    groundGradient.addColorStop(0, '#7CB342');
    groundGradient.addColorStop(0.7, '#5D8C2B');
    groundGradient.addColorStop(1, '#3D5A1F');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, canvas.height * 0.5, canvas.width, canvas.height * 0.5);
    
    // Draw path network
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    
    // Main path
    ctx.beginPath();
    ctx.strokeStyle = '#C1A06B';
    ctx.lineWidth = 25;
    ctx.moveTo(100, 500);
    ctx.lineTo(300, 350);
    ctx.lineTo(500, 250);
    ctx.lineTo(700, 200);
    ctx.lineTo(900, 300);
    ctx.stroke();
    
    // Secondary paths
    ctx.strokeStyle = '#A67B5B';
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.moveTo(200, 400);
    ctx.lineTo(400, 450);
    ctx.lineTo(600, 400);
    ctx.lineTo(800, 450);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
    
    // Draw river
    ctx.beginPath();
    ctx.strokeStyle = '#4FC3F7';
    ctx.lineWidth = 40;
    ctx.moveTo(0, 300);
    ctx.lineTo(250, 280);
    ctx.lineTo(400, 300);
    ctx.lineTo(550, 280);
    ctx.lineTo(700, 300);
    ctx.lineTo(850, 280);
    ctx.lineTo(1000, 300);
    ctx.stroke();
    
    // Add river sparkles
    ctx.fillStyle = 'white';
    for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(100 + i * 50, 290 + Math.sin(i) * 10, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fill();
    }
    
    // Draw trees
    drawTree(ctx, 50, 400);
    drawTree(ctx, 150, 550);
    drawTree(ctx, 350, 500);
    drawTree(ctx, 650, 450);
    drawTree(ctx, 850, 550);
    drawTree(ctx, 950, 400);
}

function drawCloud(ctx, x, y) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(255,255,255,0.5)';
    
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.arc(x + 35, y - 10, 35, 0, Math.PI * 2);
    ctx.arc(x + 70, y, 30, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
}

function drawTree(ctx, x, y) {
    // Trunk
    ctx.fillStyle = '#8B5A2B';
    ctx.fillRect(x - 10, y - 40, 20, 60);
    
    // Leaves
    ctx.fillStyle = '#2E7D32';
    ctx.beginPath();
    ctx.arc(x, y - 50, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - 15, y - 65, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 15, y - 65, 20, 0, Math.PI * 2);
    ctx.fill();
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
        
        // Draw label
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.fillText(loc.name, loc.coords.x, loc.coords.y - 45);
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
            tooltip.style.left = (event.pageX + 20) + 'px';
            tooltip.style.top = (event.pageY - 50) + 'px';
            
            const isAnimal = zooData.animals.includes(loc);
            const type = isAnimal ? '🐾 Animal' : '📍 Attraction';
            
            tooltip.innerHTML = `
                <strong style="font-size: 16px;">${loc.icon} ${loc.name}</strong><br>
                <span style="font-size: 12px; color: #FFD700;">${type}</span><br>
                <span style="font-size: 12px;">${loc.description}</span>
            `;
            
            canvas.style.cursor = 'pointer';
            hovered = true;
            
            // Highlight the icon
            drawAllIcons(ctx); // This would need ctx reference
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