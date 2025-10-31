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

### 1. Jenkins 설치 및 접속

#### 방법 A: Docker를 사용한 Jenkins 설치 (가장 간단 - 권장)

Docker가 설치되어 있다면 가장 빠르게 Jenkins를 실행할 수 있습니다.

```bash
# Jenkins 컨테이너 실행 (포트 8080에서 실행)
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts

# 실행 확인
docker ps
```

**Jenkins 웹 UI 접속:**
- 브라우저에서 `http://localhost:8080` 접속
- 초기 비밀번호 확인:
  ```bash
  docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
  ```
- 위 비밀번호를 입력하고 플러그인 설치 진행

#### 방법 B: macOS에 직접 설치

Homebrew를 사용한 설치:

```bash
# Homebrew로 Jenkins 설치
brew install jenkins-lts

# Jenkins 시작
brew services start jenkins-lts

# 또는 직접 실행
jenkins-lts
```

**Jenkins 웹 UI 접속:**
- 브라우저에서 `http://localhost:8080` 접속
- 초기 비밀번호는 터미널에 표시되거나 다음 경로에서 확인:
  ```bash
  cat ~/.jenkins/secrets/initialAdminPassword
  ```

#### 방법 C: Linux 서버에 설치

**⚠️ 중요: Java 버전 확인**

Jenkins는 Java 버전에 따라 다른 버전을 설치해야 합니다:
- **Jenkins 2.164 이하**: Java 8 (1.8) 지원
- **Jenkins 2.165 이상**: Java 17 이상 필수 (Java 8 미지원)
- **Jenkins 최신 버전 (LTS)**: Java 17 권장

현재 Java 버전 확인:
```bash
java -version
```

##### Java 8(1.8) 환경에서 Jenkins 설치

Java 1.8만 있는 경우, 구버전 Jenkins를 설치해야 합니다:

```bash
# Java 8 확인
java -version
# 출력: openjdk version "1.8.0_xxx"

# 구버전 Jenkins 설치 (Java 8 호환)
wget https://archives.jenkins.io/debian-stable/jenkins_2.164.3_all.deb
sudo dpkg -i jenkins_2.164.3_all.deb

# 방법 2: WAR 파일로 직접 실행 (설치 없이 실행)
# ⚠️ 주의: 이 방법은 Jenkins를 설치하는 것이 아니라 실행만 하는 것입니다.
# - 시스템 서비스로 등록되지 않음
# - 터미널을 닫으면 Jenkins가 종료됨
# - 재부팅 시 자동 시작 안 됨
# - 백그라운드 실행하려면 nohup 또는 screen 사용 필요
wget https://archives.jenkins.io/war-stable/2.164.3/jenkins.war
java -jar jenkins.war --httpPort=8080

# 백그라운드로 실행하려면:
nohup java -jar jenkins.war --httpPort=8080 > jenkins.log 2>&1 &
```

**⚠️ 주의:** 
- 구버전 Jenkins는 보안 업데이트가 없으므로 프로덕션 환경에서는 비권장됩니다.
- **WAR 파일 실행**은 Jenkins를 **설치**하는 것이 아니라 **실행**만 하는 것입니다.
  - **설치(패키지)**: 시스템 서비스로 등록, 재부팅 시 자동 시작, `systemctl`로 관리
  - **실행(WAR)**: 직접 `java -jar`로 실행, 터미널 종료 시 중단, 백그라운드 실행 필요

##### Java 17 설치 후 최신 Jenkins 설치 (권장)

**방법 1: Jenkins만 Java 17 사용 (시스템에 등록하지 않음) - 권장**

Java 17을 시스템에 등록하지 않고, Jenkins 서비스만 Java 17을 사용하도록 설정:

