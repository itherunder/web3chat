
export function checkType(file, typeList) {
    if (!typeList.includes(file.type)) {
        alert('wrong file type');
        return false;
    }
    return true;
}

// MB
export function checkSize(file, size) {
    if (file.size / 1024 / 1024 > size) {
        alert('too big size');
        return false;
    }
    return true;
}
