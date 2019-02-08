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

  async componentDidMount() {
    try {
      // if POST is made after GET, it throws 400 error on POST call. Works fine this way. Why?
      let start_player = await axios.post('https://lambda-treasure-hunt.herokuapp.com/api/adv/status/');
      let start_room = await axios.get('https://lambda-treasure-hunt.herokuapp.com/api/adv/init/');
      this.setState({
        current_room: start_room.data,
        previous_room: start_room.data,
        player_status: start_player.data
      });
    } catch(err) {
      console.log(`componentDidMount err ${err}`);
    }
    console.log(``)
  }

  // A move was made and state was altered. Update the map
  // how do i handle first room?  could simply leave as first room with question mark...
  componentDidUpdate() { 
    let big_map = JSON.parse(localStorage.getItem('big_map'));
    if (!big_map[this.state.current_room.room_id]) {
      big_map[this.state.current_room.room_id] = {};
      const exits = this.state.current_room.exits;
      for (let i = 0; i < exits.length; i++) {
        big_map[this.state.current_room.room_id][exits[i]] = '?';
      }
    }
    // add entries to big map
    // if last room and previous room are different, update connection
    console.log('here')
    console.log(`this.state.last_direction ${this.state.last_direction}`);
    console.log(`big_map[this.state.previous_room.room_id] ${big_map[this.state.previous_room.room_id]}`);
    console.log(`big_map[this.state.current_room.room_id] ${big_map[this.state.current_room.room_id]}`);
    if (this.state.last_direction !== '') {
      big_map[this.state.previous_room.room_id][this.state.last_direction] = this.state.current_room.room_id;
      big_map[this.state.current_room.room_id][this.reverse(this.state.last_direction)] = this.state.previous_room.room_id;
    }
    // Push map changes to localStorage
    localStorage.setItem('big_map', JSON.stringify(big_map));
  }

  async traverseMaze(event) {
    event.preventDefault();
    // if auto_traverse is False:
    const next_direction = event.target.value;
    // let next_direction = null;
    // const exits_ = this.state.current_room.exits;
    // // if room has a question mark in its big map entry
    // for (let j = 0; j < exits_.length; j++) {
    //   if (exits_[j] === '?') {
    //     next_direction = exits_[j];
    //     break;
    //   }
    // }
    // if room has no question marks to go to... FILL IN
    

    // travel in next_direction
    if (next_direction) {
      try {
        let response = await axios.post('https://lambda-treasure-hunt.herokuapp.com/api/adv/move/', { 'direction': next_direction });
        let temp = this.state.current_room;
        console.log('ran traverseMaze');
        this.setState({
          current_room: response.data,
          previous_room: temp,
          last_direction: next_direction
        });
      } catch(err) {
        console.log(`traverseMaze err ${err}`);
      }
    }
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
          <button onClick={this.traverseMaze.bind(this)} value='n'>N</button>
          <button onClick={this.traverseMaze.bind(this)} value='s'>S</button>
          <button onClick={this.traverseMaze.bind(this)} value='e'>E</button>
          <button onClick={this.traverseMaze.bind(this)} value='w'>W</button>
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
