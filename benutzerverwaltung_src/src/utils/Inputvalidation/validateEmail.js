const validateEmail = (email) => {
    //* Regex for valid EMail Format
    const regexEmail = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$");

    //* Max and Min Length
    const maxLength = 64;
    const minLength = 8;

    //* Test for valid Format
    if (!regexEmail.test(email)) return {success: false, error: "EMail has no a valid format"};
    if (email.length < minLength) return {success: false, error: `EMail must be longer than ${minLength - 1} Characters`};
    if (email.length > maxLength) return {success: false, error: `EMail must be shorter than ${maxLength + 1} Characters`};
    
    //* Return Success
    return {success: true};
};

module.exports = {validateEmail};
