import * as React from 'react';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import DOMHelper from '../../helpers/dom-helper.js';
import editorText from '../editor-text/editor-text';
import "../../helpers/iframeLoader.js";
import UIkit from 'uikit';
import Spinner from '../spinner/spinner';
import ConfirmModal from '../confirm-modal/confirm-modal.js';
import ChooseModal from '../choose-modal/choose-modal.js';
import Panel from '../panel/panel.js';
import EditorMeta from '../editor-meta.js/editor-meta.js';
import EditorImages from '../editor-images/editor-images.js';
import Login from '../login/login.js';

export default function Editor() {

    const [pageList, setPageList] = useState([]);
    const [backupsList, setBackupsList] = useState([]);
    const [currentPage, setCurrentPage] = useState("index.html");
    const [loading, setLoading] = useState(true);
    const [authorization, setAuthorization] = useState(false);
    const [loginError, setLoginError] = useState(false);
    const [loginLengthError, setLoginLengthError] = useState(false);

    const iframe = useRef(null)
    const virtualDom = useRef(null)
    const modal = useRef(true);

    const {parseStrToDOM, wrapTextNodes, serializeDOMToString, unwrapTextNodes, wrapImages, unwrapImages} = DOMHelper();
    const {onTextEdit} = editorText();
    const {onImageEdit} = EditorImages();

    useEffect(() => {
        checkAuth();
    }, [])

    useEffect (() => {
        init(null, currentPage);
    }, [authorization])

    const checkAuth = () => {
        axios
            .get("./api/checkAuth.php")
            .then(res => setAuthorization(res.data.authorization))
    }
    
    const login = (password) => {
        if (password.length > 4) {
            axios
                .post('./api/login.php', {"password": password})
                .then(res => {
                    setAuthorization(res.data.authorization);
                    setLoginError(!res.data.authorization),
                    setLoginLengthError(false);
                })
        } else {
            setLoginError(false),
            setLoginLengthError(true);
        }
    }

    const logout = () => {
        axios
            .get("./api/logout.php")
            .then(() => {
                window.location.replace("/");
            })
    }

    const init = (e, page) => {
        if (e) {
            e.preventDefault();
        }
        if (authorization) {
            isLoading();
            open(page, isLoaded);
            loadPageList();
            loadBackupsList();
        }
    }

    const open = (page, callback) => {
        setCurrentPage(page);
        
        axios
            .get(`../${page}?rnd=${Math.random()}`)
            .then(res => parseStrToDOM(res.data))
            .then(wrapTextNodes)
            .then(wrapImages)
            .then(dom => {
                virtualDom.current = dom;
                return dom;
            })
            .then(serializeDOMToString)
            .then(html => axios.post("./api/saveTempPage.php", {html}))
            .then(() => iframe.current.load("../sdd22233sdsd.html"))
            .then(() => axios.post("./api/deleteTempPage.php"))
            .then(() => enableEditing())
            .then(() => injectStyles())
            .then(callback)

        loadBackupsList();
    }

    const save = async () => {
        isLoading();
        const newDom = virtualDom.current.cloneNode(virtualDom.current);
        unwrapTextNodes(newDom);
        unwrapImages(newDom)
        const html = serializeDOMToString(newDom);
        await axios
            .post("./api/savePage.php", {pageName: currentPage, html})
            .then(() => showNotifications('Успешно сохранено', 'success'))
            .catch(() => showNotifications('Ошибка сохранения', 'danger'))
            .finally(isLoaded)
        
        loadBackupsList();
    }

    const enableEditing = () => {
        iframe.current.contentDocument.body.querySelectorAll("text-editor").forEach(element => {
            const id = element.getAttribute("nodeid");
            let virtualElement = virtualDom.current.body.querySelector(`[nodeid="${id}"]`);
            onTextEdit(element, virtualElement);
        })

        iframe.current.contentDocument.body.querySelectorAll("[editableimgid]").forEach(element => {
            const id = element.getAttribute("editableimgid");
            let virtualElement = virtualDom.current.body.querySelector(`[editableimgid="${id}"]`);
            onImageEdit(element, virtualElement, isLoading, isLoaded, showNotifications);
        })
    }

    const injectStyles = () => {
        const style = iframe.current.contentDocument.createElement("style");
        style.innerHTML=`
            text-editor:hover {
                outline: 3px solid orange;
                outline-offset: 8px;
            }
            text-editor:focus {
                outline: 3px solid red;
                outline-offset: 8px;
            }
            [editableimgid]:hover {
                outline: 3px solid orange;
                outline-offset: 8px;
            }
        `
        iframe.current.contentDocument.head.appendChild(style);
    }

    const showNotifications = (message, status) => {
        UIkit.notification({message, status});
    }

    const loadPageList = () => {
        axios
            .get("./api/pageList.php")
            .then(res => setPageList(res.data))
    }
    
    const loadBackupsList = () => {
        axios
            .get("./backups/backups.json")
            .then(res => setBackupsList(res.data.filter(backup => {
                return backup.page === currentPage
            })))
    }

    const restoreBackup = (e, backup) => {
        if (e) {
            e.preventDefault();
        }
        UIkit.modal.confirm("Вы действительно хотите восстановить страницу из этой резервной копии? Все несохраненные данные будут утеряны!", {labels: {ok: 'Восстановить', cancel: "Отмена"}})
        .then(() => {
            isLoading();
            return axios
                    .post('./api/restoreBackup.php', {"page": currentPage, "file": backup});
        })
        .then(() => {
            open(currentPage, isLoaded);
        })
    }

    const isLoading = () => {
        setLoading(true);
    }

    const isLoaded = () => {
        setLoading(false);
    }

    if (!authorization) {
        return <Login login={login} lengthErr={loginLengthError} loginErr={loginError}/>
    }

    return (
        <>
            {/* <iframe src={currentPage} ref={iframe}></iframe> */}
            {!loading ? <iframe src="" ref={iframe}></iframe> : <iframe style={{visibility: "hidden"}} src="" ref={iframe}></iframe>}
            {loading ? <Spinner active/> : <Spinner/>}



            <input id="img-upload" type="file" accept="image/*" style={{display: 'none'}}/>

            <Panel virtualDom={virtualDom.current}/>

            <ConfirmModal 
                modal={modal.current} 
                target={'modal-save'} 
                method={save}
                text={{
                    title: "Сохранение",
                    descr: "Вы действительно хотите сохранить изменения?",
                    btn: "Опубликовать"
                }}/>
            
            <ConfirmModal 
                modal={modal.current} 
                target={'modal-logout'} 
                method={logout}
                text={{
                    title: "Выход",
                    descr: "Вы действительно хотите выйти?",
                    btn: "Выйти"
                }}/>
            
            <ChooseModal modal={modal.current} target={'modal-open'} data={pageList} redirect={init}/>
            <ChooseModal modal={modal.current} target={'modal-backup'} data={backupsList} redirect={restoreBackup}/>
            {virtualDom.current ? <EditorMeta  modal={modal.current} target={'modal-meta'} virtualDom={virtualDom.current}/> : false}
        </>
    )
}