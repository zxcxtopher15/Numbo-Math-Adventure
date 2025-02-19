import Avatar from '@/Components/Avatar';

export function TeacherDashboard(result) {
    let students_data = result.data;
    console.log(result);

    return (
        <div className="py-12">
            <div className="mx-auto max-w-[100rem] sm:px-6 lg:px-8">
                <div className="p-4 space-y-5">
                    <div className="grid sm:grid-cols-2 grid-cols-1 text-white gap-5">
                        <div className="bg-primary rounded-2xl p-4">box1</div>
                        <div className="bg-primary rounded-2xl p-4">box1</div>
                    </div>
                    <h1 className="text-3xl font-bold text-primary">Students</h1>

                    <div className="bg-gray-200 py-7 rounded-2xl grid lg:grid-cols-2 grid-cols-1 gap-2 p-3">
                        {students_data.map((student) => (
                            <div key={student.id} className="p-4 bg-white text-gray-600 rounded-2xl">
                                <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 items-center ">
                                    <div className="flex items-center gap-3">
                                        {student.image ? (
                                            <Avatar name={student.image} />
                                        ) : (
                                            <Avatar name={student.name} />
                                        )}
                                        <h3 className="font-semibold"> {student.name}</h3>
                                    </div>
                                    <div className="flex flex-col items-end justify-end p-4 ">
                                        <p>Average</p>
                                        <h1 className="rounded-2xl  text-warning font-bold text-3xl">80%</h1>
                                    </div>
                                </div>
                                <div className="p-4 mt-8 bg-blue-100 rounded-2xl">Test</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
