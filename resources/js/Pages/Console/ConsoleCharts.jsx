import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#6366F1', '#10B981', '#D97706', '#E11D48', '#0891B2', '#7C3AED'];

export default function ConsoleCharts({ stats }) {
    // Данные для столбчатой диаграммы
    const barData = [
        { name: 'Студенты', value: stats.students },
        { name: 'Группы',   value: stats.groups },
        { name: 'Курсы',    value: stats.courses },
        { name: 'Модули',   value: stats.modules },
        { name: 'Уроки',    value: stats.lessons },
        { name: 'Задания',  value: stats.tasks },
        { name: 'ДЗ',       value: stats.homeworks },
        { name: 'КР',       value: stats.exams },
    ];

    // Данные для круговой диаграммы (пример – распределение контента)
    const pieData = [
        { name: 'Курсы',    value: stats.courses },
        { name: 'Модули',   value: stats.modules },
        { name: 'Уроки',    value: stats.lessons },
        { name: 'Задания',  value: stats.tasks + stats.homeworks + stats.exams },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Столбчатая диаграмма – общее количество сущностей */}
            <div className="glass-card p-5">
                <h3 className="text-lg font-semibold text-main mb-4">Общая статистика</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                            <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
                            <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--color-bg-card)',
                                    borderColor: 'var(--color-border)',
                                    borderRadius: '0.75rem',
                                    color: 'var(--color-text-primary)'
                                }}
                            />
                            <Bar dataKey="value" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Круговая диаграмма – структура учебного контента */}
            <div className="glass-card p-5">
                <h3 className="text-lg font-semibold text-main mb-4">Учебный контент</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="value"
                                label={({ name, value }) => `${name} (${value})`}
                                labelLine={false}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--color-bg-card)',
                                    borderColor: 'var(--color-border)',
                                    borderRadius: '0.75rem',
                                    color: 'var(--color-text-primary)'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
