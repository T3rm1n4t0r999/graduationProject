import { useForm } from '@inertiajs/react';
import { Dialog, Listbox, Switch, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const contextLabels = {
    task: 'практическому заданию',
    homework: 'домашнему заданию',
    exam: 'контрольной работе',
};

const contextTypeMap = {
    task: 'lesson_task',
    homework: 'homework',
    exam: 'exam',
};

export default function CreateQuestionForm({ isOpen, onClose, onSuccess, organization, parents = [], context, parentId }) {
    const initialType = contextTypeMap[context] || 'lesson_task';

    const { data, setData, post, processing, errors, reset } = useForm({
        question: '',
        question_type: 'single_choice',
        points: 1,
        explanation: '',
        is_active: true,
        questionable_type: initialType,
        questionable_id: parentId ? String(parentId) : '',
        options: [{ text: '', is_correct: false }],
        correct_answers: [],
        image: null,          // <-- добавить
    });

    const recalculateCorrectAnswers = (opts = null) => {
        const currentOptions = opts || data.options;
        if (data.question_type === 'free_text') return;
        if (data.question_type === 'text') {
            setData('correct_answers', currentOptions.map((_, idx) => String(idx)));
        } else {
            const selected = currentOptions
                .map((opt, idx) => (opt.is_correct ? String(idx) : null))
                .filter(v => v !== null);
            setData('correct_answers', selected);
        }
    };

    const handleQuestionTypeChange = (newType) => {
        setData('question_type', newType);
        if (newType === 'free_text') {
            setData('options', []);
            setData('correct_answers', []);
        } else if (newType === 'text') {
            setData('correct_answers', data.options.map((_, idx) => String(idx)));
        } else {
            setData('correct_answers', []);
            setData('options', data.options.map(opt => ({ ...opt, is_correct: false })));
        }
    };

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

    const updateOptionText = (index, text) => {
        const newOptions = [...data.options];
        newOptions[index].text = text;
        setData('options', newOptions);
    };

    const toggleOptionCorrect = (index) => {
        const newOptions = [...data.options];
        if (data.question_type === 'single_choice') {
            newOptions.forEach((opt, i) => (opt.is_correct = i === index));
        } else {
            newOptions[index].is_correct = !newOptions[index].is_correct;
        }
        setData('options', newOptions);
        recalculateCorrectAnswers(newOptions);
    };

    const submit = (e) => {
        e.preventDefault();
        let payloadOptions = data.options;
        let payloadCorrectAnswers = data.correct_answers;

        if (data.question_type === 'free_text') {
            payloadOptions = [];
            payloadCorrectAnswers = [];
        } else {
            payloadOptions = data.options.map(opt => ({
                text: opt.text,
                is_correct: opt.is_correct ?? false,
            }));
            recalculateCorrectAnswers(payloadOptions);
        }

        setData('options', payloadOptions);
        setData('correct_answers', payloadCorrectAnswers);

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

    const selectedParent = parents?.find(p => p.id == data.questionable_id);
    const questionTypes = [
        { value: 'single_choice', label: 'Один вариант' },
        { value: 'multiple_choice', label: 'Несколько вариантов' },
        { value: 'text', label: 'Текстовый ответ' },
        { value: 'free_text', label: 'Свободный ответ' },
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
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl glass-card p-6 text-left align-middle shadow-xl transition-all animate-fade-in">
                                <div className="flex items-center gap-3 mb-6">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{
                                            background: 'var(--color-accent-purple-light)',
                                            color: 'var(--color-accent-purple)',
                                        }}
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <Dialog.Title as="h3" className="text-lg font-semibold text-main">
                                        Новый вопрос
                                    </Dialog.Title>
                                </div>

                                <form onSubmit={submit} className="space-y-5">
                                    {/* Тип вопроса */}
                                    <div>
                                        <label className="block text-xs font-medium text-meta mb-1 uppercase tracking-wide">
                                            Тип вопроса *
                                        </label>
                                        <Listbox value={data.question_type} onChange={handleQuestionTypeChange}>
                                            <div className="relative">
                                                <Listbox.Button className="form-input-glass w-full text-left flex items-center justify-between pr-10">
                                                    <span className={data.question_type ? 'text-main' : 'text-meta'}>
                                                        {questionTypes.find(t => t.value === data.question_type)?.label || 'Выберите тип'}
                                                    </span>
                                                    <svg className="absolute right-3 h-5 w-5 text-meta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                                    </svg>
                                                </Listbox.Button>
                                                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                    <Listbox.Options
                                                        className="absolute z-20 mt-2 w-full overflow-auto rounded-xl border shadow-lg focus:outline-none"
                                                        style={{
                                                            background: 'var(--color-bg-card)',
                                                            borderColor: 'var(--color-border)',
                                                            backdropFilter: 'blur(16px)',
                                                            WebkitBackdropFilter: 'blur(16px)',
                                                            maxHeight: '15rem',
                                                        }}
                                                    >
                                                        {questionTypes.map(type => (
                                                            <Listbox.Option
                                                                key={type.value}
                                                                value={type.value}
                                                                className={({ active, selected }) =>
                                                                    `relative cursor-pointer select-none py-2.5 px-4 text-sm transition-colors ${
                                                                        active ? 'bg-primary-light' : ''
                                                                    } ${selected ? 'font-medium' : ''}`
                                                                }
                                                                style={{ color: 'var(--color-text-primary)' }}
                                                            >
                                                                {({ selected }) => (
                                                                    <div className="flex items-center justify-between">
                                                                        <span>{type.label}</span>
                                                                        {selected && (
                                                                            <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        )}
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

                                    {/* Привязка */}
                                    {parents.length > 0 && (
                                        <div>
                                            <label className="block text-xs font-medium text-meta mb-1 uppercase tracking-wide">
                                                Привязать к {contextLabels[context] || 'заданию'} *
                                            </label>
                                            <Listbox value={data.questionable_id} onChange={(value) => setData('questionable_id', value)}>
                                                <div className="relative">
                                                    <Listbox.Button className="form-input-glass w-full text-left flex items-center justify-between pr-10">
                                                        <span className={selectedParent ? 'text-main' : 'text-meta'}>
                                                            {selectedParent ? selectedParent.title : 'Выберите'}
                                                        </span>
                                                        <svg className="absolute right-3 h-5 w-5 text-meta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                                        </svg>
                                                    </Listbox.Button>
                                                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                        <Listbox.Options
                                                            className="absolute z-20 mt-2 w-full overflow-auto rounded-xl border shadow-lg focus:outline-none"
                                                            style={{
                                                                background: 'var(--color-bg-card)',
                                                                borderColor: 'var(--color-border)',
                                                                backdropFilter: 'blur(16px)',
                                                                WebkitBackdropFilter: 'blur(16px)',
                                                                maxHeight: '15rem',
                                                            }}
                                                        >
                                                            {parents.length === 0 ? (
                                                                <div className="py-3 px-4 text-sm text-meta">Нет доступных элементов</div>
                                                            ) : (
                                                                parents.map(parent => (
                                                                    <Listbox.Option
                                                                        key={parent.id}
                                                                        value={parent.id}
                                                                        className={({ active, selected }) =>
                                                                            `relative cursor-pointer select-none py-2.5 px-4 text-sm transition-colors ${
                                                                                active ? 'bg-primary-light' : ''
                                                                            } ${selected ? 'font-medium' : ''}`
                                                                        }
                                                                        style={{ color: 'var(--color-text-primary)' }}
                                                                    >
                                                                        {({ selected }) => (
                                                                            <div className="flex items-center justify-between">
                                                                                <span>{parent.title}</span>
                                                                                {selected && (
                                                                                    <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                                    </svg>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </Listbox.Option>
                                                                ))
                                                            )}
                                                        </Listbox.Options>
                                                    </Transition>
                                                </div>
                                            </Listbox>
                                            {errors.questionable_id && <p className="mt-1 text-sm text-red-500">{errors.questionable_id}</p>}
                                        </div>
                                    )}

                                    {/* Текст вопроса */}
                                    <div>
                                        <label className="block text-xs font-medium text-meta mb-1 uppercase tracking-wide">
                                            Текст вопроса *
                                        </label>
                                        <textarea
                                            value={data.question ?? ''}
                                            onChange={(e) => setData('question', e.target.value)}
                                            className="form-input-glass min-h-[100px]"
                                            placeholder="Введите текст вопроса"
                                        />
                                        {errors.question && <p className="mt-1 text-sm text-red-500">{errors.question}</p>}
                                    </div>

                                    {/* Баллы */}
                                    <div>
                                        <label className="block text-xs font-medium text-meta mb-1 uppercase tracking-wide">
                                            Баллы *
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={data.points}
                                            onChange={(e) => setData('points', parseInt(e.target.value) || 1)}
                                            className="form-input-glass"
                                        />
                                        {errors.points && <p className="mt-1 text-sm text-red-500">{errors.points}</p>}
                                    </div>

                                    {/* Варианты ответов */}
                                    {data.question_type !== 'free_text' && (
                                        <div>
                                            <label className="block text-xs font-medium text-meta mb-1 uppercase tracking-wide">
                                                {data.question_type === 'text' ? 'Правильные ответы *' : 'Варианты ответов *'}
                                            </label>
                                            {data.question_type === 'text' && (
                                                <p className="text-xs text-meta mb-3">
                                                    Все указанные варианты считаются правильными.
                                                </p>
                                            )}

                                            <div className="space-y-2">
                                                {data.options.map((option, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        {data.question_type !== 'text' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleOptionCorrect(index)}
                                                                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                                                    option.is_correct
                                                                        ? 'border-indigo-500 bg-indigo-500 text-white'
                                                                        : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                                                                }`}
                                                                title={
                                                                    data.question_type === 'single_choice'
                                                                        ? 'Выбрать правильный'
                                                                        : option.is_correct
                                                                            ? 'Убрать отметку'
                                                                            : 'Отметить как правильный'
                                                                }
                                                            >
                                                                {option.is_correct && (
                                                                    data.question_type === 'single_choice' ? (
                                                                        <svg className="w-3 h-3" viewBox="0 0 12 12">
                                                                            <circle cx="6" cy="6" r="4" fill="white" />
                                                                        </svg>
                                                                    ) : (
                                                                        <svg className="w-3 h-3" fill="none" stroke="white" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    )
                                                                )}
                                                            </button>
                                                        )}
                                                        {data.question_type === 'text' && (
                                                            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-indigo-600">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                        <input
                                                            type="text"
                                                            value={option.text}
                                                            onChange={(e) => updateOptionText(index, e.target.value)}
                                                            className="form-input-glass flex-1"
                                                            placeholder={`Вариант ${index + 1}`}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeOption(index)}
                                                            className="p-1.5 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                            disabled={data.options.length <= (data.question_type === 'text' ? 1 : 2)}
                                                            title="Удалить вариант"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={addOption}
                                                className="btn-ghost text-sm mt-3"
                                            >
                                                + Добавить вариант
                                            </button>

                                            {errors.options && <p className="mt-1 text-sm text-red-500">{errors.options}</p>}
                                            {errors.correct_answers && <p className="mt-1 text-sm text-red-500">{errors.correct_answers}</p>}
                                        </div>
                                    )}

                                    {/* Пояснение */}
                                    <div>
                                        <label className="block text-xs font-medium text-meta mb-1 uppercase tracking-wide">
                                            Пояснение
                                        </label>
                                        <textarea
                                            value={data.explanation}
                                            onChange={(e) => setData('explanation', e.target.value)}
                                            className="form-input-glass min-h-[80px]"
                                            placeholder="Пояснение к правильному ответу"
                                        />
                                        {errors.explanation && <p className="mt-1 text-sm text-red-500">{errors.explanation}</p>}
                                    </div>

                                    {/* Изображение */}
                                    <div>
                                        <label className="block text-xs font-medium text-meta mb-1 uppercase tracking-wide">
                                            Изображение
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setData('image', e.target.files[0])}
                                            className="block w-full text-sm text-main file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary/20"
                                        />
                                        {data.image && (
                                            <div className="mt-2">
                                                <img
                                                    src={URL.createObjectURL(data.image)}
                                                    alt="Предпросмотр"
                                                    className="h-32 w-auto rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                                                />
                                            </div>
                                        )}
                                        {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}
                                    </div>

                                    {/* Активность */}
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm font-medium text-main">Активный вопрос</span>
                                        <Switch
                                            checked={data.is_active}
                                            onChange={(value) => setData('is_active', value)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                                data.is_active ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                                            }`}
                                        >
                                            <span
                                                className={`${
                                                    data.is_active ? 'translate-x-6' : 'translate-x-1'
                                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                            />
                                        </Switch>
                                    </div>

                                    {/* Кнопки */}
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button type="button" onClick={handleClose} className="btn-ghost" disabled={processing}>
                                            Отмена
                                        </button>
                                        <button type="submit" disabled={processing} className="btn-primary flex items-center gap-2">
                                            {processing ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    Создание...
                                                </>
                                            ) : (
                                                'Создать'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fadeIn 0.3s ease-out; }
            `}</style>
        </Transition>
    );
}
