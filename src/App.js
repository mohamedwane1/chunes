import React from 'react';
import './App.css';
import SpotifyWebApi from 'spotify-web-api-js';
import Helmet from 'react-helmet';
import Script from 'react-load-script';
import 'react-background-video-player';
import video from './video.mp4'
const spotifyApi = new SpotifyWebApi();

class App extends React.Component {
  constructor() {
    super();
    const params = this.getHashParams();
    const token = params.access_token;
    if (token) {
      spotifyApi.setAccessToken(token);
    }
    this.handleLoadSuccess = this.handleLoadSuccess.bind(this); 
    this.handleLoadFailure = this.handleLoadSuccess.bind(this); 
    this.cb = this.cb.bind(this);
    this.state = {
      loggedIn: token ? true : false,
      nowPlaying: {
        names: 'Nothing Playing', 
        albumArt: '', artist: '', 
        albumTitle: '', 
        isPlaying: false,
        trackURI: '',
        currentDeviceID: ''
      },
      userInfo: {
        userName: '',
        userID: ''
      },
      favPlaylistInfo: {
        playlistID: ''
      }
    }
  }
  getHashParams() {
    var hashParams = {};
    var e,r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    e = r.exec(q);
    while (e) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
      e = r.exec(q);
    }
    return hashParams;
  }
  getNowPlaying() {
    spotifyApi.getMyCurrentPlaybackState()
      .then((response) => {
        if(response.item) {
        this.setState({
          nowPlaying: {
            name: response.item.name,
            albumArt: response.item.album.images[0].url,
            artist: response.item.artists[0].name,
            albumTitle: response.item.album.name,
            isPlaying: response.is_playing,
            trackURI: response.item.uri,
            currentDeviceID: response.device.id
          },
        })
      } else {
        this.setState({
          nowPlaying: {
            name: '',
            albumArt: '',
            artist: '',
            albumTitle: '',
            isPlaying: false,
            trackURI: ''
          },
        })
      };
      })
  }
  getUserInfo() {
    spotifyApi.getMe() 
      .then((response) => {
        this.setState({
          userInfo: {
            name: response.display_name.split(" ")[0],
            userID: response.id
          }
        })
      }
      )
  }
  transferPlayback() {
    spotifyApi.play({
      'device_id' : "5e02af2d00fc9ddec962b6c0e9518f90c76399a3"
    })
  }
  getLondonPlaylist() {
      spotifyApi.play({
        'device_id' : "5e02af2d00fc9ddec962b6c0e9518f90c76399a3" ,
        'context_uri': 'spotify:playlist:1ar0yt2oQpD8pXjIw7iWPr'
      });
  }
  getNewYorkPlaylist() {
    spotifyApi.play({
      'device_id' : "5e02af2d00fc9ddec962b6c0e9518f90c76399a3" ,
      'context_uri': 'spotify:playlist:6wAvsF7l0rcJvgDAGGEMNk'
    });
  }
  getLAPlaylist() {
    spotifyApi.play({
      'device_id' : "5e02af2d00fc9ddec962b6c0e9518f90c76399a3" ,
      'context_uri': 'spotify:playlist:6qbWjEwNAiZag64dgm84pG'
    });
  }
  getChicagoPlaylist() {
    spotifyApi.play({
      'device_id' : "5e02af2d00fc9ddec962b6c0e9518f90c76399a3" ,
      'context_uri': 'spotify:playlist:0Gq3zcC1xzphOF3RjwJMi4'
    });
  }
  /*addFav() {
    var userID = this.userInfo.userID
    spotifyApi.getUserPlaylists(userID)
      .then((response) => {
        for (var i = 0; i < response.items.length; i++) {
          if (response.items[i].name.localeCompare("Chunes: Favorites")) {
              this.setState({
                favPlaylistInfo: { 
                playlistID: response.items[i].id
                }
              })
          }
        }
        if (this.state.favPlaylistInfo.playlistID === '') {
          spotifyApi.createPlaylist(this.state.userInfo.userID)
          .then((response) => {
              response.name = 'Chunes: Favorites';
              response.description = "Here are your favorite chunes, curated  by the Chunes app!";
              this.setState({
                favPlaylistInfo: {
                  playlistID : response.id
                }
            })
          })
        }
        spotifyApi.addTracksToPlaylist(this.state.favPlaylistInfo.playlistID, [this.state.nowPlaying.trackURI])
      }) 
  }*/
  componentDidMount() {
    setInterval(() => this.getNowPlaying(), 1000);
    window.onSpotifyWebPlaybackSDKReady = () => {
      this.handleLoadSuccess();
    }
  }
  handleLoadSuccess() {
    this.setState({scriptLoaded: true})
    console.log("Script Loaded");
    const player = new window.Spotify.Player({
      name: 'Chunes',
      getOAuthToken: cb => {
        cb(spotifyApi.getAccessToken()) 
      }
    });
    console.log(player);
    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });

    // Playback status updates
    player.addListener('player_state_changed', state => { console.log(state); });

    // Ready
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player!
    player.connect().then(success => {
      if  (success) {
        console.log('Connected');
      }
    })
  }

  cb(token) {
    return(token);
  }
  handleScriptCreate(){
    this.setState({scriptLoaded:false});
    console.log("Script created");
  }

  handleScriptError() {
    this.setState({scriptError: true});
    console.log("Script error");
  }
  handleScriptLoad() {
    this.setState({scriptLoaded:true});
    console.log("Script loaded");
  }
  render() {
    const loggedIn = this.state.loggedIn;
    const userName = this.state.userInfo.name;
    let playButton;
    let skipToPrev;
    let skipToNext;
    let logIn;
    let londonButton;
    let newYorkButton;
    let LAButton;
    let chicagoButton;
    
    //let favButton;
    if (loggedIn) {
      this.getUserInfo();
      //this.transferPlayback();
      skipToPrev =  <button onClick={spotifyApi.skipToPrevious}>&#171;</button>;
      skipToNext = <button onClick={spotifyApi.skipToNext}>&#187;</button>;
      londonButton = 
        <button onClick={this.getLondonPlaylist}>
        London, England
        </button>;
      newYorkButton = 
        <button onClick={this.getNewYorkPlaylist}>
        New York, New York
        </button>;
      LAButton = 
        <button onClick={this.getLAPlaylist}>
        Los Angeles, California
        </button>;
      chicagoButton = 
        <button onClick={this.getChicagoPlaylist}>
        Chicago, Illinois
        </button>;
    }
    else {
      logIn = <a href="http://localhost:8888">
      Log In to Spotify
    </a>
    }
    let title = "Welcome";
    if (loggedIn && this.state.nowPlaying.isPlaying) { 
      logIn = <b>{ userName } is currently listening to: </b>
      title = "► " + this.state.nowPlaying.artist + " - " + this.state.nowPlaying.name;
      playButton = <button onClick={spotifyApi.pause}>❚❚</button>;
      //favButton = <button onClick={this.addFav}>❤</button>
    }
    else if (loggedIn){
      logIn = <b>Play Something!</b>
      title = '❚❚ ' + this.state.nowPlaying.artist + " - " + this.state.nowPlaying.name;
      playButton = <button onClick={spotifyApi.play}>►</button>;
    }
    return (
      <div className="App">
        <Helmet>
          <title>
            {title}
          </title>
        </Helmet>
        <div className="App-header">
          <Script 
            url="https://sdk.scdn.co/spotify-player.js"
            onCreate={this.handleScriptCreate.bind(this)}
            onError={this.handleScriptError.bind(this)}
            onLoad ={this.handleScriptLoad.bind(this)}
          />
    </div>
      <div id="background-video">
      <video autoPlay muted loop>
      <source type="video/mp4" src={video}/>
      </video>
    </div>
        <div id="log-in">
        {logIn}

        </div>
        <div id="now-playing">
          <div id="album-cover">
            <img src={this.state.nowPlaying.albumArt} style={{ height: 350 }}/>
          </div>
          <div id="name-and-artist">
            <div id="track-name">
              <b>{this.state.nowPlaying.name}</b>
            </div>
            <div id="track-artist">
              <b>{this.state.nowPlaying.artist}</b>
            </div>
          </div>
          </div>

        <div class="controls">
        { skipToPrev}
        { playButton }
        { skipToNext }
        {/* favButton */}
        </div>
        
        <div id="buttons">
          {londonButton}
          {newYorkButton}
          {LAButton}
          {chicagoButton}
        </div>
      </div>
    );
  }
  }
  

export default App;