```bash
# 1. Java 17 압축 해제 경로 확인 (예: /app/java/amazon-corretto-17.0.12.7.1-linux-x64)
ls /app/java/
# 출력 예시: amazon-corretto-17.0.12.7.1-linux-x64

# 2. Java 17의 실제 경로 확인 (bin/java가 있는지 확인)
ls /app/java/amazon-corretto-17.0.12.7.1-linux-x64/bin/java
# 경로가 맞으면 다음 단계 진행

# 3. Jenkins 설정 파일 찾기
# Ubuntu/Debian
sudo ls /etc/default/jenkins

# CentOS/RHEL
sudo ls /etc/sysconfig/jenkins

# 4. Jenkins 설정 파일 수정
# Ubuntu/Debian
sudo vi /etc/default/jenkins

# 또는 CentOS/RHEL
# sudo vi /etc/sysconfig/jenkins

# 파일에 다음 줄 추가 또는 수정:
# JAVA_HOME=/app/java/amazon-corretto-17.0.12.7.1-linux-x64
# 
# 기존 JAVA_HOME이 있다면 주석 처리하고 새로 추가:
# #JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
# JAVA_HOME=/app/java/amazon-corretto-17.0.12.7.1-linux-x64

# 5. 설정 파일 저장 후 Jenkins 재시작
sudo systemctl restart jenkins

# 6. Jenkins가 올바른 Java를 사용하는지 확인
ps aux | grep jenkins | grep java
# 출력에서 Java 경로 확인 (예: /app/java/.../bin/java)

# 또는 Java 버전 확인
sudo -u jenkins /app/java/amazon-corretto-17.0.12.7.1-linux-x64/bin/java -version
# 출력: openjdk version "17.0.12"
```

**Jenkins WAR 파일로 직접 실행하는 경우 (시스템 서비스 없이):**

⚠️ **중요:** 이 방법은 Jenkins를 **설치**하는 것이 아니라 **실행**만 합니다.
- 시스템 서비스로 등록되지 않음
- 터미널을 닫으면 Jenkins가 종료됨
- 재부팅 시 자동 시작 안 됨
- 테스트 목적이나 개발 환경에 적합

```bash
# Java 17 경로 설정
export JAVA_HOME=/app/java/amazon-corretto-17.0.12.7.1-linux-x64
export PATH=$JAVA_HOME/bin:$PATH

# Java 버전 확인
$JAVA_HOME/bin/java -version

# Jenkins WAR 파일 다운로드 및 실행
wget https://get.jenkins.io/war-stable/latest/jenkins.war

# 포그라운드 실행 (터미널 종료 시 중단됨)
$JAVA_HOME/bin/java -jar jenkins.war --httpPort=8080

# 또는 백그라운드 실행 (터미널 종료해도 계속 실행)
nohup $JAVA_HOME/bin/java -jar jenkins.war --httpPort=8080 > jenkins.log 2>&1 &

# 실행 확인
ps aux | grep jenkins
tail -f jenkins.log

# 종료하려면
pkill -f jenkins.war
```

**WAR 실행 vs 패키지 설치 비교:**

| 구분 | WAR 파일 실행 | 패키지 설치 |
|------|--------------|------------|
| 설치 방식 | 설치 없음, 실행만 | 시스템에 설치됨 |
| 서비스 등록 | ❌ 안 됨 | ✅ 됨 (`systemctl`) |
| 재부팅 시 시작 | ❌ 안 됨 | ✅ 자동 시작 |
| 관리 명령어 | `java -jar`, `pkill` | `systemctl start/stop/restart jenkins` |
| 데이터 저장 위치 | 실행 위치 기준 `~/.jenkins` | `/var/lib/jenkins` |
| 권한 관리 | 실행한 사용자 권한 | `jenkins` 사용자 권한 |
| 용도 | 테스트, 개발 환경 | 프로덕션 환경 권장 |

**⚠️ 주의사항:**
- 시스템 Java는 여전히 Java 8로 유지됩니다 (`java -version`은 여전히 1.8 표시)
- Jenkins만 Java 17을 사용합니다
- Jenkins 설정 파일의 JAVA_HOME만 수정하면 됩니다

**방법 2: SCP를 사용한 Java 17 설치 (시스템에 등록)**

로컬에서 Java 17 다운로드 → 원격 서버로 전송 → 설치:

