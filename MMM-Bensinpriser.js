Module.register("MMM-Bensinpriser", {
  defaults: {
    apiURL: "https://api.drivstoffappen.no/api/stations?stationType=0&countryCode=no",
    apiKey: "YOUR_API_KEY", // No default value, will return unauthorized when not passed a valid key
    coordinates: {
      latitude: 59.910761,  // Defaults to Aker Brygge, Oslo
      longitude: 10.728128, // Defaults to Aker Brygge, Oslo
    },
    numberOfStations: 5, // no. of stations shown in the table
    updateInterval: 60000, // Update interval in milliseconds (1 minute)
  },

  start: function() {
    this.loadData();
    this.scheduleUpdate();
  },

  scheduleUpdate: function() {
    const self = this;
    setInterval(function() {
      self.loadData();
    }, this.config.updateInterval);
  },

  loadData: function() {
    const url = `${this.config.apiURL}`;
    const headers = {
      "X-API-KEY": this.config.apiKey,
    };

    const self = this;
    fetch(url, { headers })
      .then(response => {
        if (response.status === 401) {
          self.updateDom(self.createWarning("Unauthorized. Check your API key."));
          return;
        }
        return response.json();
      })
      .then(data => {
        if (!data) {
          return; // Exit early if unauthorized
        }
        const sortedStations = self.sortStationsByDistance(data);
        const nearestStations = sortedStations.slice(0, self.config.numberOfStations);
        self.updateDom(self.createTable(nearestStations));
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        self.updateDom(self.createWarning("Error fetching data."));
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

    for (const station of stations) {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${station.name}</td><td>${station.stationDetails[0].price} Kr</td>`;
      table.appendChild(row);
    }

    const wrapper = document.createElement("div");
    wrapper.appendChild(table);

    return wrapper;
  },

  createWarning: function(message) {
    const warningElement = document.createElement("div");
    warningElement.className = "warning";
    warningElement.innerHTML = message;
    return warningElement;
  },

  getStyles: function() {
    return ["MMM-Bensinpriser.css"]; // Add your CSS file
  },

  getDom: function() {
    return this.wrapper;
  },
});