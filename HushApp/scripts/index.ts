// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397705
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
module HushApp {
    "use strict";

    export module Application {
        export function initialize() {
            document.addEventListener('deviceready', onDeviceReady, false);
            document.addEventListener('deviceready', renderHomeView, false);
        }

        function onDeviceReady() {
            // Handle the Cordova pause and resume events
            document.addEventListener('pause', onPause, false);
            document.addEventListener('resume', onResume, false);

            // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
        }

        function onPause() {
            // TODO: This application has been suspended. Save application state here.
        }

        function onResume() {
            // TODO: This application has been reactivated. Restore application state here.
        }
    }

    function renderHomeView() {
        var html = "<h1>Hush</h1>" +
            "<input id='message-text' class='message-input' type='text' placeholder='Enter message'/>" +
            "<button type='button' id='send-button'>Send</button>" +
            
            "<h2>Messages in range of <input id= 'range' type= 'text' placeholder= 'Enter range' value= '10' /> meters</h2>" +
            "<ul id='messages-in-range'></ul>" +
            "<div id='log'></div>"
            ;

        $('body').html(html);
        $('#send-button').on('click', function () {
            navigator.geolocation.getCurrentPosition(onGeoLocSend);
        });

        $('#range').on('input', () => { refreshMessages() });
        setInterval(() => refreshMessages(), 5000);

        refreshMessages();
    }

    var logStore = {};
    
    function log(message) {
        if (logStore[message] == undefined) {
            logStore[message] = 1;
        } else {
            logStore[message] += 1;
        } 

        $('#log').html('');
        $.each(logStore, function (message, occurences) {
            var occurenceString = occurences > 1 ? "x" + occurences : "";
            $('#log').append("<div class='log-entry'>" + message + occurenceString + "</div>");
        });
        
    };

    var onGeoLocSend = (position) => {
        sendMessage(position.coords.longitude, position.coords.latitude, $('#message-text').val());
    }

    function sendMessage(lon, lat, text) {

        var message = {
            'text': text,
            'longitude': lon,
            'latitude': lat
        };

        var settings = {
            url: 'http://opasowo:6066/api/messages',
            data:message,
            method: 'POST',
            dataType: 'json',
            success: (response) => {
                log("sent... " + JSON.stringify(message));
                refreshMessages();
            }
        }

        $.ajax(settings);
    };

    var refreshMessages = () => {
        navigator.geolocation.getCurrentPosition(refreshNearbyMessages);
    }

    var refreshNearbyMessages = (position) => {
        var origin = {
            'longitude': position.coords.longitude,
            'latitude': position.coords.latitude
        };
        var range = $('#range').val();
        $.post('http://opasowo:6066/api/messages?distance='+range, origin, renderMessageList);
        log("refreshed...");
    }

    function renderMessageList(messages) {

        $('#messages-in-range').html('');
        $.each(messages, function (index, message) {
            $('#messages-in-range').append('<li>' + message.text + '</li>');
        });
        log("rendered...");
    }

    window.onload = function () {
        Application.initialize();
    }
}
