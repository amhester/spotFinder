angular
    .module('parkApp')
    .controller('MapCtrl', MapCtrl)
    .controller('MySpotsCtrl', MySpotsCtrl)
    .controller('FindCtrl', FindCtrl);

function MapCtrl($scope, $ionicLoading, $compile, $cordovaGeolocation, localStorage, $rootScope) {
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var me = 'img/SpotFinderME2.png';
    var vm = {};
    vm.error = "";
    vm.saveSpot = saveCurrentLocation;
    vm.state = 'saveSpot';

    vm.reset = function() {
        vm.state = 'saveSpot';
        $scope.markedSpot.setMap(null);
        $scope.meMarker.setMap(null);
        directionsDisplay.setMap(null);
    };

    function init() {
        var mapOptions = {
            streetViewControl: true,
            zoom: 18,
            mapTypeId: google.maps.MapTypeId.TERRAIN
        };
        $ionicLoading.show({
            content: 'Getting current location...',
            showBackdrop: false
        });
        $cordovaGeolocation
            .getCurrentPosition({timeout: 10000, enableHighAccuracy: false})
            .then(function(pos) {
                mapOptions.center = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
                $ionicLoading.hide();
            }, function(err) {
                vm.error = err;
            });
        /*navigator.geolocation.getCurrentPosition(function(pos) {
            mapOptions.center = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
            $ionicLoading.hide();
        }, function(error) {
            alert('Unable to get location: ' + error.message);
        });*/
    }

    init();

    function saveCurrentLocation() {
        $ionicLoading.show({
            content: 'Getting current location...',
            showBackdrop: false
        });

        /*navigator.geolocation
            .getCurrentPosition(function(pos) {
                var spot = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                localStorage.set(vm.spot.name, spot);
                $ionicLoading.hide();
                vm.spot.name = '';
                $rootScope.$broadcast('event:newSpot');
            }, function(error) {
                alert('Unable to get location: ' + error.message);
            });*/

        $cordovaGeolocation
           .getCurrentPosition({timeout: 10000, enableHighAccuracy: false})
           .then(function(pos) {
                var spot = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                localStorage.set(vm.spot.name, spot);
                $ionicLoading.hide();
                vm.spot.name = '';
                $rootScope.$broadcast('event:newSpot');
         }, function(err) {
                vm.error = err;
         });

    }

    $scope.$on('event:findSpot', function(e, spot) {
        vm.state = 'findSpot';
        var c = new google.maps.LatLng(spot.coords.k, spot.coords.D);
        $scope.map.setCenter(c);

        $scope.markedSpot = new google.maps.Marker({
            position: c,
            map: $scope.map,
            title: spot.name
        });

        var spotWindow = new google.maps.InfoWindow({
            content: spot.name
        });

        spotWindow.open($scope.map, $scope.markedSpot);

        /*navigator.geolocation
            .getCurrentPosition(function(pos) {
                var cl = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                var request = {
                    origin: cl,
                    destination: c,
                    travelMode: google.maps.TravelMode.DRIVING
                };
                directionsService.route(request, function(response, status) {
                    if(status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                    }
                });

                directionsDisplay.setMap($scope.map);
            }, function(error) {
                alert('Unable to get location: ' + error.message);
            });*/
         $cordovaGeolocation
            .getCurrentPosition({timeout: 10000, enableHighAccuracy: false})
            .then(function(pos) {
                 var cl = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                 var request = {
                     origin: cl,
                     destination: c,
                     travelMode: google.maps.TravelMode.DRIVING
                 };
                 directionsService.route(request, function(response, status) {
                     if(status == google.maps.DirectionsStatus.OK) {
                         directionsDisplay.setDirections(response);
                     }
                 });

                 directionsDisplay.setMap($scope.map);
            }, function(err) {
                vm.error = err;
            });

        $scope.locationWatch = $cordovaGeolocation.watchPosition({
            frequency: 1000,
            timeout: 3000,
            maximumAge: 3000,
            enableHighAccuracy: false
        });
        $scope.locationWatch.then(null, function(err) {

        }, function(pos) {
            var mePos = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            ($scope.meMarker) ? $scope.meMarker.setMap(null) : false;
            if(!$scope.marker) {
                $scope.meMarker = new google.maps.Marker({
                    position: mePos,
                    map: $scope.map,
                    icon: me,
                    title: 'me'
                });
            } else {
                $scope.meMarker.setPosition(mePos);
                $scope.meMarker.setMap($scope.map);
            }
        });
    });

    $scope.viewModel = vm;
}
MapCtrl.$inject = ['$scope', '$ionicLoading', '$compile', '$cordovaGeolocation', '$localStorage', '$rootScope'];

function MySpotsCtrl($scope, localStorage, state, $rootScope) {
    var vm = {};

    function init() {
        vm.spots = localStorage.getAll();
    }

    init();

    vm.showDelete = false;
    vm.removeSpot = removeSpot;
    vm.findSpot = findSpot;
    vm.removeAll = removeAll;

    function removeAll() {
        localStorage.removeAll();
        vm.spots = localStorage.getAll();
    }

    function removeSpot(spot) {
        localStorage.remove(spot.name);
        vm.spots = localStorage.getAll();
    }

    function findSpot(spot) {
        $rootScope.$broadcast('event:findSpot', spot);
        state.go('tab.map');
    }

    $scope.$on('event:newSpot', function() {
        vm.spots = localStorage.getAll();
    });

    $scope.viewModel = vm;
}
MySpotsCtrl.$inject = ['$scope', '$localStorage', '$state', '$rootScope'];

function FindCtrl(scope, $ionicLoading, stateParams) {
    var vm = {};
    vm.spot = {};

    function init() {
        $ionicLoading.show({
            content: 'Finding spot...',
            showBackdrop: false
        });

        vm.spot = stateParams.spot;

        var mapOptions = {
            streetViewControl: true,
            center: vm.spot.coords,
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.TERRAIN
        };

        scope.map = new google.maps.Map(document.getElementById("find-map"), mapOptions);

        var markedSpot = new google.maps.Marker({
            position: vm.spot.coords,
            setMap: map,
            title: vm.spot.name
        });

        var spotWindow = new google.maps.InfoWindow({
             content: 'test'
        });

        spotWindow.open(map, markedSpot);

        $ionicLoading.hide();
    }

    init();

    scope.viewModel = vm;
}
FindCtrl.$inject = ['$scope', '$ionicLoading', '$stateParams'];