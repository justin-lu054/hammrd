import React, { Component } from 'react';
import { View, StyleSheet, Button, Text, Dimensions, Icon, TouchableOpacity, TouchableNativeFeedback } from 'react-native';
import MapView from 'react-native-maps'; 
import Polyline from '@mapbox/polyline'; 
import * as Location from 'expo-location'; 
import * as Permissions from 'expo-permissions';
import getDirections from 'react-native-google-maps-directions'; 


const styles = StyleSheet.create({
  container: {
      flex: 2,
      justifyContent: "center",
      alignItems: "center"
  },

   
  buttonStyle: {
      height: 100, 
      width: '100%', 
      backgroundColor: '#c471f5',
      justifyContent: 'center',
      alignItems: 'center',
      opacity: 0.75,
      borderRadius: 30
  },

  mapStyle: {
      width: Dimensions.get("window").width, 
      height: Dimensions.get("window").height
  }
});

class GetHome extends Component {
  state = {
    coordinates: [], 
    userLocation : null, 
    homeLocation: {
      latitude: 43.866756, 
      longitude: -79.348833
    } 
  };

  constructor() {
    super(); 
    this.mapDirections = this.mapDirections.bind(this); 
    this.handleGetDirections = this.handleGetDirections.bind(this); 
    this.getLocationAsync = this.getLocationAsync.bind(this); 
  }

  handleGetDirections = () => {
        const data = {
            source: {
                latitude: this.state.userLocation.latitude, 
                longitude: this.state.userLocation.longitude
            },
            destination: {
                latitude: this.state.homeLocation.latitude, 
                longitude: this.state.userLocation.longitude
            }, 
            params: [
                {
                    key:"travelmode",
                    value:"walking"
                },
                {
                    key:"dir_action",
                    value:"navigate"
                }
            ],
        }
        getDirections(data); 
    }

    async mapDirections(startLoc, destinationLoc) {
        try {
            let resp = await fetch(
                `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&mode=walking&key=`
            );
            let respJson = await resp.json(); 
            let points = Polyline.decode(respJson.routes[0].overview_polyline.points); 
            let coords = points.map((point, index) => {
                return {
                    latitude: point[0], 
                    longitude: point[1]
                };
            }); 
            const newCoords = [...this.state.coordinates, coords]; 
            this.setState({coordinates: newCoords}); 
            return coords; 
        }
        catch (error) {
            alert(error); 
            return error; 
        }
    }
    
    async getLocationAsync() {
        var { status } = await Permissions.askAsync(Permissions.LOCATION); 
        if (status !== "granted") {
            alert("Permission to access location denied."); 
        }
        var location = await Location.getCurrentPositionAsync({}); 
        this.setState({userLocation: {"latitude": location.coords.latitude, "longitude": location.coords.longitude}}); 
    }
    
    

    componentDidMount() {
        this.getLocationAsync().then(() => {    
                                        var userLocation = Object.values(this.state.userLocation).join(","); 
                                        var homeLocation = Object.values(this.state.homeLocation).join(","); 
                                        this.mapDirections(userLocation, homeLocation); 
                                        /*
                                        this.getNearestRestaurant(this.state.userLocation.latitude, this.state.userLocation.longitude)
                                        .then((coordinates) => {
                                            this.setState({foodLocation: coordinates});
                                            var restaurantLocation = Object.values(coordinates).join(","); 
                                            this.mapDirections(userLocation, restaurantLocation)});
                                          */
                                        });     
    }

  render() {
    const {userLocation} = this.state; 
    return (
        <React.Fragment>
            <View style={styles.container}>
                <MapView style={styles.mapStyle}
                        region={{
                            latitude: userLocation!=null ? userLocation.latitude : 37.78825,
                            longitude: userLocation!=null ? userLocation.longitude : -122.4234,
                            latitudeDelta: 0.01, 
                            longitudeDelta: 0.01
                        }}>
                    {userLocation && (
                        <MapView.Marker coordinate={userLocation}>
                        </MapView.Marker>
                    )}
                    {this.state.homeLocation && (
                        <MapView.Marker coordinate={this.state.homeLocation}>
                        </MapView.Marker>
                    )}
                    {this.state.coordinates.map((coords, index) => (
                        <MapView.Polyline key={index}
                                        index={index}
                                        coordinates={coords}
                                        strokeWidth={2}
                                        strokeColor="blue"></MapView.Polyline>
                    ))}
                </MapView>
            </View>
            {userLocation && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity title="test" style={styles.buttonStyle} onPress={this.handleGetDirections} >
                        <Text style={{ color: '#fff', fontSize: 30, fontFamily: 'Suisse-Intl-Medium' }}>take me to home</Text>
                    </TouchableOpacity>
                </View>
            )}
            
        </React.Fragment>);
  }
}

export default GetHome;
