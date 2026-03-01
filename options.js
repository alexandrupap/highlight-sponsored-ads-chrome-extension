// Default colors
const DEFAULTS = {
    light: {
        textColor: '#000000',
        bgColor: '#FFC800',
        opacity: 25
    },
    dark: {
        textColor: '#FFC800',
        bgColor: '#000000',
        opacity: 25
    },
    theme: 'light'
};

// DOM elements
const themeToggle = document.getElementById('themeToggle');
const lightThemeSection = document.getElementById('lightThemeSection');
const darkThemeSection = document.getElementById('darkThemeSection');

// Light theme elements
const textColorLightPicker = document.getElementById('textColorLight');
const textColorLightHex = document.getElementById('textColorLightHex');
const bgColorLightPicker = document.getElementById('bgColorLight');
const bgColorLightHex = document.getElementById('bgColorLightHex');
const opacityLightSlider = document.getElementById('opacityLight');
const opacityLightValue = document.getElementById('opacityLightValue');

// Dark theme elements
const textColorDarkPicker = document.getElementById('textColorDark');
const textColorDarkHex = document.getElementById('textColorDarkHex');
const bgColorDarkPicker = document.getElementById('bgColorDark');
const bgColorDarkHex = document.getElementById('bgColorDarkHex');
const opacityDarkSlider = document.getElementById('opacityDark');
const opacityDarkValue = document.getElementById('opacityDarkValue');

const saveButton = document.getElementById('saveButton');
const resetButton = document.getElementById('resetButton');
const saveMessage = document.getElementById('saveMessage');
const previewAd = document.getElementById('previewAd');
const previewHeader = document.getElementById('previewHeader');

// Update preview
function updatePreview() {
    const isDark = themeToggle.checked;
    const textColor = isDark ? textColorDarkPicker.value : textColorLightPicker.value;
    const bgColor = isDark ? bgColorDarkPicker.value : bgColorLightPicker.value;
    const opacity = isDark ? opacityDarkSlider.value : opacityLightSlider.value;
    
    const opacityDecimal = opacity / 100;
    
    previewAd.style.backgroundColor = bgColor;
    previewAd.style.opacity = opacityDecimal;
    previewHeader.style.backgroundColor = bgColor;
    previewHeader.style.opacity = opacityDecimal;
    
    // Update all text elements in preview
    const allElements = previewAd.querySelectorAll('*');
    allElements.forEach(element => {
        element.style.color = textColor;
    });
    
    // Update header text color
    const headerElements = previewHeader.querySelectorAll('*');
    headerElements.forEach(element => {
        element.style.color = textColor;
    });
}

// Toggle theme sections
function toggleThemeSections() {
    const isDark = themeToggle.checked;
    if (isDark) {
        lightThemeSection.classList.add('hidden');
        darkThemeSection.classList.remove('hidden');
    } else {
        lightThemeSection.classList.remove('hidden');
        darkThemeSection.classList.add('hidden');
    }
    updatePreview();
}

// Sync color picker with hex input
function syncColorInputs(colorPicker, hexInput) {
    colorPicker.addEventListener('input', (e) => {
        hexInput.value = e.target.value;
        updatePreview();
    });
    
    hexInput.addEventListener('input', (e) => {
        let value = e.target.value;
        // Add # if missing
        if (!value.startsWith('#')) {
            value = '#' + value;
        }
        // Validate hex color
        if (/^#[0-9A-F]{6}$/i.test(value)) {
            colorPicker.value = value;
            updatePreview();
        }
    });
    
    hexInput.addEventListener('blur', (e) => {
        // Ensure proper format on blur
        let value = e.target.value;
        if (!value.startsWith('#')) {
            value = '#' + value;
        }
        if (!/^#[0-9A-F]{6}$/i.test(value)) {
            // Reset to current picker value if invalid
            hexInput.value = colorPicker.value;
        } else {
            hexInput.value = value.toUpperCase();
        }
    });
}

