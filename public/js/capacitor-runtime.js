/**
 * Capacitor Runtime Handling
 * Handles hardware back button for Android/iOS
 */
(function() {
    // Check if running in Capacitor
    if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform()) {
        const { App } = window.Capacitor.Plugins;

        if (App) {
            App.addListener('backButton', ({ canGoBack }) => {
                // canGoBack is provided by the plugin in some versions,
                // but let's check history manually as well or use the event data

                // Some versions of @capacitor/app provide canGoBack in the event
                // If it's a SPA, window.history.length is often used.

                // On many SPAs, window.history.length > 1 means we can go back.
                // However, Capacitor's backButton event also tells us if the native webview can go back.

                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    // No more history, exit the app
                    App.exitApp();
                }
            });
            console.log('Capacitor back button listener initialized');
        }
    }
})();
