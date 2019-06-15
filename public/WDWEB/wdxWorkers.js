/**
 * Engines Worldox Service Workers.
 * @param.
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        if(window.location.pathname.includes('home')){
            navigator.serviceWorker.register('/workers/leftNav.worker.js').then(function(registration) {
                console.log('ServiceWorker registration successful');
            }, function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
        }
    });
}
