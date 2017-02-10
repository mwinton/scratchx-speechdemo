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
    
    ext.return_dummy_string = function(callback) {
       callback('dummy string');
    };

    ext.speak_text = function(message, callback) {
        if (!('speechSynthesis' in window)) {
            console.log('Browser does NOT have Speech Synthesis support');
        } else {
            console.log('Browser DOES have Speech Synthesis support');
            
            var msg = new SpeechSynthesisUtterance(message);
            var voices = window.speechSynthesis.getVoices();
            msg.voice = voices[10]; // Note: some voices don't support altering params
            msg.voiceURI = 'native';
            msg.volume = 1; // 0 to 1
            msg.rate = 1; // 0.1 to 10
            msg.pitch = 2; //0 to 2
            msg.lang = 'en-US';        

            msg.onend = function(e) {
              console.log('Finished speaking in ' + event.elapsedTime + ' seconds.');
            };

           window.speechSynthesis.speak(msg);
        }
        
        callback();
        
    };

    ext.get_web_speech_transcription = function(callback) {
        console.log('entering get_web_speech_transcription function');
        var final_transcript = '';
        var recognizing = false;
        var ignore_onend = false;
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
                console.log('Entered onerror function.');
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
            
              recognition.onresult = function(event) {
                console.log('entered onresult function. Event = ' + event);
                var interim_transcript = '';
                for (var i = event.resultIndex; i < event.results.length; ++i) {
                  if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript;
                    console.log('About to callback. final_transcript = ' + final_transcript);
                    callback(final_transcript);
                  } else {
                    interim_transcript += event.results[i][0].transcript;
                    console.log('interim_transcript = ' + interim_transcript);
                  }
                }                  
                //final_transcript = capitalize(final_transcript);
                //final_span.innerHTML = linebreak(final_transcript);
                //interim_span.innerHTML = linebreak(interim_transcript);
                  
              };
            
              recognition.onend = function() {
                console.log('Entered onend function. ignore_onend= ' + ignore_onend);
                recognizing = false;
                if (ignore_onend) {
                  final_transcript = 'No speech detected';
                  callback(final_transcript);
                  //return;
                }
                if (!final_transcript) {
                  final_transcript = 'No speech detected';
                  //return;
                }
              };
 
            
        }
        
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
//            ['w', 'wait for random time', 'wait_random'],
//            ['w', 'wait for 5 sec', 'wait_five'],
            ['R', 'Google speech to text', 'get_web_speech_transcription'],
            ['R', 'Return dummy string', 'return_dummy_string'],
            ['w', 'Speak %s', 'speak_text','Hello Scratcher'],
        ],
        url: 'https://developers.google.com/web/updates/2013/01/Voice-Driven-Web-Apps-Introduction-to-the-Web-Speech-API'
    };

    // Register the extension
    ScratchExtensions.register('Google web speech extension', descriptor, ext);
})();
