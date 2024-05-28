import http from 'k6/http';
import { check } from 'k6';

export let options = {
    stages: [
        { duration: '10s', target: 1 },
    ],
};

export default function () {
    const url = 'https://lt-1-stage-api.penpencil.co/batch-service/v1/fee/upcoming-instalments';

    const headers = {
        'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        'integration-with': '',
        'sec-ch-ua-mobile': '?0',
        'client-version': '4.2.1',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjM1MjM3Njg5OTQuOTg0LCJkYXRhIjp7Il9pZCI6IjY2MDQwNTZhZDc5Y2UxMzVkMTEyNjIwMSIsInVzZXJuYW1lIjoiNjUyMTA5MjgyOCIsImZpcnN0TmFtZSI6IlVzZXJuYW1lIiwibGFzdE5hbWUiOiIiLCJvcmdhbml6YXRpb24iOnsiX2lkIjoiNWViMzkzZWU5NWZhYjc0NjhhNzlkMTg5Iiwid2Vic2l0ZSI6InBoeXNpY3N3YWxsYWguY29tIiwibmFtZSI6IlBoeXNpY3N3YWxsYWgifSwicm9sZXMiOlsiNWIyN2JkOTY1ODQyZjk1MGE3NzhjNmVmIl0sImNvdW50cnlHcm91cCI6IklOIiwidHlwZSI6IlVTRVIifSwiaWF0IjoxNzE1MjQ2OTA3fQ.AaGRNafUHphXkA-VAQFC3OfUn97c9s_GaDPw9rYFCdg',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://staging.physicswallah.live/',
        'randomId': '4c2c9314-6595-4951-a08f-ac59b4b10edd',
        'client-id': '5eb393ee95fab7468a79d189',
        'client-type': 'WEB',
        'sec-ch-ua-platform': '"macOS"'
    };

    let response = http.get(url, { headers });

    check(response, {
        'status is 200': (r) => r.status === 200,
    });
}
