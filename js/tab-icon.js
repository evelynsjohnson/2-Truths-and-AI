// centralized tab icon setter
(function () {
    // preferred icon path (use this single source of truth)
    const ICON_PATH = 'img/logos/tab-logo.png';

    function setIcons(path) {
        try {

            // standard favicon
            const link = document.createElement('link');
            link.rel = 'icon';
            link.href = path;
            link.type = 'image/png';
            link.sizes = 'any';
            document.head.appendChild(link);

            // add a duplicate rel for compatibility per request
            const tabLink = document.createElement('link');
            tabLink.rel = 'tab-icon';
            tabLink.href = path;
            tabLink.type = 'image/png';
            tabLink.sizes = 'any';
            document.head.appendChild(tabLink);
        } catch (e) {
            // ignore errors
            console.warn('Could not set tab icon', e);
        }
    }

    // set immediately if DOM available, otherwise wait
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setIcons(ICON_PATH));
    } else {
        setIcons(ICON_PATH);
    }
})();
