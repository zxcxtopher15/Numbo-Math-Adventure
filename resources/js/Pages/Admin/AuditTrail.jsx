import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import React, { useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import format from 'date-fns/format';

const AuditTrail = () => {
    const { audit_trail } = usePage().props;
    const [filterText, setFilterText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const columns = [
        {
            name: '#',
            selector: (_, index) => (currentPage - 1) * rowsPerPage + index + 1,
            sortable: false,
            width: '80px',
        },
        { name: 'Name', selector: (row) => row.name, sortable: true, wrap: true },
        { name: 'User Type', selector: (row) => row.user_type, sortable: true, wrap: true },
        { name: 'Action', selector: (row) => row.action, sortable: true, wrap: true },
        {
            name: 'Date',
            selector: (row) => (
                <div className="whitespace-pre-wrap">{format(new Date(row.created_at), 'MMMM do, yyyy, h:mm a')}</div>
            ),
            sortable: true,
            wrap: false,
        },
    ];

    const filteredData = useMemo(() => {
        return audit_trail.filter(
            (item) =>
                item.name?.toLowerCase().includes(filterText.toLowerCase()) ||
                item.action?.toLowerCase().includes(filterText.toLowerCase()) ||
                format(new Date(item.created_at), 'MMMM do, yyyy, h:mm a')
                    .toLowerCase()
                    .includes(filterText.toLowerCase()),
        );
    }, [filterText, audit_trail]);

    const handleChangeRowsPerPage = (value) => {
        setRowsPerPage(value);
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Sections</h2>}>
            <Head title="Audit Trail" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8"></div>
                <div className="p-4">
                    <div className="bg-blue-50 border border-4 flex flex-col gap-3 sm:flex-row justify-between border-blue-300 p-5 rounded-3xl mb-4">
                        <div className="text-2xl font-semibold text-primary w-full"> Audit Trail Logs</div>
                        <div className="flex justify-end w-full">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="p-2 border border-gray-300 rounded-3xl lg:w-1/2 w-full"
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl sm:w-[calc(100vw-20rem)] w-[calc(100vw-4rem)]">
                        <DataTable
                            columns={columns}
                            data={filteredData}
                            pagination
                            paginationPerPage={rowsPerPage}
                            onChangePage={(page) => setCurrentPage(page)}
                            highlightOnHover
                            striped
                            customStyles={{
                                headRow: {
                                    style: {
                                        backgroundColor: '#6CA6CD',
                                        color: '#FFFFFF',
                                        fontWeight: 'semibold',
                                        fontSize: '16px',
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
        </AuthenticatedLayout>
    );
};

export default AuditTrail;