```bash
# 1. 로컬에서 Java 17 다운로드 (Linux용)
# OpenJDK 17 (tar.gz 형태)
wget https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_linux-x64_bin.tar.gz

# 또는 Oracle JDK 17 (라이선스 확인 필요)
# wget https://download.oracle.com/java/17/latest/jdk-17_linux-x64_bin.tar.gz

# 2. SCP로 원격 서버로 전송
scp openjdk-17.0.2_linux-x64_bin.tar.gz user@서버IP:/tmp/

# 3. 원격 서버에 SSH 접속
ssh user@서버IP

# 4. 원격 서버에서 Java 17 설치
cd /tmp
sudo mkdir -p /usr/local/java
sudo tar -xzf openjdk-17.0.2_linux-x64_bin.tar.gz -C /usr/local/java/

# 5. Java 17을 시스템에 등록
sudo update-alternatives --install /usr/bin/java java /usr/local/java/jdk-17.0.2/bin/java 1
sudo update-alternatives --install /usr/bin/javac javac /usr/local/java/jdk-17.0.2/bin/javac 1

# 6. 기본 Java 버전 선택
sudo update-alternatives --config java
# 목록에서 Java 17 선택 (번호 입력)

# 7. 환경변수 설정 (선택사항, 권장)
echo 'export JAVA_HOME=/usr/local/java/jdk-17.0.2' | sudo tee -a /etc/profile
echo 'export PATH=$JAVA_HOME/bin:$PATH' | sudo tee -a /etc/profile
source /etc/profile

# 8. Java 버전 확인
java -version
# 출력: openjdk version "17.0.2"
```

**방법 2: 원격 서버에서 직접 다운로드 (apt 사용 가능한 경우)**

```bash
# 원격 서버에서 직접 실행
sudo apt update
sudo apt install openjdk-17-jdk

# 여러 Java 버전이 있을 경우 기본 버전 변경
sudo update-alternatives --config java
# 목록에서 Java 17 선택 (번호 입력)

# Java 버전 확인
java -version
# 출력: openjdk version "17.0.x"
```

##### Jenkins 패키지 설치 (systemctl로 관리 - 권장)

**⚠️ 중요: 설치 전 Java 17 경로 확인**

Java 17이 이미 압축 해제되어 있다면 경로를 확인하세요:
```bash
# Java 17 경로 확인
ls /app/java/amazon-corretto-17.0.12.7.1-linux-x64/bin/java
# 출력이 나오면 경로가 맞습니다
```

**Ubuntu/Debian:**

```bash
# 1. Jenkins 공식 저장소 키 다운로드 및 등록
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

# 2. Jenkins 저장소 추가
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# 3. 패키지 목록 업데이트
sudo apt-get update

# 4. Jenkins 설치 (LTS 최신 버전)
sudo apt-get install jenkins

# 5. ⚠️ 반드시 해야 할 작업: Jenkins가 Java 17을 사용하도록 설정
sudo vi /etc/default/jenkins
# 파일에 다음 줄 추가:
# JAVA_HOME=/app/java/amazon-corretto-17.0.12.7.1-linux-x64
# 
# 또는 기존 JAVA_HOME이 있다면 주석 처리하고 새로 추가:
# #JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
# JAVA_HOME=/app/java/amazon-corretto-17.0.12.7.1-linux-x64

# Java 17 경로가 맞는지 확인 (선택사항)
sudo -u jenkins /app/java/amazon-corretto-17.0.12.7.1-linux-x64/bin/java -version
# 출력: openjdk version "17.0.12" (또는 유사한 메시지)

# 6. Jenkins 시작 및 자동 시작 설정
sudo systemctl start jenkins
sudo systemctl enable jenkins

# 7. 상태 확인
sudo systemctl status jenkins

# 8. Jenkins가 올바른 Java 17을 사용하는지 확인
ps aux | grep jenkins | grep java
# 출력에서 Java 경로 확인 (예: /app/java/.../bin/java)
```

**CentOS/RHEL:**

