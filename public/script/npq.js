window.onload = function () {
    new NPQ();
};

class NPQ {
    constructor() {
        this.numPlayerMax = 5;
        Common.popuplateSelect('selectMatchType', 'Xin chọn!', window.dataCore.match.type);
        Common.popuplateSelect('selectMatchResult', 'Xin chọn!', window.dataCore.match.typeResult);
        Common.popuplateSelect('selectMatchCalculation', 'Xin chọn!', window.dataCore.match.calculation);
        this.addUploadFunction();
        this.popupdateSelectDetail();

        let parent = this;
        document.getElementById('buttonSubmit').onclick = function () {
            let sendData = parent.createSendData();
            let checkResult = parent.validateData(sendData);
            if (checkResult.result == false) {
                checkResult.message = ['<b>Các chi tiết sau không hợp lệ:</b>'].concat(checkResult.message);
                Common.showMessage(checkResult.message.join('<br>'));
                return;
            }
            parent.sendData(sendData);
        };
    };

    addUploadFunction() {
        let parent = this;
        let button = document.getElementById('buttonUpload');
        let divPreview = document.getElementById('divPreviewImage');
        button.onclick = function () {
            let divWaiting = Common.showWaiting();
            let inputFile = document.createElement('input');
            inputFile.type = 'file';
            inputFile.accept = 'image/jpeg, image/jpg';
            inputFile.onchange = function () {
                let file = inputFile.files[0];
                let reader = new FileReader();
                reader.onloadend = function () {
                    let base64Src = reader.result;
                    if (base64Src == null) {
                        Common.hideWaiting(divWaiting);
                        Common.showMessage('Hình vừa chọn không có dữ liệu hay dữ liệu xấu.<b>' +
                            + 'Xin vui lòng kiểm tra lại!');
                        return;
                    }
                    parent.previewImageBase64 = base64Src;
                    divPreview.style.backgroundImage = `url(${base64Src})`;
                    Common.hideWaiting(divWaiting);
                };
                reader.onerror = function (error) {
                    Common.hideWaiting(divWaiting);
                    Common.showMessage('Không thể đọc được hình vừa chọn.<br>' + error + '<br>Xin vui lòng kiểm tra lại!');
                };
                reader.readAsDataURL(file);
            };
            inputFile.click();
        };
    };

    popupdateSelectDetail() {
        let data = [
            { id: 'selectPlayer', data: window.dataCore.match.player, },
            { id: 'selectNick', data: window.dataCore.match.nick, },
            { id: 'selectChar', data: window.dataCore.match.character, },
            { id: 'selectRole', data: window.dataCore.match.role, },
        ];
        for (let i = 1; i <= this.numPlayerMax; i++) {
            for (let j = 0; j < data.length; j++) {
                let object = data[j];
                let id = `${object.id}${i}`;
                Common.popuplateSelect(id, 'Xin chọn!', object.data);
            }
        }
    };

    createSendData() {
        let sendData = {};
        sendData.date = document.getElementById('inputMatchDate').value.trim();
        sendData.hour = parseInt(document.getElementById('inputMatchHour').value.trim());
        sendData.minute = parseInt(document.getElementById('inputMatchMinute').value.trim());
        sendData.matchType = document.getElementById('selectMatchType').value.trim();
        sendData.matchResult = document.getElementById('selectMatchResult').value.trim();
        sendData.matchCalculation = document.getElementById('selectMatchCalculation').value.trim();
        sendData.previewImageBase64 = this.previewImageBase64;
        sendData.detail = [];
        for (let i = 1; i <= this.numPlayerMax; i++) {
            let object = {
                player: document.getElementById(`selectPlayer${i}`).value.trim(),
                nick: document.getElementById(`selectNick${i}`).value.trim(),
                char: document.getElementById(`selectChar${i}`).value.trim(),
                role: document.getElementById(`selectRole${i}`).value.trim(),
                k: parseInt(document.getElementById(`inputK${i}`).value.trim()),
                d: parseInt(document.getElementById(`inputD${i}`).value.trim()),
                a: parseInt(document.getElementById(`inputA${i}`).value.trim()),
                score: document.getElementById(`inputScore${i}`).value.trim(),
            };
            sendData.detail.push(object);
        }
        console.log(sendData);
        return sendData;
    };

    validateData(sendData) {
        let message = this.validateMatchData(sendData);
        let countValidPosition = 0;
        for (let i = this.numPlayerMax; i >= 1; i--) {
            let result = this.validateMatchDetailObject(sendData.detail[i - 1], i);
            if (result === false) {
                sendData.detail.splice(i, 1);
                continue;
            }
            if (result.length == 0) {
                countValidPosition = countValidPosition + 1;
                continue;
            }
            sendData.detail.splice(i, 1);
            message = message.concat(result);
        }
        if (countValidPosition < 2) {
            message.push('Phải có dữ liệu của ít nhất 2 vị trí');
        }
        if (message.length > 0) {
            return {
                result: false,
                message,
            };
        }
        return {
            result: true,
        };
    };

    validateMatchData(sendData) {
        let message = [];
        if (!Common.isNumeric(sendData.hour) || sendData.hour < 0 || sendData.hour > 23) {
            message.push('Match hour');
        }
        if (!Common.isNumeric(sendData.minute) || sendData.minute < 0 || sendData.minute > 59) {
            message.push('Match minute');
        }
        if (window.dataCore.match.type[sendData.matchType] == null) {
            message.push('Match type');
        }
        if (window.dataCore.match.typeResult[sendData.matchResult] == null) {
            message.push('Match result');
        }
        if (window.dataCore.match.calculation[sendData.matchCalculation] == null) {
            message.push('Match calculation');
        }
        if (sendData.previewImageBase64 == null || sendData.previewImageBase64.trim() == '') {
            message.push('Match image');
        }
        return message;
    };

    validateMatchDetailObject(object, id) {
        let message = [];
        if (object.player == 'null' && object.nick == 'null' && object.role == 'null' &&
            isNaN(object.k) && isNaN(object.d) && isNaN(object.a) &&
            object.score == '') {
            return false;
        }
        if (object.player == 'null') {
            message.push(`Người chơi ${id}`);
        }
        if (object.nick == 'null') {
            message.push(`Nick ${id}`);
        }
        if (object.role == 'null') {
            message.push(`Vị trí ${id}`);
        }
        if (isNaN(object.k)) {
            message.push(`Kill ${id}`);
        }
        if (isNaN(object.d)) {
            message.push(`Death ${id}`);
        }
        if (isNaN(object.a)) {
            message.push(`Assist ${id}`);
        }
        if (object.score == '' || object.score.length != 4 || object.score.match(/\d\d\d\d/).length != 1) {
            message.push(`Score ${id}`);
        }
        return message;
    };

    async sendData(data) {
        let divWaiting = Common.showWaiting();
        let response = await Common.sendToBackend('data/save', data);
        Common.hideWaiting(divWaiting);
        let message = 'Thao tác thành công.';
        if (response.success == false) {
            message = `Gặp lỗi ${response.code}.`;
        }
        Common.showMessage(message);
    };
};