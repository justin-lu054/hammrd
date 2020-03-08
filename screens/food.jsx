import React, { Component } from 'react';
import { View, StyleSheet, Button, Text, Dimensions, Icon, TouchableOpacity, TouchableNativeFeedback } from 'react-native';
import MapView from 'react-native-maps'; 
import Polyline from '@mapbox/polyline'; 
import * as Location from 'expo-location'; 
import * as Permissions from 'expo-permissions';
import getDirections from 'react-native-google-maps-directions';
import { LinearGradient } from 'expo-linear-gradient';


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


class Food extends Component {
    state = {
        coordinates: [], 
        userLocation: null, 
        foodLocation: null
    }

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
                latitude: this.state.foodLocation.latitude, 
                longitude: this.state.foodLocation.longitude
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
                `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&mode=walking&key=AIzaSyCp19sWPQVlG1V8m9cUB9gLGszUAwNXa4U`
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
    
    getNearestRestaurant(latitude, longitude) {
        return new Promise((resolve, reject) => {
            fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?rankby=distance&key=AIzaSyCp19sWPQVlG1V8m9cUB9gLGszUAwNXa4U&location=${latitude},${longitude}&type=restaurant&fields=name&keyword=fast%20food&opennow=true`)
            .then(res => res.json())
            .then(
                json => {
                    var coordinates = {
                        "latitude": json.results[0].geometry.location.lat,
                        "longitude": json.results[0].geometry.location.lng
                    }
                    resolve(coordinates); 
                }
            ); 
        });
    }

    componentDidMount() {
        this.getLocationAsync().then(() => {    
                                        var userLocation = Object.values(this.state.userLocation).join(","); 
                                        this.getNearestRestaurant(this.state.userLocation.latitude, this.state.userLocation.longitude)
                                        .then((coordinates) => {
                                            this.setState({foodLocation: coordinates});
                                            var restaurantLocation = Object.values(coordinates).join(","); 
                                            this.mapDirections(userLocation, restaurantLocation)});
                                        });     
    }

    render() { 
        console.log(this.state.userLocation);
        const {userLocation} = this.state; 
        return (
            <React.Fragment>
                
                <View style={styles.container}>
                
                <TouchableOpacity onPress={() => navigation.navigate("GetHome")} title="Home"
                    style={{ height: 100, width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 290, backgroundColor: '#454545', borderRadius: 30, opacity: 0.75}}>
                    <Text style={{ color: '#fff', fontSize: 30, fontFamily: 'Suisse-Intl-Medium'}}>where you're going</Text>
                </TouchableOpacity>


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
                        {this.state.foodLocation && (
                            <MapView.Marker coordinate={this.state.foodLocation}>
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
                <View style={styles.buttonContainer}>
                    <TouchableOpacity title="test" style={styles.buttonStyle} onPress={this.handleGetDirections} >
                        <Text style={{ color: '#fff', fontSize: 30, fontFamily: 'Suisse-Intl-Medium' }}>take me to food</Text>
                    </TouchableOpacity>
                    <TouchableOpacity title="test" style={styles.buttonStyle} onPress={this.handleGetDirections}>
                        <Text>Take me to food!</Text>
                    </TouchableOpacity>
                </View>
            </React.Fragment>
        );
    }
}
 
export default Food;
