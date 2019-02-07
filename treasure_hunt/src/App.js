import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

// initialize big_map
if (localStorage.getItem('big_map') === null) {
  localStorage.setItem('big_map', JSON.stringify({}))
} 

// send token on header of every request
const secret_token = 'Token a8c8c5dc999d0ce160ce55b343e72be7694b27aa'
axios.defaults.headers.common['Authorization'] = secret_token;

// Build Queue class for breadth first search
class Queue {
  constructor() {
    this.storage = [];
  }

  enqueue(item) {
    this.storage.push(item);
  }

  dequeue() {
    return this.storage.splice(0, 1)
  }
}

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
        "encumbrance": 0,  // How much are you carrying
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
  breadthFirstSearch() {
    let paths = new Queue();
    const big_map = localStorage.getItem('big_map');
    // do bfs to find room with question mark and return path to that room
    paths.enqueue([this.state.current_room.room_id]);
    const current_path = null;

    while (paths.length > 0) {
      current_path = paths.dequeue();
      // is there a question mark in this room on the big map?
      

    }

    // return path;
  }

  // walk into unvisited rooms until you cant, 
  // then run bfs to find next unvisited spot
  traverseMaze() {
    // if room is not on big map
      // add room to map
      // fill in known exits in previous room and new room
    if (!big_map[this.state.current_room.room_id]) {
      big_map[this.state.current_room.room_id] = {};
      const exits = this.state.current_room.exits.split('');
      for (let i = 0; i < exits.length; i++) {
        big_map[this.state.current_room.room_id][exits[i]] = '?';
      }
      // big_map[this.state.current_room.room_id][opposite direction of last move] = last_room
      // big_map[this.state.previous_room][direction of last move] = current_room
    }
    
    // if room has a question mark in its big map entry
      // go to the question mark

    // if room has no question marks
      // use bfs to find path to closest room with question mark
      // go to that room

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
