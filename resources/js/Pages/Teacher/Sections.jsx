import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import Avatar from '@/Components/Avatar';
import { IoClose } from 'react-icons/io5';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import Swal from 'sweetalert2';

const sectionData = {
    // kukunin nito par yung active lang pag walang active gar pa return nalang as empty []
    section_id: 1,
    is_active: 1,
    teacher_name: 'John Doe',
    students: [
        {
            id: 1,
            name: 'John Doe',
        },
        {
            id: 2,
            name: 'Jane Doe',
        },
        {
            id: 3,
            name: 'Bob Smith',
        },
        {
            id: 4,
            name: 'Alice Johnson',
        },
        {
            id: 5,
            name: 'Michael Brown',
        },
        {
            id: 6,
            name: 'Emily Davis',
        },
        {
            id: 7,
            name: 'William Taylor',
        },
        {
            id: 8,
            name: 'Sarah Lee',
        },
        {
            id: 9,
            name: 'Kevin White',
        },
        {
            id: 10,
            name: 'Olivia Martin',
        },
    ],
};

const allStudents = [
    // student list na wala pang section
    {
        id: 1,
        name: 'John Doe',
    },
    {
        id: 2,
        name: 'Jane Doe',
    },
    {
        id: 3,
        name: 'Bob Smith',
    },
    {
        id: 4,
        name: 'Alice Johnson',
    },
    {
        id: 5,
        name: 'Michael Brown',
    },
    {
        id: 6,
        name: 'Emily Davis',
    },
    {
        id: 7,
        name: 'William Taylor',
    },
    {
        id: 8,
        name: 'Sarah Lee',
    },
    {
        id: 9,
        name: 'Kevin White',
    },
    {
        id: 10,
        name: 'Olivia Martin',
    },
];
const Sections = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenStudent, setIsOpenStudent] = useState(false);
    const [sectionName, setSectionName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [selectedStudents, setSelectedStudents] = useState([]); // eto gar yung selected sa modal na students

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

                Swal.fire({
                    title: 'Student Added',
                    text: 'The student has been successfully added to the section.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                });
            }
        });
    };
    const handleDeleteStudent = () => {
        Swal.fire({
            title: 'Delete Student',
            text: 'Are you sure you want to delete the student from the section?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('Deleted!', 'The student has been deleted from the section.', 'success');
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
                                    <div className="bg-white mb-10 flex flex-col sm:flex-row justify-between  items-center rounded-2xl">
                                        <h1 className="text-2xl font-semibold text-blue-500">Student List</h1>
                                        <button
                                            onClick={handleAddStudent}
                                            className="bg-blue-500 text-sm font-semibold text-white px-4 py-2 rounded-3xl transition duration-300 ease-in-out hover:scale-110 mt-4 sm:mt-0"
                                        >
                                            Add Students
                                        </button>
                                    </div>

                                    {sectionData.students.length === 0 ? (
                                        <div className="p-6 bg-white rounded-2xl space-y-4 flex flex-col justify-center items-center">
                                            <img src="/images/assets/background/not_found.svg" alt="" />
                                            <h1 className="text-primary text-3xl font-bold text-center">
                                                No Students Found!
                                            </h1>
                                        </div>
                                    ) : (
                                        sectionData.students.map((student) => (
                                            <div
                                                key={student.id}
                                                className="flex items-center justify-between gap-4 pb-4 border-b border-gray-300"
                                            >
                                                <div className="flex items-center justify-start gap-3">
                                                    <Avatar name={student.name} className={'w-12 h-12'} />
                                                    <h3 className="font-medium text-lg text-gray-700">
                                                        {student.name}
                                                    </h3>
                                                </div>
                                                <button
                                                    className="bg-danger text-white p-1 rounded-full hover:scale-110 transition duration-200 ease-in-out"
                                                    onClick={handleDeleteStudent}
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
                                <div className="overflow-x-auto">
                                    <p className="mt-4 text-end">Selected: {selectedStudents.length}</p>
                                    <div className="max-h-[50vh] overflow-y-scroll">
                                        <table className="table-auto w-full">
                                            <thead className="bg-gray-100 sticky top-0">
                                                <tr>
                                                    <th className="text-start px-6  py-3 border-b border-gray-200 w-1">
                                                        <input
                                                            type="checkbox"
                                                            onChange={handleSelectAll}
                                                            className="rounded-sm"
                                                            checked={selectedStudents.length === allStudents.length}
                                                        />
                                                    </th>
                                                    <th className="py-3 px-6 text-start  border-b border-gray-200 text-gray-800">
                                                        Student Name
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allStudents.map((student) => (
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
