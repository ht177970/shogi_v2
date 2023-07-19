import './Dashboard.css'

import React from 'react';
import { useConfigStore } from './stores/store';

function Dashboard(){
  const { mode, font, notation, setMode, setFont, setNotation } = useConfigStore();

  return (
    <div className="config-form">
      <div className="config-item">
        <label className="config-label">模式</label>
        <select className="config-select" value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="normal">一般</option>
          <option value="debug">除錯</option>
        </select>
      </div>
      <div className="config-item">
        <label className="config-label">字體</label>
        <select className="config-select" value={font} onChange={(e) => setFont(e.target.value)}>
          <option value="feng-bo">風波</option>
          <option value="hai-yan">海燕一字</option>
          <option value="sheng-xian-hao">勝仙好</option>
          <option value="xing-yun">行雲</option>
        </select>
      </div>
      <div className="config-item">
        <label className="config-label">記譜</label>
        <select className="config-select" value={notation} onChange={(e) => setNotation(e.target.value)}>
          <option value="japanese">日本</option>
          <option value="western">西方</option>
        </select>
      </div>
    </div>
  );
};

export default Dashboard;