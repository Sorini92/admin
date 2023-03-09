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

export default function Editor() {

    const [pageList, setPageList] = useState([]);
    const [backupsList, setBackupsList] = useState([]);
    const [currentPage, setCurrentPage] = useState("index.html");
    const [loading, setLoading] = useState(true);

    const iframe = useRef(null)
    const virtualDom = useRef(null)
    const modal = useRef(true);

    const {parseStrToDOM, wrapTextNodes, serializeDOMToString,unwrapTextNodes} = DOMHelper();
    const {onTextEdit} = editorText();

    useEffect(() => {
        init(null, currentPage);
    }, [])

    const init = (e, page) => {
        if (e) {
            e.preventDefault();
        }
        isLoading();
        open(page, isLoaded);
        loadPageList();
        loadBackupsList();
    }

    const open = (page, callback) => {
        setCurrentPage(page);
        
        axios
            .get(`../${page}?rnd=${Math.random()}`)
            .then(res => parseStrToDOM(res.data))
            .then(wrapTextNodes)
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

    const save = async (onSuccess, onError) => {
        isLoading();
        const newDom = virtualDom.current.cloneNode(virtualDom.current);
        unwrapTextNodes(newDom);
        const html = serializeDOMToString(newDom);
        await axios
            .post("./api/savePage.php", {pageName: currentPage, html})
            .then(onSuccess)
            .catch(onError)
            .finally(isLoaded)
        
        loadBackupsList();
    }

    const enableEditing = () => {
        iframe.current.contentDocument.body.querySelectorAll("text-editor").forEach(element => {
            const id = element.getAttribute("nodeid");
            let virtualElement = virtualDom.current.body.querySelector(`[nodeid="${id}"]`);
            onTextEdit(element, virtualElement);
        })
    }

    const injectStyles = () => {
        const style = iframe.current.contentDocument.createElement("style");
        style.innerHTML=`
            text-editor:hover {
                z-index: 10;
                outline: 3px solid orange;
                outline-offset: 8px;
            }
            text-editor:focus {
                z-index: 10;
                outline: 3px solid red;
                outline-offset: 8px;
            }
        `
        iframe.current.contentDocument.head.appendChild(style);
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

    return (
        <>
            {/* <iframe src={currentPage} ref={iframe}></iframe> */}
            {!loading ? <iframe src="" ref={iframe}></iframe> : <iframe style={{visibility: "hidden"}} src="" ref={iframe}></iframe>}
            {loading ? <Spinner active/> : <Spinner/>}

            <Panel/>

            <ConfirmModal modal={modal} target={'modal-save'} method={save}/>
            <ChooseModal modal={modal} target={'modal-open'} data={pageList} redirect={init}/>
            <ChooseModal modal={modal} target={'modal-backup'} data={backupsList} redirect={restoreBackup}/>
            {virtualDom.current ? <EditorMeta  modal={modal} target={'modal-meta'} virtualDom={virtualDom.current}/> : false}
        </>
    )
}