// Currency conversion rates (to gems equivalent)
// Based on conversion table: ~90-110x multiplier for gems/coins on higher difficulties
const currencyRates = {
    gems: 1,
    coins: 0.01,  // 1 coin = 0.01 gems (100 coins = 1 gem approximately)
    robux: 0.1    // 1 robux = 0.1 gems (approximate)
};

const categories = [
    "legendaries",
    "shinylegendarys",
    "mythics",
    "shinymythics",
    "transcendents",
    "shinytranscendents",
    "omegas",
    "shinyomegas",
    "page",
    "shinypage"
];

// Get base path dynamically - more reliable approach
function getBasePath() {
    // Try to find the script tag loading this file
    const scripts = Array.from(document.getElementsByTagName('script'));
    for (let script of scripts) {
        const src = script.getAttribute('src');
        if (!src || !src.includes('data.js')) continue;
        
        // Check if it's a relative path starting with ../
        if (src.startsWith('../js/data.js')) {
            return '../';
        }
        // Check if it's a relative path in same directory
        if (src === 'js/data.js' || src.startsWith('./js/data.js')) {
            return './';
        }
        // Check if it's in src directory
        if (src.includes('/src/') || src.includes('src/')) {
            return '../';
        }
    }
    
    // Fallback: detect based on current page location
    const path = window.location.pathname || window.location.href;
    if (path.includes('/src/') || path.includes('src/')) {
        return '../';
    }
    
    // Default to current directory
    return './';
}

// Optimized parallel loading
async function loadUnits() {
    try {
        const basePath = getBasePath();
        console.log('Loading units from base path:', basePath);
        
        // Load all JSON files in parallel for much better performance
        const fetchPromises = categories.map(cat => {
            const url = `${basePath}data/${cat}.json`;
            return fetch(url)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                    }
                    const contentType = res.headers.get('content-type');
                    if (!contentType || !contentType.includes('application/json')) {
                        throw new Error(`Invalid content type: ${contentType}`);
                    }
                    return res.json();
                })
                .then(data => ({ cat, data }))
                .catch(err => {
                    console.error(`Failed to load ${cat}.json from ${url}:`, err);
                    return { cat, data: [] };
                });
        });

        const results = await Promise.all(fetchPromises);
        const all = [];

        results.forEach(({ cat, data }) => {
            if (!Array.isArray(data)) {
                console.warn(`${cat}.json did not return an array:`, data);
                return;
            }
            
            data.forEach(u => {
                // Skip invalid entries
                if (!u || !u.name || u.name === "Unknown") {
                    return;
                }

                // Generate ID (unique per item name + category)
                u.id = `${cat}-${u.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}`;

                // Attach category for UI grouping
                u.category = cat;

                // Compute average trade value
                if (typeof u.value_min === "number" && typeof u.value_max === "number") {
                    u.value_avg = (u.value_min + u.value_max) / 2;
                } else if (u.value_min === "O/C" || u.value_max === "O/C") {
                    u.value_avg = 999999999; // Very high value for O/C items
                } else {
                    u.value_avg = 0;
                }

                // Normalize demand and status
                if (u.demand && typeof u.demand === 'string') {
                    u.demand = u.demand.split(' ')[0]; // Take first word if multiple
                }
                if (u.status && typeof u.status === 'string') {
                    u.status = u.status.split(' ')[0];
                }

                all.push(u);
            });
        });

        // Sort by value for better UX
        all.sort((a, b) => b.value_avg - a.value_avg);

        console.log(`Successfully loaded ${all.length} units from ${results.filter(r => r.data.length > 0).length}/${categories.length} categories`);
        return all;
    } catch (error) {
        console.error("Error loading units:", error);
        return [];
    }
}

// Load all units globally
let units = [];
let unitsLoaded = false;
let unitsLoading = false;

// Load units once
if (!unitsLoading) {
    unitsLoading = true;
    loadUnits().then(data => {
        units = data;
        unitsLoaded = true;
        unitsLoading = false;
        console.log("Loaded", units.length, "units total");
        
        // Dispatch event when units are loaded
        window.dispatchEvent(new CustomEvent('unitsLoaded', { detail: units }));
    }).catch(err => {
        console.error("Fatal error loading units:", err);
        unitsLoading = false;
    });
}