Module.register("MMM-Bensinpriser", {
  defaults: {
    apiURL: "https://api.drivstoffappen.no/api/stations?stationType=0&countryCode=no",
    apiKey: "YOUR_API_KEY",
    coordinates: {
      latitude: 59.910761,  // Defaults to Aker Brygge, Oslo
      longitude: 10.728128, // Defaults to Aker Brygge, Oslo
    },
    numberOfStations: 5,
    updateInterval: 60000, // Update interval in milliseconds (1 minute)
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
    }, this.config.updateInterval);
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

  loadLanguageJSON: function(language) {
    const self = this;
    const file = this.file(`translations/${language}.json`);
    console.log(file);
    const xhr = new XMLHttpRequest();
    xhr.overrideMimeType("application/json");
    xhr.open("GET", file, true);
    xhr.onreadystatechange = function() {
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

  // ... other functions ...
});
