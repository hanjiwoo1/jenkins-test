import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const [deployTime] = useState(new Date().toLocaleString('ko-KR'));

  useEffect(() => {
    // 배포 성공 표시를 위한 간단한 애니메이션
    const timer = setTimeout(() => {
      document.body.classList.add('loaded');
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <div className="status-badge">✓ 배포 성공</div>
          <h1>🚀 Jenkins CI/CD 테스트 페이지</h1>
          <p className="description">
            이 페이지는 Jenkins 파이프라인을 통해 자동 배포되었습니다 테스트중.
          </p>
        </div>
        
        <div className="deploy-info-card">
          <div className="deploy-icon">📦</div>
          <div className="deploy-details">
            <h3>배포 정보</h3>
            <div className="info-row">
              <span className="info-label">배포 시간:</span>
              <span className="info-value">{deployTime}</span>
            </div>
            <div className="info-row">
              <span className="info-label">환경:</span>
              <span className="info-value">{(import.meta as any).env?.MODE || 'production'}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>인터랙션 테스트</h2>
          <button onClick={() => setCount((count) => count + 1)}>
            클릭 횟수: <strong>{count}</strong>
          </button>
          <p>
            버튼을 클릭하여 애플리케이션이 정상 작동하는지 확인하세요.
          </p>
        </div>

        <div className="info">
          <h2>기술 스택</h2>
          <ul>
            <li>
              <span className="tech-label">포트:</span>
              <span className="tech-value">3000</span>
            </li>
            <li>
              <span className="tech-label">빌드 도구:</span>
              <span className="tech-value">Vite</span>
            </li>
            <li>
              <span className="tech-label">프레임워크:</span>
              <span className="tech-value">React + TypeScript</span>
            </li>
            <li>
              <span className="tech-label">CI/CD:</span>
              <span className="tech-value">Jenkins</span>
            </li>
          </ul>
        </div>

        <div className="footer">
          <p>✅ 모든 기능이 정상적으로 동작합니다!</p>
        </div>
      </div>
    </div>
  );
}

export default App;

