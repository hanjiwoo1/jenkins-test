pipeline {
    agent any
    
    environment {
        DEPLOY_SERVER = '172.16.100.110'
        DEPLOY_USER = 'conse'
        DEPLOY_PATH = '/app/frontend/dist'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '✅ GitHub에서 코드 가져오기'
                checkout scm
            }
        }
        
        stage('Node.js 버전 확인') {
            steps {
                sh '''
                    node --version
                    npm --version
                '''
            }
        }
        
        stage('의존성 설치') {
            steps {
                echo '📦 npm install 실행'
                sh 'npm install'
            }
        }
        
        stage('빌드') {
            steps {
                echo '🔨 빌드 시작'
                sh 'npm run build'
            }
        }
        
        stage('Deploy to Server') {
            steps {
                echo "🚀 ${DEPLOY_SERVER}:${DEPLOY_PATH}로 배포"
                sh """
                    # 배포 디렉토리 생성
                    ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_SERVER} \
                        'sudo mkdir -p ${DEPLOY_PATH} && sudo chown -R ${DEPLOY_USER}:${DEPLOY_USER} ${DEPLOY_PATH}'
                    
                    # 빌드 파일 배포
                    scp -r dist/* ${DEPLOY_USER}@${DEPLOY_SERVER}:${DEPLOY_PATH}/
                    
                    echo "배포 완료: ${DEPLOY_PATH}"
                """
            }
        }
    }
    
    post {
        success {
            echo "✅ 배포 성공!"
        }
        failure {
            echo '❌ 빌드/배포 실패!'
        }
    }
}