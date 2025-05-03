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

export default function Modules({ }) {
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
    const [selectedActivityIndex, setSelectedActivityIndex] = useState(null);
    const [dataScore, setDataScore] = useState(0);

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

    const [submissionsData, setSubmissionsData] = useState([]);
    const [submissions, setSubmissions] = useState([
        {
            module_title: '',
            due_date: '',
            points: '',
            attempts: '',
            submit_type: '',
            file_type: '',
            enable_comments: false,
        },
    ]);
    const { auth } = usePage().props;
    const userType = auth?.user?.user_type;
    const section_id = auth?.user?.section_id;

    const addSubmission = () => {
        setSubmissions([
            ...submissions,
            {
                module_title: '',
                due_date: '',
                points: '',
                attempts: '',
                submit_type: '',
                file_type: '',
                enable_comments: false,
            },
        ]);
    };

    const removeSubmission = (index) => {
        const updatedSubmissions = submissions.filter((_, i) => i !== index);
        setSubmissions(updatedSubmissions);
    };

    const handleSubmissionChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const updatedSubmissions = [...submissions];
        updatedSubmissions[index][name] = type === 'checkbox' ? checked : value;
        setSubmissions(updatedSubmissions);
    };

    const [editSubmissions, setEditSubmissions] = useState([
        {
            module_title: '',
            due_date: '',
            points: '',
            attempts: '',
            submit_type: '',
            file_type: '',
            enable_comments: false,
        },
    ]);

    const editSubmission = () => {
        setEditSubmissions([
            ...editSubmissions,
            {
                module_title: '',
                due_date: '',
                points: '',
                attempts: '',
                submit_type: '',
                file_type: '',
                enable_comments: false,
            },
        ]);
    };

    const editRemoveSubmission = (index) => {
        const updatedSubmissions = editSubmissions.filter((_, i) => i !== index);
        setEditSubmissions(updatedSubmissions);
    };

    const handleEditSubmissionChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const updatedSubmissions = [...editSubmissions];
        updatedSubmissions[index][name] = type === 'checkbox' ? checked : value;
        setEditSubmissions(updatedSubmissions);
    };

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
                        submission_index: module.submission_index,
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
        formData.append('is_submission_required', isSubmissionRequired);

        {
            isSubmissionRequired &&
                submissions.length > 0 &&
                submissions.forEach((item, index) => {
                    formData.append(`modules[${index}][module_title]`, item.module_title);
                    formData.append(`modules[${index}][points]`, item.points);
                    formData.append(`modules[${index}][num_of_attempts]`, item.attempts);
                    formData.append(`modules[${index}][submit_type]`, item.submit_type);
                    formData.append(`modules[${index}][file_type]`, item.file_type);
                    formData.append(`modules[${index}][due_date]`, item.due_date);
                    formData.append(`modules[${index}][enable_comment]`, item.enable_comments ? 1 : 0);
                });
        }

        files.forEach((file) => {
            formData.append('module_file[]', file);
        });

        axios
            .post(route('modules.store'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            .then((response) => {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Modules submitted successfully!',
                    confirmButtonColor: '#d33',
                }).then(() => {
                    reset();
                    window.location.reload();
                });
            })
            .catch((error) => {
                let message = 'Something went wrong.';
                if (error.response?.data?.errors) {
                    message = Object.values(error.response.data.errors)
                        .map((err) => err.join('\n'))
                        .join('\n');
                }
                Swal.fire({
                    icon: 'error',
                    title: 'Submission Failed',
                    text: message,
                    confirmButtonColor: '#d33',
                }).then(() => {
                    setIsModalOpen(true);
                });
            });
    };

    const handleEdit = (moduleId) => {
        axios
            .get(`/modules/${moduleId}`)
            .then((response) => {
                const moduleData = response.data.module;

                const moduleTitles = moduleData.module_title.split(',');
                const points = moduleData.points.split(',');
                const attempts = moduleData.num_of_attempts.split(',');
                const fileNames = moduleData.file_name.split(',');
                const filePaths = moduleData.file_path.split(',');
                const fileTypes = moduleData.file_type.split(',');
                const submitTypes = moduleData.submit_type.split(',');
                const dueDates = moduleData.due_date.split(',');

                const fileObjects = fileNames.map((fileName, index) => ({
                    name: fileName,
                    size: 0,
                    filePath: filePaths[index],
                    fileType: fileTypes[index],
                }));

                setEditModuleData({
                    ...moduleData,
                    is_comment_enabled: Boolean(moduleData.is_comment_enabled),
                });

                setEditSubmissions(
                    moduleTitles.map((title, index) => ({
                        module_title: title,
                        points: points[index],
                        attempts: attempts[index],
                        file_name: fileNames[index],
                        file_path: filePaths[index],
                        file_type: fileTypes[index],
                        submit_type: submitTypes[index],
                        due_date: dueDates[index],
                        enable_comments: moduleData.is_comment_enabled === '1',
                    }))
                );

                setEditFiles([]);
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

        editSubmissions.forEach((item, index) => {
            formData.append(`modules[${index}][module_title]`, item.module_title);
            formData.append(`modules[${index}][points]`, item.points);
            formData.append(`modules[${index}][num_of_attempts]`, item.attempts);
            formData.append(`modules[${index}][submit_type]`, item.submit_type);
            formData.append(`modules[${index}][file_type]`, item.file_type);
            formData.append(`modules[${index}][due_date]`, item.due_date);
            formData.append(`modules[${index}][enable_comment]`, item.enable_comments ? 1 : 0);
        });

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
        [data.file]
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
        [editModuleData]
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
    const handleRemoveFileModal = (id, index) => {
        isViewLessonModalOpen && setIsViewLessonModalOpen(false);
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
            } else {
                setIsViewLessonModalOpen(true);
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

    const handleViewSubmissions = (moduleId, submissionIndex) => {
        console.log('moduleId', moduleId);

        if (!submissionsData) return;
        console.log('submissionIndex', submissionIndex);

        const filteredSubmissions = submissionsData.filter(
            (submission) => submission.module_id === moduleId && submission.submission_index == submissionIndex
        );
        console.log('submissionIndex', submissionIndex);

        setSelectedSubmissions(filteredSubmissions);
        console.log('filteredSubmissions', filteredSubmissions);
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

    const handleOpenAnswerModal = (module, submissionIndex) => {
        const index = parseInt(submissionIndex) - 1;

        const getAtIndex = (value) => value?.split(',')[index] || '';

        const selectedSubmissionData = {
            module_title: getAtIndex(module.module_title),
            points: getAtIndex(module.points),
            file_type: getAtIndex(module.file_type),
            attempts: getAtIndex(module.attempts),
            due_date: getAtIndex(module.due_date),
            submit_type: getAtIndex(module.submit_type),
            enable_comments: getAtIndex(module.enable_comments),
        };

        const enrichedModule = {
            ...module,
            ...selectedSubmissionData,
            submission_index: submissionIndex,
        };

        setIsAnswerModalOpen(true);
        setSelectedModuleData(enrichedModule);
        setSelectedModuleId(module.module_id);
        setAnswerSubmitType(selectedSubmissionData.submit_type === 'text');
        setAnswerCommentEnabled(selectedSubmissionData.enable_comments === '1');
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
        formData.append('submission_index', selectedModuleData.submission_index);
        formData.append('text_answer', answerSubmitType ? e.target.text_answer.value : '');
        formData.append(
            'comments',
            answerCommentEnabled ? document.querySelector('[name="comments"]').value || '' : ''
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
                    submission_index: selectedStudentSubmission.submission_index,
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
                        : module
                )
            );

            toast.success('Score saved successfully!');
        } catch (error) {
            console.error('Error saving score:', error);
            toast.error(error.message || 'An error occurred while saving the score.');
        }
    };

    const handleViewLesson = (index, activity_index, module_id, submissionIndex) => {
        setIsViewLessonModalOpen(true);
        setSelectedLessonData(index);
        setSelectedActivityIndex(activity_index);

        fetch(`/get-module-score?module_id=${module_id}&submission_index=${submissionIndex}`)
            .then((response) => response.json())
            .then((data) => {
                const score = data.score !== undefined ? data.score : 0;
                setDataScore(score);
            })
            .catch((error) => {
                console.error('Error fetching score:', error);
                setDataScore(0);
            });
    };

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
                            {modulesData.map((module, index) => {
                                const dueDates = module.due_date?.split(',') || [];
                                const titles = module.module_title?.split(',') || [];
                                const submitTypes = module.submit_type?.split(',') || [];
                                const points = module.points?.split(',') || [];
                                const attempts = module.attempts?.split(',') || [];

                                return (
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
                                                            {module.module_name}
                                                        </h1>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="py-3">
                                                    <p className="text-primary text-xl font-semibold px-4">
                                                        {module.module_desc}
                                                    </p>
                                                </div>

                                                {userType === 'Teacher' && (
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
                                                                onClick={() => handleDeleteModule(module.module_id)}
                                                                className="cursor-pointer bg-danger p-1 px-4 rounded-lg flex items-center"
                                                            >
                                                                <FaTrashAlt className="text-sm mr-1" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {module?.is_submission_required === 1 ? (
                                                    <div className="bg-white text-primary rounded-xl px-4 py-5">
                                                        {titles.map((title, idx) => (
                                                            <div
                                                                key={idx}
                                                                onClick={() => {
                                                                    const submissionIndex =
                                                                        module.submission_index?.split(',')[idx];
                                                                    handleViewLesson(
                                                                        index,
                                                                        idx,
                                                                        module.module_id,
                                                                        submissionIndex
                                                                    );
                                                                }}
                                                                className="grid sm:grid-cols-1 md:grid-cols-2 gap-2 px-3 py-2 text-lg font-medium text-gray-600 cursor-pointer hover:bg-gray-200 focus:border-red-400 flex justify-between items-center border-b"
                                                            >
                                                                {title}
                                                                <div className="flex items-center w-100 justify-end ml-2">
                                                                    {dueDates.length > 0 && (
                                                                        <div className="pe-4">
                                                                            <p
                                                                                className={`border text-gray-700 p-1 px-2 rounded-lg font-medium text-xs ${new Date(dueDates[idx]) -
                                                                                    new Date() <
                                                                                    1000 * 60 * 60 * 24
                                                                                    ? 'bg-red-200 text-red-700'
                                                                                    : new Date(dueDates[idx]) >
                                                                                        new Date()
                                                                                        ? 'bg-green-200 text-green-800'
                                                                                        : 'bg-gray-300 text-gray-500'
                                                                                    }`}
                                                                            >
                                                                                Due: {formatDueDate(dueDates[idx])}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                    <FaArrowRight className="text-gray-600" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="bg-white text-primary rounded-xl">
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
                                                                            onClick={() =>
                                                                                window.open(file.file_path, '_blank')
                                                                            }
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
                                                                                    onClick={() =>
                                                                                        handleRemoveFile(
                                                                                            module.module_id,
                                                                                            index
                                                                                        )
                                                                                    }
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
                                );
                            })}
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
                                                    {
                                                        modulesData[selectedLessonData].module_title.split(',')[
                                                        selectedActivityIndex
                                                        ]
                                                    }
                                                </h1>
                                                <div className="flex gap-2 items-center">
                                                    <div className="text-center pe-0 md:pe-4">
                                                        <p className="text-gray-600">Submitted</p>
                                                        <h3 className="font-semibold text-xl text-warning">
                                                            {modulesData[selectedLessonData].students_submitted
                                                                ? parseInt(
                                                                    modulesData[
                                                                        selectedLessonData
                                                                    ].students_submitted.split(',')[
                                                                    selectedActivityIndex
                                                                    ]
                                                                )
                                                                : 0}{' '}
                                                            /{' '}
                                                            {
                                                                modulesData[selectedLessonData].total_students.split(
                                                                    ','
                                                                )[selectedActivityIndex]
                                                            }
                                                        </h3>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handleViewSubmissions(
                                                                modulesData[selectedLessonData].module_id,
                                                                modulesData[selectedLessonData].submission_index.split(
                                                                    ','
                                                                )[selectedActivityIndex]
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
                                            <div className="flex justify-between items-center flex-wrap gap-4 mb-4 w-full text-white font-semibold">
                                                <div className="text-center pe-4">
                                                    <p className="text-gray-600 text-xl">Score</p>
                                                    <h3 className="font-semibold text-3xl text-warning">
                                                        {dataScore} /{' '}
                                                        {
                                                            modulesData[selectedLessonData].points.split(',')[
                                                            selectedActivityIndex
                                                            ]
                                                        }
                                                    </h3>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        handleOpenAnswerModal(
                                                            modulesData[selectedLessonData],
                                                            modulesData[selectedLessonData].submission_index.split(',')[
                                                            selectedActivityIndex
                                                            ]
                                                        )
                                                    }
                                                    className="cursor-pointer bg-success p-3 px-8 rounded-lg flex items-center text-xl"
                                                >
                                                    <FaEye className="text-lg mr-3" />
                                                    Answer
                                                </button>
                                            </div>
                                            <hr className="my-6" />
                                        </>
                                    ) : (
                                        <></>
                                    )}
                                </>
                            )}

                            {modulesData[selectedLessonData]?.is_submission_required === 1 && (
                                <>
                                    <p className="text-gray-500 text-xl my-3 mb-6">Details:</p>
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                                        <div className="flex gap-4 items-center">
                                            <FaFileAlt className="text-2xl text-gray-600" />
                                            <div>
                                                <h3 className="font-semibold text-lg">Points:</h3>
                                                <span className="font-normal text-lg">
                                                    {modulesData[selectedLessonData].points.split(',')[selectedActivityIndex]}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 items-center">
                                            <FaUpload className="text-2xl text-gray-600" />
                                            <div>
                                                <h3 className="font-semibold text-lg">Submitting:</h3>
                                                <span className="font-normal text-lg">
                                                    {modulesData[selectedLessonData].submit_type === 'text'
                                                        ? 'User Input'
                                                        : 'File Upload'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 items-center">
                                            <FaFile className="text-2xl text-gray-600" />
                                            <div>
                                                <h3 className="font-semibold text-lg">File Type:</h3>
                                                <span className="font-normal text-lg">
                                                    {modulesData[selectedLessonData].file_type.split(',')[selectedActivityIndex]}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 items-center">
                                            <FaRedo className="text-2xl text-gray-600" />
                                            <div>
                                                <h3 className="font-semibold text-lg">Attempts:</h3>
                                                <span className="font-normal text-lg">
                                                    {modulesData[selectedLessonData].attempts.split(',')[selectedActivityIndex]}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 items-center">
                                            <FaCalendarAlt className="text-2xl text-gray-600" />
                                            <div>
                                                <h3 className="font-semibold text-lg">Available Until:</h3>
                                                <span className="font-normal text-lg">
                                                    {formatDueDate(
                                                        modulesData[selectedLessonData].due_date.split(',')[selectedActivityIndex]
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <hr className="my-6" />
                            <div className="py-3">
                                <p className="text-gray-500 text-lg my-4">Description:</p>
                                <p className="text-gray-700 text-xl my-4 px-4">
                                    {modulesData[selectedLessonData].module_desc}
                                </p>
                            </div>

                            <hr className="my-6" />
                            <p className="text-gray-500 text-lg my-4">Files:</p>
                            {modulesData[selectedLessonData].module_file_desc && (
                                <h3 className="font-semibold my-4 bg-yellow-50 p-4 rounded-lg text-yellow-700 text-lg">
                                    {modulesData[selectedLessonData].module_file_desc}
                                </h3>
                            )}

                            {modulesData[selectedLessonData].file.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center border-b py-4 md:flex-row flex-col sm:gap-3 gap-4"
                                >
                                    <div
                                        className="flex gap-3 items-center cursor-pointer text-blue-600 hover:text-blue-800 text-lg"
                                        onClick={() => {
                                            window.open(file.file_path, '_blank');
                                        }}
                                    >
                                        <FaFile className="text-xl" /> {file.file_name}
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = file.file_path;
                                                link.download = file.file_name;
                                                link.click();
                                            }}
                                            className="cursor-pointer bg-blue-500 hover:bg-blue-600 p-3 rounded-lg text-white font-semibold transition duration-300 text-lg"
                                        >
                                            <FaCloudDownloadAlt className="text-xl" />
                                        </button>
                                        {userType === 'Teacher' && (
                                            <button
                                                onClick={() => {
                                                    handleRemoveFileModal(
                                                        modulesData[selectedLessonData].module_id,
                                                        index
                                                    );
                                                }}
                                                className="cursor-pointer bg-red-500 hover:bg-red-600 p-3 rounded-lg text-white font-semibold transition duration-300 text-lg"
                                            >
                                                <FaTrashAlt className="text-xl" />
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
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${!submission.date_submitted && !submission.score
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
                                                        <div className="flex md:flex-row gap-2 items-center">
                                                            {(() => {
                                                                const fileExtension = selectedSubmissions[
                                                                    submissionIndex
                                                                ].uploadFile
                                                                    .split('.')
                                                                    .pop()
                                                                    .toLowerCase();
                                                                if (
                                                                    fileExtension === 'png' ||
                                                                    fileExtension === 'jpg' ||
                                                                    fileExtension === 'pdf'
                                                                ) {
                                                                    return (
                                                                        <button
                                                                            className="cursor-pointer w-max bg-green-500 hover:bg-green-600 px-3 py-1 rounded-lg text-white font-semibold transition duration-300 flex gap-2 items-center"
                                                                            onClick={() =>
                                                                                handleViewFile(
                                                                                    selectedSubmissions[submissionIndex]
                                                                                        .uploadFile
                                                                                )
                                                                            }
                                                                        >
                                                                            <FaEye />
                                                                            <span className="hidden md:inline">
                                                                                View
                                                                            </span>
                                                                        </button>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}
                                                            <button
                                                                className="cursor-pointer bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-lg text-white font-semibold transition duration-300 flex gap-2 items-center"
                                                                onClick={() =>
                                                                    handleDownload(
                                                                        selectedSubmissions[submissionIndex].uploadFile
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
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-medium text-gray-700">Submissions</h3>
                                            <button
                                                type="button"
                                                onClick={addSubmission}
                                                className="text-blue-600 hover:underline"
                                            >
                                                + Add Submission
                                            </button>
                                        </div>

                                        {submissions.map((submission, index) => (
                                            <div key={index} className="border rounded-xl p-4 mb-6 bg-blue-50">
                                                <div className="flex justify-between">
                                                    <h4 className="font-semibold mb-2">Submission {index + 1}</h4>
                                                    {submissions.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSubmission(index)}
                                                            className="text-red-500"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                                <InputLabel htmlFor="module_title" value="Module Title" />
                                                <TextInput
                                                    type="text"
                                                    name="module_title"
                                                    value={submission.module_title}
                                                    onChange={(e) => handleSubmissionChange(index, e)}
                                                    className="border w-full p-2 mb-2"
                                                    required
                                                />
                                                <InputLabel htmlFor="due_date" value="Due Date" />
                                                <TextInput
                                                    type="datetime-local"
                                                    name="due_date"
                                                    value={submission.due_date}
                                                    onChange={(e) => handleSubmissionChange(index, e)}
                                                    className="border w-full p-2 mb-2"
                                                    required
                                                />
                                                <InputLabel htmlFor="points" value="Points" />
                                                <TextInput
                                                    type="number"
                                                    name="points"
                                                    value={submission.points}
                                                    onChange={(e) => handleSubmissionChange(index, e)}
                                                    className="border w-full p-2 mb-2"
                                                    required
                                                />
                                                <InputLabel htmlFor="attempts" value="Number of Attempts" />
                                                <TextInput
                                                    type="number"
                                                    name="attempts"
                                                    value={submission.attempts}
                                                    onChange={(e) => handleSubmissionChange(index, e)}
                                                    className="border w-full p-2 mb-2"
                                                    required
                                                />
                                                <InputLabel htmlFor="submit_type" value="Submit Type" />
                                                <SelectInput
                                                    name="submit_type"
                                                    value={submission.submit_type}
                                                    onChange={(e) => handleSubmissionChange(index, e)}
                                                    className="border w-full p-2 mb-2"
                                                    required
                                                >
                                                    <option value="">Select Submit Type</option>
                                                    <option value="text">Text Input</option>
                                                    <option value="file">File Upload</option>
                                                </SelectInput>

                                                {submission.submit_type === 'file' && (
                                                    <>
                                                        <InputLabel htmlFor="file_type" value="File Type" />
                                                        <SelectInput
                                                            name="file_type"
                                                            value={submission.file_type}
                                                            onChange={(e) => handleSubmissionChange(index, e)}
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

                                                <div className="my-3">
                                                    <Checkbox
                                                        id={`enable_comments_${index}`}
                                                        name="enable_comments"
                                                        checked={submission.enable_comments}
                                                        onChange={(e) => handleSubmissionChange(index, e)}
                                                    />
                                                    <label
                                                        htmlFor={`enable_comments_${index}`}
                                                        className="ml-2 text-gray-700"
                                                    >
                                                        Enable comments for this module?
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
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
                                            {file.name} ({(file.size / 1024).toFixed(2)} KB) {/* Size is in KB */}
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
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-medium text-gray-700">Submissions</h3>
                                            <button
                                                type="button"
                                                onClick={editSubmission}
                                                className="text-blue-600 hover:underline"
                                            >
                                                + Add Submission
                                            </button>
                                        </div>

                                        {editSubmissions.map((submission, index) => (
                                            <div key={index} className="border rounded-xl p-4 mb-6 bg-blue-50">
                                                <div className="flex justify-between">
                                                    <h4 className="font-semibold mb-2">Submission {index + 1}</h4>
                                                    {editSubmissions.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => editRemoveSubmission(index)}
                                                            className="text-red-500"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>

                                                <InputLabel htmlFor="module_title" value="Module Title" />
                                                <TextInput
                                                    type="text"
                                                    name="module_title"
                                                    value={submission.module_title}
                                                    onChange={(e) => handleEditSubmissionChange(index, e)}
                                                    className="border w-full p-2 mb-2"
                                                    required
                                                />

                                                <InputLabel htmlFor="due_date" value="Due Date" />
                                                <TextInput
                                                    type="datetime-local"
                                                    name="due_date"
                                                    value={submission.due_date}
                                                    onChange={(e) => handleEditSubmissionChange(index, e)}
                                                    className="border w-full p-2 mb-2"
                                                    required
                                                />

                                                <InputLabel htmlFor="points" value="Points" />
                                                <TextInput
                                                    type="number"
                                                    name="points"
                                                    value={submission.points}
                                                    onChange={(e) => handleEditSubmissionChange(index, e)}
                                                    className="border w-full p-2 mb-2"
                                                    required
                                                />

                                                <InputLabel htmlFor="attempts" value="Number of Attempts" />
                                                <TextInput
                                                    type="number"
                                                    name="attempts"
                                                    value={submission.attempts}
                                                    onChange={(e) => handleEditSubmissionChange(index, e)}
                                                    className="border w-full p-2 mb-2"
                                                    required
                                                />

                                                <InputLabel htmlFor="submit_type" value="Submit Type" />
                                                <SelectInput
                                                    name="submit_type"
                                                    value={submission.submit_type}
                                                    onChange={(e) => {
                                                        handleEditSubmissionChange(index, e);
                                                        setIsFileTypeSelected(e.target.value === 'file');
                                                    }}
                                                    className="border w-full p-2 mb-2"
                                                    required
                                                >
                                                    <option value="">Select Submit Type</option>
                                                    <option value="text">Text Input</option>
                                                    <option value="file">File Upload</option>
                                                </SelectInput>

                                                {submission.submit_type === 'file' && (
                                                    <>
                                                        <InputLabel htmlFor="file_type" value="File Type" />
                                                        <SelectInput
                                                            name="file_type"
                                                            value={submission.file_type}
                                                            onChange={(e) => handleEditSubmissionChange(index, e)}
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

                                                <div className="my-3">
                                                    <Checkbox
                                                        id={`enable_comments_${index}`}
                                                        name="enable_comments"
                                                        checked={submission.enable_comments}
                                                        onChange={(e) => handleEditSubmissionChange(index, e)}
                                                    />
                                                    <label
                                                        htmlFor={`enable_comments_${index}`}
                                                        className="ml-2 text-gray-700"
                                                    >
                                                        Enable comments for this module?
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
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
