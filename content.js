function initStyles(textColor = '#000000', bgColor = '#FFC800', opacity = 25) {
    const opacityDecimal = opacity / 100;
    const hoverOpacity = Math.min(opacityDecimal + 0.25, 1); // Add 25% but cap at 100%
    const style = document.createElement('style');
    style.textContent = `
        body .highlight-ads {
            background-color: ${bgColor} !important;
            color: ${textColor} !important;
            padding: 0.5rem !important;
            border-radius: 0.3rem !important;
            border: 1px solid !important;
            opacity: ${opacityDecimal} !important;
            margin-bottom: 2rem;
            transition: opacity 300ms ease !important;
        }
        body .highlight-ads:hover {
            opacity: ${hoverOpacity} !important;
        }
        body .highlight-ads * {
            color: ${textColor} !important;
            background: initial;
        }
    `;
    document.head.append(style);

}

function highlightAds() {
    // Load settings and apply highlighting
    chrome.storage.sync.get([
        'textColorLight', 'bgColorLight', 'opacityLight',
        'textColorDark', 'bgColorDark', 'opacityDark'
    ], (result) => {
        // Detect browser's color scheme preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        let textColor, bgColor, opacity;
        if (prefersDark) {
            textColor = result.textColorDark || '#FFC800';
            bgColor = result.bgColorDark || '#000000';
            opacity = result.opacityDark !== undefined ? result.opacityDark : 25;
        } else {
            textColor = result.textColorLight || '#000000';
            bgColor = result.bgColorLight || '#FFC800';
            opacity = result.opacityLight !== undefined ? result.opacityLight : 25;
        }
        
        initStyles(textColor, bgColor, opacity);

        const tvcap = document.getElementById('tvcap');
        const atvcap = document.querySelector('[data-st-tgt="atvcap"]');
        const bottomads = document.getElementById('bottomads');

        setTimeout(() => {
            if (tvcap && document.querySelector('#tvcap > *').clientHeight > 1) {
                tvcap?.classList.add('highlight-ads');
            }
            if (atvcap && document.querySelector('[data-st-tgt="atvcap"] > *').clientHeight > 1) {
                atvcap?.classList.add('highlight-ads');
            }
            if (bottomads && document.querySelector('#bottomads > *').clientHeight > 1) {
                bottomads?.classList.add('highlight-ads');
            }
        }, 1);
    });
}

window.onload = highlightAds;