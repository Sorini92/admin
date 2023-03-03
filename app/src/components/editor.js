import * as React from 'react';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import DOMHelper from '../helpers/dom-helper.js';
import "../../src/helpers/iframeLoader.js";

export default function Editor() {

    const [pageList, setPageList] = useState([]);
    const [newPageName, setNewPageName] = useState("");
    const [currentPage, setCurrentPage] = useState("index.html");

    const iframe = useRef(null)
    const virtualDom = useRef(null)

    const {parseStrToDOM, wrapTextNodes, serializeDOMToString,unwrapTextNodes} = DOMHelper();

    useEffect(() => {
        init(currentPage);
    }, [])

    const init = (page) => {
        open(page);
        loadPageList();
    }

    const open = (page) => {
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
    }

    const save = () => {
        const newDom = virtualDom.current.cloneNode(virtualDom);
        unwrapTextNodes(newDom);
        const html = serializeDOMToString(newDom);
        axios
            .post("./api/savePage.php", {pageName: currentPage, html})
    }

    const enableEditing = () => {
        iframe.current.contentDocument.body.querySelectorAll("text-editor").forEach(element => {
            element.contentEditable = "true";
            element.addEventListener("input", () => {
                onTextEdit(element);
            })
        })
    }

    const onTextEdit = (element) => {
        const id = element.getAttribute("nodeid");

        virtualDom.current.body.querySelector(`[nodeid="${id}"]`).innerHTML = element.innerHTML;
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

    return (
        <>
            <button onClick={() => save()}>Click</button>
            <iframe src={currentPage} ref={iframe}></iframe>
            {/* <input
                onChange={(e) => setNewPageName(e.target.value)} 
                type="text"/>
            <button onClick={createNewPage}>Создать страницу</button>
            {pages} */}
        </>
    )
}