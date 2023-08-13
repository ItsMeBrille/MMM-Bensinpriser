Module.register("MMM-Bensinpriser", {
  defaults: {
    apiURL: "https://api.drivstoffappen.no/api/stations?stationType=0&countryCode=no",
    apiKey: "YOUR_API_KEY",
    coordinates: { // Defaults to The Royal Palace in Oslo
      latitude: 59.916952,  // Latitude of your location
      longitude: 10.728125, // Longitude of your location, defaults to Oslo
    },
    numberOfStations: 5, // Number of gas stations to show
    updateInterval: 60, // Update interval in seconds
  },

  start: function() {
    this.wrapper = document.createElement("div");
    this.wrapper.className = "fuel-price-wrapper";
    this.content = document.createElement("div");
    this.content.className = "fuel-price-content";

    this.wrapper.appendChild(this.content);
    this.loadLanguageJSON(config.language);
    this.loadData();
    this.scheduleUpdate();
  },

  scheduleUpdate: function() {
    const self = this;
    setInterval(function() {
      self.loadData();
    }, this.config.updateInterval*1000);
  },

  // ... other functions ...

  loadData: function() {
    const url = `${this.config.apiURL}`;
    const headers = {
      "X-API-KEY": this.config.apiKey,
    };

    const self = this;
    fetch(url, { headers })
      .then(response => response.json())
      .then(data => {
        if (!data || data.statusCode === 401) {
          self.content.innerHTML = self.translate("unauthorized");
          return;
        }
        const sortedStations = self.sortStationsByDistance(data);
        const nearestStations = sortedStations.slice(0, self.config.numberOfStations);
        const table = self.createTable(nearestStations);
        self.content.innerHTML = "";
        self.content.appendChild(table);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        self.content.innerHTML = self.translate("errorFetching");
      });
  },


  sortStationsByDistance: function(stations) {
    const { latitude, longitude } = this.config.coordinates;
  
    stations.forEach(station => {
      const stationLatitude = parseFloat(station.latitude);
      const stationLongitude = parseFloat(station.longitude);
  
      const distance = this.calculateDistance(latitude, longitude, stationLatitude, stationLongitude);
      station.distance = distance;
    });
  
    stations.sort((a, b) => a.distance - b.distance);
  
    return stations;
  },
  
  calculateDistance: function(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers

    return distance;
  },

  deg2rad: function(deg) {
    return deg * (Math.PI / 180);
  },

  createTable: function(stations) {
    const table = document.createElement("table");
    table.className = "fuel-price-table";
   
    // Create table header
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `<th>${this.translate("stationHeader")}</th><th>${stations[0].stationDetails[0].type}</th>`;
    table.appendChild(headerRow);
    
    // Create table rows for each station
    for (const station of stations) {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${station.name}</td><td>${station.stationDetails[0].price},-</td>`;
      table.appendChild(row);
    }
  
    const wrapper = document.createElement("div");
    wrapper.appendChild(table);
  
    return wrapper;
  },  

  loadLanguageJSON: function(language) {
    const self = this;
    const file = this.file(`translations/${language}.json`);
    console.log(file);
    const xhr = new XMLHttpRequest();
    xhr.overrideMimeType("application/json");
    xhr.open("GET", file, true);
    xhr.onreadystatechange = function(){
      if (xhr.readyState === 4 && xhr.status === 200) {
        self.translateJSON = JSON.parse(xhr.responseText);
      }
    };
    xhr.send(null);
  },

  translate: function(key) {
    if (this.translateJSON && this.translateJSON[key]) {
      return this.translateJSON[key];
    }
    return key;
  },

  getDom: function() {
    return this.wrapper;
  },

});
