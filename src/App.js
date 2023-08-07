import { useState } from "react";
import StoreProvider from "./components/stores/store"
import Game from "./components/Game"
import RoomList from "./room/Room";

function App(){
  const [nickname, setNickname] = useState(localStorage.getItem('nickname') || '');
  const [url, setUrl] = useState(null);
  const [rejoin, setRejoin] = useState(false);
  return(
    <>
      {url ?
        <StoreProvider key={'store'}>
          <Game roomId={url} nickname={nickname} setUrl={setUrl} rejoin={rejoin}/>
        </StoreProvider>
        :
        <RoomList key={'room'} setUrl={setUrl} username={nickname} setUsername={setNickname} setRejoin={setRejoin}/>
      }
    </>
  )
}

export default App;