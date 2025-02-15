import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    user_type: 'Student',
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('register'), {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <GuestLayout>
      <Head title="Register" />

      <form onSubmit={submit}>
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-5">
            <label className="flex justify-center items-center border border-dashed border-gray-400 bg-gray-100 rounded-2xl relative transition-all duration-200 peer-checked:ring-4 peer-checked:ring-primary peer-checked:border-primary">
              <input
                type="radio"
                name="user_type"
                value="Student"
                className="hidden peer"
                checked={data.user_type === 'Student'}
                onChange={(e) => setData('user_type', e.target.value)}
              />
              <img
                src="/images/assets/avatar/student.svg"
                alt=""
                className="absolute bottom-0 left-0 w-24 h-24"
              />
              <h1 className="text-2xl py-3 ml-9 font-bold text-gray-500 peer-checked:text-primary">
                Student
              </h1>
            </label>

            <label className="flex justify-center items-center border border-dashed border-gray-400 bg-gray-100 rounded-2xl relative transition-all duration-200 peer-checked:ring-4 peer-checked:ring-primary peer-checked:border-primary">
              <input
                type="radio"
                name="user_type"
                value="Teacher"
                className="hidden peer"
                checked={data.user_type === 'Teacher'}
                onChange={(e) => setData('user_type', e.target.value)}
              />
              <img
                src="/images/assets/background/classroom.svg"
                alt=""
                className="absolute w-full h-full object-cover rounded-3xl"
              />
              <img
                src="/images/assets/avatar/teacher.svg"
                alt=""
                className="absolute bottom-0 right-0 w-24 h-24"
              />
              <h1 className="text-2xl py-3 me-9 font-bold text-gray-500 peer-checked:text-primary">
                Teacher
              </h1>
            </label>
          </div>

          <div>
            <InputLabel htmlFor="name" value="Name" />
            <TextInput
              id="name"
              name="name"
              value={data.name}
              className="mt-1 block w-full"
              autoComplete="name"
              isFocused={true}
              onChange={(e) => setData('name', e.target.value)}
              required
            />
            <InputError message={errors.name} className="mt-2" />
          </div>

          <div className="mt-4">
            <InputLabel htmlFor="email" value="Email" />
            <TextInput
              id="email"
              type="email"
              name="email"
              value={data.email}
              className="mt-1 block w-full"
              autoComplete="username"
              onChange={(e) => setData('email', e.target.value)}
              required
            />
            <InputError message={errors.email} className="mt-2" />
          </div>

          <div className="mt-4">
            <InputLabel htmlFor="password" value="Password" />
            <TextInput
              id="password"
              type="password"
              name="password"
              value={data.password}
              className="mt-1 block w-full"
              autoComplete="new-password"
              onChange={(e) => setData('password', e.target.value)}
              required
            />
            <InputError message={errors.password} className="mt-2" />
          </div>

          <div className="mt-4">
            <InputLabel
              htmlFor="password_confirmation"
              value="Confirm Password"
            />
            <TextInput
              id="password_confirmation"
              type="password"
              name="password_confirmation"
              value={data.password_confirmation}
              className="mt-1 block w-full"
              autoComplete="new-password"
              onChange={(e) =>
                setData('password_confirmation', e.target.value)
              }
              required
            />
            <InputError
              message={errors.password_confirmation}
              className="mt-2"
            />
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center bg-primary-100">
          <PrimaryButton disabled={processing}>Register</PrimaryButton>
          <span className="mt-5">
            <Link
              href={route('login')}
              className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Already registered?
            </Link>
          </span>
        </div>
      </form>
    </GuestLayout>
  );
}
