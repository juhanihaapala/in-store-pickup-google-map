define([
    'jquery',
    'Kranovik_GoogleMap/js/model/marker',
    'https://www.gstatic.com/charts/loader.js'
       ], function($, markerModel) {
    return {
        map: null,
        infoWindow: null,
        infoWindowContent: '<div id="info-window" '+
                            'data-bind="scope: \'pickup-location-info\'"' +
                            '><!-- ko template: getTemplate() --><!-- /ko --></div>',
        infoWindowId: '#info-window',
        locations: [],

        /**
         * Init google map with Google Api Key for specific element.
         * @param {String} key
         * @param {Object} element
         */
        init: function(key, element) {
            let self = this;

            if (key && element && self.map === null) {
                google.load('maps', '3', {
                    other_params: 'key=' + key,
                    callback: function () {
                        self.map = new google.maps.Map(element, {
                            zoom: 16
                        });
                        if (self.locations.length > 0) {
                            self.navigate(self.locations[0].getPosition());
                            self.locations.forEach(function (loc) {
                                loc.setMap(self.map);
                            });
                        }
                    }
                });
            }
        },

        /**
         * Navigate map center to specific coordinates.
         *
         * @param {Number} lat
         * @param {Number} lng
         */
        navigate: function(lat, lng) {
            if (this.map) {
                this.map.setCenter(new google.maps.LatLng(lat, lng));
            }
        },

        /**
         * Create marker on the map for list of locations.
         *
         * @param {Array} locations
         * @param {Function|null} callback
         */
        setLocations: function(locations, callback) {
            let self = this;
            self.locations.forEach(function (marker) {
                marker.setMap(null);
            });

            self.locations = [];

            locations.forEach(function (loc) {
                self.addLocation(loc, callback)
            });
        },

        /**
         * Create marker on the map for specific location.
         *
         * @param {Object} loc
         * @param {Function|null} callback
         */
        addLocation: function(loc, callback) {
            let self = this;

            if (!google.maps || self.locations[loc.pickup_location_code]) {
                return;
            }

            let marker = new google.maps.Marker({
                position: new google.maps.LatLng(loc.latitude, loc.longitude),
                pickupLocation: loc,
                callback: callback
            });
            marker.setMap(self.map);

            marker.addListener('click', function() {
                markerModel.setActiveMarker(this);
                self.getInfoWindow().open(self.map, this);
            }.bind(marker));

            self.locations[loc.pickup_location_code] = marker;
        },

        /**
         * Create and return Info Window object.
         *
         * @returns {Object|null}
         */
        getInfoWindow: function() {
            if (this.infoWindow === null) {
                let self = this;
                self.infoWindow = new google.maps.InfoWindow({content: self.infoWindowContent});
                self.infoWindow.bounded = false;
                google.maps.event.addListener(self.infoWindow, 'domready', function() {
                     if (!self.infoWindow.bounded) {
                         self.infoWindow.bounded = true;
                        $(self.infoWindowId).applyBindings();
                     }
                });
            }

            return this.infoWindow;
        }
    }
});