```bash
# 1. Jenkins 저장소 추가
sudo wget -O /etc/yum.repos.d/jenkins.repo \
    https://pkg.jenkins.io/redhat-stable/jenkins.repo

# 2. GPG 키 등록
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

# 3. Jenkins 설치 (LTS 최신 버전)
sudo yum install jenkins

# 4. Jenkins 시작 및 자동 시작 설정
sudo systemctl start jenkins
sudo systemctl enable jenkins

# 5. 상태 확인
sudo systemctl status jenkins
```

**설치 확인:**

```bash
# 서비스 상태 확인
sudo systemctl status jenkins

# Jenkins 프로세스 확인
ps aux | grep jenkins

# 포트 확인 (기본 8080)
sudo netstat -tlnp | grep 8080
# 또는
sudo ss -tlnp | grep 8080

# 로그 확인
sudo journalctl -u jenkins -f
```

**Jenkins 관리 명령어 (systemctl):**

```bash
# 시작
sudo systemctl start jenkins

# 중지
sudo systemctl stop jenkins

# 재시작
sudo systemctl restart jenkins

# 상태 확인
sudo systemctl status jenkins

# 자동 시작 활성화
sudo systemctl enable jenkins

# 자동 시작 비활성화
sudo systemctl disable jenkins

# 로그 실시간 확인
sudo journalctl -u jenkins -f

# 최근 100줄 로그 확인
sudo journalctl -u jenkins -n 100
```

**⚠️ 중요:** Jenkins를 설치한 후 **반드시** `/etc/default/jenkins` (Ubuntu/Debian) 또는 `/etc/sysconfig/jenkins` (CentOS/RHEL) 파일에 Java 17의 `JAVA_HOME`을 설정해야 합니다. 

**설정하지 않으면 Jenkins가 시스템 Java 8을 사용하려고 시도하고 실패할 수 있습니다.**

설정 방법:
```bash
# Ubuntu/Debian
sudo vi /etc/default/jenkins

# CentOS/RHEL  
# sudo vi /etc/sysconfig/jenkins

# 파일에 추가 (압축 해제한 Java 17 경로):
JAVA_HOME=/app/java/amazon-corretto-17.0.12.7.1-linux-x64

# 저장 후 재시작
sudo systemctl restart jenkins

# 확인
sudo systemctl status jenkins
ps aux | grep jenkins | grep java
```

**Jenkins 웹 UI 접속:**
- 로컬에서: `http://localhost:8080`
- 원격 서버의 경우: `http://[서버IP]:8080`
- 방화벽 설정 필요 시:
  ```bash
  sudo ufw allow 8080
  ```
- 초기 비밀번호 확인:
  ```bash
  sudo cat /var/lib/jenkins/secrets/initialAdminPassword
  ```

#### Jenkins 접속 확인 체크리스트

✅ Jenkins 서비스가 실행 중인지 확인:
```bash
# Docker
docker ps | grep jenkins

# macOS
brew services list | grep jenkins

# Linux
sudo systemctl status jenkins
```

✅ 포트가 열려있는지 확인:
```bash
# macOS/Linux
lsof -i :8080
# 또는
netstat -an | grep 8080
```

✅ 브라우저에서 접속:
- `http://localhost:8080` (로컬)
- `http://[서버IP주소]:8080` (원격)

✅ 초기 설정 완료:
- 초기 비밀번호 입력
- 플러그인 설치 (Install suggested plugins 권장)
- 관리자 계정 생성

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

1. **Jenkins 웹 UI 접속**
   - 브라우저에서 `http://localhost:8080` (또는 설정한 포트) 접속
   - 관리자 계정으로 로그인

2. **플러그인 관리 페이지 이동**
   - 왼쪽 메뉴에서 **Manage Jenkins** 클릭
   - **Manage Plugins** 클릭

3. **플러그인 설치**
   - **Available** 탭 클릭
   - 검색창에 플러그인 이름 입력하여 검색:
     - `Pipeline` 검색 → 체크박스 선택 → **Install without restart** 클릭
     - `Git` 검색 → 체크박스 선택 → **Install without restart** 클릭
     - `NodeJS` 검색 → 체크박스 선택 (선택사항) → **Install without restart** 클릭
   - 설치가 완료되면 자동으로 적용됩니다

