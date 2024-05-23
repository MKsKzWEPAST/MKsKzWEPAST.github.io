(function (window) {
    const Folio = function () {};

    Folio.prototype.FOLIO_ID = 'folio-sdk-element';
    Folio.prototype.FOLIO_CLOSE_PREFIX = 'folio:close:';

    Folio.prototype.init = function (options) {
        options = options || {};
        if (!options.jwt) throw 'JWT is required for Folio sdk initialization';
        if (!options.requestId) throw 'Request id is required for Folio sdk initialization';

        const defaultSettings = {
            documentCaptureBtnShowTimeout: 15000,
            documentCaptureBtnShowNoTryTimeout: 45000,
            cameraMinHeight: 720,
            captureTimeout: 45000,
            captureDocumentTimeout: 30000,
            backsideRequired: true,
        };
        if (!options.settings) options.settings = {};
        Object.keys(defaultSettings).forEach((key) => {
            options.settings[key] = options.settings[key] ? options.settings[key] : defaultSettings[key];
        });

        this.jwt = options.jwt;
        this.requestId = options.requestId;
        this.settings = options.settings;

        if (!this.callbacks) {
            this.callbacks = [];
        }

        this.inited = true;
        return this;
    };

    Folio.prototype.register = function (options) {
        if (options) {
            this.init(options);
        }
        this._checkInited();

        const html = `
        <style>
            .folio-wrapper {
                position: absolute;
                top: 0; bottom: 0; left: 0; right: 0;
                background-color: rgba(0, 0, 0, 0.75);
            }
            .folio-wrapper > iframe {
                width: 100%;
                height: 100%;
                display: block;
                border: 0;
            }
        </style>
        <div class="folio-wrapper">
            <iframe
                allowtransparency="true"
                scrolling="no"
                allow="camera"
                data-folio-settings="{{settings}}"
                src="https://webapi-demo.folioltd.com{{params}}"
            >
        </div>
        `;

        const settings = window.btoa(JSON.stringify(this.settings));
        const params = `?jwt=${this.jwt}&rid=${this.requestId}`;
        const paramsWithSettings = `${params}&s=${settings}`;

        const folioSdkContent = document.createElement('div');
        folioSdkContent.setAttribute("id", this.FOLIO_ID);
        folioSdkContent.style.cssText = 'position: absolute;top: 0;left: 0;right: 0;bottom: 0;z-index: 100000;';
        folioSdkContent.innerHTML += html
            .replace('{{params}}', paramsWithSettings.length > 1900 ? params : paramsWithSettings)
            .replace('{{settings}}', settings);
        document.body.appendChild(folioSdkContent);

        window.addEventListener(
            'message',
            (event) => {
                const data = event.data;
                if (data && typeof data === 'string && data.startsWith(this.FOLIO_CLOSE_PREFIX)) {
                    const parts = event.data.split(this.FOLIO_CLOSE_PREFIX);
                    this.close(parts[1]);
                }
            },
            false
        );
    };

    Folio.prototype.close = function (message) {
        this._checkInited();
        const folioElement = document.getElementById(this.FOLIO_ID);
        if (folioElement) {
            folioElement.parentNode.removeChild(folioElement);
            this.complete(message);
        }
    };

    Folio.prototype.complete = function (data) {
        this._checkInited();
        if (data && this.callbacks && this.callbacks.length > 0) {
            for (let i = 0; i < this.callbacks.length; i++) {
                const cb = this.callbacks[i];
                cb.callback.call(cb.context, data);
            }
        }
    };

    Folio.prototype.onComplete = function (callback, context) {
        if (!this.callbacks) {
            this.callbacks = [];
        }
        this.callbacks.push({ callback: callback, context: context });
    };

    Folio.prototype._checkInited = function () {
        if (!this.inited) throw 'Folio sdk is not initialized (call init first)';
    };

    window.folio = new Folio();
})(window, undefined);
