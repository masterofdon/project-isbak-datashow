import React, {Component} from 'react';
import SO2LevelOverlay from './SO2LevelOverlay';

export default class HeatmapComponent extends Component {

    constructor(props){
        super(props);
        this.state = {
            viewport: {
                ...SO2LevelOverlay.defaultViewport,
                width: window.innerWidth,
                height : window.innerHeight * 0.90
            },
            map : null,
            data: null,
        }
        this.resize = this._resize.bind(this);
    }

    _onViewportChange(viewport) {
        this.setState({
            viewport: { ...this.state.viewport, ...viewport }
        });
    }

    _resize() {
        this._onViewportChange({
            width: window.innerWidth,
            height: window.innerHeight * 0.90
        });
    }

    componentDidMount() {
        window.addEventListener('resize', this.resize);
        this._resize();
    }
    

    componentWillUnmount(){
        var visibility = this.state.map.getLayoutProperty('earthquakes-heat','visibility');
        if (visibility === 'visible') {
            this.state.map.setLayoutProperty('earthquakes-heat', 'visibility', 'none');
        }
        window.removeEventListener('resize',this.resize);
    }

    loadMapData(nodeElement){
        this.state.map = nodeElement.getMap();
        this.state.map.on('load',function(e){
            //Add a geojson point source.
            //Heatmap layers also work with a vector tile source.
            this.addSource('earthquakes', {
                "type": "geojson",
                "data": "earthquakes_output.geojson"
            });
            var layers = this.getStyle().layers;
            // Find the index of the first symbol layer in the map style
            var firstSymbolId;
            for (var i = 0; i < layers.length; i++) {
                if (layers[i].type === 'symbol') {
                    firstSymbolId = layers[i].id;
                    break;
                }
            }
            
            this.addLayer({
                "id": "earthquakes-heat",
                "type": "heatmap",
                "source": "earthquakes",
                "maxzoom": 15,
                "paint": {
                    //Increase the heatmap weight based on frequency and property magnitude
                    "heatmap-weight": {
                        "property": "mag",
                        "type": "exponential",
                        "stops": [
                            [0, 0],
                            [50, 1]
                        ]
                    },
                    //Increase the heatmap color weight weight by zoom level
                    //heatmap-ntensity is a multiplier on top of heatmap-weight
                    "heatmap-intensity": {
                        "stops": [
                            [0, 1],
                            [20, 2]
                        ]
                    },
                    //Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                    //Begin color ramp at 0-stop with a 0-transparancy color
                    //to create a blur-like effect.
                    "heatmap-color": [
                        "interpolate",
                        ["linear"],
                        ["heatmap-density"],
                        // 0, "rgba(33,102,172,0)",
                        // 0.2, "rgb(103,169,207)",
                        // 0.4, "rgb(209,229,240)",
                        // 0.6, "rgb(253,219,199)",
                        // 0.8, "rgb(239,138,98)",
                        // 1, "rgb(178,24,43)"
                        0, "rgba(24, 170, 5, 0)",
                        0.2, "rgba(24, 170, 5,0.80)",
                        0.4, "rgba(229, 212, 22,0.80)",                        
                        0.6, "rgba(229, 173, 22,0.80)",
                        0.8, "rgba(229, 122, 22,0.80)",
                        1, "rgba(178,24,43,0.80)"
                    ],
                    //Adjust the heatmap radius by zoom level
                    "heatmap-radius": {
                        "stops": [
                            [0, 5],
                            [15, 20]
                        ]
                    },
                    //Transition from heatmap to circle layer by zoom level
                    "heatmap-opacity": {
                        "default": 1,
                        "stops": [
                            [10, 1],
                            [20, 0]
                        ]
                    },
                }
            }, firstSymbolId);
        
            // this.addLayer({
            //     "id": "earthquakes-point",
            //     "type": "circle",
            //     "source": "earthquakes",
            //     "minzoom": 7,
            //     "paint": {
            //         //Size circle raidus by earthquake magnitude and zoom level
            //         "circle-radius": {
            //             "property": "mag",
            //             "type": "exponential",
            //             "stops": [
            //                 [{ zoom: 7, value: 1 }, 1],
            //                 [{ zoom: 7, value: 6 }, 4],
            //                 [{ zoom: 16, value: 1 }, 5],
            //                 [{ zoom: 16, value: 6 }, 50],
            //             ]
            //         },
            //         //Color circle by earthquake magnitude
            //         "circle-color": {
            //             "property": "mag",
            //             "type": "exponential",
            //             "stops": [
            //                 [1, "rgba(33,102,172,0)"],
            //                 [2, "rgb(103,169,207)"],
            //                 [3, "rgb(209,229,240)"],
            //                 [4, "rgb(253,219,199)"],
            //                 [5, "rgb(239,138,98)"],
            //                 [6, "rgb(178,24,43)"]
            //             ]
            //         },
            //         "circle-stroke-color": "white",
            //         "circle-stroke-width": 1,
            //         //Transition from heatmap to circle layer by zoom level
            //         "circle-opacity": {
            //             "stops": [
            //                 [7, 0],
            //                 [8, 1]
            //             ]
            //         }
            //     }
            // }, 'waterway-label');
        }.bind(this.state.map));
    }

    render(){
        const {map} = this.props;
        if(map){
            this.state.map = map;
            this.loadMapData(map);
        }
        return(
            <input type={'hidden'} />
        );
    }

}