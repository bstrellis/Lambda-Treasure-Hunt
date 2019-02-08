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
      previous_room: {
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
      },
      last_direction: '',
      big_map: JSON.parse(localStorage.getItem('big_map'))
    }
  }

  componentDidMount() {
    axios.get('https://lambda-treasure-hunt.herokuapp.com/api/adv/init/')
      .then(response => this.setState({
        current_room: response.data,
        previous_room: response.data
      }))
      .catch(err => console.log(`init error: ${err}`));
    axios.post('https://lambda-treasure-hunt.herokuapp.com/api/adv/status/')
      .then(response => this.setState({player_status: response.data}))
      .catch(err => console.log(`status error: ${err}`));
    console.log(this.state);
  }

  reverse(direction) {
    const reverse_lookup = {
      'n':'s',
      's':'n',
      'e':'w',
      'w':'e'
    };
    return reverse_lookup[direction];
  }
  
  // find a question mark on your map  
  // and the shortest path to it
  breadthFirstSearch(big_map) {
    let paths = [];
    let visited = [];
    let current_path = null;
    let cur_room = null;
    
    paths.push([this.state.current_room.room_id]);

    while (paths.length > 0) {
      current_path = paths.splice(0, 1);
      cur_room = current_path[-1];
      visited.push(cur_room);

      // is there a question mark in this room on the big map?
      const exits = Object.entries(big_map[cur_room]);
      for (let i = 0; i < exits.length; i++) {
        if (exits[i] === '?') {
          return current_path[0];
        }
      }
      // no question marks here. go to the connecting rooms and try again
      for (let z = 0; z < exits.length; z++) {
        if (!visited.includes(exits[z][0])) {
          const new_path = current_path.splice();
          new_path.push(exits[z][1]);
          paths.push(new_path);
        }
      }
    }

    return false;
  }
    


  traverseMaze() {
    // Add entry to map if this room is new
    if (!big_map[this.state.current_room.room_id]) {
      big_map[this.state.current_room.room_id] = {};
      console.log(this.state.current_room);
      const exits = this.state.current_room.exits;
      for (let i = 0; i < exits.length; i++) {
        big_map[this.state.current_room.room_id][exits[i]] = '?';
      }
    }
    // add entries to big map
    // should only happen when last direction entered a question mark?
    big_map[this.state.previous_room.room_id][this.state.last_direction] = this.state.current_room.room_id;
    big_map[this.state.current_room.room_id][this.reverse(this.state.last_direction)] = this.state.previous_room.room_id;

    // Push map changes to localStorage
    localStorage.setItem('big_map', JSON.stringify(big_map));

    // Map updated. choose a new direction
    let next_direction = null;
    const exits_ = this.state.current_room.exits;
    // if room has a question mark in its big map entry
    for (let j = 0; j < exits_.length; j++) {
      if (exits_[j] === '?') {
        next_direction = exits_[j];
        break;
      }
    }
    // if room has no question marks to go to... FILL IN
    

    // travel in new direction
    console.log(`%%%%% next_direction: ${next_direction}`);
    if (next_direction) {
      axios.post('https://lambda-treasure-hunt.herokuapp.com/api/adv/move/', { 'direction': next_direction })
        .then(response => {
          this.setState({
            previous_room: this.state.current_room
          });
          this.setState({
            current_room: response.data
          });
        })
    }
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
