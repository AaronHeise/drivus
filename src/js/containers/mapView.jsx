import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import msToTime from '../helpers/msToTime';

class MapView extends Component {

  componentDidMount() {
    // Allows directions to be rendered on the map
    let directionsDisplay = new google.maps.DirectionsRenderer({
      suppressMarkers: true
    });
    // Creates persistent map for session
    let map = new google.maps.Map(document.querySelector('.map-container'), {
      center: this.props.currentCoords.start || { lat: 37.773972, lng: -122.431297 },
      scrollwheel: false,
      zoom: 10,
      disableDefaultUI: true,
      scaleControl: true,
      zoomControl: true,
      styles: [{
          "featureType": "landscape.natural",
          "elementType": "geometry.fill",
          "stylers": [{
            "visibility": "on"
          }, {
            "color": "#e0efef"
          }]
        }, {
          "featureType": "poi",
          "elementType": "geometry.fill",
          "stylers": [{
            "visibility": "on"
          }, {
            "hue": "#1900ff"
          }, {
            "color": "#c0e8e8"
          }]
        }, {
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [{
            "lightness": 100
          }, {
            "visibility": "simplified"
          }]
        }, {
          "featureType": "road",
          "elementType": "labels",
          "stylers": [{
            "visibility": "off"
          }]
        }, {
          "featureType": "transit.line",
          "elementType": "geometry",
          "stylers": [{
            "visibility": "on"
          }, {
            "lightness": 700
          }]
        }, {
          "featureType": "water",
          "elementType": "all",
          "stylers": [{
            "color": "#7dcdcd"
          }]
        }]
      });
    let center = map.getCenter();
    // Sets the directionsDisplay to the current map
    directionsDisplay.setMap(map);
    this.setState({
      center: center,
      map: map,
      directionsDisplay: directionsDisplay,
      markers: []
    });
  }
  componentWillReceiveProps() {
    // If new coords, remove old position markers
    if (this.props.currentCoords.start || this.props.currentCoords.end) {
      for (let marker in this.props.routeMarkers) {
        this.props.routeMarkers[marker].setMap(null);
      }
      // Removes expanded markers as well
      for (let marker in this.props.expandedMarkers) {
        if (this.props.expandedMarkers[marker]) {
          this.props.expandedMarkers[marker].setMap(null);
          this.props.expandedMarkers[marker]=null;
        }
      }
      if (this.props.expandedCircle) {
        let circles = this.props.expandedCircle;
        for (let i in circles) {
          if (circles[i]) { circles[i].setMap(null); }
        }
      }
    }
  }
  componentDidUpdate() {
    // Creates direction path on map
    if (this.props.directions && this.props.walkingTime) {
      if (this.props.walkingTime.routes[0].legs[0].duration.value >= 2700) {
        this.state.directionsDisplay.setDirections(this.props.directions);
      } else {
        this.state.directionsDisplay.setDirections(this.props.walkingTime)
      }
    }
    // Drop route markers on map
    if (this.props.routeMarkers.start) {
      let markers = this.props.routeMarkers,
          bounds = new google.maps.LatLngBounds();
      for (let data in markers) {
        if (markers[data].position) {
          markers[data].setMap(this.state.map);
          bounds.extend(markers[data].getPosition());
        }
      }
      this.state.map.fitBounds(bounds);
    }
    // Set expanded markers and remove current directions (for closer bounding box)
    if (this.props.expandedMarkers.close || this.props.expandedMarkers.medium || this.props.expandedMarkers.far) {
      this.state.directionsDisplay.set('directions', null);
      var markers = this.props.expandedMarkers,
          bounds = new google.maps.LatLngBounds();
      for (let data in markers) {
        if (markers[data].position) {
          markers[data].setMap(this.state.map);
          bounds.extend(markers[data].getPosition());
        }
      }
      // Extends bounds to include expanded markers and start location
      bounds.extend(this.props.routeMarkers['start'].getPosition());
      this.state.map.fitBounds(bounds);
    }

    // Sets circle on map
    if (this.props.expandedCircle.close || this.props.expandedCircle.medium || this.props.expandedCircle.far) {
      let circles = this.props.expandedCircle;
      // this.state.directionsDisplay.set('directions', null);
      for (let i in circles) {
        bounds = new google.maps.LatLngBounds();
        circles[i].setMap(this.state.map)
        this.state.map.fitBounds(circles[i].getBounds());
        if( navigator.userAgent.match(/(Android|webOS|i(Phone|Pad|Pod)|BlackBerry|Windows Phone)/i)) {
          this.state.map.setZoom(this.state.map.getZoom() + 1);
        }
      }
    }
  }
  render() {
    let walkingDistance;
    // Displays walking time if less than 45 minutes
    if (this.props.walkingTime && this.props.walkingTime.routes[0].legs[0].duration.value <= 2700) {
      let time = msToTime(Date.now()+(this.props.walkingTime.routes[0].legs[0].duration.value)*1000),
      message = `Arrival walking: ${time}`;
      walkingDistance = <div className="walking-distance">{message}</div>;
      }
      return (
        <div id="map-display">
          {walkingDistance}
          <div className="map-container">
          </div>
        </div>
      );
    }
  }

function mapStateToProps(state) {
  return {
    currentCoords: state.currentCoords,
    routeMarkers: state.routeMarkers,
    expandedMarkers: state.expandedMarkers,
    expandedCircle: state.expandedCircle,
    directions: state.directions,
    walkingTime: state.walkingTime
  }
}
export default connect(mapStateToProps)(MapView);
