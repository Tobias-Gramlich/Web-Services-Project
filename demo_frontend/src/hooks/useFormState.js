import { useState } from 'react';

export function useFormState(initialState) {
  const [values, setValues] = useState(initialState);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function reset(nextState = initialState) {
    setValues(nextState);
  }

  return {
    values,
    setValues,
    handleChange,
    reset,
  };
}
