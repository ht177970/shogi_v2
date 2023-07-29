import { useState } from "react";
import StoreProvider from "./components/stores/store"
import Game from "./components/Game"
import RoomList from "./room/Room";

function App(){
  const [nickname, setNickname] = useState('');
  const [url, setUrl] = useState(null);
  let element = []
  if(url){
    element.push(
      <StoreProvider key={'store'}>
        <Game roomId={url} nickname={nickname}/>
      </StoreProvider>
    );
  }
  else{
    element.push(<RoomList key={'room'} setUrl={setUrl} username={nickname} setUsername={setNickname}/>);
  }
  return(
    <>
      {element}
    </>
  )
}

export default App;