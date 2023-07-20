import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const apiURL = 'https://yonin-shogi-r.ht177970.repl.co/game';

function RoomList({setUrl, username, setUsername}){
  const [socket, setSocket] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    function updateRoomList(res){
      setRooms(res);
    }
    function updateURL(res){
      setUrl(res[0]);
    }

    const sc = io(apiURL);
    setSocket(sc);
    sc.on('roomListUpdate', updateRoomList);
    sc.on('roomUrl', updateURL);
  }, []);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleRoomNameChange = (e) => {
    setRoomName(e.target.value);
  };

  const handleCreateRoom = () => {
    if (roomName && username) {
      /*const newRoom = { name: roomName, capacity: 1 };
      setRooms([...rooms, newRoom]);
      setRoomName('');*/
      socket.emit('create', [roomName]);
    }
  };

  const handleJoinRoom = () => {
    if (selectedRoom !== null && username) {
      socket.emit('join', [rooms[selectedRoom].name]);
    }
  };

  const handleRefreshRoomList = () => {
    socket.emit('get');
  };

  const handleRoomClick = (index) => {
    if (selectedRoom === index) {
      // If the selected room is clicked again, deselect it
      setSelectedRoom(null);
    } else {
      // Otherwise, select the clicked room
      setSelectedRoom(index);
    }
  };

  const isJoinButtonDisabled = selectedRoom === null || !username;
  const isCreateButtonDisabled = !roomName || !username;

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-100vmin">
        <div className="mb-4 flex items-center">
          <input
            type="text"
            className="flex-1 px-4 py-3 border rounded-md focus:outline-none focus:ring focus:border-blue-500"
            placeholder="輸入名稱"
            value={username}
            onChange={handleUsernameChange}
          />
          <button
            className={`ml-4 bg-blue-500 text-white rounded-md py-3 px-6 font-semibold hover:bg-blue-600 transition duration-200 ${isJoinButtonDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
            onClick={handleJoinRoom}
            disabled={isJoinButtonDisabled}
          >
            加入房間
          </button>
        </div>
        <div className="mb-4 flex items-center">
          <input
            type="text"
            className="flex-1 px-4 py-3 border rounded-md focus:outline-none focus:ring focus:border-blue-500"
            placeholder="創建房間"
            value={roomName}
            onChange={handleRoomNameChange}
          />
          <button
            className={`ml-4 bg-blue-500 text-white rounded-md py-3 px-6 font-semibold hover:bg-blue-600 transition duration-200 ${isCreateButtonDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
            onClick={handleCreateRoom}
            disabled={isCreateButtonDisabled}
          >
            創建房間
          </button>
        </div>
        <h2 className="text-3xl font-semibold mb-4 flex items-center">房間列表
          <button
            className="ml-4 bg-yellow-500 text-white rounded-md py-3 px-6 font-semibold hover:bg-yellow-600 transition duration-200"
            onClick={() => handleRefreshRoomList()}
          >
            重新整理
          </button>
        </h2>
        <ul className="divide-y divide-gray-200">
          {rooms.map((room, index) => (
            <li
              key={index}
              className={`py-4 flex justify-between items-center cursor-pointer ${selectedRoom === index ? 'bg-gradient-to-r from-blue-300 to-blue-500 rounded-lg' : ''}`}
              onClick={() => handleRoomClick(index)}
            >
              <span className="px-2">{room.name}</span>
              <span className="text-sm text-gray-600 px-2">{room.capacity} 人</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RoomList;