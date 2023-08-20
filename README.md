# MMM-Bensinpriser
MMM-Bensinpriser is a MagicMirror² module that displays fuel prices for your nearest gas stations in Norway.

## Installation
1. Clone the MMM-Bensinpriser repository into the `modules` directory of your MagicMirror²:
   ```shell
   cd ~/MagicMirror/modules
   git clone https://github.com/ItsMeBrille/MMM-Bensinpriser.git
   ```

2. Install the required dependencies:
   ```shell
   cd MMM-Bensinpriser
   npm install
   ```

## Configuration
To use MMM-Bensinpriser, add it to the `modules` array in the `config/config.js` file of your MagicMirror installation:
```javascript
{
  module: "MMM-Bensinpriser",
  position: "bottom_left",
  config: {
    apiKey: "24ACBFDD74F54688B46D425104009AD9FC48CEBC-A",
    coordinates: {
      latitude: 61.151011, // Aker Brygge latitude, Oslo
      longitude: 10.382726, // Aker Brygge longitude, Oslo
    },
    numberOfStations: 3,
    updateInterval: 60, // Update interval in milliseconds (e.g., 1 minute)
    fuelTypes: ["95", "D"], // Add the fuel types you want to display
    decimalSeparator: "." // You can set it to "." or ","
  }
},
```
Replace `YOUR_API_KEY` with your API key for the fuel price data, or use the one provided.

## Usage
The module will display a table with fuel prices for the nearest gas stations based on the specified coordinates. The table will update at the configured interval.

The language is set by the global `language` field in your config.js.

## Dependencies
* MagicMirror² (not tested on versions below 2.12.0)

## License
MMM-Keypress is licensed under the [MIT License](LICENSE).
The MIT License (MIT)
