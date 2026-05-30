import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#10B981', '#EF4444', '#6366F1'];

export default function ProgressCharts({ progressStats }) {
    const { total, attempted, avgPoints, checkedCount, uncheckedCount } = progressStats;

    // Данные для столбчатой диаграммы: всего / выполнено по типам
    const barData = [
        { name: 'Практические', total: total.tasks, done: attempted.tasks },
        { name: 'Домашние',     total: total.homeworks, done: attempted.homeworks },
        { name: 'Контрольные',  total: total.exams, done: attempted.exams },
    ];

    // Процент выполнения для каждого типа
    const completionRates = barData.map(item => ({
        ...item,
        rate: item.total > 0 ? Math.round((item.done / item.total) * 100) : 0,
    }));

    // Данные для круговой диаграммы – проверенные / непроверенные
    const checkData = [
        { name: 'Проверено', value: checkedCount },
        { name: 'Не проверено', value: uncheckedCount },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Столбчатая диаграмма: всего заданий и выполнено попыток */}
            <div className="glass-card p-5">
                <h3 className="text-lg font-semibold text-main mb-4">Активность по типам заданий</h3>
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
                            <Bar dataKey="total" fill="var(--color-border)" name="Всего заданий" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="done" fill="var(--color-primary)" name="Выполнено" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                {/* Проценты выполнения текстом */}
                <div className="mt-3 space-y-1">
                    {completionRates.map(item => (
                        <div key={item.name} className="flex justify-between text-sm">
                            <span className="text-meta">{item.name}</span>
                            <span className="font-medium" style={{ color: item.rate > 50 ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                                {item.rate}% ({item.done} / {item.total})
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Круговая диаграмма: статус проверки */}
            <div className="glass-card p-5">
                <h3 className="text-lg font-semibold text-main mb-4">Статус проверки</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={checkData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="value"
                                label={({ name, value }) => `${name} (${value})`}
                                labelLine={false}
                            >
                                {checkData.map((entry, index) => (
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
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                {/* Средний балл */}
                <div className="mt-3 flex justify-between items-center text-sm">
                    <span className="text-meta">Средний балл за все попытки</span>
                    <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{avgPoints}</span>
                </div>
            </div>
        </div>
    );
}
