# GitHub 저장소 연동 가이드

이 가이드는 로컬 프로젝트를 GitHub 저장소(https://github.com/hanjiwoo1/jenkins-test.git)에 연동하는 방법을 설명합니다.

## 사전 준비

- Git이 설치되어 있어야 합니다.
- GitHub 계정이 있어야 합니다.
- GitHub 저장소가 생성되어 있어야 합니다 (현재 비어있음).

## 연동 단계

### 1. Git 저장소 초기화

프로젝트 디렉토리에서 Git 저장소를 초기화합니다.

```bash
cd jenkins-test-frontend
git init
```

### 2. 원격 저장소 연결

GitHub 저장소를 원격 저장소로 추가합니다.

```bash
git remote add origin https://github.com/hanjiwoo1/jenkins-test.git
```

원격 저장소가 제대로 설정되었는지 확인:

```bash
git remote -v
```

출력 예시:
```
origin  https://github.com/hanjiwoo1/jenkins-test.git (fetch)
origin  https://github.com/hanjiwoo1/jenkins-test.git (push)
```

### 3. 파일 추가 및 커밋

모든 파일을 스테이징 영역에 추가:

```bash
git add .
```

커밋 메시지와 함께 커밋:

```bash
git commit -m "Initial commit: Jenkins 테스트 프론트엔드 프로젝트"
```

### 4. GitHub에 푸시

메인 브랜치로 푸시:

```bash
git branch -M main
git push -u origin main
```

### 5. 인증 문제 발생 시

GitHub에서 Personal Access Token을 사용해야 할 수 있습니다.

#### Personal Access Token 생성 방법:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" 클릭
3. 필요한 권한 선택 (repo 권한 필요)
4. 토큰 생성 후 복사

#### 토큰 사용하여 푸시:
```bash
# URL에 토큰 포함 (권장하지 않음)
git remote set-url origin https://[토큰]@github.com/hanjiwoo1/jenkins-test.git

# 또는 Git Credential Manager 사용 (권장)
# macOS의 경우 Keychain에 자동 저장됨
git push -u origin main
# 사용자명: GitHub 사용자명
# 비밀번호: Personal Access Token
```

#### SSH 키 사용 (권장)
SSH 키를 사용하면 토큰 없이 인증할 수 있습니다.

1. SSH 키 생성 (이미 있는 경우 스킵):
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

2. SSH 키를 GitHub에 등록:
   - 생성된 공개키 복사: `cat ~/.ssh/id_ed25519.pub`
   - GitHub → Settings → SSH and GPG keys → New SSH key
   - 복사한 키 붙여넣기

3. 원격 저장소 URL을 SSH로 변경:
```bash
git remote set-url origin git@github.com:hanjiwoo1/jenkins-test.git
```

4. 푸시:
```bash
git push -u origin main
```

## 이후 작업

### 변경사항 푸시하기
```bash
git add .
git commit -m "변경사항 설명"
git push
```

### 최신 변경사항 가져오기
```bash
git pull origin main
```

### 브랜치 관리
```bash
# 새 브랜치 생성
git checkout -b feature/new-feature

# 브랜치 푸시
git push -u origin feature/new-feature
```

## Jenkins와 연동

GitHub 저장소에 코드가 푸시되면, Jenkins에서 이 저장소를 사용할 수 있습니다.

### Jenkins 설정 시:
1. **Repository URL**: `https://github.com/hanjiwoo1/jenkins-test.git`
2. **Credentials**: Public 저장소인 경우 불필요, Private인 경우 인증 정보 필요
3. **Branch**: `*/main`

자세한 Jenkins 연동 방법은 [JENKINS_SETUP_GUIDE.md](./JENKINS_SETUP_GUIDE.md)를 참고하세요.

## 문제 해결

### 문제 1: "remote origin already exists"
```bash
# 기존 원격 저장소 제거 후 재설정
git remote remove origin
git remote add origin https://github.com/hanjiwoo1/jenkins-test.git
```

### 문제 2: 인증 실패
- Personal Access Token 사용 확인
- SSH 키 설정 확인
- GitHub 계정 권한 확인

### 문제 3: 푸시 거부 (non-fast-forward)
```bash
# 원격 저장소의 변경사항 먼저 가져오기
git pull origin main --rebase
git push origin main
```

## 참고 자료

- [Git 공식 문서](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com/)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