// Load saved settings
function loadSettings() {
    chrome.storage.sync.get([
        'theme',
        'textColorLight', 'bgColorLight', 'opacityLight',
        'textColorDark', 'bgColorDark', 'opacityDark'
    ], (result) => {
        // Theme
        const theme = result.theme || DEFAULTS.theme;
        themeToggle.checked = (theme === 'dark');
        
        // Light theme
        const textColorLight = result.textColorLight || DEFAULTS.light.textColor;
        const bgColorLight = result.bgColorLight || DEFAULTS.light.bgColor;
        let opacityLight = result.opacityLight !== undefined ? result.opacityLight : DEFAULTS.light.opacity;
        // Enforce minimum 25%
        if (opacityLight < 25) opacityLight = 25;
        
        textColorLightPicker.value = textColorLight;
        textColorLightHex.value = textColorLight;
        bgColorLightPicker.value = bgColorLight;
        bgColorLightHex.value = bgColorLight;
        opacityLightSlider.value = opacityLight;
        opacityLightValue.textContent = opacityLight + '%';
        
        // Dark theme
        const textColorDark = result.textColorDark || DEFAULTS.dark.textColor;
        const bgColorDark = result.bgColorDark || DEFAULTS.dark.bgColor;
        let opacityDark = result.opacityDark !== undefined ? result.opacityDark : DEFAULTS.dark.opacity;
        // Enforce minimum 25%
        if (opacityDark < 25) opacityDark = 25;
        
        textColorDarkPicker.value = textColorDark;
        textColorDarkHex.value = textColorDark;
        bgColorDarkPicker.value = bgColorDark;
        bgColorDarkHex.value = bgColorDark;
        opacityDarkSlider.value = opacityDark;
        opacityDarkValue.textContent = opacityDark + '%';
        
        toggleThemeSections();
        updatePreview();
    });
}

// Save settings
function saveSettings() {
    const theme = themeToggle.checked ? 'dark' : 'light';
    
    chrome.storage.sync.set({
        theme: theme,
        textColorLight: textColorLightPicker.value,
        bgColorLight: bgColorLightPicker.value,
        opacityLight: parseInt(opacityLightSlider.value),
        textColorDark: textColorDarkPicker.value,
        bgColorDark: bgColorDarkPicker.value,
        opacityDark: parseInt(opacityDarkSlider.value)
    }, () => {
        // Show save message
        saveMessage.classList.add('show');
        setTimeout(() => {
            saveMessage.classList.remove('show');
        }, 2000);
    });
}

// Reset to defaults
function resetToDefaults() {
    const confirmed = confirm(
        'Are you sure you want to reset all colors to their defaults?\n\n' +
        'Your current color settings will be lost. This action cannot be undone.'
    );
    
    if (confirmed) {
        // Reset light theme
        textColorLightPicker.value = DEFAULTS.light.textColor;
        textColorLightHex.value = DEFAULTS.light.textColor;
        bgColorLightPicker.value = DEFAULTS.light.bgColor;
        bgColorLightHex.value = DEFAULTS.light.bgColor;
        opacityLightSlider.value = DEFAULTS.light.opacity;
        opacityLightValue.textContent = DEFAULTS.light.opacity + '%';
        
        // Reset dark theme
        textColorDarkPicker.value = DEFAULTS.dark.textColor;
        textColorDarkHex.value = DEFAULTS.dark.textColor;
        bgColorDarkPicker.value = DEFAULTS.dark.bgColor;
        bgColorDarkHex.value = DEFAULTS.dark.bgColor;
        opacityDarkSlider.value = DEFAULTS.dark.opacity;
        opacityDarkValue.textContent = DEFAULTS.dark.opacity + '%';
        
        // Reset theme to light
        themeToggle.checked = false;
        toggleThemeSections();
        
        // Save the defaults
        saveSettings();
        updatePreview();
    }
}

// Theme toggle
themeToggle.addEventListener('change', () => {
    toggleThemeSections();
    saveSettings();
});

// Light theme opacity slider
opacityLightSlider.addEventListener('input', (e) => {
    let value = parseInt(e.target.value);
    // Enforce minimum of 25%
    if (value < 25) {
        value = 25;
        e.target.value = 25;
    }
    opacityLightValue.textContent = value + '%';
    updatePreview();
});

// Dark theme opacity slider
opacityDarkSlider.addEventListener('input', (e) => {
    let value = parseInt(e.target.value);
    // Enforce minimum of 25%
    if (value < 25) {
        value = 25;
        e.target.value = 25;
    }
    opacityDarkValue.textContent = value + '%';
    updatePreview();
});

// Initialize
syncColorInputs(textColorLightPicker, textColorLightHex);
syncColorInputs(bgColorLightPicker, bgColorLightHex);
syncColorInputs(textColorDarkPicker, textColorDarkHex);
syncColorInputs(bgColorDarkPicker, bgColorDarkHex);
loadSettings();

// Save button
saveButton.addEventListener('click', saveSettings);

// Reset button
resetButton.addEventListener('click', resetToDefaults);

// Auto-save on color change
textColorLightPicker.addEventListener('change', saveSettings);
bgColorLightPicker.addEventListener('change', saveSettings);
opacityLightSlider.addEventListener('change', saveSettings);
textColorDarkPicker.addEventListener('change', saveSettings);
bgColorDarkPicker.addEventListener('change', saveSettings);
opacityDarkSlider.addEventListener('change', saveSettings);
