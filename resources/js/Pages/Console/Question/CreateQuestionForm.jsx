import {useForm} from '@inertiajs/react';
import {Dialog, Listbox, Switch, Transition} from '@headlessui/react';
import {Fragment, useState} from 'react';

export default function CreateQuestionForm({ isOpen, onClose, onSuccess, organization, tasks = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        question: '',
        question_type: 'single_choice',
        points: 1,
        explanation: '',
        is_active: true,
        questionable_type: 'App\\Models\\LessonTask',
        questionable_id: '',
        options: [{ text: '', is_correct: false }],
        correct_answers: [],

    });

    const recalculateCorrectAnswers = (opts = null) => {
        const currentOptions = opts || data.options;
        if (data.question_type === 'text') {
            setData('correct_answers', currentOptions.map((_, idx) => String(idx)));
        } else {
            const selected = currentOptions
                .map((opt, idx) => opt.is_correct ? String(idx) : null)
                .filter(v => v !== null);
            setData('correct_answers', selected);
        }
    };

    // === Смена типа вопроса ===
    const handleQuestionTypeChange = (newType) => {
        setData('question_type', newType);
        if (newType === 'text') {
            setData('correct_answers', data.options.map((_, idx) => String(idx)));
        } else {
            setData('correct_answers', []);
        }
        setData('options', data.options.map(opt => ({ ...opt, is_correct: false})))
    };

    // === Добавление варианта ===
    const addOption = () => {
        const newOptions = [...data.options, { text: '', is_correct: data.question_type === 'text' }];
        setData('options', newOptions);
        recalculateCorrectAnswers(newOptions);
    };

    const removeOption = (index) => {
        const newOptions = data.options.filter((_, i) => i !== index);
        setData('options', newOptions);
        recalculateCorrectAnswers(newOptions);
    };

    // === Редактирование текста варианта ===
    const updateOptionText = (index, text) => {
        const newOptions = [...data.options];
        newOptions[index].text = text;
        setData('options', newOptions);
    };

    // === Переключение is_correct ===
    const toggleOptionCorrect = (index) => {
        const newOptions = [...data.options];

        if (data.question_type === 'single_choice') {
            // Только один правильный
            newOptions.forEach((opt, i) => opt.is_correct = i === index);
        } else {
            // multiple_choice или text: переключаем чекбокс
            newOptions[index].is_correct = !newOptions[index].is_correct;
        }

        setData('options', newOptions);
        recalculateCorrectAnswers();
    };

    // === Отправка формы ===
    const submit = (e) => {
        e.preventDefault();
        const updatedOptions = data.options.map(opt => ({
            text: opt.text,
            is_correct: opt.is_correct ?? false,
        }));
        setData('options', updatedOptions);
        recalculateCorrectAnswers(updatedOptions);
        post(route('question.store', { organization: organization.id }), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onSuccess?.();
            },
        });
    };

    const handleClose = () => {
        if (!processing) onClose();
    };

    const selectedTask = tasks?.find((t) => t.id == data.questionable_id);
    const questionTypes = [
        { value: 'single_choice', label: 'Один вариант ответа' },
        { value: 'multiple_choice', label: 'Несколько вариантов ответа' },
        { value: 'text', label: 'Текстовый ответ' },
    ];

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl glass-card p-6 text-left align-middle shadow-xl transition-all relative z-10">
                                <Dialog.Title as="h3" className="text-lg font-medium text-main mb-4">
                                    Новый вопрос
                                </Dialog.Title>

                                <form onSubmit={submit}>
                                    {/* Тип вопроса */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-main mb-2">Тип вопроса *</label>
                                        <Listbox value={data.question_type} onChange={handleQuestionTypeChange}>
                                            <div className="relative">
                                                <Listbox.Button className="form-input-glass w-full text-left flex items-center justify-between pr-10">
                                                    <span className={data.question_type ? 'text-main' : 'text-meta'}>
                                                        {questionTypes.find(t => t.value === data.question_type)?.label || 'Выберите тип'}
                                                    </span>
                                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                        <svg className="h-5 w-5 text-meta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                                        </svg>
                                                    </span>
                                                </Listbox.Button>
                                                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                    <Listbox.Options className="absolute z-20 mt-2 w-full overflow-auto rounded-xl border shadow-lg focus:outline-none"
                                                                     style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', maxHeight: '15rem' }}>
                                                        {questionTypes.map((type) => (
                                                            <Listbox.Option key={type.value} value={type.value}
                                                                            className={({ active, selected }) => `relative cursor-pointer select-none py-2.5 px-4 text-sm transition-colors ${active ? 'bg-primary-light' : ''} ${selected ? 'font-medium' : ''}`}
                                                                            style={{ color: 'var(--color-text-primary)' }}>
                                                                {({ selected }) => (
                                                                    <div className="flex items-center justify-between">
                                                                        <span className={selected ? 'text-primary font-semibold' : 'text-main'}>{type.label}</span>
                                                                        {selected && <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                                                                    </div>
                                                                )}
                                                            </Listbox.Option>
                                                        ))}
                                                    </Listbox.Options>
                                                </Transition>
                                            </div>
                                        </Listbox>
                                        {errors.question_type && <p className="mt-1 text-sm text-red-500">{errors.question_type}</p>}
                                    </div>

                                    {/* Привязка к заданию */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-main mb-2">Привязать к заданию *</label>
                                        <Listbox value={data.questionable_id} onChange={(value) => setData('questionable_id', value)}>
                                            <div className="relative">
                                                <Listbox.Button className="form-input-glass w-full text-left flex items-center justify-between pr-10">
                                                    <span className={selectedTask ? 'text-main' : 'text-meta'}>
                                                        {selectedTask ? selectedTask.title : 'Выберите задание'}
                                                    </span>
                                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                        <svg className="h-5 w-5 text-meta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                                        </svg>
                                                    </span>
                                                </Listbox.Button>
                                                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                    <Listbox.Options className="absolute z-20 mt-2 w-full overflow-auto rounded-xl border shadow-lg focus:outline-none"
                                                                     style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', maxHeight: '15rem' }}>
                                                        {tasks.map((task) => (
                                                            <Listbox.Option key={task.id} value={task.id}
                                                                            className={({ active, selected }) => `relative cursor-pointer select-none py-2.5 px-4 text-sm transition-colors ${active ? 'bg-primary-light' : ''} ${selected ? 'font-medium' : ''}`}
                                                                            style={{ color: 'var(--color-text-primary)' }}>
                                                                {({ selected }) => (
                                                                    <div className="flex items-center justify-between">
                                                                        <span className={selected ? 'text-primary font-semibold' : 'text-main'}>{task.title}</span>
                                                                        {selected && <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                                                                    </div>
                                                                )}
                                                            </Listbox.Option>
                                                        ))}
                                                    </Listbox.Options>
                                                </Transition>
                                            </div>
                                        </Listbox>
                                        {errors.questionable_id && <p className="mt-1 text-sm text-red-500">{errors.questionable_id}</p>}
                                    </div>

                                    {/* Текст вопроса */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-main">Текст вопроса *</label>
                                        <textarea value={data.question ?? ''} onChange={(e) => setData('question', e.target.value)}
                                                  className="form-input-glass mt-1 min-h-[100px]" placeholder="Введите текст вопроса" />
                                        {errors.question && <p className="mt-1 text-sm text-red-500">{errors.question}</p>}
                                    </div>

                                    {/* Баллы */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-main">Баллы *</label>
                                        <input type="number" min="1" max="100" value={data.points}
                                               onChange={(e) => setData('points', parseInt(e.target.value) || 1)}
                                               className="form-input-glass mt-1" />
                                        {errors.points && <p className="mt-1 text-sm text-red-500">{errors.points}</p>}
                                    </div>

                                    {/* Варианты ответов */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-main mb-2">
                                            {data.question_type === 'text' ? 'Варианты правильных ответов *' : 'Варианты ответов *'}
                                        </label>
                                        {data.question_type === 'text' && (
                                            <p className="text-xs text-meta mb-3">
                                                Все указанные варианты будут считаться правильными.
                                            </p>
                                        )}

                                        <div className="space-y-2">
                                            {data.options.map((option, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    {/* Кастомный радио/чекбокс */}
                                                    <label className="relative flex items-center cursor-pointer">
                                                        <input
                                                            type={data.question_type === 'single_choice' ? 'radio' : 'checkbox'}
                                                            name="correct_answer"
                                                            checked={data.question_type === 'text' ? true : option.is_correct}
                                                            onChange={() => toggleOptionCorrect(index)}
                                                            disabled={data.question_type === 'text'}
                                                            className="sr-only peer"
                                                        />
                                                        <span
                                                            className={`
                                                                inline-flex items-center justify-center w-5 h-5
                                                                transition-all duration-200 border-2
                                                                peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
                                                                ${data.question_type === 'single_choice' ? 'rounded-full' : 'rounded-md'}
                                                                ${
                                                                option.is_correct || data.question_type === 'text'
                                                                    ? 'bg-primary-light border-primary text-[var(--color-text-primary)]'
                                                                    : 'border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-primary/50'
                                                                }
                                                            `}
                                                        >
                                                             {/* Иконка выбора */}
                                                            {data.question_type === 'single_choice' && (option.is_correct || data.question_type === 'text') && (
                                                                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
                                                                    <circle cx="6" cy="6" r="3" />
                                                                </svg>
                                                            )}
                                                            {data.question_type !== 'single_choice' && (option.is_correct || data.question_type === 'text') && (
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </span>
                                                    </label>

                                                    {/* Текстовое поле варианта */}
                                                    <input
                                                        type="text"
                                                        value={option.text}
                                                        onChange={(e) => updateOptionText(index, e.target.value)}
                                                        className="form-input-glass flex-1"
                                                        placeholder={`Вариант ${index + 1}`}
                                                    />

                                                    {/* Кнопка удаления (уже обновлённая) */}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeOption(index)}
                                                        className="p-1.5 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed
                   text-red-500 dark:text-red-400 hover:bg-red-500/10"
                                                        disabled={data.options.length <= (data.question_type === 'text' ? 1 : 2)}
                                                        title="Удалить вариант"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={addOption}
                                            className="mt-3 btn-ghost text-sm inline-flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Добавить вариант
                                        </button>

                                        {errors.options && <p className="mt-1 text-sm text-red-500">{errors.options}</p>}
                                        {errors.correct_answers && <p className="mt-1 text-sm text-red-500">{errors.correct_answers}</p>}
                                    </div>

                                    {/* Пояснение */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-main">Пояснение (необязательно)</label>
                                        <textarea value={data.explanation} onChange={(e) => setData('explanation', e.target.value)}
                                                  className="form-input-glass mt-1 min-h-[80px]" placeholder="Пояснение к правильному ответу" />
                                        {errors.explanation && <p className="mt-1 text-sm text-red-500">{errors.explanation}</p>}
                                    </div>

                                    {/* Активный вопрос */}
                                    <div className="mb-6 flex items-center justify-between">
                                        <span className="text-sm font-medium text-main">Активный вопрос</span>
                                        <Switch checked={data.is_active} onChange={(value) => setData('is_active', value)}
                                                style={{ background: data.is_active ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                                                className='relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none'>
                                            <span className={`${data.is_active ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                                        </Switch>
                                    </div>

                                    {/* Кнопки */}
                                    <div className="flex justify-end gap-3">
                                        <button type="button" onClick={handleClose} className="btn-ghost" disabled={processing}>Отмена</button>
                                        <button type="submit" disabled={processing} className="btn-primary">
                                            {processing ? 'Создание...' : 'Создать'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
