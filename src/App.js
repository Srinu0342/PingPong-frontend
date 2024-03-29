/* eslint-disable react/prop-types */
import './App.css';
import React,{ useState, createContext, useContext, useMemo } from "react";
import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom';
import Axios from 'axios';

const matchContext = createContext();

function SetUp({ baseURL }){

  const context = useContext(matchContext);

  const [redirect, setRedirect] = useState(false);

  const [payload, setPayload] = useState();

  let player1 = context.players[0];
  let player2 = context.players[1];

  let setPlayer1 = context.setPlayers[0];
  let setPlayer2 = context.setPlayers[1];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if(player1 == player2){
      alert('both players can not be same');
      document.getElementById('player1').value = '';
      document.getElementById('player2').value = '';
      return 0;
    }

    document.getElementById('player1').value = '';
    document.getElementById('player2').value = '';

    try {
      let Res = await Axios.post(`${baseURL}/matchsetup`, {player1:player1 , player2:player2});
      setPayload(Res.data);
    }catch (e) {
      console.log(e);
    }
    
    setRedirect(true);
  };


  if (redirect){
    return <Redirect to={{pathname : '/'+player1+'vs'+player2, state : payload }} />
  }
  else{
  return(
    <form  onSubmit={handleSubmit} className = 'setUp'>
        <label htmlFor='player1' className = 'label'>PLAYER 1</label>
        <input id='player1' type='text' placeholder='ENTER PLAYER1' onChange={e=>setPlayer1(e.target.value)}/>
        <label htmlFor='player2' className = 'label'>PLAYER 2</label>
        <input id='player2' type='text' placeholder='ENTER PLAYER2' onChange={e=>setPlayer2(e.target.value)}/>
        <button className = 'button'>START GAME</button>
      </form>
  );}
}

function MatchRecord(props){

  const context = useContext(matchContext);

  let player1 = context.players[0];
  let player2 = context.players[1];

  let score = props.location.state;

  const baseURL = useMemo(() => process.env.REACT_APP_BASE_URL, []);

  const [redirect, setRedirect] = useState(false);

  const [score1, setScore1] = useState(score.score1);
  const [score2, setScore2] = useState(score.score2);

  async function saveData(){

    let requestBody = {player1:{name: player1, score: score1}, player2: {name: player2, score: score2}};
    try {
    await Axios.post(`${baseURL}/game`, requestBody);
  }catch (e) {
    console.log(e);
  }
  } 

  const handleExit = async () => {
    alert('Data will be saved automatically');
    saveData();
    setRedirect(true);
  }

  if(redirect){
    return <Redirect to = '/' />
  } else {
  return(
    <div className = 'gamebox'>
      <div className = 'box'>
        <p className = 'player'>{player1}</p>
        <button onClick={()=>setScore1(score1+1)} className = 'button1'>ADD WIN</button>
      </div>  
      <div className = 'box'>
        <p className = 'stat'>wins  : </p><p className = 'value'>{score1}</p>
      </div>  
      <div className = 'box'>
        <p className = 'player'>{player2}</p>
        <button onClick={()=>setScore2(score2+1)} className = 'button1'>ADD WIN</button>
      </div>
      <div className = 'box'>
        <p className = 'stat'>wins  : </p><p className = 'value'>{score2}</p>
      </div>  
      <div className = 'result'>
        <div className = 'winner'>
          <p>CURRENT WINNER : </p>
          {
          (score1==score2)?(<p>TIE</p>):
          ((score1>score2)?
          (<p>{player1}</p>)
          :(<p>{player2}</p>))
          }
        </div>
        <div className = 'winner'> 
          <p>win difference : </p>
          <p>{Math.abs(score1-score2)}</p>
        </div>
      </div>
      <button onClick={saveData} className = 'button'>SAVE GAME</button>
      <button onClick={handleExit} className = 'button'>EXIT GAME</button>
    </div>
  );
}
}
function App() {

  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);

  const baseURL = useMemo(() => process.env.REACT_APP_BASE_URL, []);

  let players = [player1, player2];
  let setPlayers = [setPlayer1, setPlayer2];

  return (
    <div className = 'App'>
      <matchContext.Provider value={{players, setPlayers}}>
      <Router>
        <Switch>
          <Route exact path='/'><SetUp baseURL={baseURL}/></Route>
          <Route exact path='/match_setup'><SetUp baseURL={baseURL}/></Route>
          <Route exact path={'/'+player1+'vs'+player2} component={MatchRecord}/>
          <Route exact path = '*' component={Error} />
        </Switch>
      </Router>
      </matchContext.Provider>
    </div>
  );
}

function Error(){
  return <div>ERROR 404: PAGE NOT FOUND</div>
}

export default App;
