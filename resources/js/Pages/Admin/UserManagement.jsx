import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import React, { useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import format from 'date-fns/format';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Avatar from '@/Components/Avatar';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import Swal from 'sweetalert2';
import axios from 'axios';

const UserManagement = () => {
    const { users, allRequests, allRejects } = usePage().props;
    const [filterText, setFilterText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [selectedRejects, setSelectedRejects] = useState([]);
    const [isOpenRequest, setIsOpenRequest] = useState(false);
    const [isOpenReject, setIsOpenReject] = useState(false);

    console.log(allRejects);

    const columns = [
        {
            name: '#',
            selector: (_, index) => (currentPage - 1) * rowsPerPage + index + 1,
            sortable: false,
            width: '70px',
        },
        { name: 'Name', selector: (row) => row.name, sortable: true },
        { name: 'Email', selector: (row) => row.email, sortable: true },
        { name: 'Type', selector: (row) => row.user_type, sortable: true },
        {
            name: 'Date',
            selector: (row) => format(new Date(row.created_at), 'MMMM do, yyyy, h:mm a'),
            sortable: true,
        },
    ];

    const filteredData = useMemo(() => {
        return users.filter(
            (item) =>
                item.name?.toLowerCase().includes(filterText.toLowerCase()) ||
                item.email?.toLowerCase().includes(filterText.toLowerCase()) ||
                format(new Date(item.created_at), 'MMMM do, yyyy, h:mm a')
                    .toLowerCase()
                    .includes(filterText.toLowerCase()),
        );
    }, [filterText, users]);

    const handleChangeRowsPerPage = (value) => {
        setRowsPerPage(value);
    };

    const handleSelectAllRequests = (e) => {
        if (e.target.checked) {
            setSelectedRequests(allRequests.map((request) => request.id));
        } else {
            setSelectedRequests([]);
        }
    };
    const handleSelectAllRejects = (e) => {
        if (e.target.checked) {
            setSelectedRejects(allRejects.map((reject) => reject.id));
        } else {
            setSelectedRejects([]);
        }
    };

    const handleRequestCheckboxChange = (id) => {
        setSelectedRequests((prevSelected) =>
            prevSelected.includes(id) ? prevSelected.filter((requestId) => requestId !== id) : [...prevSelected, id],
        );
    };

    const handleRejectCheckboxChange = (id) => {
        setSelectedRejects((prevSelected) =>
            prevSelected.includes(id) ? prevSelected.filter((requestId) => requestId !== id) : [...prevSelected, id],
        );
    };

    const handleApproveRequests = () => {
        setIsOpenRequest(false);
        setIsOpenReject(false);
        Swal.fire({
            title: 'Approve Selected Users?',
            text: 'Are you sure you want to approve the selected user accounts?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .post('/approve_users', { user_ids: selectedRequests })
                    .then((response) => {
                        if (response.data.message) {
                            Swal.fire('Approved!', 'The selected users have been approved.', 'success').then(() => {
                                window.location.reload();
                            });
                        }
                    })
                    .catch((error) => {
                        console.error('Error approving users:', error);
                        Swal.fire('Error', 'Failed to approve users.', 'error');
                    });
            }
        });
    };
    const handleRestoreRejects = () => {
        setIsOpenReject(false);

        Swal.fire({
            title: 'Restore Rejected Users?',
            text: 'Are you sure you want to restore the rejected user accounts?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .post('/restore_users', { user_ids: selectedRejects })
                    .then((response) => {
                        if (response.data.message) {
                            Swal.fire('Restored!', 'The rejected users have been restored.', 'success').then(() => {
                                window.location.reload();
                            });
                        }
                    })
                    .catch((error) => {
                        console.error('Error restoring rejected users:', error);
                        Swal.fire('Error', 'Failed to restore rejected users.', 'error');
                    });
            }
        });
    };
    const handleRejectRequests = () => {
        setIsOpenRequest(false);
        setIsOpenReject(false);
        Swal.fire({
            title: 'Reject Selected Users?',
            text: 'Are you sure you want to reject the selected user accounts?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .post('/reject_users', { user_ids: selectedRequests })
                    .then((response) => {
                        if (response.data.message) {
                            Swal.fire('Rejected!', 'The selected users have been rejected.', 'success').then(() => {
                                window.location.reload();
                            });
                        }
                    })
                    .catch((error) => {
                        console.error('Error rejecting users:', error);
                        Swal.fire('Error', 'Failed to reject users.', 'error');
                    });
            }
        });
    };
    const handleDeleteRequests = () => {
        setIsOpenRequest(false);
        setIsOpenReject(false);
        Swal.fire({
            title: 'Delete Selected Users?',
            text: 'Are you sure you want to delete the selected user accounts?',
            icon: 'error',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .delete('/delete_users', { data: { user_ids: selectedRequests } })
                    .then((response) => {
                        if (response.data.message) {
                            Swal.fire('Deleted!', 'The selected users have been deleted.', 'success').then(() => {
                                window.location.reload();
                            });
                        }
                    })
                    .catch((error) => {
                        console.error('Error deleting users:', error);
                        Swal.fire('Error', 'Failed to delete users.', 'error');
                    });
            }
        });
    };
    const handleDeleteRejects = () => {
        setIsOpenRequest(false);
        setIsOpenReject(false);
        Swal.fire({
            title: 'Delete Rejected Users?',
            text: 'Are you sure you want to delete the rejected user accounts?',
            icon: 'error',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .delete('/delete_users', { data: { user_ids: selectedRejects } })
                    .then((response) => {
                        if (response.data.message) {
                            Swal.fire('Deleted!', 'The rejected users have been deleted.', 'success').then(() => {
                                window.location.reload();
                            });
                        }
                    })
                    .catch((error) => {
                        console.error('Error deleting users:', error);
                        Swal.fire('Error', 'Failed to delete users.', 'error');
                    });
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Questions" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8"></div>
                <div className="p-4">
                    <div className="bg-blue-50  border-4 flex flex-col gap-3 items-center sm:flex-row justify-between border-blue-300 p-5 rounded-3xl mb-4">
                        <div className="flex items-center w-full gap-5">
                            <div className="text-2xl font-semibold text-primary "> Manage Users</div>
                            <div className="relative transition duration-300 ease-in-out hover:scale-110">
                                <button
                                    className={`bg-primary font-semibold w-max text-nowrap text-white px-4 py-2 rounded-3xl mt-4 sm:mt-0 ${
                                        allRequests.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                    onClick={() => setIsOpenRequest(true)}
                                    disabled={allRequests.length === 0}
                                >
                                    For Approval
                                </button>
                                {allRequests.length > 0 && (
                                    <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                                        {allRequests.length}
                                    </span>
                                )}
                            </div>
                            <div className="relative transition duration-300 ease-in-out hover:scale-110">
                                <button
                                    className={`bg-warning font-semibold w-max text-nowrap text-white px-4 py-2 rounded-3xl mt-4 sm:mt-0 ${
                                        allRejects.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                    onClick={() => setIsOpenReject(true)}
                                    disabled={allRejects.length === 0}
                                >
                                    Rejected List
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end w-full">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="p-2 border border-gray-300 rounded-3xl lg:w-1/2 w-full "
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="rounded-2xl border border-gray-200 shadow-md overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                        <div className="overflow-x-auto max-w-full">
                            <DataTable
                                columns={columns}
                                data={filteredData}
                                pagination
                                paginationPerPage={rowsPerPage}
                                onChangePage={(page) => setCurrentPage(page)}
                                highlightOnHover
                                striped
                                responsive
                                customStyles={{
                                    headRow: {
                                        style: {
                                            backgroundColor: '#6CA6CD',
                                            color: '#FFFFFF',
                                            fontWeight: 'semibold',
                                            fontSize: '17px',
                                        },
                                    },
                                    rows: {
                                        style: {
                                            minHeight: '48px',
                                        },
                                    },
                                    cells: {
                                        style: {
                                            padding: '12px',
                                            fontSize: '14px',
                                        },
                                    },
                                }}
                                onChangeRowsPerPage={handleChangeRowsPerPage}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={isOpenRequest} onOpenChange={setIsOpenRequest}>
                <DialogContent className="max-w-5xl">
                    <DialogHeader>
                        <DialogTitle className="text-blue-600 text-2xl">Approve User Accounts</DialogTitle>
                        <DialogDescription>Please select the user accounts you wish to approve</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="overflow-x-auto">
                                <p className="mt-4 text-end">Selected: {selectedRequests.length}</p>
                                <div className="max-h-[50vh] overflow-y-scroll">
                                    <table className="table-auto w-full">
                                        <thead className="bg-gray-100 sticky top-0">
                                            <tr>
                                                <th className="text-start px-6 py-3 border-b border-gray-200 w-1">
                                                    <input
                                                        type="checkbox"
                                                        onChange={handleSelectAllRequests}
                                                        className="rounded-sm"
                                                        checked={selectedRequests.length === allRequests.length}
                                                    />
                                                </th>
                                                <th className="py-3 px-6 text-start border-b border-gray-200 text-gray-800">
                                                    User Name
                                                </th>
                                                <th className="py-3 px-6 text-start border-b border-gray-200 text-gray-800">
                                                    Email
                                                </th>
                                                <th className="py-3 px-6 text-start border-b border-gray-200 text-gray-800">
                                                    User Type
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allRequests.map((request) => (
                                                <tr key={request.id} className="border-b">
                                                    <td className="px-6 py-4 border-b border-gray-200">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRequests.includes(request.id)}
                                                            className="rounded-sm w-4 h-4"
                                                            onChange={() => handleRequestCheckboxChange(request.id)}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 border-b border-gray-200">
                                                        <div className="flex gap-4 items-center justify-start">
                                                            <Avatar name={request.name} className={'w-12 h-12'} />

                                                            {request.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 border-b border-gray-200">
                                                        <div className="flex gap-4 items-center justify-start">
                                                            {request.email}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 border-b border-gray-200">
                                                        <div className="flex gap-4 items-center justify-start">
                                                            {request.user_type}
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

                    <div className="flex items-center justify-between bg-white p-4 space-x-2">
                        <DangerButton
                            type="button"
                            className="py-2 px-4 "
                            onClick={handleDeleteRequests}
                            disabled={selectedRequests.length === 0}
                        >
                            Delete
                        </DangerButton>
                        <div className="space-x-2">
                            <DangerButton
                                type="button"
                                className="py-2 px-4 bg-warning"
                                onClick={handleRejectRequests}
                                disabled={selectedRequests.length === 0}
                            >
                                Reject
                            </DangerButton>
                            <PrimaryButton
                                type="button"
                                className="py-2 px-4"
                                onClick={handleApproveRequests}
                                disabled={selectedRequests.length === 0}
                            >
                                Approve Users
                            </PrimaryButton>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={isOpenReject} onOpenChange={setIsOpenReject}>
                <DialogContent className="max-w-5xl">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 text-2xl">Rejected User Accounts</DialogTitle>
                        <DialogDescription>Review the user accounts that have been rejected</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="overflow-x-auto">
                                <p className="mt-4 text-end">Selected: {selectedRejects.length}</p>
                                <div className="max-h-[50vh] overflow-y-scroll">
                                    <table className="table-auto w-full">
                                        <thead className="bg-gray-100 sticky top-0">
                                            <tr>
                                                <th className="text-start px-6 py-3 border-b border-gray-200 w-1">
                                                    <input
                                                        type="checkbox"
                                                        onChange={handleSelectAllRejects}
                                                        className="rounded-sm"
                                                        checked={selectedRejects.length === allRejects.length}
                                                    />
                                                </th>
                                                <th className="py-3 px-6 text-start border-b border-gray-200 text-gray-800">
                                                    User Name
                                                </th>
                                                <th className="py-3 px-6 text-start border-b border-gray-200 text-gray-800">
                                                    Email
                                                </th>
                                                <th className="py-3 px-6 text-start border-b border-gray-200 text-gray-800">
                                                    User Type
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allRejects.map((reject) => (
                                                <tr key={reject.id} className="border-b">
                                                    <td className="px-6 py-4 border-b border-gray-200">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRejects.includes(reject.id)}
                                                            className="rounded-sm w-4 h-4"
                                                            onChange={() => handleRejectCheckboxChange(reject.id)}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 border-b border-gray-200">
                                                        <div className="flex gap-4 items-center justify-start">
                                                            <Avatar name={reject.name} className={'w-12 h-12'} />

                                                            {reject.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 border-b border-gray-200">
                                                        <div className="flex gap-4 items-center justify-start">
                                                            {reject.email}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 border-b border-gray-200">
                                                        <div className="flex gap-4 items-center justify-start">
                                                            {reject.user_type}
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

                    <div className="flex items-center justify-between bg-white p-4 space-x-2">
                        <DangerButton
                            type="button"
                            className="py-2 px-4 "
                            onClick={handleDeleteRejects}
                            disabled={selectedRejects.length === 0}
                        >
                            Delete
                        </DangerButton>
                        <div className="space-x-2">
                            <PrimaryButton
                                type="button"
                                className="py-2 px-4"
                                onClick={handleRestoreRejects}
                                disabled={selectedRejects.length === 0}
                            >
                                Approve Users
                            </PrimaryButton>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
};

export default UserManagement;
