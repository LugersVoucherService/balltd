const state = {
    my: {
        items: [],
        gems: 0,
        coins: 0,
        robux: 0
    },
    their: {
        items: [],
        gems: 0,
        coins: 0,
        robux: 0
    },
    activeSelector: null,
    allFilteredItems: []
};

let modal, modalList, searchInput;
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    modal = document.getElementById('item-selector-modal');
    modalList = document.getElementById('modal-items-list');
    searchInput = document.getElementById('item-search');
    
    if (units && units.length > 0) {
        initializeApp();
    } else {
        window.addEventListener('unitsLoaded', initializeApp, { once: true });
    }
});

function initializeApp() {
    setupEventListeners();
    state.allFilteredItems = units;
    renderModalItems(units);
    
    const getImageBasePath = () => {
        const path = window.location.pathname;
        if (path.includes('/src/')) {
            return '../src/';
        }
        return 'src/';
    };
    const imageBasePath = getImageBasePath();
    
    const myTotalEl = document.getElementById('my-total-value');
    const theirTotalEl = document.getElementById('their-total-value');
    if (myTotalEl) {
        myTotalEl.innerHTML = `<img src="${imageBasePath}images/gems.png" alt="Gems" class="currency-icon">0`;
    }
    if (theirTotalEl) {
        theirTotalEl.innerHTML = `<img src="${imageBasePath}images/gems.png" alt="Gems" class="currency-icon">0`;
    }
    
    updateCalculations();
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeItemSelector();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeItemSelector();
        }
    });
}

function setupEventListeners() {
    const debouncedSearch = debounce((e) => {
        const term = e.target.value.toLowerCase().trim();
        if (term === '') {
            state.allFilteredItems = units;
            renderModalItems(units);
            return;
        }
        
        const filtered = units.filter(u => 
            u.name.toLowerCase().includes(term) ||
            u.category.toLowerCase().includes(term)
        );
        
        state.allFilteredItems = filtered;
        renderModalItems(filtered);
    }, 150);
    
    searchInput.addEventListener('input', debouncedSearch);

    ['my', 'their'].forEach(side => {
        ['gems', 'coins', 'robux'].forEach(currency => {
            const input = document.getElementById(`${side}-${currency}`);
            if (input) {
                input.addEventListener('input', (e) => {
                    const value = e.target.value.trim();
                    state[side][currency] = parseAbbreviation(value);
                    updateCalculations();
                });
            }
        });
    });
}

function openItemSelector(side) {
    state.activeSelector = side;
    modal.classList.add('active');
    searchInput.value = '';
    state.allFilteredItems = units;
    renderModalItems(units);
    setTimeout(() => searchInput.focus(), 100);
}

function closeItemSelector() {
    modal.classList.remove('active');
    state.activeSelector = null;
    searchInput.value = '';
}

function renderModalItems(items, append = false) {
    if (!modalList) return;
    
    if (!append) {
        modalList.innerHTML = '';
    }
    
    if (items.length === 0) {
        modalList.innerHTML = '<div class="empty-results">No items found</div>';
        return;
    }
    
    const fragment = document.createDocumentFragment();
    const itemsPerBatch = 50;
    let currentBatch = 0;
    
    function renderBatch() {
        const start = currentBatch * itemsPerBatch;
        const end = Math.min(start + itemsPerBatch, items.length);
        
        for (let i = start; i < end; i++) {
            const item = items[i];
            const card = createItemCard(item, false);
            fragment.appendChild(card);
        }
        
        modalList.appendChild(fragment);
        currentBatch++;
        
        if (end < items.length) {
            requestAnimationFrame(renderBatch);
        }
    }
    
    renderBatch();
}

