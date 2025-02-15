import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function SelectInput(
    { className = '', isFocused = false, placeholder = '', children, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <select
            {...props}
            className={
                'rounded-2xl h-14 bg-gray-50 border-gray-300 shadow-sm focus:border-warning focus:ring-warning w-full ' +
                className
            }
            ref={localRef}
        >
            {placeholder && <option value="">{placeholder}</option>}
            {children}
        </select>
    );
});
