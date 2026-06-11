import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 10,
    duration: '30s',
};

export default function () {
    // Тестируем ТОЛЬКО этот новый маршрут
    let res = http.get('http://graduationproject.test');

    check(res, {
        'is status 200': (r) => r.status === 200,
    });
}
