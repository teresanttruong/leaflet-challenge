// Establish dataset url
let url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'

// Create base map and layer to hold earthquake markers
function createMap(earthquakes) {

    let USmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let baseMaps = {
        "Street Map": USmap
      };

    let overlayMaps = {
        "All Earthquakes from the Past 7 Days": earthquakes
      };

    let map = L.map("map", {
        center: [39.83, -98.58],
        zoom: 5,
        layers: [USmap, earthquakes]
      })

    let legend = L.control({position: 'bottomleft'});
    legend.onAdd = function () {
          let div = L.DomUtil.create("div", "info legend");
      
          let grades = [-10, 10, 30, 50, 70, 90];
          let colors = [
            "#33ff99",
            "#33ff33",
            "#99ff33",
            "#ffff33",
            "#ff9933",
            "#ff3333"];
      
          // Loop through our intervals and generate a label with a colored square for each interval.
          for (let i = 0; i < grades.length; i++) {
            div.innerHTML += "<i style='background: "
              + colors[i]
              + "'></i> "
              + grades[i]
              + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
          }
          return div;
        }
    legend.addTo(map)
      
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);
}

// Determine marker size
function markerSize(magnitude) {
    return magnitude * 15000;
  }

  // Determine marker color
function chooseColor(depth) {
    switch (true) {
        case Number(depth) < 10: return '#33ff99'
        case Number(depth) < 30: return '#33ff33'
        case Number(depth) < 50: return '#99ff33'
        case Number(depth)< 70: return '#ffff33'
        case Number(depth) < 90: return '#ff9933'
        case Number(depth) >= 90: return '#ff3333'
        default: return 'gray'
    }
}

// Create earthquake markers
function createMarkers(response) {
    let recordedEarthquakes = response.features;
    let earthquakeMarkers = []

    for (let index = 0; index < recordedEarthquakes.length; index++) {
        let earthquake = recordedEarthquakes[index]

        let earthquakeMarker = L.circle([earthquake.geometry.coordinates[1],earthquake.geometry.coordinates[0]], {
            fillOpacity: 0.25,
            //Color is based on earthquake depth
            color: chooseColor(earthquake.geometry.coordinates[2]),
            fillColor: chooseColor(earthquake.geometry.coordinates[2]),
            //Radius is based on earthquake magnitude
            radius: markerSize(earthquake.properties.mag)
        })
        //Create popup that includes location, depth, and magnitude
        .bindPopup(`<h2>Location: ${earthquake.properties.place}</h2> <hr> 
                    <h3>Depth: ${earthquake.geometry.coordinates[2]} <br>
                        Magnitude: ${earthquake.properties.mag}</h3>`)

        earthquakeMarkers.push(earthquakeMarker)
    }

    createMap(L.layerGroup(earthquakeMarkers))
}

// Get data from url and call createMarkers
d3.json(url).then(createMarkers)