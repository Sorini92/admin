const DOMHelper = () => {

    const parseStrToDOM = (str) => {
        const parser = new DOMParser();
        return parser.parseFromString(str, "text/html");
    }
    
    const wrapTextNodes = (dom) => {
        const body = dom.body;
        let textNodes = [];

        function recursy (element) {
            element.childNodes.forEach(node => {
                if (node.nodeName === "#text" && node.nodeValue.replace(/\s+/g, "").length > 0) {
                    textNodes.push(node);
                } else {
                    recursy(node);
                }
            })
        }

        recursy(body);

        textNodes.forEach((node, i) => {
            const wrapper = dom.createElement('text-editor');
            node.parentNode.replaceChild(wrapper, node);
            wrapper.appendChild(node);
            wrapper.setAttribute("nodeid", i);
        });

        return dom;
    }

    const serializeDOMToString = (dom) => {
        const serializer = new XMLSerializer();
        return serializer.serializeToString(dom);
    }

    const unwrapTextNodes = (dom) => {
        dom.body.querySelectorAll("text-editor").forEach(element => {
            element.parentNode.replaceChild(element.firstChild, element);
        })
    }

    return {
        parseStrToDOM,
        wrapTextNodes,
        serializeDOMToString,
        unwrapTextNodes
    }
}

export default DOMHelper;