function createItemCard(item, isInTrade = false, side = null, uniqueId = null) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.setAttribute('data-item-id', item.id);
    
    if (!isInTrade) {
        card.onclick = (e) => {
            e.stopPropagation();
            selectItem(item.id);
        };
        card.style.cursor = 'pointer';
    }
    
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
    
    const imageSrc = item.image || '';
    const valueDisplay = formatRange(item);
    const itemName = escapeHtml(item.name || 'Unknown');
    const categoryName = !isInTrade ? escapeHtml(formatCategoryName(item.category)) : '';
    const getImageBasePath = () => {
        const path = window.location.pathname;
        if (path.includes('/src/')) {
            return '../src/';
        }
        return 'src/';
    };
    const imageBasePath = getImageBasePath();
    
    card.innerHTML = `
        ${isInTrade ? `
            <button class="remove-item" onclick="removeItem('${side}', ${uniqueId}); event.stopPropagation();">
                <i class="fa-solid fa-xmark"></i>
            </button>
        ` : ''}
        <div class="item-image-wrapper">
            <img src="${imageSrc}" 
                 alt="${itemName}" 
                 loading="lazy" 
                 onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMzM4MSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjY2NzEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='"
                 class="item-image">
        </div>
        <div class="item-name" title="${itemName}">${itemName}</div>
        ${categoryName ? `<div class="item-category">${categoryName}</div>` : ''}
        <div class="item-value">
            <img src="${imageBasePath}images/gems.png" alt="Gems" class="currency-icon-small">
            <span>${escapeHtml(valueDisplay)}</span>
        </div>
    `;
    
    return card;
}

