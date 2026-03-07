const validatePassword = (password) => {
    //* Regex for valid Password
    const regexCapitalLetter = new RegExp("[A-Z]+");
    const regexSmallLetter = new RegExp("[a-z]+");
    const regexNumber = new RegExp("[0-9]+");
    const regexSpecialCharacters = new RegExp("^(?=.*[!@#$%^&*]).+$");

    //* Max and Min Length
    const maxLength = 30;
    const minLength = 8;

    //* Test for valid Format
    if (!regexCapitalLetter.test(password)) return {success: false, error: "Password must contain a Capital Letter"};
    if (!regexSmallLetter.test(password)) return {success: false, error: "Password must contain a Small Letter"};
    if (!regexNumber.test(password)) return {success: false, error: "Password must contain a Number"};
    if (!regexSpecialCharacters.test(password)) return {success: false, error: "Password must contain a Special Character"};
    if(password.length < minLength) return {success: false, error: `Password must be longer than ${minLength - 1} Characters`};
    if(password.length > maxLength) return {success: false, error: `Password must be shorter than ${maxLength + 1} Characters`};

    //* Return Success
    return {success: true};
};

module.exports = {validatePassword}; 