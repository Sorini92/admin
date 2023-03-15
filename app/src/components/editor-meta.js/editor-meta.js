import React from "react";
import { useState, useRef, useEffect } from 'react';

const EditorMeta = ({modal, target, virtualDom}) => {
    
    const [meta, setMeta] = useState({
        title: '',
        keywords: '',
        description: ''
    });

    const title = useRef(null);
    const keywords = useRef(null);
    const description = useRef(null);

    useEffect(() => {
        getMeta(virtualDom);
    }, [virtualDom])

    const getMeta = (virtualDom) => {
        title.current = virtualDom.head.querySelector('title') || virtualDom.head.appendChild(virtualDom.createElement('title'));

        keywords.current = virtualDom.head.querySelector('meta[name="keywords"]');
        if (!keywords.current) {
            keywords.current = virtualDom.head.appendChild(virtualDom.createElement('meta'));
            keywords.current.setAttribute("name", "keywords");
            keywords.current.setAttribute("content", "");
        }
        
        description.current = virtualDom.head.querySelector('meta[name="description"]');
        if (!description.current) {
            description.current = virtualDom.head.appendChild(virtualDom.createElement('meta'));
            description.current.setAttribute("name", "description");
            description.current.setAttribute("content", "");
        }
        setMeta({
            title: title.current.innerHTML,
            keywords: keywords.current.getAttribute("content"),
            description: description.current.getAttribute("content")
        })
    }

    const applyMeta = () => {
        title.current.innerHTML = meta.title;
        keywords.current.setAttribute("content", meta.keywords);
        description.current.setAttribute("content", meta.description);
    }

    const onValueChange = (e) => {
        if (e.target.getAttribute("data-title")) {
            e.persist();
            setMeta((prevState) => {
                const newMeta = {
                    ...prevState,
                    title: e.target.value
                }

                return newMeta;
            })
        } else if (e.target.getAttribute("data-keywords")) {
            e.persist();
            setMeta((prevState) => {
                const newMeta = {
                    ...prevState,
                    keywords: e.target.value
                }

                return newMeta;
            })
        } else {
            e.persist();
            setMeta((prevState) => {
                const newMeta = {
                    ...prevState,
                    description: e.target.value
                }

                return newMeta;
            })
        }
    }

    return (
        <div id={target} uk-modal={modal.toString()} container="false">
            <div className="uk-modal-dialog uk-modal-body">
                <h2 className="uk-modal-title">Редактирование Meta-тэгов</h2>
                <form>
                    <div className="uk-margin">
                        <input 
                            data-title
                            className="uk-input" 
                            type="text" placeholder="Title" 
                            aria-label="Input" 
                            value={meta.title}
                            onChange={(e) => onValueChange(e)}/>
                    </div>

                    <div className="uk-margin">
                        <textarea 
                            data-keywords
                            className="uk-textarea" 
                            rows="5" placeholder="Keywords" 
                            aria-label="Textarea" 
                            value={meta.keywords}
                            onChange={(e) => onValueChange(e)}>
                        </textarea>
                    </div>
                    <div className="uk-margin">
                        <textarea 
                            data-description
                            className="uk-textarea" 
                            rows="5" placeholder="Description" 
                            aria-label="Textarea" 
                            value={meta.description}
                            onChange={(e) => onValueChange(e)}>
                        </textarea>
                    </div>
                </form>

                <p className="uk-text-right">
                    <button 
                        className="uk-button uk-button-default uk-margin-small-right uk-modal-close" 
                        type="button">Отменить
                    </button>
                    <button 
                        className="uk-button uk-button-primary uk-modal-close" 
                        type="button"
                        onClick={() => applyMeta()}>Применить
                    </button>
                </p>
            </div>
        </div>
    )
}

export default EditorMeta;