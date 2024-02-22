const axios = require('axios');

// 다른 API 서버의 엔드포인트 URL
const apiUrl = 'http://59.16.223.162:38888/api/mydata/postdata';
console.log("11");
// API 서버에서 데이터 가져오기
axios.get(apiUrl)
    .then(response => {
        // 요청에 성공한 경우 응답 데이터 처리
        console.log('응답 데이터:', response.data);
        // 여기서 데이터를 원하는 대로 처리합니다.
    })
    .catch(error => {
        // 요청에 실패한 경우 에러 처리
        console.error('API 요청에 실패했습니다:', error);
    });