**참고:** 초기 설치 시 "Install suggested plugins"를 선택했다면 Pipeline과 Git은 이미 설치되어 있을 수 있습니다.

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

### 문제 6: Jenkins 서비스 시작 실패
```
× jenkins.service - Jenkins Continuous Integration Server
   Active: failed (Result: exit-code)
   Process: ExecStart=/usr/bin/jenkins (code=exited, status=1/FAILURE)
```

**진단 방법 (순서대로 실행):**

```bash
# 1. 에러 메시지 확인 (가장 중요!)
sudo journalctl -xeu jenkins.service -n 50 --no-pager

# 2. Jenkins 서비스 상태 확인
sudo systemctl status jenkins.service

# 3. Jenkins 로그 확인
sudo journalctl -u jenkins -n 100 --no-pager | grep -i error
# 또는 상세 로그
sudo journalctl -u jenkins -n 200 --no-pager

# 4. Jenkins 로그 파일 직접 확인
sudo tail -100 /var/log/jenkins/jenkins.log

# 5. JAVA_HOME 설정 확인
sudo cat /etc/default/jenkins | grep JAVA_HOME
# 또는
# sudo cat /etc/sysconfig/jenkins | grep JAVA_HOME

# 6. Java 17 경로가 실제로 존재하는지 확인
ls -la /app/java/amazon-corretto-17.0.12.7.1-linux-x64/bin/java

# 7. Jenkins 사용자로 Java 17 실행 가능한지 확인
sudo -u jenkins /app/java/amazon-corretto-17.0.12.7.1-linux-x64/bin/java -version

# 8. Jenkins 실행 스크립트 직접 실행 (에러 메시지 확인)
sudo -u jenkins /usr/bin/jenkins
# 이 명령어는 에러 메시지를 직접 보여줍니다
```

**일반적인 원인 및 해결 방법:**

1. **Java 버전 문제 (가장 흔한 원인)**
   ```bash
   # Jenkins 설정 파일 확인
   sudo vi /etc/default/jenkins
   # 또는
   # sudo vi /etc/sysconfig/jenkins
   
   # JAVA_HOME이 제대로 설정되어 있는지 확인
   # 예시:
   # JAVA_HOME=/app/java/amazon-corretto-17.0.12.7.1-linux-x64
   
   # Java 경로가 맞는지 확인
   sudo -u jenkins /app/java/amazon-corretto-17.0.12.7.1-linux-x64/bin/java -version
   
   # 설정 후 재시작
   sudo systemctl restart jenkins
   ```

2. **권한 문제**
   ```bash
   # Jenkins 홈 디렉토리 권한 확인
   sudo ls -la /var/lib/jenkins
   sudo chown -R jenkins:jenkins /var/lib/jenkins
   sudo chmod 755 /var/lib/jenkins
   
   # 재시작
   sudo systemctl restart jenkins
   ```

3. **포트 충돌**
   ```bash
   # 8080 포트 사용 중인 프로세스 확인
   sudo lsof -i :8080
   # 또는
   sudo netstat -tlnp | grep 8080
   
   # 다른 프로세스가 사용 중이면 종료하거나 Jenkins 포트 변경
   # /etc/default/jenkins에서 HTTP_PORT=8080 변경
   ```

4. **디스크 공간 부족**
   ```bash
   df -h
   # 디스크 공간이 부족하면 정리 필요
   ```

5. **설정 파일 문법 오류**
   ```bash
   # 설정 파일 검증
   sudo jenkins --validate
   
   # 또는 직접 확인
   sudo cat /etc/default/jenkins
   ```

**상세 로그 확인 및 해결 절차:**

