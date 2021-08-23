class Common {
    static createElement(elementTag, cssList, parent) {
        if (elementTag == null) {
            elementTag = 'div';
        }
        let element = document.createElement(elementTag);
        if (cssList == null) {
            cssList = [];
        }
        if (typeof (cssList) === 'string') {
            element.classList.add(cssList);
        } else {
            for (let i = 0; i < cssList.length; i++) {
                element.classList.add(cssList[i]);
            }
        }
        if (parent != null) {
            parent.appendChild(element);
        }
        return element;
    };

    static popuplateSelect(id, optionFirstText, data) {
        let select = document.getElementById(id);
        if (select == null) {
            select = document.createElement('select');
            select.id = id;
        }

        let optionFirst = document.createElement('option');
        optionFirst.value = null;
        optionFirst.innerText = optionFirstText;
        select.appendChild(optionFirst);

        let keyList = Object.keys(data);
        for (let i = 0; i < keyList.length; i++) {
            let key = keyList[i];
            let option = document.createElement('option');
            option.value = key;
            option.innerText = data[key].name;
            select.appendChild(option);
        }

        return select;
    };

    static sleep(ms) {
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve();
            }, ms);
        });
    };

    static isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };

    static showMessage(message, persist) {
        let div = document.createElement('div');
        div.classList.add('general-overlay');

        let divMessage = document.createElement('div');
        divMessage.classList.add('general-overlay-message');
        divMessage.innerHTML = message;
        div.appendChild(divMessage);

        document.body.appendChild(div);

        if (persist !== true) {
            div.onclick = function () {
                document.body.removeChild(div);
            };
        }
        return div;
    };

    static showWaiting() {
        let div = Common.showMessage('<b>Xin chờ</b>', true);
        return div;
    };

    static hideWaiting(div) {
        document.body.removeChild(div);
    };

    static sendToBackend(webPart, dataJson) {
        let url = window.backendURL + webPart;
        return new Promise(function (resolve, reject) {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        Common.parseJSON(this['response'])
                            .then(function (parseResult) {
                                let result = parseResult.result;
                                if (result != 0) {
                                    resolve({
                                        success: false,
                                        code: result,
                                    });
                                } else {
                                    resolve({
                                        success: true,
                                        result: parseResult,
                                    });
                                }
                            })
                            .catch(function () {
                                resolve({
                                    success: false,
                                    code: 1,
                                });
                            });
                    } else {
                        resolve({
                            success: false,
                            code: this.status,
                        });
                    }
                }
            }
            xmlhttp.onerror = function (xmlhttpErr) {
                reject(xmlhttpErr);
            }
            let params = '';
            for (let key in dataJson) {
                if (dataJson.hasOwnProperty(key)) {
                    params = params + key + '=' + dataJson[key] + '&';
                }
            }
            params = params.slice(0, -1);
            xmlhttp.open('POST', url, true);
            xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xmlhttp.setRequestHeader('cache', 'no-cahce');
            xmlhttp.send(params);
        });
    };

    static parseJSON(input) {
        return new Promise(function (resolve, reject) {
            let jsonRes = JSON.parse(input);
            if (jsonRes.success) {
                resolve(jsonRes);
            } else {
                reject(jsonRes);
            }
        });
    };





    static loadSVGAsXML(divParent, path, callback) {
        let loadXML = new XMLHttpRequest;
        if (loadXML != null) {
            loadXML.open("GET", path, true);
            loadXML.onreadystatechange = function () {
                if (loadXML.readyState == 4) {
                    if (loadXML.status == 200) {
                        divParent.innerHTML = divParent.innerHTML + loadXML.responseText;
                    } else {
                        console.log('Could not load "' + path + '" (' + loadXML.status + ')');
                    }
                    if (callback) {
                        callback();
                    }
                }
            };
            loadXML.send();
        }
    };

    static preloadImage(imageObject, minWaitTime, callback) {
        if (minWaitTime == null || minWaitTime < 0) {
            minWaitTime = 0;
        }
        window.imagePreload = {};
        let loaded = 0;
        let startTime = (new Date()).getTime();
        let keyList = Object.keys(imageObject);
        let onResponse = function () {
            loaded = loaded + 1;
            if (loaded < keyList.length) {
                return;
            }
            if (callback == null) {
                return;
            }
            let endTime = (new Date()).getTime();
            let loadingTime = endTime - startTime;
            console.log('Time for preloading ' + keyList.length + ' image(s): ' + loadingTime + 'ms.');
            let timeLeft = Math.max(minWaitTime - loadingTime, 0);
            window.setTimeout(function () {
                callback();
            }, timeLeft);
        };
        for (let i = 0; i < keyList.length; i++) {
            let key = keyList[i];
            let link = imageObject[key];
            if (link.includes('.svg')) {
                let loadXML = new XMLHttpRequest;
                if (loadXML != null) {
                    loadXML.open("GET", link, true);
                    loadXML.onreadystatechange = function () {
                        if (loadXML.readyState == 4 && loadXML.status == 200) {
                            window.imagePreload[key] = loadXML.responseText;
                            onResponse();
                        }
                    };
                    loadXML.send();
                }
            } else {
                window.imagePreload[key] = new Image();
                window.imagePreload[key].onload = onResponse;
                window.imagePreload[key].onerror = onResponse;
                window.imagePreload[key].src = link;
            }
        }
    };

    static preloadImageFromVersion(categoryList, minWaitTime, callback) {
        let imageObject = {};
        for (let i = 0; i < categoryList.length; i++) {
            let category = categoryList[i];
            let keyList = Object.keys(window.version.image[category]);
            for (let j = 0; j < keyList.length; j++) {
                let key = keyList[j];
                imageObject[key] = window.version.image[category][key];
            }
        }
        Common.preloadImage(imageObject, minWaitTime, callback);
    };

    static capitalizeFirstLetterOnly(string) {
        let lowerCase = string.toLowerCase();
        let wordList = lowerCase.split(' ');
        for (let i = 0; i < wordList.length; i++) {
            let word = wordList[i];
            if (word.length < 1) {
                continue;
            }
            wordList[i] = `${word[0].toUpperCase()}${word.slice(1)}`;
        }
        return wordList.join(' ');
    };

    static createDivParallax(divTarget, objectTarget, bgPercentStart, bgPercentEnd) {
        objectTarget = Common.createObjectParallax(divTarget, bgPercentStart, bgPercentEnd);
        if (objectTarget == null) {
            return;
        }
        objectTarget.divParent.addEventListener('scroll', function () {
            Common.handleParallax(objectTarget);
        });
        window.addEventListener('resize', function () {
            objectTarget = Common.createObjectParallax(divTarget, bgPercentStart, bgPercentEnd);
        });
    };

    static createObjectParallax(divTarget, bgPercentStart, bgPercentEnd, divParent) {
        if (divParent == null) {
            divParent = document.getElementsByClassName('general-content-outer')[0];
        }
        let totalPageHeight = divParent.scrollHeight;
        if (totalPageHeight <= window.innerHeight) {
            return;
        }
        let scrollTop = divParent.scrollTop;

        if (bgPercentStart == null) {
            bgPercentStart = 100;
        }
        if (bgPercentEnd == null) {
            bgPercentEnd = 0;
        }
        let bgDiff = bgPercentStart - bgPercentEnd;

        let rect = divTarget.getBoundingClientRect();
        let rectTop = rect.top + scrollTop;
        let rectBottom = rectTop + rect.height;
        let spaceTop = Math.min(window.innerHeight, rectTop);
        let parallaxStart = rectTop - spaceTop;
        let spaceBottom = Math.min(window.innerHeight, totalPageHeight - rectBottom);
        let parallaxEnd = rectBottom + spaceBottom - window.innerHeight;
        let parallaxDistance = parallaxEnd - parallaxStart;

        return {
            divParent,
            div: divTarget,
            start: parallaxStart,
            end: parallaxEnd,
            distance: parallaxDistance,
            bgPercentStart,
            bgPercentEnd,
            bgDiff,
        };
    };

    static handleParallax(objectParallax) {
        let divParent = objectParallax.divParent;
        let div = objectParallax.div;
        let scrollTop = divParent.scrollTop;
        if (scrollTop <= objectParallax.start) {
            div.style.backgroundPosition = `50% ${objectParallax.bgPercentStart}%`;
            return;
        }
        if (scrollTop > objectParallax.end) {
            div.style.backgroundPosition = `50% ${objectParallax.bgPercentEnd}%`;
            return;
        }
        let scrollDistance = scrollTop - objectParallax.start;
        let scrollPercentage =
            Math.floor(scrollDistance / objectParallax.distance * 100);
        let bgPercentage = objectParallax.bgDiff * scrollPercentage / 100;
        div.style.backgroundPosition = `50% ${objectParallax.bgPercentStart - bgPercentage}%`;
    };



    static showImage(path, caption, orientation) {
        let div = document.createElement('div');
        div.classList.add('general-overlay');
        div.classList.add('image-outer');
        if (orientation != null) {
            div.classList.add(orientation);
        }

        let img = document.createElement('img');
        img.classList.add('general-overlay-image-inner');
        img.src = path;
        div.appendChild(img);

        let divCaption = document.createElement('div');
        divCaption.classList.add('general-overlay-image-caption');
        div.appendChild(divCaption);

        let divCaptionInner = document.createElement('div');
        divCaption.appendChild(divCaptionInner);
        let span = document.createElement('span');
        span.innerHTML = caption;
        divCaptionInner.appendChild(span);

        document.body.appendChild(div);
        div.onclick = function () {
            document.body.removeChild(div);
        };
    };


    static getURLParameter(sParam, locationSearch) {
        if (locationSearch == null) {
            locationSearch = document.location.search;
        }
        let sPageURL = locationSearch.substring(1);
        let sURLVariables = sPageURL.split('&');
        for (let i = 0; i < sURLVariables.length; i++) {
            let sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0].trim() == sParam) {
                return sParameterName[1].trim();
            }
        }
    };
};

class TextBox {
    constructor(placeholder, id) {
        this.div = document.createElement('div');
        this.div.classList.add('general-text-box-outer');

        this.input = document.createElement('input');
        this.input.classList.add('general-input-text');
        this.input.placeholder = placeholder;
        if (id != null) {
            this.input.id = id;
        }
        this.div.appendChild(this.input);
    };
};

class TextArea {
    constructor(placeholder, id) {
        this.div = document.createElement('div');
        this.div.classList.add('general-text-box-outer');

        this.input = document.createElement('textarea');
        this.input.classList.add('general-input-text');
        this.input.classList.add('text-area');
        this.input.placeholder = placeholder;
        if (id != null) {
            this.input.id = id;
        }
        this.div.appendChild(this.input);
    };
}