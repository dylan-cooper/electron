var deepEqual, desktopCapturer, ipcMain, requestsQueue;

ipcMain = require('electron').ipcMain;

desktopCapturer = process.atomBinding('desktop_capturer').desktopCapturer;

deepEqual = function(opt1, opt2) {
  return JSON.stringify(opt1) === JSON.stringify(opt2);
};

// A queue for holding all requests from renderer process.
requestsQueue = [];

ipcMain.on('ATOM_BROWSER_DESKTOP_CAPTURER_GET_SOURCES', function(event, captureWindow, captureScreen, thumbnailSize, id) {
  var request;
  request = {
    id: id,
    options: {
      captureWindow: captureWindow,
      captureScreen: captureScreen,
      thumbnailSize: thumbnailSize
    },
    webContents: event.sender
  };
  requestsQueue.push(request);
  if (requestsQueue.length === 1) {
    desktopCapturer.startHandling(captureWindow, captureScreen, thumbnailSize);
  }

  // If the WebContents is destroyed before receiving result, just remove the
  // reference from requestsQueue to make the module not send the result to it.
  return event.sender.once('destroyed', function() {
    return request.webContents = null;
  });
});

desktopCapturer.emit = function(event, name, sources) {
  // Receiving sources result from main process, now send them back to renderer.
  var captureScreen, captureWindow, handledRequest, i, len, ref, ref1, ref2, request, result, source, thumbnailSize, unhandledRequestsQueue;
  handledRequest = requestsQueue.shift(0);
  result = (function() {
    var i, len, results;
    results = [];
    for (i = 0, len = sources.length; i < len; i++) {
      source = sources[i];
      results.push({
        id: source.id,
        name: source.name,
        thumbnail: source.thumbnail.toDataUrl()
      });
    }
    return results;
  })();
  if ((ref = handledRequest.webContents) != null) {
    ref.send("ATOM_RENDERER_DESKTOP_CAPTURER_RESULT_" + handledRequest.id, result);
  }

  // Check the queue to see whether there is other same request. If has, handle
  // it for reducing redunplicated `desktopCaptuer.startHandling` calls.
  unhandledRequestsQueue = [];
  for (i = 0, len = requestsQueue.length; i < len; i++) {
    request = requestsQueue[i];
    if (deepEqual(handledRequest.options, request.options)) {
      if ((ref1 = request.webContents) != null) {
        ref1.send("ATOM_RENDERER_DESKTOP_CAPTURER_RESULT_" + request.id, errorMessage, result);
      }
    } else {
      unhandledRequestsQueue.push(request);
    }
  }
  requestsQueue = unhandledRequestsQueue;

  // If the requestsQueue is not empty, start a new request handling.
  if (requestsQueue.length > 0) {
    ref2 = requestsQueue[0].options, captureWindow = ref2.captureWindow, captureScreen = ref2.captureScreen, thumbnailSize = ref2.thumbnailSize;
    return desktopCapturer.startHandling(captureWindow, captureScreen, thumbnailSize);
  }
};
