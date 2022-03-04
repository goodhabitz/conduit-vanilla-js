"use strict";
export class CExampleComponent extends HTMLElement {
    constructor () {
        super();
        this.shadow = this.attachShadow({
            mode: 'open'
        });
        this._complete = 0;
    }

    get complete () {
        return this._complete;
    }

    set complete (val) {
        this.setAttribute('complete', val);
    }

    static get observedAttributes () { return ["complete"]; }

    attributeChangedCallback (name, oldValue, newValue) {
        // name will always be "complete" due to observedAttributes
        switch (name) {
            case 'complete': {
                this._complete = newValue;
                return;
            }
            default: 
                console.log(`attribute ${name} changed from ${oldValue} to ${newValue}`);
                return;
        }
    }

    connectedCallback () {
        this.shadow.innerHTML = this.render();
        var btn = this.shadow.querySelector('a');
        btn.addEventListener('click', this.increment.bind(this));
    }

    increment () {
        this._complete = +this._complete + +1;
        this.connectedCallback();
    }

    render () {
        return `
            <h1>test ${this.complete}</h1>
            <a>increment</a>
        `;
    }
}
