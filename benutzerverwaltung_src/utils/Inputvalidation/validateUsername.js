const validateUsername = (username) => {
    //* Regex for valid Username
    const regexOnlyLetters = new RegExp("^[a-zA-Z]+$");

    //* Max and Min Length
    const maxLetters = 20;
    const minLetters = 3;

    //* Test for valid Format
    if (!regexOnlyLetters.test(username)) return {success: false, error: "Username must only be letters"};
    if (username.length < minLetters) return {success: false, error: `Username must be longer than ${minLetters - 1} Letters`};
    if (username.length > maxLetters) return {success: false, error: `Username must be shorter than ${maxLetters + 1} Letters`};

    //* Return Success
    return {success: true};
};

module.exports = {validateUsername};