import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Categories from '@/Components/Categories.jsx';
import { BiDotsHorizontal } from 'react-icons/bi';
import { FaTrashAlt, FaEdit, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar';
import Swal from 'sweetalert2';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import InputLabel from '@/Components/InputLabel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { IoClose } from 'react-icons/io5';
import { Textarea } from '@headlessui/react';

export default function Questions({ questions = [] }) {
    const { auth } = usePage().props;
    const { gameTypes, categories } = usePage().props;
    const section_id = auth?.user?.section_id;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalCategoryOpen, setIsModalCategoryOpen] = useState(false);
    const [isModalManageCategoryOpen, setIsModalManageCategoryOpen] = useState(false);
    const [isEditQuestionModalOpen, setIsEditQuestionModalOpen] = useState(false);
    const [isModalManageGameTypeOpen, setIsModalManageGameTypeOpen] = useState(false);
    const [isModalGameTypeOpen, setIsModalGameTypeOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [search, setSearch] = useState('');
    const [expandedSections, setExpandedSections] = useState({});
    const [formDataGameType, setFormDataGameType] = useState({
        gameType: '',
        description: '',
    });

    const toggleSection = (type) => {
        setExpandedSections((prev) => ({
            ...prev,
            [type]: !prev[type],
        }));
    };

    const [formDataCategory, setFormDataCategory] = useState({
        gameType: '',
        category: '',
        description: '',
        example: '',
    });

    const [formDataUpdate, setFormDataUpdate] = useState({
        id: '',
        section_id: section_id,
        category: '',
        question: '',
        choices: ['', '', '', ''],
        correct_answer: '',
    });

    const { data, setData, post, reset } = useForm({
        section_id: section_id,
        category: '',
        question: '',
        choices: ['', '', '', ''],
        correct_answer: '',
    });

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const toggleModalGameType = () => {
        setIsModalGameTypeOpen(!isModalGameTypeOpen);
    };
    const toggleModalManageGameType = () => {
        setIsModalManageGameTypeOpen(!isModalManageGameTypeOpen);
    };
    const toggleModalCategory = () => {
        setIsModalCategoryOpen(!isModalCategoryOpen);
    };
    const toggleModalManageCategory = () => {
        setIsModalManageCategoryOpen(!isModalManageCategoryOpen);
    };
    const toggleEditQuestionModal = () => {
        setIsEditQuestionModalOpen(!isEditQuestionModalOpen);
    };

    const handleChange = (e) => {
        setData(e.target.name, e.target.value);
    };

    const handleChangeUpdate = (e) => {
        const { name, value } = e.target;
        setFormDataUpdate((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleChangeCategory = (event) => {
        const { name, value } = event.target;
        setFormDataCategory((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleChangeGameType = (event) => {
        const { name, value } = event.target;
        setFormDataGameType((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleChoiceChange = (index, value) => {
        const updatedChoices = [...data.choices];
        updatedChoices[index] = value;
        setData('choices', updatedChoices);
    };

    const handleChoiceChangeUpdate = (index, value) => {
        setFormDataUpdate((prev) => {
            const updatedChoices = [...prev.choices];
            updatedChoices[index] = value;
            return { ...prev, choices: updatedChoices };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsModalOpen(false);
        const trimmedChoices = data.choices.map((choice) => choice.trim()).filter((choice) => choice !== '');

        const trimmedCorrectAnswer = data.correct_answer.trim();

        if (
            !data.category.trim() ||
            !data.question.trim() ||
            trimmedChoices.length === 0 ||
            trimmedCorrectAnswer === ''
        ) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'All fields are required.',
            }).then(() => {
                setIsModalOpen(true);
            });
            return;
        }

        const uniqueChoices = new Set(trimmedChoices);
        if (uniqueChoices.size !== trimmedChoices.length) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Each choice must be unique.',
            }).then(() => {
                setIsModalOpen(true);
            });
            return;
        }

        if (!trimmedChoices.includes(trimmedCorrectAnswer)) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'The correct answer must be one of the choices.',
            }).then(() => {
                setIsModalOpen(true);
            });
            return;
        }

        Swal.fire({
            icon: 'question',
            title: 'Are you sure?',
            text: 'Do you want to save this question?',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, save it!',
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('questions.store'), {
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    },
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success',
                            text: 'Question added successfully!',
                        });
                        reset();
                        toggleModal();
                    },
                });
            }
        });
    };

    const handleSubmitUpdate = async (e) => {
        e.preventDefault();
        setIsEditQuestionModalOpen(false);

        const trimmedChoices = formDataUpdate.choices.map((choice) => choice.trim()).filter((choice) => choice !== '');

        const trimmedCorrectAnswer = formDataUpdate.correct_answer.trim();

        if (
            !formDataUpdate.category.trim() ||
            !formDataUpdate.question.trim() ||
            trimmedChoices.length === 0 ||
            trimmedCorrectAnswer === ''
        ) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'All fields are required.',
            }).then(() => setIsEditQuestionModalOpen(true));
            return;
        }

        const uniqueChoices = new Set(trimmedChoices);
        if (uniqueChoices.size !== trimmedChoices.length) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Each choice must be unique.',
            }).then(() => setIsEditQuestionModalOpen(true));
            return;
        }

        if (!trimmedChoices.includes(trimmedCorrectAnswer)) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'The correct answer must be one of the choices.',
            }).then(() => setIsEditQuestionModalOpen(true));
            return;
        }

        Swal.fire({
            icon: 'question',
            title: 'Are you sure?',
            text: 'Do you want to update this question?',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, update it!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.put(`/questions/${formDataUpdate.id}`, formDataUpdate, {
                        headers: {
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.status === 200) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success',
                            text: 'Question updated successfully!',
                        }).then(() => window.location.reload());
                    }
                } catch (error) {
                    console.error('Error updating question:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Update Failed',
                        text: 'Something went wrong. Please try again.',
                    });
                    setIsEditQuestionModalOpen(true);
                }
            }
        });
    };

    const handlePublish = async (gameType) => {
        Swal.fire({
            icon: 'question',
            title: 'Are you sure?',
            text: `Do you want to ${gameType.status === 0 ? 'unpublish' : 'publish'} this game type?`,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, update it!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const updatedStatus = gameType.status === 0 ? 1 : 0;

                    const response = await axios.put(
                        `/game-types/${gameType.game_type_id}/status`,
                        { status: updatedStatus },
                        {
                            headers: {
                                'X-CSRF-TOKEN': document
                                    .querySelector('meta[name="csrf-token"]')
                                    .getAttribute('content'),
                                'Content-Type': 'application/json',
                            },
                        },
                    );

                    if (response.status === 200) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success',
                            text: `Game type ${updatedStatus === 1 ? 'unpublished' : 'published'} successfully!`,
                        }).then(() => window.location.reload());
                    }
                } catch (error) {
                    console.error('Error updating game type:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Update Failed',
                        text: 'Something went wrong. Please try again.',
                    });
                }
            }
        });
    };

    const handleDelete = (id) => {
        console.log(id);
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .delete(route('questions.destroy', id), {
                        headers: {
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                        },
                    })
                    .then(() => {
                        Swal.fire('Deleted!', 'Your question has been deleted.', 'success').then(() => {
                            window.location.reload();
                        });
                    })
                    .catch((error) => {
                        console.error('Error deleting question:', error);
                        Swal.fire('Error', 'Something went wrong.', 'error');
                    });
            }
        });
    };

    const handleSubmitCategory = async (event) => {
        event.preventDefault();

        setIsModalManageCategoryOpen(false);
        setIsModalCategoryOpen(false);

        try {
            const response = await axios.post('/category/store', {
                game_type: formDataCategory.gameType,
                category: formDataCategory.category,
                description: formDataCategory.description,
                example: formDataCategory.example,
            });

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Category added successfully!',
                    confirmButtonColor: '#3085d6',
                }).then(() => {
                    window.location.reload();
                });
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                const errorMessage = Object.values(error.response.data.errors).flat().join('\n');
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error!',
                    text: errorMessage,
                    confirmButtonColor: '#d33',
                }).then(() => {
                    setIsModalCategoryOpen(false);
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed!',
                    text: 'Failed to add Category.',
                    confirmButtonColor: '#d33',
                }).then(() => {
                    setIsModalCategoryOpen(false);
                });
            }
        }
    };

    const handleDeleteCategory = async (category_id) => {
        event.preventDefault();

        setIsModalManageCategoryOpen(false);

        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.post('/category/destroy', {
                        category_id: category_id,
                    });

                    if (response.data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted!',
                            text: 'Category has been deleted.',
                            confirmButtonColor: '#3085d6',
                        }).then(() => {
                            window.location.reload();
                        });
                    }
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Failed!',
                        text: 'Failed to delete Category.',
                        confirmButtonColor: '#d33',
                    }).then(() => {
                        setIsModalManageCategoryOpen(true);
                    });
                }
            }
        });
    };

    const handleSubmitGameType = async (event) => {
        event.preventDefault();

        setIsModalManageGameTypeOpen(false);
        setIsModalGameTypeOpen(false);

        try {
            const response = await axios.post('/game-type/store', {
                game_type: formDataGameType.gameType,
                description: formDataGameType.description,
            });

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Game Type added successfully!',
                    confirmButtonColor: '#3085d6',
                }).then(() => {
                    setFormDataGameType({ gameType: '', description: '' });
                    location.reload();
                });
            }
        } catch (error) {
            let errorMessage = 'An unexpected error occurred.';
            if (error.response) {
                if (error.response.status === 422) {
                    errorMessage = Object.values(error.response.data.errors).flat().join('\n');
                } else {
                    errorMessage = 'Failed to add Game Type.';
                }
            }

            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: errorMessage,
                confirmButtonColor: '#d33',
            }).then(() => {
                setIsModalGameTypeOpen(true);
            });
        }
    };

    const handleDeleteGameType = async (game_type_id) => {
        event.preventDefault();

        setIsModalManageGameTypeOpen(false);

        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.post('/game-type/destroy', {
                        game_type_id: game_type_id,
                    });

                    if (response.data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted!',
                            text: 'Game Type has been deleted.',
                            confirmButtonColor: '#3085d6',
                        }).then(() => {
                            window.location.reload();
                        });
                    }
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Failed!',
                        text: 'Failed to delete Game Type.',
                        confirmButtonColor: '#d33',
                    }).then(() => {
                        setIsModalManageGameTypeOpen(true);
                    });
                }
            }
        });
    };

    const handleEditQuestion = async (questionId) => {
        try {
            const response = await axios.get(`/questions/${questionId}`);
            if (response.data) {
                setSelectedQuestion(response.data);

                setFormDataUpdate((prev) => ({
                    ...prev,
                    id: questionId,
                    category: response.data.category || '',
                    question: response.data.question || '',
                    choices: response.data.choices || ['', '', '', ''],
                    correct_answer: response.data.correct_answer || '',
                }));

                toggleEditQuestionModal();
            }
        } catch (error) {
            console.error('Error fetching question:', error);
        }
    };

    const groupedCategories = categories.reduce((acc, category) => {
        if (!acc[category.type]) {
            acc[category.type] = [];
        }
        acc[category.type].push(category);
        return acc;
    }, {});

    const gradientColors = [
        'to-[#CDDA1E] from-[#50DE65]',
        'to-[#EC4899] from-[#8B5CF6]',
        'to-[#7A00E6] from-[#8C6FFF]',
        'to-[#34D399] from-[#50DE65]',
        'to-[#6366F1] from-[#4F46E5]',
        'to-[#FBBF24] from-[#EC4899]',
    ];

    const correctColors = ['bg-success', 'bg-info', 'bg-warning', 'bg-primary', 'bg-gray-500'];

    const gameTypes_data = gameTypes.filter((type) => type.type.toLowerCase().includes(search.toLowerCase()));

    const categories_data = categories.filter((category) =>
        category.category.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Questions</h2>}>
            <Head title="Questions" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="p-4 space-y-4">
                        <div className="grid lg:grid-cols-2 gap-4 grid-cols-1">
                            <div className="bg-green-50 border border-4 flex flex-col sm:flex-row justify-between border-green-300 p-5 rounded-3xl">
                                <div className="text-2xl font-semibold text-green-500">Game Type</div>
                                <button
                                    onClick={toggleModalManageGameType}
                                    className="bg-green-500 font-semibold text-white px-4 py-2 rounded-3xl transition duration-300 ease-in-out hover:scale-110 mt-4 sm:mt-0"
                                >
                                    Manage
                                </button>
                            </div>
                            <div className="bg-yellow-50 border border-4 flex flex-col sm:flex-row justify-between border-yellow-300 p-5 rounded-3xl">
                                <div className="text-2xl font-semibold text-yellow-500">Manage Categories</div>
                                <button
                                    onClick={toggleModalManageCategory}
                                    className="bg-yellow-500 font-semibold text-white px-4 py-2 rounded-3xl transition duration-300 ease-in-out hover:scale-110 mt-4 sm:mt-0"
                                >
                                    Manage
                                </button>
                            </div>
                        </div>
                        <div className="bg-blue-50 border border-4 flex flex-col sm:flex-row justify-between border-blue-300 p-5 rounded-3xl">
                            <div className="text-2xl font-semibold text-primary">Add a New Question</div>
                            <button
                                onClick={toggleModal}
                                className="bg-primary font-semibold text-white px-4 py-2 rounded-3xl transition duration-300 ease-in-out hover:scale-110 mt-4 sm:mt-0"
                            >
                                Add Question
                            </button>
                        </div>

                        {gameTypes.map((gameType, index) => {
                            const gradient = gradientColors[index % gradientColors.length];
                            const correctColor = correctColors[index % correctColors.length];
                            const isExpanded = expandedSections[gameType.type];

                            // Filter Questions for this Game Type
                            const filteredQuestions = questions.filter(
                                (q) =>
                                    groupedCategories[gameType.type] &&
                                    groupedCategories[gameType.type].map((item) => item.category).includes(q.category),
                            );

                            return (
                                <div key={gameType.type} className="mb-8 relative">
                                    <div
                                        className={`bg-gradient-to-r ${gradient} sm:p-6 p-3 rounded-3xl text-gray-600 relative`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div
                                                className="cursor-pointer text-white"
                                                onClick={() => toggleSection(gameType.type)}
                                            >
                                                {isExpanded ? <FaChevronUp size={20} /> : <FaChevronDown size={20} />}
                                            </div>
                                            <h1 className="text-2xl font-semibold text-white">{gameType.type}</h1>
                                            <button
                                                onClick={() => handlePublish(gameType)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg"
                                            >
                                                {gameType.status === 0 ? 'Unpublish' : 'Publish'}
                                            </button>
                                        </div>

                                        {isExpanded && (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 sm:gap-4 gap-2 mt-4">
                                                {filteredQuestions.length > 0 ? (
                                                    filteredQuestions.map((q) => (
                                                        <div
                                                            key={`${q.id}-${Math.random().toString(36).substr(2, 9)}`}
                                                            className="flex items-center bg-white rounded-xl shadow-lg p-4 relative"
                                                        >
                                                            <div className="absolute top-4 right-4">
                                                                <div className="flex flex-col gap-3">
                                                                    <div
                                                                        onClick={() => handleEditQuestion(q.id)}
                                                                        className="cursor-pointer bg-green-400 text-white font-medium text-xs p-1 px-4 rounded-lg"
                                                                    >
                                                                        <FaEdit />
                                                                    </div>
                                                                    <div
                                                                        onClick={() => handleDelete(q.id)}
                                                                        className="cursor-pointer bg-red-400 text-white font-medium text-xs p-1 px-4 rounded-lg"
                                                                    >
                                                                        <FaTrashAlt />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex-1">
                                                                <div className="text-2xl font-semibold max-w-[86%]">
                                                                    {q.question}
                                                                </div>
                                                                <div className="text-sm mt-2">
                                                                    Category: {q.category}
                                                                </div>
                                                                <div className="bg-gray-100 rounded-2xl">
                                                                    <div className="text-sm text-gray-700 font-medium mt-2 flex gap-3">
                                                                        {q.choices
                                                                            .filter(
                                                                                (choice) =>
                                                                                    choice !== null && choice !== '',
                                                                            )
                                                                            .map((choice, i) => (
                                                                                <div
                                                                                    key={`${q.id}-${choice}`}
                                                                                    className={`bg-gray-200 p-2 rounded-lg w-full ${choice === q.correct_answer ? correctColor + ' text-white' : ''}`}
                                                                                >
                                                                                    {choice}
                                                                                    {i < q.choices.length - 1 && ' '}
                                                                                </div>
                                                                            ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-white text-center text-lg font-semibold p-4 col-span-2">
                                                        No Questions Available
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={toggleModal} className="fixed inset-0 overflow-y-auto">
                <DialogContent className="overflow-y-auto max-h-[80vh] max-w-lg p-0">
                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-4">
                        <div className="p-6">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-semibold mb-5">Add New Question</DialogTitle>
                            </DialogHeader>

                            <InputLabel htmlFor="category" value="Category" />

                            <TextInput type="hidden" name="section_id" value={section_id} />

                            <SelectInput
                                name="category"
                                value={data.category}
                                onChange={handleChange}
                                className="border w-full p-2 mb-2"
                            >
                                <option value="">Select Category</option>
                                {Object.entries(groupedCategories).map(([type, options]) => (
                                    <optgroup key={type} label={type}>
                                        {options.map((cat) => (
                                            <option key={cat.category_id} value={cat.category}>
                                                {cat.category}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </SelectInput>

                            <InputLabel htmlFor="question" value="Question" />
                            <TextInput
                                type="text"
                                name="question"
                                value={data.question}
                                onChange={handleChange}
                                className="border w-full p-2 mb-2"
                                maxLength={250}
                            />
                            <h1 className="text-lg my-5 font-semibold text-primary">Choices</h1>

                            {data.choices.map((choice, index) => (
                                <div key={index} className="mb-2">
                                    <InputLabel htmlFor="choices" value={`Choice ${String.fromCharCode(65 + index)}`} />
                                    <TextInput
                                        type="text"
                                        value={choice}
                                        onChange={(e) => handleChoiceChange(index, e.target.value)}
                                        className="border w-full p-2"
                                    />
                                </div>
                            ))}
                            <InputLabel htmlFor="correct_answer" value="Correct Answer" />

                            <TextInput
                                type="text"
                                name="correct_answer"
                                value={data.correct_answer}
                                onChange={handleChange}
                                className="border w-full p-2 "
                            />
                        </div>
                        <div className=" sticky bottom-0 bg-white h-max ">
                            <div className="h-full flex justify-end space-x-4 p-6">
                                <DangerButton
                                    type="button"
                                    onClick={toggleModal}
                                    className="bg-gray-500 text-white px-4 py-2 rounded"
                                >
                                    Cancel
                                </DangerButton>

                                <PrimaryButton type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                                    Save
                                </PrimaryButton>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Questionm */}
            <Dialog
                open={isEditQuestionModalOpen}
                onOpenChange={toggleEditQuestionModal}
                className="fixed inset-0 overflow-y-auto"
            >
                <DialogContent className="overflow-y-auto max-h-[80vh] max-w-lg p-0">
                    <form onSubmit={handleSubmitUpdate}>
                        <div className="p-6">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-semibold mb-5">Edit Question</DialogTitle>
                            </DialogHeader>

                            {/* Category Selection */}
                            <SelectInput
                                name="category"
                                value={formDataUpdate.category}
                                onChange={handleChangeUpdate}
                                className="border w-full p-2 mb-2"
                            >
                                <option value="">Select Category</option>
                                {categories.map((category) => (
                                    <option key={category.category} value={category.category}>
                                        {category.category}
                                    </option>
                                ))}
                            </SelectInput>

                            {/* Question Input */}
                            <InputLabel htmlFor="question" value="Question" />
                            <TextInput
                                type="text"
                                name="question"
                                value={formDataUpdate.question}
                                onChange={handleChangeUpdate}
                                className="border w-full p-2 mb-2"
                                maxLength={250}
                            />

                            {/* Choices Section */}
                            <h1 className="text-lg my-5 font-semibold text-primary">Choices</h1>
                            {formDataUpdate.choices.map((choice, index) => (
                                <div key={index} className="mb-2">
                                    <InputLabel
                                        htmlFor={`choice-${index}`}
                                        value={`Choice ${String.fromCharCode(65 + index)}`}
                                    />
                                    <TextInput
                                        type="text"
                                        value={choice}
                                        onChange={(e) => handleChoiceChangeUpdate(index, e.target.value)}
                                        className="border w-full p-2"
                                    />
                                </div>
                            ))}

                            {/* Correct Answer Input */}
                            <InputLabel htmlFor="correct_answer" value="Correct Answer" />
                            <TextInput
                                type="text"
                                name="correct_answer"
                                value={formDataUpdate.correct_answer}
                                onChange={handleChangeUpdate}
                                className="border w-full p-2"
                            />
                        </div>
                        {/* Footer Buttons */}
                        <div className="bg-white sticky bottom-0 p-6 flex justify-end space-x-4">
                            <DangerButton
                                type="button"
                                onClick={toggleEditQuestionModal}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </DangerButton>
                            <PrimaryButton type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                                Save
                            </PrimaryButton>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Manage Category */}
            <Dialog
                open={isModalManageCategoryOpen}
                onOpenChange={toggleModalManageCategory}
                className="fixed inset-0 overflow-y-auto"
            >
                <DialogContent className="overflow-y-auto max-h-[95vh] max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-semibold mb-5 text-yellow-500">
                            Manage Categories
                        </DialogTitle>
                    </DialogHeader>
                    <div className="bg-yellow-50 flex flex-col sm:flex-row justify-between items-center p-5 rounded-3xl">
                        <div className="text-xl font-semibold text-yellow-500">Create New </div>
                        <button
                            onClick={toggleModalCategory}
                            className="bg-yellow-500 font-semibold text-white px-4 py-2 rounded-3xl transition duration-300 ease-in-out hover:scale-110 mt-4 sm:mt-0"
                        >
                            Add
                        </button>
                    </div>
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search Category..."
                        className="w-full my-2 text-lg bg-white text-gray-700 bg-transparent border border-gray-300 rounded-xl mb-7 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="bg-gray-100 rounded-2xl space-y-2 p-4 overflow-y-auto max-h-[40vh]">
                        <div className="sm:grid grid-cols-1 gap-4">
                            {Object.entries(
                                categories_data
                                    .filter((category) => category.type !== null)
                                    .reduce((map, category) => {
                                        const key = category.type;
                                        map[key] = map[key] || [];
                                        map[key].push(category);
                                        return map;
                                    }, {}),
                            ).map(([key, categories]) => (
                                <div key={key}>
                                    <h2 className="text-lg font-semibold px-3 py-2 bg-gray-200 text-gray-600 rounded-t-xl">
                                        {key}
                                    </h2>
                                    {categories.map((category) => (
                                        <div
                                            key={category.category_id}
                                            className="bg-white text-gray-600 p-3 rounded-b-xl flex justify-between"
                                        >
                                            <span>
                                                <h3 className="text-lg">{category.category}</h3>
                                            </span>
                                            <div>
                                                <button
                                                    className="bg-danger text-white p-1 rounded-full hover:scale-110 transition duration-200 ease-in-out"
                                                    onClick={() => handleDeleteCategory(category.category_id)}
                                                >
                                                    <IoClose />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Category */}
            <Dialog
                open={isModalCategoryOpen}
                onOpenChange={toggleModalCategory}
                className="fixed inset-0 overflow-y-auto"
            >
                <DialogContent className="overflow-y-auto max-h-[80vh] max-w-lg p-0">
                    <form onSubmit={handleSubmitCategory} className="">
                        <div className="p-6">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-semibold mb-5 text-yellow-500">
                                    Add Category
                                </DialogTitle>
                            </DialogHeader>
                            <InputLabel htmlFor="game_type" value="Game Type" />

                            <SelectInput
                                name="gameType"
                                value={formDataCategory.gameType}
                                onChange={handleChangeCategory}
                                className="border w-full p-2 mb-2"
                            >
                                <option value="">Select Game Type</option>
                                {gameTypes.map((type) => (
                                    <option key={type.game_type_id} value={type.game_type_id}>
                                        {type.type}
                                    </option>
                                ))}
                            </SelectInput>

                            <InputLabel htmlFor="category" value="Category Name" />
                            <TextInput
                                type="text"
                                value={formDataCategory.category}
                                name="category"
                                onChange={handleChangeCategory}
                                className="border w-full p-2 mb-4"
                            />

                            <InputLabel htmlFor="description" value="Description" />
                            <Textarea
                                type="text"
                                value={formDataCategory.description}
                                name="description"
                                onChange={handleChangeCategory}
                                className="border w-full p-4 mb-4 rounded-2xl h-14 min-h-[120px] bg-gray-50 border-gray-300 shadow-sm focus:border-warning focus:ring-warning "
                            />

                            <InputLabel htmlFor="sample" value="Example" />
                            <TextInput
                                type="text"
                                value={formDataCategory.example}
                                name="example"
                                onChange={handleChangeCategory}
                                className="border w-full p-2 "
                            />
                        </div>
                        <div className="bg-white sticky bottom-0 p-6  flex justify-end space-x-4">
                            <DangerButton
                                type="button"
                                onClick={toggleModalCategory}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </DangerButton>

                            <PrimaryButton type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                                Save
                            </PrimaryButton>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Manage Game type */}
            <Dialog
                open={isModalManageGameTypeOpen}
                onOpenChange={toggleModalManageGameType}
                className="fixed inset-0 overflow-y-auto"
            >
                <DialogContent className="overflow-y-auto max-h-[95vh] max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-semibold mb-5 text-green-500">
                            Manage Game Types
                        </DialogTitle>
                    </DialogHeader>
                    <div className="bg-green-50 flex flex-col sm:flex-row justify-between items-center p-5 rounded-3xl">
                        <div className="text-xl font-semibold text-green-500">Create New </div>
                        <button
                            onClick={toggleModalGameType}
                            className="bg-green-500 font-semibold text-white px-4 py-2 rounded-3xl transition duration-300 ease-in-out hover:scale-110 mt-4 sm:mt-0"
                        >
                            Add
                        </button>
                    </div>
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search Category..."
                        className="w-full my-2 text-lg bg-white text-gray-700 bg-transparent border border-gray-300 rounded-xl mb-7 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="bg-gray-100 rounded-2xl space-y-2 p-4 overflow-y-auto max-h-[40vh]">
                        <div className="sm:grid grid-cols-1 gap-2">
                            {gameTypes_data.map((type) => (
                                <div key={type.id}>
                                    <div className="bg-white text-gray-600 p-3 rounded-xl flex justify-between">
                                        <span>
                                            <p>{}</p>
                                            <h3 className="text-lg">{type.type}</h3>
                                        </span>
                                        <div>
                                            <button
                                                className="bg-danger text-white p-1 rounded-full hover:scale-110 transition duration-200 ease-in-out"
                                                onClick={() => handleDeleteGameType(type.game_type_id)}
                                            >
                                                <IoClose />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog
                open={isModalGameTypeOpen}
                onOpenChange={toggleModalGameType}
                className="fixed inset-0 overflow-y-auto"
            >
                <DialogContent className="overflow-y-auto max-h-[80vh] max-w-lg">
                    <form onSubmit={handleSubmitGameType}>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-semibold mb-5">Add Game Type</DialogTitle>
                        </DialogHeader>
                        <InputLabel htmlFor="gameType" value="Game Type" />
                        <TextInput
                            type="text"
                            name="gameType"
                            value={formDataGameType.gameType}
                            onChange={handleChangeGameType}
                            className="border w-full p-2 mb-4"
                        />

                        <InputLabel htmlFor="description" value="Description" />
                        <Textarea
                            name="description"
                            value={formDataGameType.description}
                            onChange={handleChangeGameType}
                            className="border w-full p-4 mb-4 rounded-2xl h-14 min-h-[120px] bg-gray-50 border-gray-300 shadow-sm focus:border-warning focus:ring-warning "
                            placeholder="Enter game description here..."
                        />
                        <div className="bg-white sticky bottom-0 p-4 flex justify-end space-x-4">
                            <DangerButton
                                type="button"
                                onClick={() => setIsModalGameTypeOpen(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </DangerButton>

                            <PrimaryButton type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                                Save
                            </PrimaryButton>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
