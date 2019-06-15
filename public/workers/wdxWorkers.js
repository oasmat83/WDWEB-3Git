/**
 * Created by Worldox's development team.
 */
var wdxWorkers = (function () {
// ==================================== Worldox Workers Customs ====================================
// ============================================= START =============================================
    var _favMattersAccess = 'favMattersAccess';
    var _bookmarks = 'bookmarks';
    var _workspaces = 'workspaces';

    function _seekingRequest(request){
        if(request.url.includes(_favMattersAccess) || request.url.includes(_favMattersAccess) || request.url.includes(_workspaces)){
            return request;
        }
    }

    function _isEquivalent(a, b) {
        return JSON.stringify(a) === JSON.stringify(b)? true: false;
    }

    function _update(cacheName, request) {
        return caches.open(cacheName).then(function (cache) {
            return fetch(request).then(function (response) {
                return cache.put(request, response.clone()).then(function () {
                    return response;
                });
            });
        });
    }

    return{
        seekingRequest: _seekingRequest,
        isEquivalent: _isEquivalent,
        update: _update
    }
}());
