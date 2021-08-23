window.onload = function () {
    new NPQ();
};

class NPQ {
    constructor() {
        this.numPlayerMax = 5;
        Common.popuplateSelect('selectMatchSeason', 'Xin chọn!', window.dataCore.match.season);
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
            let stringList = [];
            for (let i = 0; i < sendData.detail.length; i++) {
                let object = sendData.detail[i];
                let string = `(<matchId>,${object.player},${object.nick},${object.char},${object.role},${object.score},${object.k},${object.d},${object.a})`;
                stringList.push(string);
            }
            sendData.sqlPart = stringList.join(',');
            delete sendData.detailTemp;
            delete sendData.detail;
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
        Common.popuplateSelect('selectPlayerMVP', 'Không có', window.dataCore.match.player);
    };

    createSendData() {
        let sendData = {};
        sendData.season = document.getElementById('selectMatchSeason').value.trim();
        sendData.date = document.getElementById('inputMatchDate').value.trim();
        sendData.hour = parseInt(document.getElementById('inputMatchHour').value.trim());
        sendData.minute = parseInt(document.getElementById('inputMatchMinute').value.trim());
        sendData.matchType = document.getElementById('selectMatchType').value.trim();
        sendData.matchResult = document.getElementById('selectMatchResult').value.trim();
        sendData.matchCalculation = document.getElementById('selectMatchCalculation').value.trim();
        sendData.previewImageBase64 = (this.previewImageBase64 || '').replace(/\+/g, '%2B');
        sendData.detailTemp = [];
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
            sendData.detailTemp.push(object);
        }
        sendData.mvp = document.getElementById('selectPlayerMVP').value.trim();
        return sendData;
    };

    validateData(sendData) {
        let message = this.validateMatchData(sendData);
        sendData.detail = [];
        for (let i = 1; i <= this.numPlayerMax; i++) {
            let object = sendData.detailTemp[i - 1];
            let result = this.validateMatchDetailObject(object, i);
            if (result === false) {
                continue;
            }
            if (result.length == 0) {
                sendData.detail.push(object);
                continue;
            }
            message = message.concat(result);
        }
        if (sendData.detail < 2) {
            message.push('Phải có dữ liệu đầy đủ của ít nhất 2 vị trí');
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
        if (window.dataCore.match.season[sendData.season] == null) {
            message.push('Match season');
        }
        if (sendData.date == null || sendData.date == '') {
            message.push('Match date');
        }
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
        console.log(data);
        let divWaiting = Common.showWaiting();
        let response = await Common.sendToBackend('data/save', data);
        console.log(response.result);
        Common.hideWaiting(divWaiting);
        let message = `Thao tác thành công.`;
        if (response.success == false) {
            message = `Gặp lỗi ${response.code}.`;
        }
        Common.showMessage(message);
    };
};