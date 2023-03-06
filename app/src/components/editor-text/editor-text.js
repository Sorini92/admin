const editorText = () => {

    const onTextEdit = (element, virtualElement) => {
        element.addEventListener("click", () => {
            element.contentEditable = "true";
            element.focus();
        });

        element.addEventListener("blur", () => {
            element.removeAttribute('contenteditable');
        });

        element.addEventListener("keypress", (e) => {
            if(e.keyCode === 13) {
                element.blur();
            }
        });

        element.addEventListener("input", () => {
            virtualElement.innerHTML = element.innerHTML;
        });

        if (element.parentNode.nodeName === "A" || element.parentNode.nodeName === "BUTTON") {
            element.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                element.contentEditable = "true";
                element.focus();
            });
        }
    }

    return {
        onTextEdit
    }
}

export default editorText;