```bash
# Step 1: 즉시 에러 확인 (가장 먼저!)
sudo journalctl -xeu jenkins.service -n 100 --no-pager
# 또는
sudo journalctl -u jenkins -n 200 --no-pager | grep -i -A 10 -B 10 error

# Step 2: Jenkins 로그 파일 확인
sudo tail -100 /var/log/jenkins/jenkins.log

# Step 3: JAVA_HOME 설정 확인 및 수정
sudo cat /etc/default/jenkins | grep JAVA_HOME
# 설정이 없거나 잘못되었다면:
sudo vi /etc/default/jenkins
# 다음 줄 추가 또는 수정:
# JAVA_HOME=/app/java/amazon-corretto-17.0.12.7.1-linux-x64

# Step 4: Java 17 경로 확인
sudo -u jenkins /app/java/amazon-corretto-17.0.12.7.1-linux-x64/bin/java -version
# 정상적으로 버전이 나오면 경로가 맞는 것입니다

# Step 5: Jenkins 재시작
sudo systemctl restart jenkins

# Step 6: 즉시 로그 확인
sudo journalctl -u jenkins -f
# Ctrl+C로 종료

# Step 7: 여전히 실패하면 Jenkins 수동 실행으로 에러 확인
# 이 명령어는 에러 메시지를 직접 콘솔에 출력합니다
# ⚠️ 서비스가 자동 재시작을 멈추게 하려면 먼저:
sudo systemctl stop jenkins
sudo systemctl reset-failed jenkins

# 그 다음 수동 실행:
sudo -u jenkins /usr/bin/jenkins
# 또는 환경변수 설정하고 실행:
sudo -u jenkins env JAVA_HOME=/app/java/amazon-corretto-17.0.12.7.1-linux-x64 /usr/bin/jenkins
```

**특정 에러별 해결 방법:**

**에러: "JAVA_HOME not set" 또는 "Java not found"**
```bash
# /etc/default/jenkins에 JAVA_HOME 추가
sudo vi /etc/default/jenkins
# JAVA_HOME=/app/java/amazon-corretto-17.0.12.7.1-linux-x64
sudo systemctl restart jenkins
```

**에러: "Permission denied"**
```bash
# Jenkins 홈 디렉토리 권한 확인
sudo chown -R jenkins:jenkins /var/lib/jenkins
sudo chmod 755 /var/lib/jenkins
sudo systemctl restart jenkins
```

**에러: "UnsupportedClassVersionError"**
```bash
# Java 버전이 맞지 않음, Java 17 경로 확인
sudo -u jenkins /app/java/amazon-corretto-17.0.12.7.1-linux-x64/bin/java -version
# 정상이면 /etc/default/jenkins의 JAVA_HOME 확인
```

**에러: "Address already in use" (포트 충돌)**
```bash
# 8080 포트 사용 중인 프로세스 확인
sudo lsof -i :8080
# 프로세스 종료 또는 Jenkins 포트 변경
```

### 문제 7: Java 버전 오류 (Java 8 환경)
```
Exception in thread "main" java.lang.UnsupportedClassVersionError
```

**해결 방법:**
1. **Java 17 설치 (권장)**
   - SCP로 Java 17 tar.gz 전송 후 설치 (위 가이드 참고)
   - 또는 서버에서 직접 다운로드: `sudo apt install openjdk-17-jdk`

2. **Jenkins가 올바른 Java를 사용하도록 설정 (시스템 등록 없이)**
   ```bash
   # Jenkins 설정 파일 수정
   # Ubuntu/Debian
   sudo vi /etc/default/jenkins
   
   # 또는 CentOS/RHEL
   # sudo vi /etc/sysconfig/jenkins
   
   # 파일에 JAVA_HOME 추가 (압축 해제한 Java 17 경로)
   # JAVA_HOME=/app/java/amazon-corretto-17.0.12.7.1-linux-x64
   
   # Jenkins 재시작
   sudo systemctl restart jenkins
   
   # Jenkins가 사용하는 Java 확인
   ps aux | grep jenkins | grep java
   # 또는
   sudo systemctl status jenkins
   ```

3. **Java 버전 변경 후 Jenkins 재시작**
   ```bash
   sudo systemctl restart jenkins
   sudo systemctl status jenkins
   ```

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


