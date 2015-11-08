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
        var html = "<h1>Post message</h1>" +
            "<input id='message-text' type='text' placeholder='Enter message'/>" +
            "<button type='button' id='send-button'>Send</button>" +
            "<ul id='messages-in-range'></ul>" +
            "<div id='log'></div>"
            ;

        $('body').html(html);
        $('#send-button').on('click', function () {
            navigator.geolocation.getCurrentPosition(onGeoLocSend);
        });

        refreshMessages();
    }

    function log(message) {
        $('#log').append("<div>" + message + "</div>");
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

        $.post('http://opasowo:6066/api/messages?distance=10.0', origin, renderMessageList);
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
