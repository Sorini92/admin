import axios from 'axios';

const EditorImages = () => {

    const onImageEdit = (element, virtualElement, ...[isLoading, isLoaded, showNotifications]) => {
        let imgUploader = document.querySelector("#img-upload");

        element.addEventListener('click', () => {
            imgUploader.click();
            imgUploader.addEventListener("change", () => {
                if (imgUploader.files && imgUploader.files[0]) {
                    let formData = new FormData();
                    formData.append("image", imgUploader.files[0]);
                    isLoading();
                    axios
                        .post('./api/uploadImage.php', formData, {
                            headers: {
                                "Content-Type": "multipart/form-data"
                            }
                        })
                        .then((res) => {
                            virtualElement.src = `./img/${res.data.src}`;
                            element.src = `./img/${res.data.src}`;
                        })
                        .catch(() => showNotifications('Ошибка сохранения', 'danger'))
                        .finally(() => {
                            imgUploader.value = "";
                            isLoaded();
                        })
                }
            })
        })
    }

    return {
        onImageEdit
    }
}

export default EditorImages;