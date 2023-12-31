Module.register("MMM-Bensinpriser", {
  defaults: {
    apiURL: "https://api.drivstoffappen.no/api/stations?stationType=0&countryCode=no",
    apiKey: "YOUR_API_KEY",
    coordinates: {
      latitude: 59.910981, // Aker Brygge latitude, Oslo
      longitude: 10.727169, // Aker Brygge longitude, Oslo
    },
    numberOfStations: 3, // Number of gas stations to show
    updateInterval: 180, // Update interval in minutes (default 3 hours)
    fuelTypes: ["95", "D"], // The fuel types you want to display (95, 98, 100, D, FD or EN590)
    decimalSeparator: "." // You can set it to "." or ","

  },

  start: function () {
    this.wrapper = document.createElement("div");
    this.wrapper.className = "fuel-price-wrapper";
    this.content = document.createElement("div");
    this.content.className = "fuel-price-content";

    this.wrapper.appendChild(this.content);
    this.loadLanguageJSON(config.language);
    this.loadData();
    this.scheduleUpdate();
  },

  scheduleUpdate: function () {
    const self = this;
    setInterval(function () {
      self.loadData();
    }, this.config.updateInterval * 60000);
  },

  // ... other functions ...

  loadData: function () {
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


  sortStationsByDistance: function (stations) {
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

  deg2rad: function (deg) {
    return deg * (Math.PI / 180);
  },

  // Calculating distance between two points on a globe
  calculateDistance: function (lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  },

  createTable: function (stations) {
    const self = this;
    const table = document.createElement("table");
    table.className = "fuel-price-table";

    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `<th></th><th>${self.translate("stationHeader")}</th>${this.config.fuelTypes.map(type => `<th>${type}</th>`).join("")}`;
    table.appendChild(headerRow);

    updates = [];
    for (const station of stations) {
      const stationRow = document.createElement("tr");
      const stationName = station.name + (station.extras?.facilities?.airPump ? " &#129520;" : ""); // Add marker if there are airpumps at the given station
      stationRow.innerHTML = `<td><img class="station-icon" src="${station.pictureUrl}"></td><td>${stationName}</td>${this.config.fuelTypes.map(type => this.getPriceCell(station, type)).join("")}`;
      table.appendChild(stationRow);

      updates.push(new Date(station.lastUpdated));
    }

    const wrapper = document.createElement("div");
    wrapper.appendChild(table);
    const lastUpdate = document.createElement("p");
    lastUpdate.className = "fuel-last-updated";


    const seconds = Math.floor((new Date() - new Date(Math.min.apply(null, updates))));
    // If time is more than 30 minutes, show hours
    if (seconds > 1800000) {
      lastUpdate.innerHTML = `Sist oppdatert for ${Math.round(seconds / 3600000)} ${Math.round(seconds / 3600000) > 1 ? "timer" : "time"} siden`;
    } else {
      lastUpdate.innerHTML = `Oppdatert nå nettopp`;
    }

    wrapper.appendChild(lastUpdate);

    return wrapper;
  },

  getPriceCell: function (station, type) {
    const fuelTypeDetails = station.stationDetails.find(detail => detail.type === type);
    const decimalSeparator = this.config.decimalSeparator; // Get the configured decimal separator
    const priceFormatted = fuelTypeDetails ? `${fuelTypeDetails.price.toFixed(2).replace(".", decimalSeparator)} kr` : "";
    return `<td>${priceFormatted}</td>`;
  },


  loadLanguageJSON: function (language) {
    const self = this;
    const file = this.file(`translations/${language}.json`);
    const xhr = new XMLHttpRequest();
    xhr.overrideMimeType("application/json");
    xhr.open("GET", file, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        self.translateJSON = JSON.parse(xhr.responseText);
      }
    };
    xhr.send(null);
  },

  translate: function (key) {
    if (this.translateJSON && this.translateJSON[key]) {
      return this.translateJSON[key];
    }
    return key;
  },

  getStyles: function () {
    return ["MMM-Bensinpriser.css"]; // Add your CSS file
  },

  getDom: function () {
    return this.wrapper;
  },

});