import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Swal from 'sweetalert2';
import axios from 'axios';

import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import InputLabel from '@/Components/InputLabel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FaFile } from 'react-icons/fa6';
import { FaCloudDownloadAlt, FaTrashAlt } from 'react-icons/fa';
import { useEffect } from 'react';

export default function Modules({ }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const { data, setData, reset } = useForm({
        module_name: '',
        module_desc: '',
        file: [],
    });

    const [editModuleData, setEditModuleData] = useState({
        module_name: "",
        module_desc: "",
        module_file_desc: "",
    });

    const [modulesData, setModuleData] = useState([]);
    const { auth } = usePage().props;
    const userType = auth?.user?.user_type;
    const section_id = auth?.user?.section_id;

    useEffect(() => {
        axios.get('/get_all_modules')
            .then(response => {
                const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');

                const formattedModules = response.data.map(module => {
                    const files = module.file_name.split(',').map((file, index) => ({
                        file_name: file.trim(),
                        file_path: module.file_path.split(',')[index]?.trim() ? `${baseUrl}/modules/${module.file_path.split(',')[index].trim()}` : ''
                    })).filter(file => file.file_name && file.file_path);

                    return {
                        module_id: module.id,
                        module_name: module.module_name,
                        module_desc: module.module_desc,
                        module_file_desc: module.module_file_desc,
                        file: files.length > 0 ? files : []
                    };
                });

                setModuleData(formattedModules);
            })
            .catch(error => {
                console.error("There was an error fetching the modules:", error);
            });
    }, []);


    const toggleModal = () => setIsModalOpen(!isModalOpen);
    const toggleEditModal = () => setIsEditModalOpen(!isEditModalOpen);

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

        files.forEach((file) => {
            formData.append('module_file[]', file);
        });

        axios.post(route('modules.store'), formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then(response => {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Announcement submitted successfully!',
                    confirmButtonColor: '#d33'
                }).then(() => {
                    reset();
                    window.location.reload();
                });
            })
            .catch(error => {
                if (error.response && error.response.data.errors) {
                    let errorMessages = Object.values(error.response.data.errors)
                        .map(err => err.join('\n'))
                        .join('\n');

                    Swal.fire({
                        icon: 'error',
                        title: 'Submission Failed',
                        text: errorMessages,
                        confirmButtonColor: '#d33'
                    }).then(() => {
                        setIsModalOpen(true);
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Something went wrong. Please try again later.',
                        confirmButtonColor: '#d33'
                    }).then(() => {
                        setIsModalOpen(true);
                    });
                }

                console.error("There was an error submitting the form:", error);
            });
    };

    const handleEdit = (moduleId) => {
        axios.get(`/modules/${moduleId}`)
            .then(response => {
                const moduleData = response.data.module;

                const files = [];

                setEditModuleData(moduleData);
                setEditFiles(files);
                toggleEditModal();
            })
            .catch(error => {
                console.error("There was an error fetching the module data:", error);
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

        editFiles.forEach((file) => {
            formData.append('module_file[]', file);
        });

        axios.post(route('modules.update', { id: editModuleData.id }), formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then(response => {
                Swal.fire({
                    icon: 'success',
                    title: 'Updated Successfully',
                    text: 'The module has been updated!',
                    confirmButtonColor: '#d33'
                }).then(() => {
                    reset();
                    window.location.reload();
                });
            })
            .catch(error => {
                if (error.response && error.response.data.errors) {
                    let errorMessages = Object.values(error.response.data.errors)
                        .map(err => err.join('\n'))
                        .join('\n');

                    Swal.fire({
                        icon: 'error',
                        title: 'Update Failed',
                        text: errorMessages,
                        confirmButtonColor: '#d33'
                    }).then(() => {
                        setIsEditModalOpen(true);
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Something went wrong. Please try again later.',
                        confirmButtonColor: '#d33'
                    }).then(() => {
                        setIsEditModalOpen(true);
                    });
                }

                console.error("There was an error updating the module:", error);
            });
    };

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
                axios.delete(`/modules/${module}`)
                    .then((response) => {
                        Swal.fire('Removed!', 'The Announcement has been removed.', 'success')
                            .then(() => {
                                window.location.reload();
                            });
                    })
                    .catch((error) => {
                        Swal.fire('Error!', 'There was an issue deleting the module. Please try again.', 'error');
                        console.error("There was an error deleting the module:", error);
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
                axios.delete(`/modules/single/${id}/${index}`)
                    .then((response) => {
                        Swal.fire('Removed!', 'The Announcement has been removed.', 'success')
                            .then(() => {
                                window.location.reload();
                            });
                    })
                    .catch((error) => {
                        Swal.fire('Error!', 'There was an issue deleting the module. Please try again.', 'error');
                        console.error("There was an error deleting the module:", error);
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

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Announcement</h2>}>
            <Head title="Announcements" />

            <div className="sm:py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="sm:p-4 py-5 space-y-4">
                        {userType === 'Teacher' ? (
                            <div className="bg-blue-50 border-4 flex flex-col sm:flex-row justify-between border-blue-300 p-5 rounded-3xl">
                                <div className="text-2xl font-semibold text-primary">Add New Announcement</div>
                                <button
                                    onClick={toggleModal}
                                    className="bg-primary font-semibold text-white px-4 py-2 rounded-3xl transition duration-300 ease-in-out hover:scale-110 mt-4 sm:mt-0"
                                >
                                    Add Announcement
                                </button>
                            </div>
                        ) : (
                            <div className="bg-blue-50 border-4 flex  flex-col sm:flex-row justify-between border-blue-300 p-5 rounded-3xl">
                                <div className="text-2xl font-semibold text-primary">Announcement List</div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                            {modulesData.map((module, index) => (
                                <Accordion
                                    key={index}
                                    type="single"
                                    className="bg-gray-200 rounded-2xl px-5 text-primary"
                                    collapsible
                                    open
                                    defaultValue="item-1"
                                >
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger className="font-medium text-2xl text-gray-600">
                                            {module.module_name}
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <p className="text-gray-600 ">{module.module_desc}</p>
                                            {userType === 'Teacher' && (
                                                <div className="flex  gap-2  py-2 w-max text-white font-semibold">
                                                    <span
                                                        onClick={() => handleEdit(module.module_id)}
                                                        className="cursor-pointer bg-primary p-1 px-4 rounded-lg"
                                                    >
                                                        Edit
                                                    </span>
                                                    <span
                                                        onClick={() => handleDeleteModule(module.module_id)}
                                                        className="cursor-pointer bg-danger p-1 px-4 rounded-lg"
                                                    >
                                                        Delete
                                                    </span>
                                                </div>
                                            )}
                                            <div className="my-5 pt-2 pb-5 bg-white px-5 rounded-lg">
                                                <h3 className="font-medium my-4 bg-yellow-100 p-2 rounded-lg text-yellow-600">
                                                    {module.module_file_desc}
                                                </h3>

                                                {module.file.map((file, index) => (
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
                                                                    const link = document.createElement('a');
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
                                                                        handleRemoveFile(module.module_id, index);
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
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            <Dialog open={isModalOpen} onOpenChange={toggleModal}>
                <DialogContent className="overflow-y-auto max-h-[80vh] max-w-lg">
                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-4">
                        <DialogHeader>
                            <DialogTitle className="text-2xl text-primary font-semibold mb-5">
                                Add New Announcement
                            </DialogTitle>
                        </DialogHeader>

                        <InputLabel htmlFor="module_name" value="Announcement Title" />
                        <TextInput
                            type="text"
                            name="module_name"
                            value={data.module_name}
                            onChange={handleChange}
                            className="border w-full p-2 mb-2"
                        />
                        <InputLabel htmlFor="module_desc" value="Description" />
                        <TextInput
                            type="text"
                            name="module_desc"
                            value={data.module_desc}
                            onChange={handleChange}
                            className="border w-full p-2 mb-2"
                        />
                        <InputLabel htmlFor="module_file_desc" value="File Description" />
                        <TextInput
                            type="text"
                            name="module_file_desc"
                            value={data.module_file_desc}
                            onChange={handleChange}
                            className="border w-full p-2 mb-2"
                        />

                        <InputLabel htmlFor="module_file" value="Announcement File" />
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

                        <div className="bg-white sticky bottom-0 p-2  flex justify-end space-x-4">
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

            {/* Edit Modal */}

            <Dialog open={isEditModalOpen} onOpenChange={toggleEditModal}>
                <DialogContent className="overflow-y-auto max-h-[80vh] max-w-lg">
                    <form onSubmit={handleUpdate} className="bg-white rounded-3xl p-4">
                        <DialogHeader>
                            <DialogTitle className="text-2xl text-primary font-semibold mb-5">Edit Announcement</DialogTitle>
                        </DialogHeader>

                        <InputLabel htmlFor="module_name" value="Announcement Title" />
                        <TextInput
                            type="text"
                            name="module_name"
                            value={editModuleData ? editModuleData.module_name : ''}
                            onChange={handleEditChange}
                            className="border w-full p-2 mb-2"
                        />
                        <InputLabel htmlFor="module_desc" value="Description" />
                        <TextInput
                            type="text"
                            name="module_desc"
                            value={editModuleData ? editModuleData.module_desc : ''}
                            onChange={handleEditChange}
                            className="border w-full p-2 mb-2"
                        />
                        <InputLabel htmlFor="module_file_desc" value="File Description" />
                        <TextInput
                            type="text"
                            name="module_file_desc"
                            value={editModuleData ? editModuleData.module_file_desc : ''}
                            onChange={handleEditChange}
                            className="border w-full p-2 mb-2"
                        />
                        <InputLabel htmlFor="module_file" value="Announcement File" />
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

                        <div className="bg-white sticky bottom-0 p-2 flex justify-end space-x-4">
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
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
