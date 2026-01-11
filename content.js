function initStyles(textColor = '#000000', bgColor = '#FFC800', opacity = 25) {
    const opacityDecimal = opacity / 100;
    const hoverOpacity = Math.min(opacityDecimal + 0.25, 1); // Add 25% but cap at 100%
    const style = document.createElement('style');
    style.textContent = `
        body .highlight-ads {
            background-color: ${bgColor} !important;
            padding: 0.5rem !important;
            border-radius: 0.3rem !important;
            border: 1px solid !important;
            opacity: ${opacityDecimal} !important;
            margin-bottom: 1rem;
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
    const sponsoredTranslations = [
        { language: "English", word: "sponsored" },
        { language: "Spanish", word: "patrocinado" },
        { language: "French", word: "sponsorisé" },
        { language: "German", word: "gesponsert" },
        { language: "Italian", word: "sponsorizzato" },
        { language: "Portuguese", word: "patrocinado" },
        { language: "Dutch", word: "gesponsord" },
        { language: "Russian", word: "спонсировано" },
        { language: "Chinese", word: "赞助" },
        { language: "Japanese", word: "スポンサー" },
        { language: "Korean", word: "스폰서된" },
        { language: "Arabic", word: "برعاية" },
        { language: "Hindi", word: "प्रायोजित" },
        { language: "Turkish", word: "sponsorlu" },
        { language: "Polish", word: "sponsorowany" },
        { language: "Romanian", word: "sponsorizat" },
    ];

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

        const adElements = document.querySelectorAll('#main span, #main div, #main a');

        adElements.forEach((element) => {
            const textContent = element.textContent.toLowerCase();

            if (sponsoredTranslations.some((translation) => textContent.includes(translation.word)) && element.children.length === 0) {
                element.parentNode.parentNode.parentNode.parentNode.classList.add('highlight-ads');
            }
        });
    });
}

window.onload = highlightAds;