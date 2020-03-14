import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Dimensions, TextInput, Keyboard, AsyncStorage, KeyboardAvoidingView, TouchableHighlight} from 'react-native';
import apikeys from '../apikeys.json';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column", 
        margin: 10,
        marginBottom:10,
        justifyContent: "center",
    }, 
    address: {
        borderWidth: 1,
        borderColor: "#CCCCCC",  
        padding: 15, 
        margin: 5
    }, 
    saveButton: {
        borderWidth: 1,
        borderColor: "#007BFF", 
        backgroundColor: "#007BFF", 
        padding: 15, 
        margin: 5
    }, 
    saveButtonText: {
        color: "#FFFFFF",
        fontSize: 20, 
        textAlign: "center"
    },
    locationSuggestion: {
        backgroundColor: "white", 
        padding: 5,
        borderWidth: 0.5, 
        fontSize: 18
    }
});


class Settings extends Component {
    state = {
        address: "", 
        name: "", 
        contact: "",
        locationSuggestions: []
    };

    handleChange = (key, text) => {
        this.setState({[key]: text}); 
    }
    
    saveData = async () => {
        await AsyncStorage.setItem("address", this.state.address); //.then(console.log("test")); 
        await AsyncStorage.setItem("name", this.state.name); //.then(console.log("test2")); 
        await AsyncStorage.setItem("contact", this.state.contact); //.then(console.log("test3")).then(alert("Information saved!")); 
        alert("Information saved!"); 
    }

    componentDidMount = async () => {
        console.log("mount")
        console.log(apikeys.GOOGLE_MAPS_API_KEY);
        address = await AsyncStorage.getItem("address");
        name = await AsyncStorage.getItem("name"); 
        contact = await AsyncStorage.getItem("contact"); 
        this.setState({"address": address, "name": name, "contact": contact}); 
    }

    onChangeAddress = async (address) => {
        this.setState({address: address}); 
        const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${apikeys.GOOGLE_MAPS_API_KEY}&input={${address}}`;
        const result = await fetch(apiUrl); 
        const json = await result.json(); 
        this.setState({locationSuggestions: json.predictions}); 
    }

    render() {
        const locationSuggestions = this.state.locationSuggestions.map(
            prediction => (
                <TouchableHighlight key={prediction.id}
                                    onPress = {() => this.setState({address: prediction.description})}>
                    <Text style={styles.locationSuggestion}>
                        {prediction.description}
                    </Text>
                </TouchableHighlight>
            )
        );

        return (
           <KeyboardAvoidingView style={styles.container} behavior="padding">
                <Text>Emergency Contact Name</Text>
                <TextInput
                    style={styles.address}
                    placeholder="Contact Name"
                    maxLength={20}
                    value={this.state.name}
                    onChangeText={(text) => this.handleChange("name", text)}>
                </TextInput>

                <Text>Emergency Contact Number</Text>
                <TextInput
                    style={styles.address}
                    placeholder="Phone Number"
                    maxLength={20}
                    value={this.state.contact}
                    onChangeText={(text) => this.handleChange("contact", text)}>
                </TextInput>

                <Text>Address</Text>
                <TextInput
                    style={styles.address}
                    placeholder="Address"
                    maxLength={100}
                    value={this.state.address}
                    onChangeText={this.onChangeAddress}>
                </TextInput>
                {locationSuggestions}
                <TouchableOpacity style={styles.saveButton}
                                onPress={this.saveData}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
           </KeyboardAvoidingView>
        );
    }
}

export default Settings;
