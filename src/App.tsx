import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <div className="container">
        <h1>Jenkins 테스트 프론트엔드</h1>
        <p className="description">
          이 페이지는 Jenkins CI/CD 파이프라인 테스트를 위한 간단한 React 앱입니다.
        </p>
        
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            클릭 횟수: {count}
          </button>
          <p>
            버튼을 클릭하여 카운터를 증가시켜보세요.
          </p>
        </div>

        <div className="info">
          <h2>배포 정보</h2>
          <ul>
            <li>포트: 3000</li>
            <li>빌드 도구: Vite</li>
            <li>프레임워크: React + TypeScript</li>
            <li>CI/CD: Jenkins</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;

