import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import Avatar from '@/Components/Avatar';
import { IoClose } from 'react-icons/io5';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import Swal from 'sweetalert2';
import { usePage } from "@inertiajs/react";
import axios from 'axios';

const Sections = () => {
    const { sections, sectionData, allStudents } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenStudent, setIsOpenStudent] = useState(false);
    const [sectionName, setSectionName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedStudents, setSelectedStudents] = useState([]);
    const [nameFilter, setNameFilter] = useState('');
    const [sectionFilter, setSectionFilter] = useState('');

    const filteredStudentsData = sectionData
        ? sectionData.students.filter(student =>
            student.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
            (sectionFilter === '' || student.section_name === sectionFilter)
        )
        : [];

    const filteredStudents = allStudents.filter((student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCheckboxChange = (id) => {
        setSelectedStudents((prev) => (prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]));
    };

    const handleSelectAll = () => {
        log;
        setSelectedStudents(selectedStudents.length === allStudents.length ? [] : allStudents.map((user) => user.id));
    };

    const handleAddStudent = () => {
        setIsOpenStudent(true);
    };

    const handleAddStudentSubmit = () => {
        setIsOpenStudent(false);

        Swal.fire({
            title: 'Add Student/s',
            text: 'Are you sure you want to add the student/s to this section?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.isConfirmed) {
                setIsOpenStudent(false);

                axios.post('/add-student-section', { student_ids: selectedStudents })
                    .then(response => {
                        if (response.data.success) {
                            Swal.fire({
                                title: 'Student Added',
                                text: 'The student has been successfully added to the section.',
                                icon: 'success',
                                confirmButtonText: 'OK',
                            }).then(() => {
                                window.location.reload();
                            });
                        } else {
                            Swal.fire('Error', 'Failed to delete student. Please try again.', 'error');
                        }
                    })
                    .catch(error => {
                        Swal.fire('Error', 'Something went wrong!', 'error');
                        console.error('Delete Error:', error);
                    });
            }
        });
    };

    const handleDeleteStudent = (studentId) => {
        Swal.fire({
            title: 'Delete Student',
            text: 'Are you sure you want to delete the student from the section?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.isConfirmed) {
                axios.post('/remove-student-section', { student_id: studentId })
                    .then(response => {
                        if (response.data.success) {
                            Swal.fire({
                                title: 'Deleted!',
                                text: 'The student has been removed from the section.',
                                icon: 'success',
                            }).then(() => {
                                window.location.reload();
                            });
                        } else {
                            Swal.fire('Error', 'Failed to delete student. Please try again.', 'error');
                        }
                    })
                    .catch(error => {
                        Swal.fire('Error', 'Something went wrong!', 'error');
                        console.error('Delete Error:', error);
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
                        </div>
                        {sectionData ? (
                            <div className="p-4 border rounded-3xl">
                                <div className="p-6 bg-white rounded-2xl space-y-4">
                                    <div className="bg-white mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center rounded-2xl gap-4">
                                        <h1 className="text-2xl font-semibold text-blue-500">Student List</h1>
                                        <button
                                            onClick={handleAddStudent}
                                            className="bg-blue-500 text-sm font-semibold text-white px-4 py-2 rounded-3xl transition duration-300 ease-in-out hover:scale-110"
                                        >
                                            Add Students
                                        </button>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                        <input
                                            type="text"
                                            placeholder="Filter by student name"
                                            value={nameFilter}
                                            onChange={(e) => setNameFilter(e.target.value)}
                                            className="border rounded-2xl px-3 py-2 w-full sm:w-1/2"
                                        />
                                        <select
                                            className="border rounded-2xl px-3 py-2 w-full sm:w-1/2"
                                            value={sectionFilter}
                                            onChange={(e) => setSectionFilter(e.target.value)}
                                        >
                                            <option value="">All Sections</option>
                                            {sections.map((section) => (
                                                <option key={section.id} value={section.section_name}>
                                                    {section.section_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {filteredStudentsData.length === 0 ? (
                                        <div className="p-6 bg-white rounded-2xl flex flex-col justify-center items-center">
                                            <img src="/images/assets/background/not_found.svg" alt="" />
                                            <h1 className="text-primary text-3xl font-bold text-center">
                                                No Students Found!
                                            </h1>
                                        </div>
                                    ) : (
                                        filteredStudentsData.map((student) => (
                                            <div
                                                key={student.id}
                                                className="flex items-center justify-between gap-4 pb-4 border-b border-gray-300"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={student.name} className={'w-12 h-12'} />
                                                    <div>
                                                        <h3 className="font-medium text-lg text-gray-700">{student.name}</h3>
                                                        <div className="mt-1 text-sm text-gray-500">
                                                            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-500 font-semibold">
                                                                {student.section_name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    className="bg-danger text-white p-1 rounded-full hover:scale-110 transition duration-200 ease-in-out"
                                                    onClick={() => handleDeleteStudent(student.id)}
                                                >
                                                    <IoClose />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 border rounded-3xl">
                                <div className="p-6 bg-white rounded-2xl flex flex-col justify-center items-center">
                                    <img src="/images/assets/background/not_found.svg" alt="" />
                                    <h1 className="text-primary text-3xl font-bold text-center">
                                        Opps! No Active Section Found
                                    </h1>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <Dialog open={isOpenStudent} onOpenChange={setIsOpenStudent}>
                    <DialogContent className=" max-w-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-blue-600 text-2xl">Add Student</DialogTitle>
                            <DialogDescription>
                                Please select the students you wish to enroll in this section
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="Search student name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-2xl focus:outline-none focus:ring focus:border-blue-300"
                                />

                                <div className="overflow-x-auto">
                                    <p className="mt-4 text-end">Selected: {selectedStudents.length}</p>
                                    <div className="max-h-[50vh] overflow-y-scroll">
                                        <table className="table-auto w-full">
                                            <thead className="bg-gray-100 sticky top-0">
                                                <tr>
                                                    <th className="text-start px-6 py-3 border-b border-gray-200 w-1">
                                                        <input
                                                            type="checkbox"
                                                            onChange={handleSelectAll}
                                                            className="rounded-sm"
                                                            checked={
                                                                selectedStudents.length > 0 &&
                                                                selectedStudents.length ===
                                                                filteredStudents.length
                                                            }
                                                        />
                                                    </th>
                                                    <th className="py-3 px-6 text-start border-b border-gray-200 text-gray-800">
                                                        Student Name
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredStudents.map((student) => (
                                                    <tr key={student.id} className="border-b">
                                                        <td className="px-6 py-4 border-b border-gray-200">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedStudents.includes(student.id)}
                                                                className="rounded-sm w-4 h-4"
                                                                onChange={() => handleCheckboxChange(student.id)}
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 border-b border-gray-200">
                                                            <div className="flex gap-4 items-center justify-start">
                                                                <Avatar name={student.name} className={'w-12 h-12'} />
                                                                {student.name}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end bg-white p-4 space-x-2">
                            <DangerButton type="button" className="py-2 px-4" onClick={() => setIsOpenStudent(false)}>
                                Cancel
                            </DangerButton>

                            <PrimaryButton
                                type="button"
                                className="py-2 px-4"
                                onClick={handleAddStudentSubmit}
                                disabled={selectedStudents.length === 0}
                            >
                                Add Students
                            </PrimaryButton>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
};

export default Sections;
