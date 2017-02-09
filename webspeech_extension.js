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
        var final_transcript = 'none detected';
        var recognizing = false;
        var ignore_onend;
        var start_timestamp;

        if (!('webkitSpeechRecognition' in window)) {
            console.log('Browser does NOT have Web Speech API support');
        } else {
              console.log('Browser DOES have Web Speech API support');
              var recognition = new webkitSpeechRecognition();
              recognition.continuous = false; // stop and send for processing when user pauses
              recognition.interimResults = false; // wait until final transcription is ready
              recognition.lang = 'en-US'; // if not specified, defaults to page setting
              recognition.start();
            
              recognition.onstart = function() {
                recognizing = true;
                console.log('Ready for user to start speaking');
              };
            
              recognition.onerror = function(event) {
                if (event.error == 'no-speech') {
                  console.log('No speech detected');
                  ignore_onend = true;
                }
                if (event.error == 'audio-capture') {
                  console.log('No microphone detected');
                  ignore_onend = true;
                }
                if (event.error == 'not-allowed') {
                  console.log('Access denied');
                  if (event.timeStamp - start_timestamp < 100) {
                    //showInfo('info_blocked');
                  } else {
                    //showInfo('info_denied');
                  }
                  ignore_onend = true;
                }
              };
            
              recognition.onend = function() {
                console.log('Finished recognizing');
                recognizing = false;
                if (ignore_onend) {
                  return;
                }
                if (!final_transcript) {
                  return;
                }
              };
            
              recognition.onresult = function(event) {
                var interim_transcript = '';
                for (var i = event.resultIndex; i < event.results.length; ++i) {
                  if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript;
                  } else {
                    interim_transcript += event.results[i][0].transcript;
                  }
                }
                console.log('final_transcript = ' + final_transcript);
                  
                //final_transcript = capitalize(final_transcript);
                //final_span.innerHTML = linebreak(final_transcript);
                //interim_span.innerHTML = linebreak(interim_transcript);
              };
        }
        
        console.log('Transcribed text being returned to ScratchX: ' + final_transcript);
        callback(final_transcript);
        
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            ['w', 'wait for random time', 'wait_random'],
            ['w', 'wait for 5 sec', 'wait_five'],
            ['R', 'Google speech to text', 'get_web_speech_transcription'],

        ],
        url: 'https://developers.google.com/web/updates/2013/01/Voice-Driven-Web-Apps-Introduction-to-the-Web-Speech-API'
    };

    // Register the extension
    ScratchExtensions.register('Google web speech extension', descriptor, ext);
})();
