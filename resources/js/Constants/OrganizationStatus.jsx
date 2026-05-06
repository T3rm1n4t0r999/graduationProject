export const ORGANIZATION_STATUS = {
    active: {
        label: 'Подтверждена',
        className: 'bg-green-900 text-white',
    },
    trial: {
        label: 'Пробный период',
        className: 'bg-blue-900 text-white',
    },
    suspended: {
        label: 'Приостановлена',
        className: 'bg-red-900 text-white',
    },
    pending_verification: {
        label: 'Требует подтверждения',
        className: 'bg-yellow-500 text-black',
    },
};

export const DEFAULT_STATUS = {
    label: 'Неизвестно',
    className: 'bg-gray-500 text-white',
};
