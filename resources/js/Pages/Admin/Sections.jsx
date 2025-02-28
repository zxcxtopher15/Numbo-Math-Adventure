import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import Avatar from '@/Components/Avatar';
import { IoClose } from 'react-icons/io5';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import { Checkbox } from '@/components/ui/checkbox';
import Swal from 'sweetalert2';
import SelectInput from '@/Components/SelectInput';
import { usePage } from "@inertiajs/react";
import axios from 'axios';

// const allTeachers = [

//     {
//         id: 1,
//         name: 'John Doe',
//     },
//     {
//         id: 2,
//         name: 'Jane Doe',
//     },
//     {
//         id: 3,
//         name: 'Bob Smith',
//     },
// ];

// const section_list = [
//     {
//         section_id: 1,
//         section_name: 'Section 1',
//         name: 'Junnie S. Zins',
//     },
//     {
//         section_id: 2,
//         section_name: 'Section 2',
//         name: 'Junnie S. Zins',
//     },
// ];

const Sections = () => {
    const { unassignedTeachers, assignedTeachers } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenTeacher, setIsOpenTeacher] = useState(false);
    const [sectionName, setSectionName] = useState('');

    const [selectedTeacher, setSelectedTeacher] = useState('');

    const [selectedSectionId, setSelectedSectionId] = useState(null);

    const allTeachers = unassignedTeachers.map((teacher) => ({
        id: teacher.id,
        name: teacher.name,
    }));

    const section_list = assignedTeachers.map((teacher) => ({
        id: teacher.id,
        section_id: teacher.section_id,
        section_name: teacher.section_name,
        name: teacher.name,
    }));

    const handleAddSection = () => {
        setIsOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch("/save_section", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ section_name: sectionName }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create section");
            }

            Swal.fire({
                title: "Success!",
                text: data.message,
                icon: "success",
                confirmButtonColor: "#d33",
            }).then(() => {
                window.location.reload();
            });

            setIsOpen(false);
            setSectionName("");
        } catch (error) {
            console.error(error);
            setIsOpen(false);

            Swal.fire({
                title: "Error",
                text: error.message.includes("Section name already exists")
                    ? "Section name already exists"
                    : "Error saving section",
                icon: "error",
                confirmButtonColor: "#d33",
            }).then(() => {
                setIsOpen(true);
            });
        }
    };

    useEffect(() => {
        setSelectedSectionId(selectedSectionId);
        // console.log("Selected Section ID:", selectedSectionId);
    }, [selectedSectionId]);

    const handleAssignTeacher = (sectionId) => {
        setSelectedSectionId(sectionId);
        setIsOpenTeacher(true);
    };

    const handleRemoveAssigned = (Id) => {
        setIsOpenTeacher(false);
        Swal.fire({
            title: "Remove Assigned Teacher?",
            text: "Are you sure you want to remove the teacher from the section?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                fetch("/remove-assigned-teacher", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
                    },
                    body: JSON.stringify({ teacher_id: Id }),
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.message) {
                            Swal.fire("Deleted!", "The teacher has been removed from the section.", "success")
                                .then(() => {
                                    window.location.reload();
                                });
                        }
                    })
                    .catch(error => {
                        console.error("Error removing teacher:", error);
                        Swal.fire("Error", "Failed to remove teacher.", "error");
                    });
            }
        });
    };

    const handleDeleteSection = (sectionId, id) => {
        Swal.fire({
            title: "Delete Section",
            text: "Are you sure you want to delete this section? This action is permanent.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            allowOutsideClick: false,
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`/delete_section`, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
                        },
                        body: JSON.stringify({ sectionId, id }),
                    });

                    if (!response.ok) throw new Error("Failed to delete section");

                    const data = await response.json();

                    Swal.fire({
                        title: "Updated!",
                        text: "The section has been deactivated.",
                        icon: "success",
                        confirmButtonColor: "#d33",
                    }).then(() => {
                        window.location.reload();
                    });
                } catch (error) {
                    console.error(error);
                    Swal.fire({
                        title: "Error",
                        text: "Failed to delete section",
                        icon: "error",
                        confirmButtonColor: "#d33",
                    });
                }
            }
        });
    };

    const handleSubmitTeacher = () => {
        if (!selectedTeacher || !selectedSectionId) {
            setIsOpenTeacher(false);
            Swal.fire("Error", "Please select a teacher before assigning.", "error");
            return;
        }

        setIsOpenTeacher(false);
        Swal.fire({
            title: "Assign Teacher",
            text: "Are you sure you want to assign the teacher to the section?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                console.log("Assigning teacher:", {
                    teacher_id: selectedTeacher,
                    section_id: selectedSectionId
                });

                fetch("/assign-teacher", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
                    },
                    body: JSON.stringify({
                        teacher_id: selectedTeacher,
                        section_id: selectedSectionId,
                    }),
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.message) {
                            Swal.fire("Assigned!", "The teacher has been assigned to the section.", "success")
                                .then(() => {
                                    window.location.reload();
                                });
                            setIsOpenTeacher(false);
                            setSelectedTeacher("");
                            setSelectedSectionId(null);
                        } else {
                            throw new Error("Failed to assign teacher.");
                        }
                    })
                    .catch((error) => {
                        console.error("Error assigning teacher:", error);
                        Swal.fire("Error", "Failed to assign teacher.", "error");
                    });
            }
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Sections</h2>}>
            <Head title="Questions" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="p-4 space-y-4">
                        <div className="bg-blue-50 border border-4 flex flex-col sm:flex-row justify-between border-blue-300 p-5 rounded-3xl">
                            <div className="text-2xl font-semibold text-primary"> Section</div>

                            <button
                                className="bg-primary font-semibold text-white px-4 py-2 rounded-3xl transition duration-300 ease-in-out hover:scale-110 mt-4 sm:mt-0"
                                onClick={handleAddSection}
                            >
                                Add Section
                            </button>
                        </div>
                        {section_list ? (
                            <div className="p-2 sm:p-4 border rounded-3xl">
                                <div className="p-3 sm:p-6 bg-white rounded-2xl space-y-4">
                                    <div className="bg-white mb-5 sm:mb-10 flex flex-col sm:flex-row justify-between  items-center rounded-2xl">
                                        <h1 className="text-lg sm:text-2xl font-semibold text-primary">Section List</h1>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2 sm:gap-4">
                                        {section_list.map((section) => (
                                            <div className="p-4 sm:p-5 border rounded-3xl bg-gray-100">
                                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center justify-between">
                                                    <span className="flex gap-2 sm:gap-4 items-center justify-start">
                                                        <Avatar
                                                            className={'w-10 sm:w-20 h-10 sm:h-20'}
                                                            rounded={true}
                                                            name={section.name ? section.name : section.section_name}
                                                            color="fff"
                                                            background="87CEEB"
                                                        />
                                                        <h1 className="font-semibold text-lg sm:text-2xl text-info">
                                                            {section.section_name}
                                                        </h1>
                                                    </span>
                                                    <div
                                                        onClick={() => handleDeleteSection(section.section_id, section.id)}
                                                        className="bg-danger   text-white px-2 sm:px-4 mx-2 sm:mx-4 font-medium  py-1 sm:py-2 text-xs sm:text-sm  rounded-full  hover:scale-110 transition duration-200 ease-in-out cursor-pointer"
                                                    >
                                                        Delete Section
                                                    </div>
                                                </div>

                                                <h3 className="mt-5 sm:mt-7 font-semibold text-gray-600 px-2 sm:px-3 text-sm sm:text-lg ">
                                                    Assigned Teacher
                                                </h3>

                                                {!section.name ? (
                                                    <div className="mt-3 p-3 sm:p-4 border border-dashed rounded-2xl bg-white  ">
                                                        <div className="grid sm:grid-cols-2 gap-2 sm:gap-4 grid-cols-1 items-center py-4  px-1 sm:px-2 ">
                                                            <p className="text-xs">
                                                                No teacher assigned to this section
                                                            </p>
                                                            <button
                                                                onClick={() => handleAssignTeacher(section.section_id)}
                                                                className="bg-primary text-white px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-full hover:scale-110 transition duration-200 ease-in-out cursor-pointer"
                                                            >
                                                                Assign Teacher
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mt-3 p-3 sm:p-4 border rounded-2xl bg-white  ">
                                                        <div className="flex gap-2 sm:gap-4 items-center justify-between px-1 sm:px-2">
                                                            <div className="flex gap-2 sm:gap-4 items-center justify-start">
                                                                <Avatar
                                                                    className={'w-10 sm:w-16 h-10 sm:h-16'}
                                                                    name={section.name}
                                                                />
                                                                <h2 className="font-semibold text-sm sm:text-xl">
                                                                    {section.name}
                                                                </h2>
                                                            </div>
                                                            <button
                                                                className="bg-danger text-white p-1 sm:p-2 rounded-full hover:scale-110 transition duration-200 ease-in-out"
                                                                onClick={() => handleRemoveAssigned(section.id)}
                                                            >
                                                                <IoClose />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 border rounded-3xl">
                                <div className="p-6 bg-white rounded-2xl space-y-4 flex flex-col justify-center items-center">
                                    <img src="/images/assets/background/not_found.svg" alt="" />
                                    <h1 className="text-primary text-3xl font-bold text-center">
                                        Opps! No Active Section Found
                                    </h1>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent className="overflow-y-auto max-h-[80vh] max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-primary text-2xl">Add Section</DialogTitle>
                            <DialogDescription>
                                Please enter the required information to add a new section
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <InputLabel htmlFor="sectionName" className="block text-lg font-medium text-gray-700">
                                    Section Name
                                </InputLabel>
                                <TextInput
                                    type="text"
                                    id="sectionName"
                                    value={sectionName}
                                    onChange={(e) => setSectionName(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <div className="flex items-center justify-end space-x-2">
                                <DangerButton type="button" className="py-2 px-4" onClick={() => setIsOpen(false)}>
                                    Cancel
                                </DangerButton>

                                <PrimaryButton type="button" className="py-2 px-4" onClick={handleSubmit}>
                                    Create
                                </PrimaryButton>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isOpenTeacher} onOpenChange={setIsOpenTeacher}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-primary text-2xl">Assign Teacher</DialogTitle>
                            <DialogDescription>Please select the teacher to assign to this section</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <SelectInput
                                value={selectedTeacher}
                                onChange={(e) => setSelectedTeacher(e.target.value)}
                                className="w-full"
                            >
                                <option value="">Select Teacher</option>
                                {allTeachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.name}
                                    </option>
                                ))}
                            </SelectInput>
                        </div>

                        <DialogFooter>
                            <div className="flex items-center justify-end space-x-2">
                                <DangerButton
                                    type="button"
                                    className="py-2 px-4"
                                    onClick={() => setIsOpenTeacher(false)}
                                >
                                    Cancel
                                </DangerButton>

                                <PrimaryButton type="button" className="py-2 px-4" onClick={handleSubmitTeacher}>
                                    Assign
                                </PrimaryButton>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
};

export default Sections;
