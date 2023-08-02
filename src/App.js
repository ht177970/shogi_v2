import { useState } from "react";
import StoreProvider from "./components/stores/store"
import Game from "./components/Game"
import RoomList from "./room/Room";

function App(){
  const [nickname, setNickname] = useState('');
  const [url, setUrl] = useState(null);
  return(
    <>
      {url ?
        <StoreProvider key={'store'}>
          <Game roomId={url} nickname={nickname} setUrl={setUrl}/>
        </StoreProvider>
        :
        <RoomList key={'room'} setUrl={setUrl} username={nickname} setUsername={setNickname}/>
      }
    </>
  )
}

export default App;