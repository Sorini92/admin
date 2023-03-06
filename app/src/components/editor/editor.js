import * as React from 'react';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import DOMHelper from '../../helpers/dom-helper.js';
import editorText from '../editor-text/editor-text';
import "../../helpers/iframeLoader.js";
import UIkit from 'uikit';
import Spinner from '../spinner/spinner';

export default function Editor() {

    const [pageList, setPageList] = useState([]);
    const [newPageName, setNewPageName] = useState("");
    const [currentPage, setCurrentPage] = useState("index.html");
    const [loading, setLoading] = useState(true);

    const iframe = useRef(null)
    const virtualDom = useRef(null)
    const modal = useRef(true);

    const {parseStrToDOM, wrapTextNodes, serializeDOMToString,unwrapTextNodes} = DOMHelper();
    const {onTextEdit} = editorText();

    useEffect(() => {
        init(currentPage);
    }, [])

    const init = (page) => {
        open(page, isLoaded);
        loadPageList();
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
            .then(() => iframe.current.load("../temp.html"))
            .then(() => enableEditing())
            .then(() => injectStyles())
            .then(callback)
    }

    const save = (onSuccess, onError) => {
        isLoading();
        const newDom = virtualDom.current.cloneNode(virtualDom);
        unwrapTextNodes(newDom);
        const html = serializeDOMToString(newDom);
        axios
            .post("./api/savePage.php", {pageName: currentPage, html})
            .then(onSuccess)
            .catch(onError)
            .finally(isLoaded)
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
            .get("./api")
            .then(res => setPageList(res.data))
    }

    const createNewPage = () => {
        axios
            .post("./api/createNewPage.php", {"name": newPageName})
            .then(() => loadPageList())
            .catch(() => alert("Страница уже существует!"));
    }

    const deletePage = (page) => {
        axios
            .post("./api/deletePage.php", {"name": page})
            .then(() => loadPageList())
            .catch(() => alert("Страницы не существует!"));
    }

    const pages = pageList.map((page, i) => {
        return (
            <h1 key={i}>{page}
                <a 
                href="#"
                onClick={() => deletePage(page)}>
                    (x)
                </a>
            </h1>
        )
    });

    const isLoading = () => {
        setLoading(true);
    }

    const isLoaded = () => {
        setLoading(false);
    }

    return (
        <>
            {/* <iframe src={currentPage} ref={iframe}></iframe> */}
            {!loading ? <iframe src={currentPage} ref={iframe}></iframe> : <iframe style={{visibility: "hidden"}} src={currentPage} ref={iframe}></iframe>}
            {loading ? <Spinner active/> : <Spinner/>}

            <div className='panel'>
                <button className='uk-button uk-button-primary' uk-toggle="target: #modal-save">Опубликовать</button>
            </div>

            <div id="modal-save" uk-modal={modal.toString()}>
                <div className="uk-modal-dialog uk-modal-body">
                    <h2 className="uk-modal-title">Сохранение</h2>
                    <p>Вы действительно хотите сохранить изменения?</p>
                    <p className="uk-text-right">
                        <button className="uk-button uk-button-default uk-modal-close" type="button">Отменить</button>
                        <button 
                            className="uk-button uk-button-primary uk-modal-close" 
                            type="button" 
                            onClick={() => save(() => {
                                UIkit.notification({message: 'Успешно сохранено', status: 'success'})
                            },
                            () => {
                                UIkit.notification({message: 'Ошибка сохранения', status: 'danger'})
                            })}>
                                Опубликовать
                        </button>
                    </p>
                </div>
            </div>
        </>
    )
}