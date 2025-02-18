import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Questions({ questions = [] }) {
    const { auth } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, reset } = useForm({
        category: '',
        question: '',
        choices: ['', '', '', ''],
        correct_answer: '',
    });

    const categories = {
        Addition: ['Add Tens', 'Add Two Numbers', 'Addition Sentences', 'Complete the Equations (Addition)', 'Add Three Numbers'],
        Subtraction: ['Subtract Tens', 'Subtract Two Numbers', 'Subtraction Sentences', 'Complete the Equations (Subtraction)', 'Subtract Doubles'],
        Multiplication: ['Times Tables Race', 'Multiply and Match', 'Magic Multipliers', 'Multiplication Mystery'],
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handleChange = (e) => {
        setData(e.target.name, e.target.value);
    };

    const handleChoiceChange = (index, value) => {
        const updatedChoices = [...data.choices];
        updatedChoices[index] = value;
        setData('choices', updatedChoices);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('questions.store'), {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            onSuccess: () => {
                reset();
                toggleModal();
            }
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Questions</h2>}>
            <Head title="Questions" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="p-4 space-y-4">
                        <button onClick={toggleModal} className="bg-blue-500 text-white px-4 py-2 rounded">Add Question</button>

                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200">
                                <thead>
                                    <tr className="bg-gray-200 text-left">
                                        <th className="border px-4 py-2">No</th>
                                        <th className="border px-4 py-2">Category</th>
                                        <th className="border px-4 py-2">Question</th>
                                        <th className="border px-4 py-2">Choices</th>
                                        <th className="border px-4 py-2">Correct Answer</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {questions.map((q, index) => (
                                        <tr key={q.id} className="border">
                                            <td className="border px-4 py-2">{index + 1}</td>
                                            <td className="border px-4 py-2">{q.category}</td>
                                            <td className="border px-4 py-2">{q.question}</td>
                                            <td className="border px-4 py-2">{q.choices.join(', ')}</td>
                                            <td className="border px-4 py-2">{q.correct_answer}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">Add New Question</h3>
                        <form onSubmit={handleSubmit}>
                            <label className="block mb-2">Category:</label>
                            <select name="category" value={data.category} onChange={handleChange} className="border w-full p-2 mb-2">
                                <option value="">Select Category</option>
                                {Object.entries(categories).map(([type, options]) => (
                                    <optgroup key={type} label={type}>
                                        {options.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>

                            <label className="block mb-2">Question:</label>
                            <input type="text" name="question" value={data.question} onChange={handleChange} className="border w-full p-2 mb-2" />

                            <label className="block mb-2">Choices:</label>
                            {data.choices.map((choice, index) => (
                                <div key={index} className="mb-2">
                                    <label className="block mb-1">{`Choice ${String.fromCharCode(65 + index)}`}</label>
                                    <input
                                        type="text"
                                        value={choice}
                                        onChange={(e) => handleChoiceChange(index, e.target.value)}
                                        className="border w-full p-2"
                                    />
                                </div>
                            ))}

                            <label className="block mb-2">Correct Answer:</label>
                            <input type="text" name="correct_answer" value={data.correct_answer} onChange={handleChange} className="border w-full p-2 mb-4" />

                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={toggleModal} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
