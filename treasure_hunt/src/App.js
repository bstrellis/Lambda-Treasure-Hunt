import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

const secret_token = 'Token a8c8c5dc999d0ce160ce55b343e72be7694b27aa'
axios.defaults.headers.common['Authorization'] = secret_token;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current_room: {
        "room_id": 0,
        "title": "",
        "description": "",
        "coordinates": "",
        "players": [],
        "items": [],
        "exits": [],
        "cooldown": 0,
        "errors": [],
        "messages": []
    },
      player_status: {
        "name": "",
        "cooldown": 0,
        "encumbrance": 0,  // How much are you carrying?
        "strength": 0,  // How much can you carry?
        "speed": 0,  // How fast do you travel?
        "gold": 0,
        "inventory": [],
        "status": [],
        "errors": [],
        "messages": []
      }
    }
  }

  componentDidMount() {
    axios.get('https://lambda-treasure-hunt.herokuapp.com/api/adv/init/')
      .then(response => this.setState({current_room: response.data}))
      .catch(err => console.log(err));
    axios.post('https://lambda-treasure-hunt.herokuapp.com/api/adv/status/')
      .then(response => this.setState({player_status: response.data}))
      .catch(err => console.log(err));
  }

  // find a question mark on your map  
  // and the shortest path to it
  // (run bfs on your map)
  breadthFirstSearch(big_map, current_room) {
    let path = [];
    // do bfs to find room with question mark and return path to that room
    return path;
  }

  traverseMaze(big_map, current_room) {
    // traverseMaze returns the direction of the player's next move
    const next_path = this.breadthFirstSearch(big_map, current_room);
    
    // travel along the path to the question mark
    for (let i = 0; i < next_path.length; i++) {
      axios.post('https://lambda-treasure-hunt.herokuapp.com/api/adv/move/', 
        {'direction': next_path[i]})
        .then(response => this.setState({current_room: response.data}))
        .catch(err => console.log(err))
    }

    // take first question mark path
    when current_room == target
    // run bfs on your current map to find closed question mark and path to it
   
  }
  


  render() {
    return (
      <div className="App">
        <div>
          <ul>Location {this.state.current_room.room_id}</ul>
          <ul>{this.state.current_room.title}</ul>
          <ul>{this.state.current_room.description}</ul>
          <ul>{this.state.current_room.coordinates}</ul>
          <ul>{this.state.current_room.items}</ul>
          <ul>{this.state.current_room.exits}</ul>
          <ul>Messages: {this.state.current_room.messages}</ul>
          <ul>Errors: {this.state.current_room.errors}</ul>
        </div>
        <div>
          <ul>Name: {this.state.player_status.name}</ul>
          <ul>Cooldown: {this.state.player_status.cooldown}</ul>
          <ul>Encumbrance: {this.state.player_status.encumbrance}</ul>
          <ul>Strength: {this.state.player_status.strength}</ul>
          <ul>Speed: {this.state.player_status.speed}</ul>
          <ul>Gold: {this.state.player_status.gold}</ul>
          <ul>Inventory: {this.state.player_status.inventory}</ul>
          <ul>Status: {this.state.player_status.status}</ul>
          <ul>Messages: {this.state.player_status.messages}</ul>
          <ul>Errors: {this.state.player_status.errors}</ul>
        </div>
      </div>
    );
  }
}

export default App;
