import Avatar from './Avatar';
export default function StudentList({ data }) {
    return (
        <div className=" box-border">
            <div className=" rounded-3xl p-4 space-y-4  overflow-y-auto">
                {data.map((profile) => (
                    <div key={profile.id} className="flex gap-4 justify-between items-center pe-3 pb-4 border-b">
                        <div className="flex items-center gap-4 ">
                            {profile.image ? <Avatar name={profile.image} /> : <Avatar name={profile.name} />}

                            <span>
                                <h3 className="font-semibold text-gray-600">{profile.name}</h3>
                                <p
                                    className={`text-sm font-medium ${profile.user_type === 'Student' ? 'text-green-50 bg-green-400' : profile.user_type === 'Teacher' ? 'text-yellow-50 bg-yellow-500' : 'text-blue-50 bg-blue-400'} px-2 py-0 rounded-full w-fit`}
                                >
                                    {profile.user_type ?? 'None'}
                                </p>
                            </span>
                        </div>
                        {data.score ? (
                            <div className="text-center ">
                                <p className="font-semibold text-gray-600">score</p>
                                <h1 className="text-4xl text-warning font-semibold">{data[0].score}</h1>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="font-semibold text-yellow-500">Waiting</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
