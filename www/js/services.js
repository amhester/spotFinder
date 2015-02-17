angular
    .module('parkApp')
    .factory('$localStorage', localStorage);

localStorage.$inject = ['$window'];
function localStorage(window) {
    window.localStorage['spotFinder'] = JSON.stringify([]);

    return {
        set: function(key, value) {
            var spots = JSON.parse(window.localStorage['spotFinder']);
            if(!spots || spots.constructor !== Array) {
                spots = [];
            }
            spots.push({ name: key, coords: value });
            window.localStorage['spotFinder'] = JSON.stringify(spots);
        },
        get: function(key) {
            var spots = JSON.parse(window.localStorage['spotFinder']);
            for(var i = 0; i < spots.length; i++) {
                if(spots[i].name == key) {
                    return spots[i];
                }
            }
            return { name: 'Error', value: 'No Spots Found' };
        },
        remove: function(key) {
            var spots = JSON.parse(window.localStorage['spotFinder']);
            for(var j = 0; j < spots.length; j++) {
                if(spots[j].name == key) {
                    spots.splice(j, 1);
                    window.localStorage['spotFinder'] = spots;
                    return true;
                }
            }
            return false;
        },
        removeAll: function() {
            window.localStorage['spotFinder'] = JSON.stringify([]);
        },
        getAll: function() {
            return JSON.parse(window.localStorage['spotFinder']);
        }
    };
}


