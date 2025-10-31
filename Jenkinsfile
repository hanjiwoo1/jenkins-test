pipeline {
    agent any

    environment {
        NODE_VERSION = '18'
        PORT = '3000'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '소스코드 체크아웃 중...'
                checkout scm
            }
        }

        stage('Node.js 설치') {
            steps {
                echo 'Node.js 설치 중...'
                script {
                    sh """
                        if ! command -v node &> /dev/null; then
                            echo "Node.js가 설치되어 있지 않습니다. 설치를 진행합니다."
                            # Node.js 설치 (Jenkins 서버 환경에 맞게 수정 필요)
                            # 예: nvm 사용 시
                            # source ~/.nvm/nvm.sh && nvm install ${NODE_VERSION} && nvm use ${NODE_VERSION}
                        fi
                        node --version
                        npm --version
                    """
                }
            }
        }

        stage('의존성 설치') {
            steps {
                echo 'npm 패키지 설치 중...'
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                echo '코드 린트 체크 중...'
                sh 'npm run lint || true'
            }
        }

        stage('빌드') {
            steps {
                echo '프로젝트 빌드 중...'
                sh 'npm run build'
                archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
            }
        }

        stage('빌드 결과 확인') {
            steps {
                echo '빌드 결과 확인 중...'
                sh '''
                    if [ -d "dist" ]; then
                        echo "빌드 성공: dist 폴더가 생성되었습니다."
                        ls -la dist/
                    else
                        echo "빌드 실패: dist 폴더가 생성되지 않았습니다."
                        exit 1
                    fi
                '''
            }
        }
    }

    post {
        success {
            echo '빌드가 성공적으로 완료되었습니다!'
        }
        failure {
            echo '빌드가 실패했습니다. 로그를 확인해주세요.'
        }
        always {
            cleanWs()
        }
    }
}


