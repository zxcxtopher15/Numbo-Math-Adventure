import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', id = '', isFocused = false, placeholder = '', ...props },
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
        <input
            {...props}
            type={type}
            id={id}
            className={
                'rounded-2xl h-14 bg-gray-50 border-gray-300 shadow-sm focus:border-warning focus:ring-warning ' +
                className
            }
            placeholder={placeholder}
            ref={localRef}
        />
    );
});
