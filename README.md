# Jenkins Test Frontend

Jenkins CI/CD 파이프라인 테스트를 위한 간단한 React 프론트엔드 애플리케이션입니다.

## 기술 스택

- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빠른 빌드 도구
- **Jenkins** - CI/CD 파이프라인

## 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

개발 서버가 포트 3000에서 실행됩니다.
브라우저에서 `http://localhost:3000` 접속하여 확인할 수 있습니다.

### 3. 빌드

```bash
npm run build
```

빌드 결과물은 `dist` 폴더에 생성됩니다.

### 4. 빌드 결과 미리보기

```bash
npm run preview
```

## 프로젝트 구조

```
jenkins-test-frontend/
├── src/
│   ├── App.tsx          # 메인 컴포넌트
│   ├── App.css          # 컴포넌트 스타일
│   ├── main.tsx         # 애플리케이션 진입점
│   └── index.css        # 전역 스타일
├── Jenkinsfile          # Jenkins 파이프라인 설정
├── package.json         # 프로젝트 의존성
├── vite.config.ts       # Vite 설정
├── tsconfig.json        # TypeScript 설정
└── README.md            # 프로젝트 문서
```

## Jenkins 연동

Jenkins와 연동하는 방법은 [JENKINS_SETUP_GUIDE.md](./JENKINS_SETUP_GUIDE.md) 문서를 참고하세요.

### 주요 내용

- Jenkins 설치 및 플러그인 설정
- Pipeline Job 생성 방법
- 자동 빌드 트리거 설정
- 트러블슈팅 가이드

## 사용 가능한 스크립트

- `npm run dev` - 개발 서버 실행 (포트 3000)
- `npm run build` - 프로덕션 빌드
- `npm run preview` - 빌드 결과 미리보기
- `npm run lint` - 코드 린트 체크

## 라이선스

이 프로젝트는 테스트 목적으로 작성되었습니다.


