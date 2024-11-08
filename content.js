function initStyles() {
    const style = document.createElement('style');
    style.textContent = `
        body .highlight-ads {
            background-color: #ffff95 !important;
            padding: 0.5rem !important;
            border-radius: 0.3rem !important;
            border: 1px solid !important;
            opacity: 0.7 !important;
            margin-bottom: 1rem;
        }
        body .highlight-ads:hover {
            opacity: 1 !important;
        }
        body .highlight-ads * {
            color: red !important;
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

    initStyles();

    const adElements = document.querySelectorAll('#main span, #main div, #main a');

    adElements.forEach((element) => {
        const textContent = element.textContent.toLowerCase();

        if (sponsoredTranslations.some((translation) => textContent.includes(translation.word)) && element.children.length === 0) {
            element.parentNode.parentNode.parentNode.parentNode.classList.add('highlight-ads');
        }
    });
}

window.onload = highlightAds;

console.log('Highlight Google Sponsored Ads extension has loaded.');