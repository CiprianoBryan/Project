function getIconMarker(feature) {
  let iconBase = 'http://maps.google.com/mapfiles/kml/';
  var icons = {
    mark: 'paddle/red-circle.png',
    parking: 'shapes/parking_lot_maps.png',
    library: 'shapes/library_maps.png',
    info: 'shapes/info-i_maps.png'
  };
  return iconBase + icons[feature];
}

function myPosition() {
  var coordinate = null;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      coordinate = position.coords;
    }, function() {});
  }
  return coordinate;
}

function computeTotalDistance(result) {
  let totalDistance = 0;
  let totalDuration = 0;
  let myroute = result.routes[0];
  for (let i=0; i < nroPoints-1; i++) {
    totalDistance += myroute.legs[i].distance.value;
    totalDuration += myroute.legs[i].duration.value;
    document.getElementById(pointName[i]).value = myroute.legs[i].start_address;
    if(i == myroute.legs.length-1) {
      document.getElementById(pointName[i+1]).value = myroute.legs[i].end_address;
    }
  }
  totalDuration = totalDuration / 60;
  totalDistance = totalDistance / 1000;
  document.getElementById('total').innerHTML = totalDistance + ' km';
}

var pointName;
var directionsService;
var directionsDisplay;
var pointPlaceId;
var formPoints;
var buttonAdd;
var nroPoints;
var map;
/*------------------------- INIT PROJECT ---------------------- */

function initialize() {
  nroPoints = 0;
  pointPlaceId = [null, null];
  pointName = ['point1', 'point2'];
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  var ParqueJohnFKennedy = new google.maps.LatLng(-12.1220124, -77.0307685);
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    center: ParqueJohnFKennedy
  });
  directionsDisplay.setOptions({
    map: map,
    draggable: true,
    panel: document.getElementById('panel'),
    markerOptions: {
      // draggable:true
      // animation: google.maps.Animation.DROP,
    }
  });
  directionsDisplay.addListener('directions_changed', function() {
    computeTotalDistance(directionsDisplay.getDirections());
  });
  AutocompleteDirectionsHandler(0);
  AutocompleteDirectionsHandler(1);
  buttonAdd = document.getElementById('buttonAdd');
  formPoints = document.getElementById('formPoints');
  buttonAdd.addEventListener('click', pressButtonAdd, false);
}

function pressButtonAdd(event) {
  if(pointPlaceId.length != nroPoints) {
    return;
  }
  var input = document.createElement('input');
  var newId = 'point' + (nroPoints + 1);
  pointPlaceId.push(null);
  pointName.push(newId);
  input.setAttribute('id', newId);
  input.setAttribute('class', 'controls');
  input.setAttribute('placeholder', "Elige un destino");
  formPoints.insertBefore(input, buttonAdd);
  buttonAdd.setAttribute('class', 'disabled');
  AutocompleteDirectionsHandler(nroPoints);
}

function AutocompleteDirectionsHandler(index) {
  pointInput = document.getElementById(pointName[index]);
  pointAutocomplete = new google.maps.places.Autocomplete(pointInput, {placeIdOnly: true});
  setupPlaceChangedListener(pointAutocomplete, index);
}

function setupPlaceChangedListener(autocomplete, index) {
  autocomplete.bindTo('bounds', map);
  autocomplete.addListener('place_changed', function() {
    var place = autocomplete.getPlace();
    if (!place.place_id) {
      alert("Please select an option from the dropdown list.");
      return;
    }
    nroPoints ++;
    if(nroPoints >= 2) {
      buttonAdd.removeAttribute('class');
      buttonAdd.style.cursor = 'pointer';
    }
    pointPlaceId[index] = place.place_id;
    displayRoute(nroPoints);
  });
};

function displayRoute() {
  let waypoints = [];
  for(let i = 1 ; i < nroPoints-1; i ++) {
    waypoints.push({
      location: {'placeId': this.pointPlaceId[i]}
    });
  }
  directionsService.route({
    origin: {'placeId': pointPlaceId[0]},
    destination: {'placeId': pointPlaceId[nroPoints-1]},
    waypoints: waypoints,
    travelMode: 'DRIVING',
    // transitOptions: TransitOptions,
    // drivingOptions: DrivingOptions,
    // unitSystem: UnitSystem,
    // avoidHighways: Boolean,
    // avoidTolls: true
  }, function(response, status) {
    if (status === 'OK') {
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
};

window.addEventListener('load',initialize,false);