function formatCategoryName(category) {
    return category
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

function selectItem(itemId) {
    if (!state.activeSelector) return;

    const item = units.find(u => u.id === itemId);
    if (item) {
        state[state.activeSelector].items.push({
            ...item,
            uniqueId: Date.now() + Math.random()
        });

        renderSideItems(state.activeSelector);
        updateCalculations();
        closeItemSelector();
    }
}

function removeItem(side, uniqueId) {
    state[side].items = state[side].items.filter(i => i.uniqueId !== uniqueId);
    renderSideItems(side);
    updateCalculations();
}

function renderSideItems(side) {
    const container = document.getElementById(`${side}-items-container`);
    if (!container) return;
    
    const items = state[side].items;

    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-plus"></i>
                <p>Add Items</p>
            </div>
        `;
        return;
    }

    const fragment = document.createDocumentFragment();
    items.forEach(item => {
        const card = createItemCard(item, true, side, item.uniqueId);
        fragment.appendChild(card);
    });
    
    container.innerHTML = '';
    container.appendChild(fragment);
}

function updateCalculations() {
    const myTotal = calculateSideValue('my');
    const theirTotal = calculateSideValue('their');
    const myTotalEl = document.getElementById('my-total-value');
    const theirTotalEl = document.getElementById('their-total-value');
    
    const getImageBasePath = () => {
        const path = window.location.pathname;
        if (path.includes('/src/')) {
            return '../src/';
        }
        return 'src/';
    };
    const imageBasePath = getImageBasePath();
    
    if (myTotalEl) {
        myTotalEl.innerHTML = `<img src="${imageBasePath}images/gems.png" alt="Gems" class="currency-icon">${formatNumber(myTotal)}`;
    }
    if (theirTotalEl) {
        theirTotalEl.innerHTML = `<img src="${imageBasePath}images/gems.png" alt="Gems" class="currency-icon">${formatNumber(theirTotal)}`;
    }

    const diff = myTotal - theirTotal;
    const diffEl = document.getElementById('value-difference');
    if (diffEl) {
        if (Math.abs(diff) < 1) {
            diffEl.textContent = '0';
        } else {
            const formattedDiff = formatNumber(Math.abs(diff));
            diffEl.textContent = `${diff > 0 ? '+' : diff < 0 ? '-' : ''}${formattedDiff}`;
        }
    }

    const resultDisplay = document.getElementById('trade-result');
    if (!resultDisplay) return;
    
    const resultText = resultDisplay.querySelector('.status-text');
    const resultSub = resultDisplay.querySelector('.status-subtext');

    let status = 'Fair';
    let color = 'var(--primary)';
    let sub = 'Fair trade';

    if (myTotal === 0 && theirTotal === 0) {
        status = 'Waiting...';
        sub = 'Add items to calculate';
        color = 'var(--text-muted)';
    } else {
        const ratio = myTotal / (theirTotal || 1);
        const getAvgDemand = (items) => {
            if (!items || items.length === 0) return null;
            const demands = items
                .map(i => (i.demand || '').toLowerCase())
                .filter(d => d && d !== 'unknown');
            if (demands.length === 0) return null;
            
            const demandLevels = {
                'poor': 1, 'low': 2, 'below': 3, 'normal': 4,
                'above': 5, 'great': 6, 'godly': 7, 'supreme': 8
            };
            const avg = demands.reduce((sum, d) => {
                for (const [key, val] of Object.entries(demandLevels)) {
                    if (d.includes(key)) return sum + val;
                }
                return sum + 4;
            }, 0) / demands.length;
            return avg;
        };
        
        const myDemand = getAvgDemand(state.my.items);
        const theirDemand = getAvgDemand(state.their.items);
        
        const getDemandText = (demand) => {
            if (!demand) return '';
            if (demand < 3) return ' (low demand)';
            if (demand < 5) return ' (normal demand)';
            return ' (high demand)';
        };

        const getDemandLabel = (demand) => {
            if (!demand) return null;
            if (demand < 3) return 'low demand';
            if (demand >= 6) return 'high demand';
            return 'stable demand';
        };

        if (ratio > 1.5) {
            status = 'Big L';
            color = 'var(--danger)';
            const theirLabel = getDemandLabel(theirDemand);
            sub = theirLabel ? `Overpaying (they have ${theirLabel})` : 'Overpaying significantly';
        } else if (ratio > 1.1) {
            status = 'Small L';
            color = 'var(--warning)';
            const theirLabel = getDemandLabel(theirDemand);
            sub = theirLabel ? `Slightly over (${theirLabel})` : 'Slightly over';
        } else if (ratio < 0.5) {
            status = 'Big W';
            color = 'var(--success)';
            const myLabel = getDemandLabel(myDemand);
            sub = myLabel ? `Huge win (you get ${myLabel})` : 'Huge win';
        } else if (ratio < 0.9) {
            status = 'Small W';
            color = 'var(--success)';
            const myLabel = getDemandLabel(myDemand);
            sub = myLabel ? `Good deal (${myLabel})` : 'Good deal';
        } else if (ratio >= 0.95 && ratio <= 1.05) {
            status = 'Fair';
            color = 'var(--primary)';
            sub = 'Fair trade';
        } else {
            status = ratio > 1 ? 'Small L' : 'Small W';
            color = ratio > 1 ? 'var(--warning)' : 'var(--success)';
            sub = ratio > 1 ? 'Slightly over' : 'Slight win';
        }
    }

    if (resultText) {
        resultText.textContent = status;
        resultText.style.color = color;
    }
    if (resultSub) {
        resultSub.textContent = sub;
    }
    resultDisplay.style.borderColor = color;
    resultDisplay.style.boxShadow = `0 0 20px ${color}40`;
}

function calculateSideValue(side) {
    const s = state[side];
    let total = 0;

    s.items.forEach(item => {
        if (typeof item.value_avg === "number") {
            total += item.value_avg;
        }
    });

    if (typeof currencyRates !== 'undefined') {
        total += s.gems * currencyRates.gems;
        total += s.coins * currencyRates.coins;
        total += s.robux * currencyRates.robux;
    } else {
        total += s.gems;
        total += s.coins * 0.00001;
        total += s.robux * 0.1;
    }

    return total;
}

function formatNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    let result;
    if (num >= 1_000_000_000) {
        result = (num / 1_000_000_000).toFixed(2) + "B";
    } else if (num >= 1_000_000) {
        result = (num / 1_000_000).toFixed(2) + "M";
    } else if (num >= 1_000) {
        result = (num / 1_000).toFixed(2) + "k";
    } else {
        return Math.floor(num).toString();
    }
    return result.replace(/\.00([BkM])/g, '$1').replace(/\.0([BkM])/g, '$1');
}

function parseAbbreviation(value) {
    if (!value || typeof value !== 'string') return 0;
    
    value = value.trim().toLowerCase();
    const numPart = parseFloat(value);
    if (isNaN(numPart)) return 0;
    
    if (value.endsWith('b')) return numPart * 1_000_000_000;
    if (value.endsWith('m')) return numPart * 1_000_000;
    if (value.endsWith('k')) return numPart * 1_000;
    
    return numPart;
}

function formatRange(item) {
    if (!item) return '0';
    if (item.value_min === "O/C" || item.value_max === "O/C") {
        return "O/C";
    }
    if (typeof item.value_min === "number" && typeof item.value_max === "number") {
        if (item.value_min === item.value_max) {
            return formatNumber(item.value_min);
        }
        return `${formatNumber(item.value_min)} – ${formatNumber(item.value_max)}`;
    }
    return '0';
}

window.openItemSelector = openItemSelector;
window.closeItemSelector = closeItemSelector;
window.selectItem = selectItem;
window.removeItem = removeItem;