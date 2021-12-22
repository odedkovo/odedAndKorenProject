import { locService } from './services/loc.service.js';
import { mapService } from './services/map.service.js';

window.onload = onInit;
window.onAddMarker = onAddMarker;
window.onPanTo = onPanTo;
window.onGetLocs = onGetLocs;
window.onGetUserPos = onGetUserPos;
window.onDeleteLocation = onDeleteLocation;
window.onGoToLocation = onGoToLocation;
window.onSearchLocation = onSearchLocation;
window.saveUrl = saveUrl;

function onInit() {
  mapService
    .initMap(undefined, undefined, renderUsersLocations)
    .then(() => {
      console.log('Map is ready');
    })
    .catch(() => console.log('Error: cannot init map'));
}

// This function provides a Promise API to the callback-based-api of getCurrentPosition
function getPosition() {
  console.log('Getting Pos');
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

function onAddMarker() {
  console.log('Adding a marker');
  mapService.addMarker({ lat: 32.0749831, lng: 34.9120554 });
}

function onGetLocs() {
  locService.getLocs().then((locs) => {
    console.log('Locations:', locs);
    document.querySelector('.locs').innerText = JSON.stringify(locs);
  });
}

function onGetUserPos() {
  getPosition()
    .then((pos) => {
      mapService.panTo(pos.coords.latitude, pos.coords.longitude);
      console.log('User position is:', pos.coords);
      document.querySelector(
        '.user-pos'
      ).innerText = `Latitude: ${pos.coords.latitude} - Longitude: ${pos.coords.longitude}`;
    })

    .catch((err) => {
      console.log('err!!!', err);
    });
}
function onPanTo() {
  console.log('Panning the Map');
  mapService.panTo(35.6895, 139.6917);
}

function renderUsersLocations(locations) {
  document.querySelector('.table').hidden = false;
  var strHTMLs = locations.map((location) => {
    return `<tr>
    <td>${location.id}</td>
    <td>${location.name}</td>
    <td>${location.lat}</td>
    <td>${location.lng}</td>
    <td>${location.weather}</td>
    <td>${location.createdAt}</td>
    <td>${location.updatedAt}</td>
    <td><button onclick="onGoToLocation('${location.lat}','${location.lng}')">Go</button></td>
		<td><button onclick="onDeleteLocation('${location.id}')">Delete</button></td>
    </tr>`;
  });
  document.querySelector('tbody').innerHTML = strHTMLs.join('');
}

function onDeleteLocation(id) {
  mapService.deleteLocation(id, renderUsersLocations);
}

function onGoToLocation(lat, lng) {
  mapService.goToLocation(lat, lng, renderUsersLocations);
}

function onSearchLocation(ev, value) {
  ev.preventDefault();
  console.log(value);
  mapService.sendToLocation(value, renderUsersLocations);
}

function saveUrl(lat, lng) {
  console.log('hihi');
  var url = window.location.href + '?lat=' + lat + '&' + 'lng=' + lng;
  console.log(url);
  navigator.clipboard.writeText(url);
}


