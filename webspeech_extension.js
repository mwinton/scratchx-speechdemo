/* Extension demonstrating a Chrome web speech API block */
/* Michael Winton <winton@google.com>, Feb 2017 */

new (function() {
    var ext = this;

    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    // Functions for block with type 'w' will get a callback function as the 
    // final argument. This should be called to indicate that the block can
    // stop waiting.
    ext.wait_random = function(callback) {
        wait = Math.random();
        console.log('Waiting for ' + wait + ' seconds');
        window.setTimeout(function() {
            callback();
        }, wait*1000);
    };

    ext.wait_five = function(callback) {
        wait = 5;
        console.log('Waiting for ' + wait + ' seconds');
        window.setTimeout(function() {
            callback();
        }, wait*1000);
    };

    ext.get_web_speech_transcription = function(callback) {
        transcribed_text = 'none detected';
        console.log('Transcribed text: ' + transcribed_text);
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            ['w', 'wait for random time', 'wait_random'],
            ['w', 'wait for 5 sec', 'wait_five'],
            ['R', 'Google speech to text', 'get_web_speech_transcription'],

        ]
    };

    // Register the extension
    ScratchExtensions.register('Google web speech extension', descriptor, ext);
})();
