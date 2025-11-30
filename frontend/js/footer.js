// Shared footer component - can be included on all pages
function renderFooter() {
    return `
        <footer>
            <div class="footer-content">
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul class="footer-links">
                        <li><a href="../index.html">Home</a></li>
                        <li><a href="calculator.html">Calculator</a></li>
                        <li><a href="values.html">Values</a></li>
                        <li><a href="conversions.html">Conversions</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Community</h4>
                    <ul class="footer-links">
                        <li><a href="YOUR_DISCORD_SERVER_LINK" target="_blank"><i class="fab fa-discord"></i> Discord</a></li>
                        <li><a href="YOUR_ROBLOX_GAME_LINK" target="_blank"><i class="fas fa-gamepad"></i> Roblox Game</a></li>
                        <li><a href="YOUR_ROBLOX_GROUP_LINK" target="_blank"><i class="fas fa-users"></i> Group</a></li>
                        <li><a href="YOUR_ROBLOX_PROFILE_LINK" target="_blank"><i class="fas fa-user"></i> Profile</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Resources</h4>
                    <ul class="footer-links">
                        <li><a href="https://sites.google.com/view/gggballtdvalues/home?authuser=0" target="_blank">GGG Values</a></li>
                        <li><a href="https://sites.google.com/view/ball-td-tower-values-dps-list/damage-per-second-list/dps-omega?authuser=0" target="_blank">DPS List</a></li>
                        <li><a href="credits.html">Credits</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>Ball TD Trade Calculator © 2024 | Made by <a href="https://discord.com/users/YOUR_DISCORD_ID" target="_blank">88</a></p>
            </div>
        </footer>
    `;
}

// Function to get logo HTML based on page location
function getLogoHTML() {
    const isRoot = !window.location.pathname.includes('/src/');
    const discordLink = 'https://discord.com/users/YOUR_DISCORD_ID';
    
    return `
        <div class="logo">
            <a href="${discordLink}" target="_blank">
                <i class="fa-solid fa-calculator"></i>
                <span>Ball TD <small>(made by 88)</small></span>
            </a>
        </div>
    `;
}
