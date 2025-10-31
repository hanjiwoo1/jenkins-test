Jenkins 설치 및 설정 가이드
목차

환경 정보
Java 17 설치
Jenkins 설치
Jenkins Java 버전 설정
Jenkins 초기 설정
문제 해결


환경 정보

OS: Ubuntu 22.04.5 LTS  
전역 Java 버전: Java 1.8 (기존 시스템에서 사용 중)
Jenkins용 Java: Amazon Corretto 17
Jenkins 포트: 8080


Java 17 설치
Jenkins는 Java 11 이상이 필요하므로 Amazon Corretto 17을 별도로 설치합니다.
1. Java 17 다운로드 및 설치
bash# Java 설치 디렉토리 생성
sudo mkdir -p /app/java
cd /app/java

# Amazon Corretto 17 다운로드
sudo wget https://corretto.aws/downloads/latest/amazon-corretto-17-x64-linux-jdk.tar.gz

# 압축 해제
sudo tar -xzf amazon-corretto-17-x64-linux-jdk.tar.gz

# 압축 파일 삭제 (선택)
sudo rm amazon-corretto-17-x64-linux-jdk.tar.gz
2. Java 17 버전 확인
bash/app/java/amazon-corretto-17.0.12.7.1-linux-x64/bin/java -version
예상 출력:
openjdk version "17.0.12" 2024-07-16 LTS
OpenJDK Runtime Environment Corretto-17.0.12.7.1 (build 17.0.12+7-LTS)
OpenJDK 64-Bit Server VM Corretto-17.0.12.7.1 (build 17.0.12+7-LTS, mixed mode, sharing)

Jenkins 설치
1. Jenkins 저장소 추가
bash# Jenkins GPG 키 다운로드
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key

# Jenkins 저장소 추가
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
2. Jenkins 설치
bash# 패키지 목록 업데이트
sudo apt update

# Jenkins 설치
sudo apt install jenkins -y
3. Jenkins 서비스 확인
bash# Jenkins 서비스 상태 확인
sudo systemctl status jenkins.service
⚠️ 이 시점에서 Jenkins가 시작되지 않을 수 있습니다 (Java 버전 문제)

Jenkins Java 버전 설정
전역 Java는 1.8을 유지하면서 Jenkins만 Java 17을 사용하도록 설정합니다.
1. systemd 오버라이드 디렉토리 생성
bashsudo mkdir -p /etc/systemd/system/jenkins.service.d
2. 오버라이드 설정 파일 생성
bashsudo vi /etc/systemd/system/jenkins.service.d/override.conf
파일 내용:
ini[Service]
Environment="JAVA_HOME=/app/java/amazon-corretto-17.0.12.7.1-linux-x64"
Environment="JENKINS_JAVA_CMD=/app/java/amazon-corretto-17.0.12.7.1-linux-x64/bin/java"
vi 에디터 사용법:

i 키 - INSERT 모드 진입
위 내용 입력
Esc 키 - NORMAL 모드 전환
:wq + Enter - 저장하고 종료

3. 설정 확인
bash# 파일 내용 확인
cat /etc/systemd/system/jenkins.service.d/override.conf
4. systemd 리로드 및 Jenkins 시작
bash# systemd 데몬 리로드
sudo systemctl daemon-reload

# 이전 실패 상태 초기화
sudo systemctl reset-failed jenkins.service

# Jenkins 시작
sudo systemctl start jenkins.service

# Jenkins 상태 확인
sudo systemctl status jenkins.service
성공 시 출력 예시:
● jenkins.service - Jenkins Continuous Integration Server
     Loaded: loaded (/lib/systemd/system/jenkins.service; enabled; vendor preset: enabled)
    Drop-In: /etc/systemd/system/jenkins.service.d
             └─override.conf
     Active: active (running) since Fri 2025-10-31 11:30:00 KST; 5s ago
5. Jenkins 자동 시작 설정
bash# 부팅 시 자동 시작 활성화
sudo systemctl enable jenkins.service

Jenkins 초기 설정
1. 초기 관리자 비밀번호 확인
bashsudo cat /var/lib/jenkins/secrets/initialAdminPassword
2. 웹 브라우저 접속
http://서버IP주소:8080
3. 초기 설정 단계

Unlock Jenkins

터미널에서 확인한 초기 비밀번호 입력
Continue 클릭


Customize Jenkins

"Install suggested plugins" 선택 (권장)
플러그인 자동 설치 (Git, Pipeline, Credentials 등)


Create First Admin User

Username: 관리자 ID 입력
Password: 비밀번호 입력
Full name: 이름 입력
E-mail address: 이메일 입력
Save and Continue


Instance Configuration

Jenkins URL 확인 (기본값 사용 가능)
Save and Finish


Start using Jenkins!

Jenkins 사용 시작




문제 해결
문제 1: Jenkins 시작 실패 - "Start request repeated too quickly"
원인: Jenkins가 Java를 찾지 못하거나 잘못된 Java 버전을 사용
해결:
bash# 설정 파일 확인
cat /etc/systemd/system/jenkins.service.d/override.conf

# systemd 리로드
sudo systemctl daemon-reload
sudo systemctl reset-failed jenkins.service
sudo systemctl start jenkins.service
문제 2: Java Virtual Machine 생성 실패
증상:
Error: Could not create the Java Virtual Machine.
Error: A fatal exception has occurred. Program will exit.
원인: Jenkins가 Java 1.8을 사용하려고 시도
해결: override.conf 파일에서 Java 17 경로 확인 및 수정
문제 3: 포트 8080 충돌
확인:
bashsudo netstat -tlnp | grep 8080
# 또는
sudo lsof -i :8080
해결: 다른 프로세스가 8080 포트를 사용 중이면 종료하거나 Jenkins 포트 변경
bash# Jenkins 포트 변경 (예: 9090으로)
sudo vi /etc/systemd/system/jenkins.service.d/override.conf
추가 내용:
iniEnvironment="JENKINS_PORT=9090"
문제 4: 로그 확인 방법
bash# systemd 저널 로그
sudo journalctl -u jenkins.service -n 100 --no-pager

# Jenkins 애플리케이션 로그
sudo tail -100 /var/log/jenkins/jenkins.log

# 실시간 로그 확인
sudo journalctl -u jenkins.service -f

유용한 명령어 모음
bash# Jenkins 시작
sudo systemctl start jenkins.service

# Jenkins 중지
sudo systemctl stop jenkins.service

# Jenkins 재시작
sudo systemctl restart jenkins.service

# Jenkins 상태 확인
sudo systemctl status jenkins.service

# Jenkins 로그 확인
sudo journalctl -u jenkins.service -n 50

# Jenkins 설정 확인
sudo systemctl show jenkins.service | grep Environment

# 초기 비밀번호 확인
sudo cat /var/lib/jenkins/secrets/initialAdminPassword

다음 단계: GitHub 연동 및 파이프라인 구성
Jenkins 설치가 완료되었으면 다음 작업을 진행할 수 있습니다:

GitHub Personal Access Token 생성
Jenkins Credentials 설정
Pipeline 또는 Multibranch Pipeline Job 생성
Jenkinsfile 작성
자동화 빌드/테스트/배포 파이프라인 구축


참고 자료

Jenkins 공식 문서: https://www.jenkins.io/doc/
Amazon Corretto: https://aws.amazon.com/corretto/
systemd 문서: https://www.freedesktop.org/software/systemd/man/


작성일: 2025-10-31
버전: 1.0
작성자: 한지우