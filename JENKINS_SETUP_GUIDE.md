# Jenkins CI/CD 연동 가이드

이 가이드는 React 프론트엔드 프로젝트를 Jenkins와 연동하는 방법을 설명합니다.

## 목차
1. [사전 준비사항](#사전-준비사항)
2. [Jenkins 플러그인 설치](#jenkins-플러그인-설치)
3. [Jenkins Job 생성](#jenkins-job-생성)
4. [Pipeline 설정](#pipeline-설정)
5. [빌드 및 배포](#빌드-및-배포)
6. [트러블슈팅](#트러블슈팅)

---

## 사전 준비사항

### 1. Jenkins 설치
- Jenkins가 서버에 설치되어 있어야 합니다.
- Jenkins 웹 UI에 접근 가능해야 합니다.

### 2. Node.js 설치 확인
Jenkins 서버에 Node.js가 설치되어 있어야 합니다.

```bash
# Jenkins 서버에서 실행
node --version
npm --version
```

Node.js가 설치되어 있지 않은 경우:
```bash
# nvm을 사용한 Node.js 설치 (권장)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### 3. Git 저장소 준비
- 프로젝트가 Git 저장소에 커밋되어 있어야 합니다.
- Jenkins가 접근 가능한 Git 저장소 URL이 필요합니다.

---

## Jenkins 플러그인 설치

### 필수 플러그인
1. **Pipeline** - Jenkinsfile을 실행하기 위한 플러그인
2. **NodeJS Plugin** - Node.js 환경 관리 (선택사항, 수동 설치 시 불필요)

### 플러그인 설치 방법
1. Jenkins 웹 UI 접속
2. **Manage Jenkins** → **Manage Plugins** 이동
3. **Available** 탭에서 다음 플러그인 검색 및 설치:
   - Pipeline
   - Git
   - NodeJS (선택사항)

---

## Jenkins Job 생성

### 방법 1: Pipeline Job 생성 (Jenkinsfile 사용) - 권장

1. Jenkins 웹 UI에서 **New Item** 클릭
2. Job 이름 입력 (예: `jenkins-test-frontend`)
3. **Pipeline** 선택 후 **OK** 클릭
4. **Pipeline** 섹션에서:
   - **Definition**: `Pipeline script from SCM` 선택
   - **SCM**: `Git` 선택
   - **Repository URL**: Git 저장소 URL 입력
   - **Credentials**: 필요시 Git 인증 정보 추가
   - **Branch Specifier**: `*/main` 또는 `*/master` (기본 브랜치명에 맞게)
   - **Script Path**: `Jenkinsfile` (기본값)

### 방법 2: Freestyle Project 생성

1. **New Item** → **Freestyle project** 선택
2. **Source Code Management**:
   - Git 선택
   - Repository URL 입력
   - Credentials 추가
3. **Build Triggers**: 필요에 따라 설정
   - **Poll SCM**: 주기적으로 변경사항 체크 (예: `H/15 * * * *`)
4. **Build**:
   - **Execute shell** 추가:
   ```bash
   npm ci
   npm run lint
   npm run build
   ```
5. **Post-build Actions**:
   - **Archive the artifacts**: `dist/**/*`

---

## Pipeline 설정

### Jenkinsfile 위치
프로젝트 루트에 `Jenkinsfile`이 있어야 합니다.
```
jenkins-test-frontend/
├── Jenkinsfile          # 여기 위치
├── package.json
├── src/
└── ...
```

### Jenkinsfile 커스터마이징

#### 1. Node.js 버전 변경
`Jenkinsfile`의 `NODE_VERSION` 환경변수 수정:
```groovy
environment {
    NODE_VERSION = '18'  // 원하는 버전으로 변경
}
```

#### 2. 빌드 후 배포 추가
예: SSH를 통한 배포
```groovy
stage('배포') {
    steps {
        script {
            sh '''
                # 빌드 결과물을 서버로 배포
                # 예: scp, rsync 등을 사용
                echo "배포 중..."
            '''
        }
    }
}
```

#### 3. 테스트 추가
```groovy
stage('테스트') {
    steps {
        echo '테스트 실행 중...'
        sh 'npm test || true'  # 테스트 스크립트가 있는 경우
    }
}
```

---

## 빌드 및 배포

### 1. 수동 빌드
1. Jenkins Job 페이지에서 **Build Now** 클릭
2. 빌드 진행 상황은 **Build History**에서 확인
3. 빌드 번호 클릭 → **Console Output**에서 상세 로그 확인

### 2. 자동 빌드 트리거
#### Git Hook 사용 (GitHub/GitLab)
1. **Build Triggers**에서 **GitHub hook trigger for GITScm polling** 활성화
2. Git 저장소에서 Webhook 설정:
   - URL: `http://your-jenkins-url/github-webhook/`
   - Events: `push` 선택

#### Poll SCM
1. **Build Triggers**에서 **Poll SCM** 선택
2. Schedule 입력 (예: `H/15 * * * *` - 15분마다 체크)

### 3. 빌드 결과 확인
- **Console Output**: 빌드 실행 로그
- **Changes**: 변경된 파일 목록
- **Artifacts**: 빌드 산출물 (dist 폴더 등)

---

## 로컬에서 테스트

### 1. 개발 서버 실행
```bash
cd jenkins-test-frontend
npm install
npm run dev
```
브라우저에서 `http://localhost:3000` 접속 확인

### 2. 빌드 테스트
```bash
npm run build
```
`dist` 폴더가 생성되는지 확인

### 3. 빌드 결과 미리보기
```bash
npm run preview
```
빌드된 결과물을 3000 포트에서 확인

---

## 트러블슈팅

### 문제 1: Node.js를 찾을 수 없음
```
Error: node: command not found
```

**해결 방법:**
1. Jenkins 서버에 Node.js가 설치되어 있는지 확인
2. Jenkinsfile에서 Node.js 경로를 명시적으로 지정:
```groovy
environment {
    PATH = "${env.PATH}:/usr/local/bin:/opt/node/bin"
}
```

### 문제 2: npm 권한 오류
```
Error: EACCES: permission denied
```

**해결 방법:**
1. npm 전역 설치 권한 문제인 경우:
```bash
# Jenkins 서버에서 실행
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

2. 또는 `npm ci` 대신 `npm install --legacy-peer-deps` 사용

### 문제 3: 빌드는 성공하지만 dist 폴더가 비어있음
**해결 방법:**
1. `vite.config.ts`에서 `build.outDir` 확인
2. Jenkinsfile의 `archiveArtifacts` 경로 확인

### 문제 4: Git 인증 오류
**해결 방법:**
1. Jenkins에서 **Manage Jenkins** → **Manage Credentials** 이동
2. Git 저장소 인증 정보 추가 (Username/Password 또는 SSH Key)
3. Pipeline 설정에서 Credentials 선택

### 문제 5: 포트 충돌
포트 3000이 이미 사용 중인 경우:
- `vite.config.ts`에서 포트 변경
- 또는 Jenkinsfile에서 환경변수로 포트 지정

---

## 추가 팁

### 1. 빌드 캐시 활용
```groovy
stage('의존성 설치') {
    steps {
        script {
            sh '''
                if [ -d "node_modules" ]; then
                    echo "node_modules 캐시 발견, npm ci 건너뛰기"
                else
                    npm ci
                fi
            '''
        }
    }
}
```

### 2. 빌드 알림 설정
- Email 알림: **Post-build Actions** → **Editable Email Notification**
- Slack 알림: Slack 플러그인 사용
- Teams 알림: Teams 플러그인 사용

### 3. 다중 브랜치 Pipeline
여러 브랜치를 자동으로 빌드하려면:
- **New Item** → **Multibranch Pipeline** 선택
- 각 브랜치별로 자동으로 Jenkinsfile 실행

### 4. Docker를 사용한 빌드
Jenkinsfile에서 Docker 이미지 사용:
```groovy
pipeline {
    agent {
        docker {
            image 'node:18'
        }
    }
    // ... 나머지 설정
}
```

---

## 참고 자료

- [Jenkins 공식 문서](https://www.jenkins.io/doc/)
- [Jenkins Pipeline 문법](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Vite 공식 문서](https://vitejs.dev/)
- [React 공식 문서](https://react.dev/)

---

## 질문 및 지원

문제가 발생하거나 추가 설정이 필요한 경우:
1. Jenkins Console Output 로그 확인
2. `npm run build` 로컬 실행으로 빌드 문제 확인
3. Jenkins 서버의 Node.js, npm 버전 확인


