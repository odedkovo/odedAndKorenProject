import { storageService } from './storage.service.js';
import { apiService } from './api.service.js';
export const mapService = {
  initMap,
  addMarker,
  panTo,
  deleteLocation,
  goToLocation,
  sendToLocation,
};

const STORAGE_KEY = 'userLocationsDB';

var gMap;

function initMap(lat = 32.0749831, lng = 34.9120554, cb = false) {
  console.log('cb:', cb);
  var usersLocations = storageService.load(STORAGE_KEY);
  if (usersLocations && cb) cb(usersLocations);
  console.log('InitMap');
  return _connectGoogleApi().then(() => {
    console.log('google available');
    gMap = new google.maps.Map(document.querySelector('#map'), {
      center: { lat, lng },
      zoom: 15,
    });
    const myLatlng = { lat: lat, lng: lng };
    let infoWindow = new google.maps.InfoWindow({
      content: 'Click the map to get Lat/Lng!',
      position: myLatlng,
    });
    infoWindow.open(gMap);
    gMap.addListener('click', (ev) => {
      // Close the current InfoWindow.
      infoWindow.close();
      // Create a new InfoWindow.
      infoWindow = new google.maps.InfoWindow({
        position: ev.latLng,
      });
      infoWindow.setContent(JSON.stringify(ev.latLng.toJSON(), null, 2));
      infoWindow.open(gMap);

      const userLocationData = {
        id: 100,
        name: prompt('enter your name'),
        lat: ev.latLng.toJSON().lat,
        lng: ev.latLng.toJSON().lng,
        weather: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      var usersData = storageService.load(STORAGE_KEY);
      if ((!usersData || usersData.length === 0) && cb) {
        storageService.save(STORAGE_KEY, [userLocationData]);
        cb([userLocationData]);
      } else if (cb) {
        userLocationData.id = usersData[usersData.length - 1].id + 1;
        usersData.push(userLocationData);
        storageService.save(STORAGE_KEY, usersData);
        cb(usersData);
      }
    });
    console.log('Map!', gMap);
  });
}

function addMarker(loc) {
  var marker = new google.maps.Marker({
    position: loc,
    map: gMap,
    title: 'Hello World!',
  });
  return marker;
}

function panTo(lat, lng) {
  var laLatLng = new google.maps.LatLng(lat, lng);
  gMap.panTo(laLatLng);
}

function _connectGoogleApi() {
  if (window.google) return Promise.resolve();
  var elGoogleApi = document.createElement('script');
  elGoogleApi.src = `https://maps.googleapis.com/maps/api/js?key=${apiService.API_KEY}`;
  elGoogleApi.async = true;
  document.body.append(elGoogleApi);

  return new Promise((resolve, reject) => {
    elGoogleApi.onload = resolve;
    elGoogleApi.onerror = () => reject('Google script failed to load');
  });
}

function deleteLocation(id, cb) {
  var locations = storageService.load(STORAGE_KEY);
  var idx = locations.findIndex((location) => location.id === id);
  locations.splice(idx, 1);
  storageService.save(STORAGE_KEY, locations);
  cb(locations);
}

function goToLocation(lat, lng, cb) {
  console.log(lat, lng);
  panTo(lat, lng);
}

function sendToLocation(value, cb) {
  console.log(value);
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      const ans = JSON.parse(xhr.responseText);
      var lat = ans.results[0].geometry.location.lat;
      var lng = ans.results[0].geometry.location.lng;
      panTo(lat, lng);
      var locations = storageService.load(STORAGE_KEY);
      locations.push({
        id: locations[length - 1].id + 1,
        name: value,
        lat: lat,
        lng: lng,
        weather: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      storageService.save(STORAGE_KEY, locations);
      cb(locations);
    }
  };
  xhr.open(
    'GET',
    `https://maps.googleapis.com/maps/api/geocode/json?address=${value}+&key=${apiService.GEOCODEAPI_KEY}`,
    true
  );
  xhr.send();
}
