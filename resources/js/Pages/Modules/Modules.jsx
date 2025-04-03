import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Swal from 'sweetalert2';
import axios from 'axios';

import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import InputLabel from '@/Components/InputLabel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FaFile } from 'react-icons/fa6';
import {
    FaCloudDownloadAlt,
    FaTrashAlt,
    FaFileAlt,
    FaUpload,
    FaRedo,
    FaCalendarAlt,
    FaEdit,
    FaEye,
    FaArrowRight,
} from 'react-icons/fa';
import { useEffect } from 'react';
import { Textarea } from '@headlessui/react';
import { set } from 'date-fns';
import Avatar from '@/Components/Avatar';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

export default function Modules({}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmissionRequired, setIsSubmissionRequired] = useState(false);
    const [isEditSubmissionRequired, setIsEditSubmissionRequired] = useState(false);
    const [isEnableComment, setIsEnableComment] = useState(false);
    const [isEditEnableComment, setIsEditEnableComment] = useState(false);
    const [isFileTypeSelected, setIsFileTypeSelected] = useState(false);
    const [isViewListSubmissionModalOpen, setIsViewListSubmissionModalOpen] = useState(false);
    const [isViewSubmissionModalOpen, setIsViewSubmissionModalOpen] = useState(false);
    const [submissionIndex, setSubmissionIndex] = useState(0);
    const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(null);
    const [selectedModuleData, setSelectedModuleData] = useState(null);
    const [answerSubmitType, setAnswerSubmitType] = useState(null);
    const [answerCommentEnabled, setAnswerCommentEnabled] = useState(null);
    const [selectedModuleId, setSelectedModuleId] = useState(null);
    const [selectedSubmissions, setSelectedSubmissions] = useState([]);
    const [selectedStudentSubmission, setSelectedStudentSubmission] = useState([]);
    const [isViewLessonModalOpen, setIsViewLessonModalOpen] = useState(false);
    const [selectedLessonData, setSelectedLessonData] = useState(null);

    const { data, setData, reset } = useForm({
        module_name: '',
        module_desc: '',
        file: [],
        due_date: '',
        points: '',
        attempts: '',
        submit_type: '',
        module_title: '',
    });

    const [editModuleData, setEditModuleData] = useState({
        module_name: '',
        module_desc: '',
        module_file_desc: '',
        due_date: '',
        points: '',
        num_of_attempts: '',
        submit_type: '',
        file_type: '',
        is_comment_enabled: false,
        module_title: '',
    });

    const [modulesData, setModuleData] = useState([]);
    const [submissions, setSubmissionsData] = useState([]);
    const { auth } = usePage().props;
    const userType = auth?.user?.user_type;
    const section_id = auth?.user?.section_id;

    const formatDueDate = (dateString) => {
        if (!dateString) return 'No due date';

        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'long',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    useEffect(() => {
        axios
            .get('/get_all_modules')
            .then((response) => {
                const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');

                const formattedModules = response.data.map((module) => {
                    const files = module.file_name
                        .split(',')
                        .map((file, index) => ({
                            file_name: file.trim(),
                            file_path: module.file_path.split(',')[index]?.trim()
                                ? `${baseUrl}/modules/${module.file_path.split(',')[index].trim()}`
                                : '',
                        }))
                        .filter((file) => file.file_name && file.file_path);

                    return {
                        module_id: module.id,
                        module_name: module.module_name,
                        module_desc: module.module_desc,
                        module_file_desc: module.module_file_desc,
                        file: files.length > 0 ? files : [],
                        is_submission_required: module.is_submission_required,
                        module_title: module.module_title,
                        points: module.points,
                        score: module.score ? module.score : 0,
                        attempts: module.num_of_attempts,
                        submit_type: module.submit_type,
                        file_type: module.submit_type === 'text' ? '' : module.file_type,
                        enable_comments: module.is_comment_enabled,
                        due_date: module.due_date,
                        total_students: module.total_students ? module.total_students : 0,
                        students_submitted: module.students_submitted ? module.students_submitted : 0,
                    };
                });

                setModuleData(formattedModules);
            })
            .catch((error) => {
                console.error('There was an error fetching the modules:', error);
            });
    }, []);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
        setIsSubmissionRequired(false);
        setIsFileTypeSelected(false);
    };
    const toggleEditModal = () => {
        setIsEditModalOpen(!isEditModalOpen);
        setIsEditSubmissionRequired(false);
        setIsFileTypeSelected(false);
    };
    const handleChange = (e) => setData(e.target.name, e.target.value);

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditModuleData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        setIsModalOpen(false);

        const formData = new FormData();
        formData.append('section_id', section_id);
        formData.append('module_name', data.module_name);
        formData.append('module_desc', data.module_desc);
        formData.append('module_file_desc', data.module_file_desc);
        formData.append('module_title', data.module_title);
        formData.append('is_submission_required', isSubmissionRequired);
        formData.append('due_date', data.due_date);
        formData.append('points', data.points);
        formData.append('num_of_attempts', data.attempts);
        formData.append('submit_type', data.submit_type);
        formData.append('file_type', data.file_type);
        formData.append('is_comment_enabled', isEnableComment);

        files.forEach((file) => {
            formData.append('module_file[]', file);
        });

        axios
            .post(route('modules.store'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then((response) => {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Module submitted successfully!',
                    confirmButtonColor: '#d33',
                }).then(() => {
                    reset();
                    window.location.reload();
                });
            })
            .catch((error) => {
                if (error.response && error.response.data.errors) {
                    let errorMessages = Object.values(error.response.data.errors)
                        .map((err) => err.join('\n'))
                        .join('\n');

                    Swal.fire({
                        icon: 'error',
                        title: 'Submission Failed',
                        text: errorMessages,
                        confirmButtonColor: '#d33',
                    }).then(() => {
                        setIsModalOpen(true);
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Something went wrong. Please try again later.',
                        confirmButtonColor: '#d33',
                    }).then(() => {
                        setIsModalOpen(true);
                    });
                }

                console.error('There was an error submitting the form:', error);
            });
    };

    const handleEdit = (moduleId) => {
        axios
            .get(`/modules/${moduleId}`)
            .then((response) => {
                const moduleData = response.data.module;

                const files = [];

                setEditModuleData({
                    ...moduleData,
                    is_comment_enabled: Boolean(moduleData.is_comment_enabled),
                });
                setEditFiles(files);
                toggleEditModal();
                setIsEditSubmissionRequired(moduleData.is_submission_required);
                if (moduleData.submit_type !== 'text') {
                    setIsFileTypeSelected(true);
                }
            })
            .catch((error) => {
                console.error('There was an error fetching the module data:', error);
            });
    };

    const handleUpdate = (e) => {
        e.preventDefault();

        setIsEditModalOpen(false);
        const formData = new FormData();
        formData.append('section_id', section_id);
        formData.append('module_name', editModuleData.module_name);
        formData.append('module_desc', editModuleData.module_desc);
        formData.append('module_file_desc', editModuleData.module_file_desc);
        formData.append('is_submission_required', isEditSubmissionRequired);
        formData.append('module_title', editModuleData.module_title);
        formData.append('due_date', editModuleData.due_date);
        formData.append('points', editModuleData.points);
        formData.append('num_of_attempts', editModuleData.num_of_attempts);
        formData.append('submit_type', editModuleData.submit_type);
        formData.append('file_type', editModuleData.file_type);
        formData.append('is_comment_enabled', isEditEnableComment);

        editFiles.forEach((file) => {
            formData.append('module_file[]', file);
        });

        axios
            .post(route('modules.update', { id: editModuleData.id }), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then((response) => {
                Swal.fire({
                    icon: 'success',
                    title: 'Updated Successfully',
                    text: 'The module has been updated!',
                    confirmButtonColor: '#d33',
                }).then(() => {
                    reset();
                    window.location.reload();
                });
            })
            .catch((error) => {
                if (error.response && error.response.data.errors) {
                    let errorMessages = Object.values(error.response.data.errors)
                        .map((err) => err.join('\n'))
                        .join('\n');

                    Swal.fire({
                        icon: 'error',
                        title: 'Update Failed',
                        text: errorMessages,
                        confirmButtonColor: '#d33',
                    }).then(() => {
                        setIsEditModalOpen(true);
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Something went wrong. Please try again later.',
                        confirmButtonColor: '#d33',
                    }).then(() => {
                        setIsEditModalOpen(true);
                    });
                }

                console.error('There was an error updating the module:', error);
            });
    };

    const handleDownload = (fileName) => {
        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
        const fileUrl = `${baseUrl}/module_submissions/${fileName}`;
        const link = document.createElement('a');
        link.href = fileUrl;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const [isViewFileModalOpen, setIsViewFileModalOpen] = useState(false);

    const [fileUrl, setFileUrl] = useState(null);

    const handleViewFile = useCallback((fileName) => {
        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
        const updatedFileUrl = `${baseUrl}/module_submissions/${fileName}`;

        setFileUrl(updatedFileUrl);
        setIsViewFileModalOpen(true);
        console.log('fileUrl', updatedFileUrl);
    }, []);

    const handleDeleteModule = (module) => {
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
                    .delete(`/modules/${module}`)
                    .then((response) => {
                        Swal.fire('Removed!', 'The Module has been removed.', 'success').then(() => {
                            window.location.reload();
                        });
                    })
                    .catch((error) => {
                        Swal.fire('Error!', 'There was an issue deleting the module. Please try again.', 'error');
                        console.error('There was an error deleting the module:', error);
                    });
            }
        });
    };

    const [files, setFiles] = useState([]);
    const [editFiles, setEditFiles] = useState([]);

    const onDrop = useCallback(
        (acceptedFiles) => {
            setFiles(acceptedFiles);
            setData('file', [...data.file, ...acceptedFiles]);
        },
        [data.file],
    );

    const onEditDrop = useCallback(
        (acceptedFiles) => {
            setEditFiles(acceptedFiles);
            if (editModuleData) {
                setEditModuleData({
                    ...editModuleData,
                    file: [...editModuleData.file, ...acceptedFiles],
                });
            }
        },
        [editModuleData],
    );

    const { getRootProps, getInputProps } = useDropzone({ onDrop, multiple: true });
    const { getRootProps: getEditRootProps, getInputProps: getEditInputProps } = useDropzone({
        onDrop: onEditDrop,
        multiple: true,
    });

    const handleRemoveFile = (id, index) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove it!',
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .delete(`/modules/single/${id}/${index}`)
                    .then((response) => {
                        Swal.fire('Removed!', 'The Module has been removed.', 'success').then(() => {
                            window.location.reload();
                        });
                    })
                    .catch((error) => {
                        Swal.fire('Error!', 'There was an issue deleting the module. Please try again.', 'error');
                        console.error('There was an error deleting the module:', error);
                    });
            }
        });
    };

    const handleRemoveEditFile = (index) => {
        setEditFiles(editFiles.filter((_, i) => i !== index));
        if (editModuleData) {
            setEditModuleData({
                ...editModuleData,
                file: editModuleData.file.filter((_, i) => i !== index),
            });
        }
    };

    useEffect(() => {
        axios
            .get('/get_all_submissions')
            .then((response) => {
                setSubmissionsData(response.data);
            })
            .catch((error) => {
                console.error('There was an error fetching the submissions:', error);
            });
    }, []);

    const handleViewSubmissions = (moduleId) => {
        if (!submissions) return;
        const filteredSubmissions = submissions.filter((submission) => submission.module_id === moduleId);
        setSelectedSubmissions(filteredSubmissions);
        setIsViewListSubmissionModalOpen(true);
    };

    const handleViewSubmission = (submission, index) => {
        console.log('submission', submission);

        setIsViewSubmissionModalOpen(true);
        console.log('isViewSubmissionModalOpen', isViewSubmissionModalOpen);

        setSubmissionIndex(index);
        setSelectedStudentSubmission(submission);
        console.log('selectedStudentSubmission', selectedStudentSubmission);
    };

    const handleOpenAnswerModal = (module) => {
        setIsAnswerModalOpen(true);
        setSelectedModuleData(module);
        setSelectedModuleId(module.module_id);

        if (module.submit_type == 'text') {
            setAnswerSubmitType(true);
        } else {
            setAnswerSubmitType(false);
        }

        if (module.is_comment_enabled) {
            setAnswerCommentEnabled(true);
        } else {
            setAnswerCommentEnabled(false);
        }
    };

    const handleSubmitAnswer = async (e) => {
        e.preventDefault();

        setIsAnswerModalOpen(false);
        setIsViewLessonModalOpen(false);

        if (!answerSubmitType && files.length === 0) {
            Swal.fire('Error!', 'Please upload a file before submitting.', 'error').then(() => {
                setIsAnswerModalOpen(true);
            });
            return;
        }

        const formData = new FormData();
        formData.append('module_id', selectedModuleId);
        formData.append('text_answer', answerSubmitType ? e.target.text_answer.value : '');
        formData.append(
            'comments',
            answerCommentEnabled ? document.querySelector('[name="comments"]').value || '' : '',
        );
        formData.append('score', 0);
        formData.append('total_attempts', 1);

        if (!answerSubmitType && files.length > 0) {
            formData.append('module_file', files[0]);
        }

        Swal.fire({
            title: 'Submit Answer?',
            text: 'Are you sure you want to submit?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Submit',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch('/submit-answer', {
                    method: 'POST',
                    body: formData,
                })
                    .then(async (response) => {
                        const data = await response.json();

                        if (!response.ok) {
                            throw new Error(data.message || 'An error occurred.');
                        }

                        return data;
                    })
                    .then((data) => {
                        Swal.fire('Success!', data.message, 'success').then(() => {
                            location.reload();
                        });
                        setIsAnswerModalOpen(false);
                    })
                    .catch((error) => {
                        Swal.fire('Error!', error.message, 'error');
                    });
            } else {
                setIsViewLessonModalOpen(true);
                setIsAnswerModalOpen(true);
            }
        });
    };

    const handleScoreChange = (e) => {
        const newScore = e.target.value;
        setSelectedSubmissions((prevSubmissions) => {
            const updatedSubmissions = [...prevSubmissions];
            updatedSubmissions[submissionIndex] = {
                ...updatedSubmissions[submissionIndex],
                score: newScore,
            };
            return updatedSubmissions;
        });
    };

    const handleSubmitScore = async () => {
        if (!selectedSubmissions[submissionIndex].score) {
            toast.error('Please enter a valid score.');
            return;
        }

        try {
            const response = await fetch('/save-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    student_id: selectedStudentSubmission.student_id,
                    module_id: selectedStudentSubmission.module_id,
                    score: selectedSubmissions[submissionIndex].score,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to save score.');
            }

            // Update moduleData with the new score
            setModuleData((prevData) =>
                prevData.map((module) =>
                    module.id === selectedStudentSubmission.module_id
                        ? { ...module, score: selectedSubmissions[submissionIndex].score }
                        : module,
                ),
            );

            toast.success('Score saved successfully!');
        } catch (error) {
            console.error('Error saving score:', error);
            toast.error(error.message || 'An error occurred while saving the score.');
        }
    };

    const handleViewLesson = (module_id) => {
        setIsViewLessonModalOpen(true);
        setSelectedLessonData(module_id);
    };
    console.log('modulesData[selectedLessonData]', modulesData[selectedLessonData]);
    console.log('modulesData', modulesData);
    console.log('[selectedLessonData]', selectedLessonData);

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Module</h2>}>
            <Head title="Modules" />
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick />
            <div className="sm:py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="sm:p-4 py-5 space-y-4">
                        {userType === 'Teacher' ? (
                            <div className="bg-blue-50 border-4 flex flex-col sm:flex-row justify-between border-blue-300 p-5 rounded-3xl">
                                <div className="text-2xl font-semibold text-primary">Add New Module</div>
                                <button
                                    onClick={toggleModal}
                                    className="bg-primary font-semibold text-white px-4 py-2 rounded-3xl transition duration-300 ease-in-out hover:scale-110 mt-4 sm:mt-0"
                                >
                                    Add Module
                                </button>
                            </div>
                        ) : (
                            <div className="bg-blue-50 border-4 flex  flex-col sm:flex-row justify-between border-blue-300 p-5 rounded-3xl">
                                <div className="text-2xl font-semibold text-primary">Module List</div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                            {modulesData.map((module, index) => (
                                <Accordion
                                    key={index}
                                    type="single"
                                    className="bg-gray-200 rounded-2xl px-2 md:px-4 text-primary"
                                    collapsible
                                    open
                                    defaultValue="item-1"
                                >
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger>
                                            <div className="flex flex-wrap justify-between items-center w-full gap-4">
                                                <div>
                                                    <h1 className="font-medium text-base md:text-3xl no-underline text-primary ps-2 mb-1">
                                                        {' '}
                                                        {module.module_name}
                                                    </h1>
                                                </div>
                                                {module?.is_submission_required === 1 && (
                                                    <div className="px-4">
                                                        <p
                                                            className={`border text-gray-700 p-1 px-2 rounded-lg font-medium text-xs ${
                                                                new Date(module.due_date) - new Date() <
                                                                1000 * 60 * 60 * 24
                                                                    ? 'bg-red-200 text-red-700'
                                                                    : new Date(module.due_date) > new Date()
                                                                      ? 'bg-green-200 text-green-800'
                                                                      : 'bg-gray-300 text-gray-500'
                                                            }`}
                                                        >
                                                            Due: {formatDueDate(module.due_date)}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="py-2">
                                                <p className="text-primary text-base  px-3">{module.module_desc}</p>
                                            </div>
                                            {userType === 'Teacher' && (
                                                <>
                                                    {module?.is_submission_required === 1 ? (
                                                        <>
                                                            <div className="flex justify-between flex-wrap gap-2 mb-2 w-full px-3 text-white font-semibold">
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleEdit(module.module_id)}
                                                                        className="cursor-pointer bg-primary p-1 px-4 rounded-lg flex items-center"
                                                                    >
                                                                        <FaEdit className="text-sm mr-1" />
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleDeleteModule(module.module_id)
                                                                        }
                                                                        className="cursor-pointer bg-danger p-1 px-4 rounded-lg flex items-center"
                                                                    >
                                                                        <FaTrashAlt className="text-sm mr-1" />
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <hr className="my-4" />
                                                        </>
                                                    ) : (
                                                        <div className="flex justify-end flex-wrap gap-2 mb-2 w-full px-3 text-white font-semibold">
                                                            <button
                                                                onClick={() => handleEdit(module.module_id)}
                                                                className="cursor-pointer bg-primary p-1 px-4 rounded-lg flex items-center"
                                                            >
                                                                <FaEdit className="text-sm mr-1" />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteModule(module.module_id)}
                                                                className="cursor-pointer bg-danger p-1 px-4 rounded-lg flex items-center"
                                                            >
                                                                <FaTrashAlt className="text-sm mr-1" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            {module?.is_submission_required === 1 ? (
                                                <div className="bg-white text-primary rounded-xl px-4 py-5">
                                                    <div
                                                        onClick={() => handleViewLesson(index)}
                                                        className=" px-3 py-2 text-lg font-medium text-gray-600 cursor-pointer hover:bg-gray-200  focus:border-red-400 flex justify-between items-center border-b"
                                                    >
                                                        {module.module_title}
                                                        <FaArrowRight className="text-gray-600 ml-2" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-white text-primary rounded-xl ">
                                                    <div className="my-5 pt-2 pb-5 bg-white px-5 rounded-lg">
                                                        {module.module_file_desc && (
                                                            <h3 className="font-medium my-4 bg-yellow-100 p-2 rounded-lg text-yellow-600">
                                                                {module.module_file_desc}
                                                            </h3>
                                                        )}

                                                        {module.file &&
                                                            module.file.map((file, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex justify-between text-info flex-1 items-center border-b-2 md:flex-row flex-col sm:gap-2 gap-4"
                                                                >
                                                                    <div
                                                                        className="p-5 flex gap-2 items-center cursor-pointer"
                                                                        onClick={() => {
                                                                            window.open(file.file_path, '_blank');
                                                                        }}
                                                                    >
                                                                        <FaFile /> {file.file_name}
                                                                    </div>
                                                                    <div className="flex gap-2 my-4">
                                                                        <div
                                                                            onClick={() => {
                                                                                const link =
                                                                                    document.createElement('a');
                                                                                link.href = file.file_path;
                                                                                link.download = file.file_name;
                                                                                link.click();
                                                                            }}
                                                                            className="cursor-pointer bg-primary p-1 px-4 rounded-lg text-white font-semibold"
                                                                        >
                                                                            <FaCloudDownloadAlt />
                                                                        </div>
                                                                        {userType === 'Teacher' && (
                                                                            <div
                                                                                onClick={() => {
                                                                                    handleRemoveFile(
                                                                                        module.module_id,
                                                                                        index,
                                                                                    );
                                                                                }}
                                                                                className="cursor-pointer bg-danger p-1 px-4 rounded-lg text-white font-semibold"
                                                                            >
                                                                                <FaTrashAlt />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={isViewFileModalOpen} onOpenChange={setIsViewFileModalOpen}>
                <DialogContent className="max-h-[95vh] h-[95vh] max-w-[95vw] rounded-3xl">
                    <DialogTitle>Viewer</DialogTitle>
                    {fileUrl && (
                        <div className="w-full h-[85vh]  flex justify-center items-center">
                            <iframe
                                src={fileUrl}
                                title="File Viewer"
                                className="w-full h-full  rounded-2xl border-none"
                            ></iframe>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* View Modal Module Lesson */}
            {isViewLessonModalOpen && (
                <Dialog open={isViewLessonModalOpen} onOpenChange={setIsViewLessonModalOpen}>
                    <DialogContent
                        className="overflow-y-auto max-h-[95vh] h-[95vh] max-w-[95vw] rounded-3xl"
                        onInteractOutside={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <DialogHeader>
                            <DialogTitle>View Module</DialogTitle>
                        </DialogHeader>
                        <div className="bg-white border rounded-3xl p-5 text-black">
                            {userType === 'Teacher' && (
                                <>
                                    {modulesData[selectedLessonData]?.is_submission_required === 1 && (
                                        <>
                                            <div className="flex justify-between items-center flex-wrap gap-2 mb-2 w-full text-white font-semibold">
                                                <h1 className="text-2xl text-gray-700">
                                                    {modulesData[selectedLessonData].module_title}
                                                </h1>
                                                <div className="flex gap-2 items-center">
                                                    <div className="text-center pe-0 md:pe-4">
                                                        <p className="text-gray-600">Submitted</p>
                                                        <h3 className="font-semibold text-xl text-warning">
                                                            {modulesData[selectedLessonData].students_submitted
                                                                ? modulesData[selectedLessonData].students_submitted
                                                                : 0}{' '}
                                                            / {modulesData[selectedLessonData].total_students}
                                                        </h3>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handleViewSubmissions(
                                                                modulesData[selectedLessonData].module_id,
                                                            )
                                                        }
                                                        className="cursor-pointer bg-success p-1 px-4 rounded-lg flex items-center"
                                                    >
                                                        <FaEye className="text-sm mr-1" />
                                                        View Submissions
                                                    </button>
                                                </div>
                                            </div>
                                            <hr className="my-4" />
                                        </>
                                    )}
                                </>
                            )}
                            {userType === 'Student' && (
                                <>
                                    {modulesData[selectedLessonData]?.is_submission_required === 1 ? (
                                        <>
                                            <div className="flex justify-between items-center flex-wrap gap-2 mb-2 w-full text-white font-semibold">
                                                <div className="text-center pe-4">
                                                    <p className="text-gray-600">Score</p>
                                                    <h3 className="font-semibold text-xl text-warning">
                                                        {modulesData[selectedLessonData].score
                                                            ? modulesData[selectedLessonData].score
                                                            : 0}{' '}
                                                        / {modulesData[selectedLessonData].points}
                                                    </h3>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        handleOpenAnswerModal(modulesData[selectedLessonData])
                                                    }
                                                    className="cursor-pointer bg-success p-1 px-4 rounded-lg flex items-center"
                                                >
                                                    <FaEye className="text-sm mr-1" />
                                                    Answer
                                                </button>
                                            </div>
                                            <hr className="my-4" />
                                        </>
                                    ) : (
                                        <></>
                                    )}
                                </>
                            )}

                            {modulesData[selectedLessonData]?.is_submission_required === 1 && (
                                <>
                                    <p className="text-gray-500 text-sm my-2 mb-4">Details:</p>
                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                                        <div className="flex gap-2 items-center">
                                            <FaFileAlt className="text-base text-gray-600" />
                                            <div>
                                                <h3 className="font-semibold text-sm">Points: </h3>
                                                <span className="font-normal text-sm">
                                                    {modulesData[selectedLessonData].points}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <FaUpload className="text-base text-gray-600" />
                                            <div>
                                                <h3 className="font-semibold text-sm">Submitting: </h3>
                                                <span className="font-normal text-sm">
                                                    {modulesData[selectedLessonData].submit_type === 'text'
                                                        ? 'User Input'
                                                        : 'File Upload'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <FaFile className="text-base text-gray-600" />
                                            <div>
                                                <h3 className="font-semibold text-sm">File Type: </h3>
                                                <span className="font-normal text-sm">
                                                    {modulesData[selectedLessonData].file_type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <FaRedo className="text-base text-gray-600" />
                                            <div>
                                                <h3 className="font-semibold text-sm">Attempts: </h3>
                                                <span className="font-normal text-sm">
                                                    {modulesData[selectedLessonData].attempts}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <FaCalendarAlt className="text-base text-gray-600" />
                                            <div>
                                                <h3 className="font-semibold text-sm">Available Until: </h3>
                                                <span className="font-normal text-sm">
                                                    {formatDueDate(modulesData[selectedLessonData].due_date)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                            <hr className="my-4" />
                            <div className="py-2">
                                <p className="text-gray-500 text-sm my-4">Desciption:</p>
                                <p className="text-gray-700 text-base my-4 px-3">
                                    {modulesData[selectedLessonData].module_desc}
                                </p>
                            </div>

                            <hr className="my-4" />
                            <p className="text-gray-500 text-sm my-4">Files:</p>
                            {modulesData[selectedLessonData].module_file_desc && (
                                <h3 className="font-medium my-4  bg-yellow-50 p-3 rounded-lg text-yellow-700">
                                    {modulesData[selectedLessonData].module_file_desc}
                                </h3>
                            )}

                            {modulesData[selectedLessonData].file.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center border-b py-3 md:flex-row flex-col sm:gap-2 gap-4"
                                >
                                    <div
                                        className="flex gap-2 items-center cursor-pointer text-blue-600 hover:text-blue-800"
                                        onClick={() => {
                                            window.open(file.file_path, '_blank');
                                        }}
                                    >
                                        <FaFile /> {file.file_name}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = file.file_path;
                                                link.download = file.file_name;
                                                link.click();
                                            }}
                                            className="cursor-pointer bg-blue-500 hover:bg-blue-600 p-2 rounded-lg text-white font-semibold transition duration-300"
                                        >
                                            <FaCloudDownloadAlt />
                                        </button>
                                        {userType === 'Teacher' && (
                                            <button
                                                onClick={() => {
                                                    handleRemoveFile(modulesData[selectedLessonData].module_id, index);
                                                }}
                                                className="cursor-pointer bg-red-500 hover:bg-red-600 p-2 rounded-lg text-white font-semibold transition duration-300"
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
            {/* Student: Answer Module Modal */}
            {isAnswerModalOpen && (
                <Dialog open={isAnswerModalOpen} onOpenChange={setIsAnswerModalOpen}>
                    <DialogContent
                        className="overflow-y-auto max-h-[80vh] max-w-4xl"
                        onInteractOutside={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <DialogHeader>
                            <DialogTitle>Answer Module</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmitAnswer}>
                            {/* {selectedModuleData && selectedModuleData.submit_type === 'text' && ( */}{' '}
                            {/* Add this condition pag may submit type na db */}
                            {answerSubmitType && (
                                <div className="mt-4">
                                    <InputLabel htmlFor="text_answer" value="Answer" />
                                    <Textarea
                                        label="Text Answer"
                                        type="text"
                                        name="text_answer"
                                        className="border w-full p-2 mb-2 rounded-2xl h-14 min-h-[120px] bg-gray-50 border-gray-300 shadow-sm focus:border-warning focus:ring-warning"
                                        required
                                    />
                                </div>
                            )}
                            {/* )} */}
                            {/* {selectedModuleData && selectedModuleData.submit_type === 'file' && ( */}{' '}
                            {/* Add this condition pag may submit type na db  */}
                            {!answerSubmitType && (
                                <div className="mt-4">
                                    <InputLabel htmlFor="module_file" value="Upload File" />
                                    <div
                                        {...getRootProps()}
                                        className="border-2 border-dashed p-4 text-center cursor-pointer rounded-lg mb-4"
                                    >
                                        <input
                                            {...getInputProps({
                                                multiple: false,
                                                onChange: (event) => {
                                                    const selectedFile = event.target.files[0];
                                                    if (selectedFile) {
                                                        setFiles([selectedFile]);
                                                    }
                                                },
                                            })}
                                        />
                                        <p>Drag & drop a file here, or click to select one</p>
                                    </div>

                                    {files.length > 0 && (
                                        <ul className="mb-9">
                                            <li className="text-sm text-gray-700">
                                                {files[0].name} ({(files[0].size / 1024).toFixed(2)} KB)
                                                <button
                                                    onClick={() => setFiles([])}
                                                    className="text-red-500 hover:text-red-700 p-1 px-4 rounded-lg"
                                                >
                                                    X
                                                </button>
                                            </li>
                                        </ul>
                                    )}
                                </div>
                            )}
                            {/* )} */}
                            {!answerSubmitType && answerCommentEnabled && (
                                <div className="mt-4">
                                    <InputLabel htmlFor="comments" value="Comments" />
                                    <Textarea
                                        label="Comments"
                                        type="text"
                                        name="comments"
                                        className="border w-full p-2 mb-2 rounded-2xl h-14 min-h-[120px] bg-gray-50 border-gray-300 shadow-sm focus:border-warning focus:ring-warning"
                                    />
                                </div>
                            )}
                            <div className="mt-4 flex justify-end">
                                <DangerButton onClick={() => setIsAnswerModalOpen(false)} className="mr-2">
                                    Cancel
                                </DangerButton>

                                <PrimaryButton type="submit">Submit</PrimaryButton>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

            {/* View List Submission Modal */}
            {isViewListSubmissionModalOpen && (
                <Dialog open={isViewListSubmissionModalOpen} onOpenChange={setIsViewListSubmissionModalOpen}>
                    <DialogContent
                        className="overflow-y-auto max-h-[80vh] max-w-4xl"
                        onInteractOutside={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <DialogHeader>
                            <DialogTitle>Submissions</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">
                                            Submission
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date Submitted
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Score
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {selectedSubmissions.length > 0 ? (
                                        selectedSubmissions.map((submission, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            !submission.date_submitted && !submission.score
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : 'bg-green-100 text-green-600'
                                                        }`}
                                                    >
                                                        {!submission.date_submitted && !submission.score
                                                            ? 'No Submission'
                                                            : 'Submitted'}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {submission.name}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {submission.date_submitted || ' - '}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {submission.date_submitted === null ? (
                                                        ' - '
                                                    ) : submission.score === null ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                            Not checked yet
                                                        </span>
                                                    ) : (
                                                        `${submission.score}`
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                                                    <button
                                                        className="bg-blue-500 hover:bg-blue-600 p-2 rounded-lg text-white font-semibold transition duration-300"
                                                        onClick={() => {
                                                            handleViewSubmission(submission, index);
                                                        }}
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4 text-gray-500">
                                                No submissions found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* View Student Submission Modal */}
            {isViewSubmissionModalOpen && (
                <Dialog
                    open={isViewSubmissionModalOpen}
                    onOpenChange={setIsViewSubmissionModalOpen}
                    className="fixed inset-0 overflow-y-auto"
                >
                    <DialogContent
                        className="overflow-y-auto max-h-[80vh] h-[80vh] max-w-7xl p-0"
                        onInteractOutside={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <div className="bg-white rounded-3xl">
                            <div className="p-6">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl text-primary font-semibold mb-5">
                                        View Submission
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="mb-4 flex flex-row justify-between">
                                    <button
                                        className={`bg-${submissionIndex > 0 ? 'green-500' : 'gray-400'} hover:bg-${submissionIndex > 0 ? 'green-600' : 'gray-600'} py-2 px-5 rounded-lg text-white font-semibold transition duration-300`}
                                        onClick={() => {
                                            if (submissionIndex > 0) {
                                                setSubmissionIndex(submissionIndex - 1);
                                            }
                                        }}
                                        disabled={submissionIndex === 0}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        className={`bg-${submissionIndex < selectedSubmissions.length - 1 ? 'blue-500' : 'gray-400'} hover:bg-${submissionIndex < selectedSubmissions.length - 1 ? 'blue-600' : 'gray-600'} py-2 px-5 rounded-lg text-white font-semibold transition duration-300`}
                                        onClick={() => {
                                            if (submissionIndex < selectedSubmissions.length - 1) {
                                                setSubmissionIndex(submissionIndex + 1);
                                            }
                                        }}
                                        disabled={submissionIndex >= selectedSubmissions.length - 1}
                                    >
                                        Next
                                    </button>
                                </div>
                                <hr className="my-5" />
                                <div>
                                    <div className="grid grid-cols- md:grid-cols-2 gap-5 items-center">
                                        <div className="flex items-center gap-5">
                                            <Avatar
                                                name={selectedSubmissions[submissionIndex].name}
                                                image={selectedSubmissions[submissionIndex].image}
                                            />
                                            <p className="font-semibold text-xl text-gray-600">
                                                {selectedSubmissions[submissionIndex].name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-5">
                                        <div className="bg-gray-200 rounded-2xl col-span-1 md:col-span-2 p-5">
                                            {selectedSubmissions[submissionIndex].text_answer && (
                                                <div>
                                                    <p className="font-medium text-gray-600">Answer:</p>
                                                    <p className="mt-2 mb-5 text-gray-600">
                                                        {selectedSubmissions[submissionIndex].text_answer}
                                                    </p>
                                                </div>
                                            )}
                                            {selectedSubmissions[submissionIndex].uploadFile && (
                                                <div>
                                                    <p className="font-medium text-gray-600 mb-4">Submitted File:</p>
                                                    <div className="flex items-center justify-between gap-2 w-full">
                                                        <p>{selectedSubmissions[submissionIndex].uploadFile}</p>
                                                        <div className="flex  md:flex-row gap-2 items-center">
                                                            <button
                                                                className="cursor-pointer w-max bg-green-500 hover:bg-green-600 px-3 py-1 rounded-lg text-white font-semibold transition duration-300 flex gap-2 items-center"
                                                                onClick={() =>
                                                                    handleViewFile(
                                                                        selectedSubmissions[submissionIndex].uploadFile,
                                                                    )
                                                                }
                                                            >
                                                                <FaEye />
                                                                <span className="hidden md:inline">View</span>
                                                            </button>
                                                            <button
                                                                className="cursor-pointer bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-lg text-white font-semibold transition duration-300 flex gap-2 items-center"
                                                                onClick={() =>
                                                                    handleDownload(
                                                                        selectedSubmissions[submissionIndex].uploadFile,
                                                                    )
                                                                }
                                                            >
                                                                <FaCloudDownloadAlt />
                                                                <span className="hidden md:inline">Download</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="bg-gray-200 rounded-2xl p-5 col-span-1">
                                            <p className="font-medium text-gray-600">Comments:</p>
                                            <p className="mt-2 text-gray-600">
                                                {selectedSubmissions[submissionIndex].comments}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-white h-max">
                            <div className="h-full flex justify-end space-x-4 p-6">
                                <div className="flex items-center gap-4 text-center">
                                    <p className="font-medium">Score:</p>
                                    <TextInput
                                        type="number"
                                        name="score"
                                        value={selectedSubmissions[submissionIndex]?.score || 0}
                                        className="border border-blue-600 border-2 w-full p-2 text-center"
                                        onChange={handleScoreChange}
                                    />
                                </div>
                                <PrimaryButton
                                    type="button"
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                    onClick={handleSubmitScore}
                                >
                                    Save Score
                                </PrimaryButton>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Add Modal */}
            <Dialog open={isModalOpen} onOpenChange={toggleModal} className="fixed inset-0 overflow-y-auto">
                <DialogContent className="overflow-y-auto max-h-[80vh] max-w-lg p-0">
                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl ">
                        <div className="p-6 ">
                            <DialogHeader>
                                <DialogTitle className="text-2xl text-primary font-semibold mb-5">
                                    Add New Module
                                </DialogTitle>
                            </DialogHeader>

                            <InputLabel htmlFor="module_name" value="Module Title" />
                            <TextInput
                                type="text"
                                name="module_name"
                                value={data.module_name}
                                onChange={handleChange}
                                className="border w-full p-2 mb-2"
                            />
                            <InputLabel htmlFor="module_desc" value="Description" />
                            <Textarea
                                type="text"
                                name="module_desc"
                                value={data.module_desc}
                                onChange={handleChange}
                                className="border w-full p-2 mb-2 rounded-2xl h-14 min-h-[120px] bg-gray-50 border-gray-300 shadow-sm focus:border-warning focus:ring-warning"
                            />
                            <InputLabel htmlFor="module_file_desc" value="File Description" />
                            <Textarea
                                type="text"
                                name="module_file_desc"
                                value={data.module_file_desc}
                                onChange={handleChange}
                                className="border w-full p-2 mb-2 rounded-2xl h-14 min-h-[120px] bg-gray-50 border-gray-300 shadow-sm focus:border-warning focus:ring-warning"
                            />

                            <InputLabel htmlFor="module_file" value="Module File" />
                            <div
                                {...getRootProps()}
                                className="border-2 border-dashed p-4 text-center cursor-pointer rounded-lg mb-4"
                            >
                                <input {...getInputProps()} />
                                <p>Drag & drop a file here, or click to select one</p>
                            </div>

                            {files.length > 0 && (
                                <ul className="mb-9">
                                    {files.map((file, index) => (
                                        <li key={index} className="text-sm text-gray-700">
                                            {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                            <button
                                                onClick={() => handleRemoveFile(index)}
                                                className="text-red-500 hover:text-red-700 p-1 px-4 rounded-lg"
                                            >
                                                X
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="rounded-2xl my-7 bg-blue-50 border border-blue-100 p-5">
                                <div className="">
                                    <Checkbox
                                        id="is_submission_required"
                                        checked={data.is_submission_required}
                                        onChange={(e) => {
                                            handleChange(e);
                                            setIsSubmissionRequired(e.target.checked);
                                        }}
                                    />
                                    <label htmlFor="is_submission_required" className="ml-2 text-gray-700">
                                        Does this module require a submission?
                                    </label>
                                </div>

                                {isSubmissionRequired && (
                                    <div className="mt-7">
                                        <InputLabel htmlFor="module_title" value="Module Title" />
                                        <TextInput
                                            type="text"
                                            name="module_title"
                                            value={data.module_title}
                                            onChange={handleChange}
                                            className="border w-full p-2 mb-2"
                                            required
                                        />

                                        <InputLabel htmlFor="due_date" value="Due Date" />
                                        <TextInput
                                            type="datetime-local"
                                            name="due_date"
                                            value={data.due_date}
                                            onChange={handleChange}
                                            className="border w-full p-2 mb-2"
                                            required
                                        />

                                        <InputLabel htmlFor="points" value="Points" />
                                        <TextInput
                                            type="number"
                                            name="points"
                                            value={data.points}
                                            onChange={handleChange}
                                            className="border w-full p-2 mb-2"
                                            required
                                        />

                                        <InputLabel htmlFor="attempts" value="Number of Attempts" />
                                        <TextInput
                                            type="number"
                                            name="attempts"
                                            value={data.attempts}
                                            onChange={handleChange}
                                            className="border w-full p-2 mb-2"
                                            required
                                        />

                                        <InputLabel htmlFor="submit_type" value="Submit Type" />
                                        <SelectInput
                                            name="submit_type"
                                            value={data.submit_type}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setIsFileTypeSelected(e.target.value === 'file');
                                            }}
                                            className="border w-full p-2 mb-2"
                                            required
                                        >
                                            <option value="">Select Submit Type</option>
                                            <option value="text">Text Input</option>
                                            <option value="file">File Upload</option>
                                        </SelectInput>
                                        {isFileTypeSelected && (
                                            <>
                                                <InputLabel htmlFor="file_type" value="File Type" />
                                                <SelectInput
                                                    name="file_type"
                                                    value={data.file_type}
                                                    onChange={handleChange}
                                                    className="border w-full p-2 mb-2"
                                                >
                                                    <option value="">Select File Type</option>
                                                    <option value="png/jpeg/jpg">Image</option>
                                                    <option value="video">Video</option>
                                                    <option value="pdf">PDF</option>
                                                    <option value="doc/docx">Word Document</option>
                                                    <option value="txt">Text File</option>
                                                    <option value="xls/xlsx">Excel File</option>
                                                    <option value="ppt/pptx">Powerpoint File</option>
                                                    <option value="any">Any File</option>
                                                </SelectInput>
                                            </>
                                        )}

                                        <div className="my-6 mx-2">
                                            <Checkbox
                                                id="enable_comments"
                                                checked={data.enable_comments}
                                                onChange={(e) => {
                                                    handleChange(e);
                                                    setIsEnableComment(e.target.checked);
                                                }}
                                            />
                                            <label htmlFor="enable_comments" className="ml-2 text-gray-700">
                                                Enable comments for this module?
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className=" sticky bottom-0 bg-white h-max">
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

            {/* Edit Modal */}

            <Dialog open={isEditModalOpen} onOpenChange={toggleEditModal} className="fixed inset-0 overflow-y-auto">
                <DialogContent className="overflow-y-auto max-h-[80vh] max-w-lg p-0">
                    <form onSubmit={handleUpdate} className="bg-white rounded-3xl">
                        <div className="p-6">
                            <DialogHeader>
                                <DialogTitle className="text-2xl text-primary font-semibold mb-5">
                                    Edit Module
                                </DialogTitle>
                            </DialogHeader>

                            <InputLabel htmlFor="module_name" value="Module Title" />
                            <TextInput
                                type="text"
                                name="module_name"
                                value={editModuleData ? editModuleData.module_name : ''}
                                onChange={handleEditChange}
                                className="border w-full p-2 mb-2"
                            />
                            <InputLabel htmlFor="module_desc" value="Description" />
                            <Textarea
                                type="text"
                                name="module_desc"
                                value={editModuleData ? editModuleData.module_desc : ''}
                                onChange={handleEditChange}
                                className="border w-full p-2 mb-2 rounded-2xl h-14 min-h-[120px] bg-gray-50 border-gray-300 shadow-sm focus:border-warning focus:ring-warning"
                            />
                            <InputLabel htmlFor="module_file_desc" value="File Description" />
                            <Textarea
                                type="text"
                                name="module_file_desc"
                                value={editModuleData ? editModuleData.module_file_desc : ''}
                                onChange={handleEditChange}
                                className="border w-full p-2 mb-2 rounded-2xl h-14 min-h-[120px] bg-gray-50 border-gray-300 shadow-sm focus:border-warning focus:ring-warning"
                            />
                            <InputLabel htmlFor="module_file" value="Module File" />
                            <div
                                {...getEditRootProps()}
                                className="border-2 border-dashed p-4 text-center cursor-pointer rounded-lg mb-4"
                            >
                                <input {...getEditInputProps()} />
                                <p>Drag & drop a file here, or click to select one</p>
                            </div>

                            {editFiles.length > 0 && (
                                <ul className="mb-9">
                                    {editFiles.map((file, index) => (
                                        <li key={index} className="text-sm text-gray-700">
                                            {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                            <button
                                                onClick={() => handleRemoveEditFile(index)}
                                                className="text-red-500 hover:text-red-700 p-1 px-4 rounded-lg"
                                            >
                                                X
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="rounded-2xl my-7 bg-blue-50 border border-blue-100 p-5">
                                <div className="">
                                    <Checkbox
                                        id="is_submission_required"
                                        checked={isEditSubmissionRequired === 1}
                                        onChange={(e) => {
                                            if (isEditSubmissionRequired === 1) {
                                                setIsEditSubmissionRequired(0);
                                            } else {
                                                setIsEditSubmissionRequired(1);
                                            }
                                            handleEditChange(e);
                                        }}
                                    />
                                    <label htmlFor="is_submission_required" className="ml-2 text-gray-700">
                                        Does this module require a submission?
                                    </label>
                                </div>

                                {isEditSubmissionRequired === 1 && (
                                    <div className="mt-7">
                                        <InputLabel htmlFor="module_title" value="Module Title" />
                                        <TextInput
                                            type="text"
                                            name="module_title"
                                            value={editModuleData ? editModuleData.module_title : ''}
                                            onChange={handleEditChange}
                                            className="border w-full p-2 mb-2"
                                            required
                                        />

                                        <InputLabel htmlFor="due_date" value="Due Date" />
                                        <TextInput
                                            type="datetime-local"
                                            name="due_date"
                                            value={editModuleData ? editModuleData.due_date : ''}
                                            onChange={handleEditChange}
                                            className="border w-full p-2 mb-2"
                                            required
                                        />

                                        <InputLabel htmlFor="points" value="Points" />
                                        <TextInput
                                            type="number"
                                            name="points"
                                            value={editModuleData ? editModuleData.points : ''}
                                            onChange={handleEditChange}
                                            className="border w-full p-2 mb-2"
                                            required
                                        />

                                        <InputLabel htmlFor="num_of_attempts" value="Number of Attempts" />
                                        <TextInput
                                            type="number"
                                            name="num_of_attempts"
                                            value={editModuleData ? editModuleData.num_of_attempts : ''}
                                            onChange={handleEditChange}
                                            className="border w-full p-2 mb-2"
                                            required
                                        />

                                        <InputLabel htmlFor="submit_type" value="Submit Type" />
                                        <SelectInput
                                            name="submit_type"
                                            value={editModuleData ? editModuleData.submit_type : ''}
                                            onChange={(e) => {
                                                handleEditChange(e);
                                                setIsFileTypeSelected(e.target.value === 'file');
                                            }}
                                            className="border w-full p-2 mb-2"
                                            required
                                        >
                                            <option value="">Select Submit Type</option>
                                            <option value="text">Text Input</option>
                                            <option value="file">File Upload</option>
                                        </SelectInput>
                                        {isFileTypeSelected && (
                                            <>
                                                <InputLabel htmlFor="file_type" value="File Type" />
                                                <SelectInput
                                                    name="file_type"
                                                    value={editModuleData ? editModuleData.file_type : []}
                                                    onChange={handleEditChange}
                                                    className="border w-full p-2 mb-2"
                                                >
                                                    <option value="">Select File Type</option>
                                                    <option value="png/jpeg/jpg">Image</option>
                                                    <option value="video">Video</option>
                                                    <option value="pdf">PDF</option>
                                                    <option value="doc/docx">Word Document</option>
                                                    <option value="txt">Text File</option>
                                                    <option value="xls/xlsx">Excel File</option>
                                                    <option value="ppt/pptx">Powerpoint File</option>
                                                    <option value="any">Any File</option>
                                                </SelectInput>
                                            </>
                                        )}

                                        <div className="my-6 mx-2">
                                            <Checkbox
                                                id="enable_comments"
                                                checked={!!editModuleData.is_comment_enabled}
                                                onChange={(e) => {
                                                    const newValue = e.target.checked;
                                                    setEditModuleData((prevData) => ({
                                                        ...prevData,
                                                        is_comment_enabled: newValue,
                                                    }));
                                                    setIsEditEnableComment(newValue);
                                                }}
                                            />
                                            <label htmlFor="enable_comments" className="ml-2 text-gray-700">
                                                Enable comments for this module?
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className=" sticky bottom-0 bg-white h-max ">
                            <div className="h-full flex justify-end space-x-4 p-6">
                                <DangerButton
                                    type="button"
                                    onClick={toggleEditModal}
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
        </AuthenticatedLayout>
    );
}
