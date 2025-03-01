import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Categories from '@/Components/Categories.jsx';
import { BiDotsHorizontal } from 'react-icons/bi';
import { FaTrashAlt, FaEdit } from 'react-icons/fa';
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
export default function Questions({ questions = [] }) {
    const { auth } = usePage().props;
    const { gameTypes } = usePage().props;
    const section_id = auth?.user?.section_id;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalCategoryOpen, setIsModalCategoryOpen] = useState(false);
    const [isModalManageCategoryOpen, setIsModalManageCategoryOpen] = useState(false);
    const [isEditQuestionModalOpen, setIsEditQuestionModalOpen] = useState(false);
    const [isModalManageGameTypeOpen, setIsModalManageGameTypeOpen] = useState(false);
    const [isModalGameTypeOpen, setIsModalGameTypeOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [search, setSearch] = useState('');
    const [gameType, setGameType] = useState("");

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
    const handleChangeCategory = (e) => {
        setData(e.target.name, e.target.value);
    };

    const handleChangeGameType = (event) => {
        setGameType(event.target.value);
    };

    const handleChoiceChange = (index, value) => {
        const updatedChoices = [...data.choices];
        updatedChoices[index] = value;
        setData('choices', updatedChoices);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsModalOpen(false);
        const trimmedChoices = data.choices.map((choice) => choice.trim());
        const trimmedCorrectAnswer = data.correct_answer.trim();

        if (
            !data.category.trim() ||
            !data.question.trim() ||
            trimmedChoices.some((choice) => choice === '') ||
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

    const handleSubmitCategory = () => { };

    const handleSubmitGameType = async (event) => {
        event.preventDefault();

        setIsModalManageGameTypeOpen(false);
        setIsModalGameTypeOpen(false);

        try {
            const response = await axios.post("/game-type/store", {
                game_type: gameType,
            });

            if (response.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: "Game Type added successfully!",
                    confirmButtonColor: "#3085d6",
                }).then(() => {
                    setIsModalManageGameTypeOpen(true);
                });
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                const errorMessage = Object.values(error.response.data.errors).flat().join("\n");
                Swal.fire({
                    icon: "error",
                    title: "Validation Error!",
                    text: errorMessage,
                    confirmButtonColor: "#d33",
                }).then(() => {
                    setIsModalGameTypeOpen(true);
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Failed!",
                    text: "Failed to add Game Type.",
                    confirmButtonColor: "#d33",
                }).then(() => {
                    setIsModalGameTypeOpen(true);
                });
            }
        }
    };

    const handleDeleteGameType = async (game_type_id) => {
        event.preventDefault();

        setIsModalManageGameTypeOpen(false);

        try {
            const response = await axios.post("/game-type/destroy", {
                game_type_id: game_type_id,
            });

            if (response.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: "Game Type deleted successfully!",
                    confirmButtonColor: "#3085d6",
                }).then(() => {
                    setIsModalManageGameTypeOpen(true);
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Failed!",
                text: "Failed to delete Game Type.",
                confirmButtonColor: "#d33",
            }).then(() => {
                setIsModalManageGameTypeOpen(true);
            });

        }
    };

    const handleEditQuestion = (question) => {
        setSelectedQuestion(question);
        toggleEditQuestionModal();
        console.log(selectedQuestion);
    };

    const gameTypes_data = gameTypes.filter((type) => type.type.toLowerCase().includes(search.toLowerCase()));

    const categories = [
        {
            category_id: 1,
            category: 'Add Tens',
            type: 'Addition',
            game_type_id: 1,
        },
        {
            category_id: 2,
            category: 'Add Two Numbers',
            type: 'Subtraction',
            game_type_id: 2,
        },
        {
            category_id: 3,
            category: 'Addition Sentences',
            type: 'Addition',
            game_type_id: 1,
        },
        {
            category_id: 4,
            category: 'Complete the Equations (+)',
            type: 'Multiplication',
            game_type_id: 3,
        },
        {
            category_id: 5,
            category: 'Add Three Numbers',
            type: 'Mixed',
            game_type_id: 4,
        },
        {
            category_id: 6,
            category: 'Subtract Tens',
            type: 'Subtraction',
            game_type_id: 2,
        },
        {
            category_id: 7,
            category: 'Subtract Two Numbers',
            type: 'Subtraction',
            game_type_id: 2,
        },
        {
            category_id: 8,
            category: 'Subtraction Sentences',
            type: 'Subtraction',
            game_type_id: 2,
        },
        {
            category_id: 9,
            category: 'Complete the Equations (-)',
            type: 'Subtraction',
            game_type_id: 2,
        },
        {
            category_id: 10,
            category: 'Subtract Doubles',
            type: 'Subtraction',
            game_type_id: 2,
        },
        {
            category_id: 11,
            category: 'Multiplication Table',
            type: 'Multiplication',
            game_type_id: 3,
        },
        {
            category_id: 12,
            category: 'Multiplication Word Problem',
            type: 'Multiplication',
            game_type_id: 3,
        },
        {
            category_id: 13,
            category: 'Complete the Equations (x)',
            type: 'Multiplication',
            game_type_id: 3,
        },
        {
            category_id: 14,
            category: 'Multiplication Mystery',
            type: 'Multiplication',
            game_type_id: 3,
        },
    ];

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
                                <div className="text-2xl font-semibold text-green-500"> Game Type</div>
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
                            <div className="text-2xl font-semibold text-primary"> Add a New Question</div>
                            <button
                                onClick={toggleModal}
                                className="bg-primary font-semibold text-white px-4 py-2 rounded-3xl transition duration-300 ease-in-out hover:scale-110 mt-4 sm:mt-0"
                            >
                                Add Question
                            </button>
                        </div>

                        {Object.keys(Categories).map((category) => {
                            const gradient =
                                category === 'Addition'
                                    ? 'to-[#CDDA1E] from-[#50DE65]'
                                    : category === 'Subtraction'
                                        ? 'to-[#EC4899] from-[#8B5CF6]'
                                        : category === 'Subtraction'
                                            ? 'to-[#7A00E6] from-[#8C6FFF]'
                                            : category === 'Division'
                                                ? 'to-[#34D399] from-[#50DE65]'
                                                : category === 'Mixed Question'
                                                    ? 'to-[#6366F1] from-[#4F46E5]'
                                                    : 'to-[#FBBF24] from-[#EC4899]';
                            const correctColor =
                                category === 'Addition'
                                    ? 'bg-success'
                                    : category === 'Subtraction'
                                        ? 'bg-info'
                                        : category === 'Multiplication'
                                            ? 'bg-warning'
                                            : category === 'Mixed Question'
                                                ? 'bg-primary'
                                                : 'bg-gray-500';

                            return (
                                <div
                                    key={category}
                                    className={`mb-8 bg-gradient-to-r ${gradient} sm:p-6 p-3 rounded-3xl text-gray-600`}
                                >
                                    <h1 className="text-2xl font-semibold mb-4 text-white"> {category}</h1>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 sm:gap-4 gap-2">
                                        {questions
                                            .filter((q) => Categories[category].includes(q.category))
                                            .map((q) => (
                                                <div
                                                    key={Math.random().toString(36).substr(2, 9)}
                                                    className="flex items-center bg-white rounded-xl shadow-lg p-4 relative"
                                                >
                                                    <div className="absolute top-4 right-4">
                                                        <div className="flex gap-3">
                                                            <div
                                                                onClick={() => handleEditQuestion(category)}
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
                                                        <div className="text-sm mt-2">Category: {q.category}</div>
                                                        <div className="bg-gray-100 rounded-2xl">
                                                            <div
                                                                className={`text-sm text-gray-700 font-medium mt-2 flex gap-3`}
                                                            >
                                                                {q.choices
                                                                    .filter(
                                                                        (choice) => choice !== null && choice !== '',
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

                                                        <div></div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={toggleModal} className="fixed inset-0 overflow-y-auto">
                <DialogContent className="overflow-y-auto max-h-[80vh] max-w-lg">
                    <form onSubmit={handleSubmit} className="">
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
                            {Object.entries(Categories).map(([type, options]) => (
                                <optgroup key={type} label={type}>
                                    {options.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
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
                        <div className="bg-white sticky bottom-0 p-4  flex justify-end space-x-4">
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
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Questionm */}
            <Dialog
                open={isEditQuestionModalOpen}
                onOpenChange={toggleEditQuestionModal}
                className="fixed inset-0 overflow-y-auto"
            >
                <DialogContent className="overflow-y-auto max-h-[80vh] max-w-lg">
                    <form onSubmit={handleSubmit} className="">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-semibold mb-5">Edit Question</DialogTitle>
                        </DialogHeader>

                        <SelectInput
                            name="category"
                            value={selectedQuestion ? selectedQuestion.category : data.category}
                            onChange={handleChange}
                            className="border w-full p-2 mb-2"
                        >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                                <option
                                    key={category}
                                    value={category}
                                    selected={selectedQuestion?.category === category}
                                >
                                    {category.category}
                                </option>
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
                        <div className="bg-white sticky bottom-0 p-4  flex justify-end space-x-4">
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
                                categories_data.reduce((map, category) => {
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
                                            key={category.id}
                                            className="bg-white text-gray-600 p-3 rounded-b-xl flex justify-between"
                                        >
                                            <span>
                                                <p>{ }</p>
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
                <DialogContent className="overflow-y-auto max-h-[80vh] max-w-lg">
                    <form onSubmit={handleSubmitCategory} className="">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-semibold mb-5 text-yellow-500">
                                Add Category
                            </DialogTitle>
                        </DialogHeader>
                        <InputLabel htmlFor="game_type" value="Game Type" />

                        <SelectInput
                            name="game_type"
                            value={data.game_type}
                            onChange={handleChange}
                            className="border w-full p-2 mb-2"
                        >
                            <option value="">Select Game Type</option>
                            {gameTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.type}
                                </option>
                            ))}
                        </SelectInput>

                        <InputLabel htmlFor="category" value="Category Name" />
                        <TextInput
                            type="text"
                            name="category"
                            onChange={handleChangeCategory}
                            className="border w-full p-2 "
                        />
                        <div className="bg-white sticky bottom-0 p-4  flex justify-end space-x-4">
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
                                            <p>{ }</p>
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
                    <form onSubmit={handleSubmitGameType} className="">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-semibold mb-5">Add Game Type</DialogTitle>
                        </DialogHeader>
                        <InputLabel htmlFor="gameType" value="Game Type" />
                        <TextInput
                            type="text"
                            name="gameType"
                            value={gameType ? gameType : ''}
                            onChange={handleChangeGameType}
                            className="border w-full p-2 "
                        />
                        <div className="bg-white sticky bottom-0 p-4  flex justify-end space-x-4">
                            <DangerButton
                                type="button"
                                onClick={toggleModalGameType}
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
