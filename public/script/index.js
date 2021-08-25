window.onload = function () {
    new Summary();
};

class Summary {
    constructor() {
        this.getData();
    };

    async getData() {
        let divWaiting = Common.showWaiting();
        let response = await Common.sendToBackend('data/summary');
        Common.hideWaiting(divWaiting);
        if (response.success == false) {
            Common.showMessage(`Gặp lỗi ${response.code}.`);
            return;
        }
        this.data = response.result.data;
        this.data.season = response.result.season;
        this.sortData();

        this.data.totalContribution = 0;

        this.createObjectPlayer();

        this.calculate();

        this.displayData();

        let parent = this;
        document.getElementById('showMatch').onclick = function () {
            parent.showMatch();
        };
    };

    sortData() {
        let sort = function (a, b) {
            if (b.o_date > a.o_date) {
                return 1;
            }
            if (b.o_date < a.o_date) {
                return -1;
            }
            return 0;
        };
        let matchList = Object.values(this.data.data);
        matchList.sort(sort);
        this.data.matchList = matchList;
        console.log(this.data);
    };

    createObjectPlayer() {
        let seasonContribution = window.dataCore.match.season[this.data.season].contribution || {};
        let seasonCredit = window.dataCore.match.season[this.data.season].credit || {};

        this.objectPlayer = {};
        let keyList = Object.keys(window.dataCore.match.player);

        for (let i = 0; i < keyList.length; i++) {
            let key = keyList[i];
            let object = window.dataCore.match.player[key];
            let contribution = (seasonContribution[key] || {}).amount || 0;
            let credit = (seasonCredit[key] || {}).amount || 0;
            this.objectPlayer[key] = {
                name: object.name,
                contribution,
                credit,
                lost: 0,
                mvp: 0,
                play: 0,
                win: 0,
                contribTime: 0,
                historyContrib: {},
                historyCredit: {},
            };
            this.data.totalContribution = this.data.totalContribution + contribution;
        }
    };

    displayData() {
        document.getElementById('divSeasonName').innerText = window.dataCore.match.season[this.data.season].name;
        document.getElementById('divTotalMatch').innerText = this.data.matchList.length;
        this.data.matchFirst = this.data.matchList[this.data.matchList.length - 1];
        this.data.matchLast = this.data.matchList[0];
        document.getElementById('divMatchFrom').innerHTML = `Trận <b>${this.data.matchFirst.id}</b>,<br>${this.data.matchFirst.date}`;
        document.getElementById('divMatchTo').innerHTML = `Trận <b>${this.data.matchLast.id}</b>,<br>${this.data.matchLast.date}`;
        document.getElementById('divMatchWin').innerHTML = `${this.data.summary.win} trận`;
        document.getElementById('divMatchLost').innerHTML = `${this.data.summary.lost} trận`;

        document.getElementById('divTotalContrib').innerHTML = `<b>${Number(this.data.totalContribution).toLocaleString('vi-vn')} VNĐ</b>`;

        document.getElementById('divFindMatchLabel').innerHTML =
            `Tìm trận theo số từ ${this.data.matchFirst.id} đến ${this.data.matchLast.id}`;
        this.displayPlayerDetail();
    };

    displayPlayerDetail() {
        let divGrid = document.getElementById('divGrid');

        let playerList = Object.values(this.objectPlayer);
        playerList.sort(function (a, b) {
            return b.contribution - a.contribution;
        });

        for (let i = 0; i < playerList.length; i++) {
            let object = playerList[i];

            let divName = Common.createElement('div', ['general-title', 'medium',], divGrid);
            divName.innerText = object.name;

            let divLabelContrib = Common.createElement('div', 'general-label', divGrid);
            divLabelContrib.innerText = 'Đóng góp';
            let divContrib = Common.createElement('div', ['general-label', 'number',], divGrid);
            divContrib.innerHTML = `<b>${Number(object.contribution).toLocaleString('vi-vn')}</b>`;

            let divLabelCredit = Common.createElement('div', 'general-label', divGrid);
            divLabelCredit.innerText = 'Credit còn';
            let divCredit = Common.createElement('div', ['general-label', 'number',], divGrid);
            divCredit.innerText = Number(object.credit).toLocaleString('vi-vn');

            let divLabelPlay = Common.createElement('div', 'general-label', divGrid);
            divLabelPlay.innerText = 'Lần chơi';
            let divPlay = Common.createElement('div', ['general-label', 'number',], divGrid);
            divPlay.innerText = Number(object.play).toLocaleString('vi-vn');

            let divLabelContribTime = Common.createElement('div', 'general-label', divGrid);
            divLabelContribTime.innerText = 'Lần đóng góp';
            let divContribTime = Common.createElement('div', ['general-label', 'number',], divGrid);
            divContribTime.innerText = Number(object.contribTime).toLocaleString('vi-vn');

            let divLabelWinTime = Common.createElement('div', 'general-label', divGrid);
            divLabelWinTime.innerText = 'Lần thắng';
            let divWinTime = Common.createElement('div', ['general-label', 'number',], divGrid);
            divWinTime.innerText = Number(object.win).toLocaleString('vi-vn');

            let divLabelMVPTime = Common.createElement('div', 'general-label', divGrid);
            divLabelMVPTime.innerText = 'Lần MVP';
            let divMVPTime = Common.createElement('div', ['general-label', 'number',], divGrid);
            divMVPTime.innerText = Number(object.mvp).toLocaleString('vi-vn');

            let divLabelLostTime = Common.createElement('div', 'general-label', divGrid);
            divLabelLostTime.innerText = 'Lần thua';
            let divLostTime = Common.createElement('div', ['general-label', 'number',], divGrid);
            divLostTime.innerText = Number(object.lost).toLocaleString('vi-vn');

            console.log([object.name, object.contribution, object.credit, object.play, object.lost, object.mvp]);
        }
    };

    sortScoreAsc(a, b) {
        if (a.score < b.score) {
            return -1;
        }
        if (a.score > b.score) {
            return 1;
        }
        if (a.k < b.k) {
            return -1;
        }
        if (a.k > b.k) {
            return 1;
        }
        if (a.d < b.d) {
            return 1;
        }
        if (a.d > b.d) {
            return -1;
        }
        if (a.a < b.a) {
            return -1;
        }
        if (a.a > b.a) {
            return 1;
        }
        return b.role - a.role;
    };

    calculate() {
        for (let i = this.data.matchList.length - 1; i >= 0; i--) {
            let match = this.data.matchList[i];
            if (match.calculation == 1) {
                this.calculateMethod1(match);
            } else if (match.calculation == 2) {
                this.calculateMethod2(match);
            }
        };
    };

    calculateMethod1(match) {
        for (let i = 0; i < match.detail.length; i++) {
            let detail = match.detail[i];
            detail.score = parseInt(detail.score);
            let role = detail.role;
            if (role == 1) {
                detail.score = detail.score - 100;
            }
            let player = this.objectPlayer[detail.player];
            player.play = player.play + 1;
            if (match.result == 1) {
                player.win = player.win + 1;
            } else {
                player.lost = player.lost + 1;
            }
        }
        match.totalBefore = this.data.totalContribution;
        match.detail.sort(this.sortScoreAsc);
        match.contributor = match.detail[0].player;
        let contributor = this.objectPlayer[match.contributor];
        let creditor = this.objectPlayer[match.mvp];
        let contribution = 20000;
        let credit = 5000;
        if (match.result == 1) {
            contribution = 10000;
            credit = 10000;
        }
        match.contribution = contribution;
        if (contributor != null) {
            contributor.contribTime = contributor.contribTime + 1;
            match.creditBeforeContrib = contributor.credit;
            contributor.credit = contributor.credit - contribution;
            if (contributor.credit <= 0) {
                let contributionFinal = Math.abs(contributor.credit);
                contributor.credit = 0;
                contributor.contribution = contributor.contribution + contributionFinal;
                this.data.totalContribution = this.data.totalContribution + contributionFinal;
                match.contributionFinal = contributionFinal;
            } else {
                contributor.contribution = 0;
                match.contributionFinal = 0;
            }
            match.totalAfter = this.data.totalContribution;
            match.creditAfterContrib = contributor.credit;
        }
        if (creditor != null) {
            creditor.mvp = creditor.mvp + 1;
            match.creditorBefore = creditor.credit;
            match.credit = credit;
            creditor.credit = creditor.credit + credit;
            match.creditorAfter = creditor.credit;
            match.creditor = creditor;
        }
    };

    calculateMethod2(match) {
        for (let i = 0; i < match.detail.length; i++) {
            let detail = match.detail[i];
            detail.score = parseInt(detail.score);
            let role = detail.role;
            if (role == 1) {
                detail.score = detail.score - 100;
            }
            if (role == 5) {
                detail.score = detail.score - 50;
            }
            let player = this.objectPlayer[detail.player];
            player.play = player.play + 1;
            if (match.result == 1) {
                player.win = player.win + 1;
            } else {
                player.lost = player.lost + 1;
            }
        }
        match.totalBefore = this.data.totalContribution;
        match.detail.sort(this.sortScoreAsc);
        match.contributor = match.detail[0].player;
        let contributor = this.objectPlayer[match.contributor];
        let creditor = this.objectPlayer[match.mvp];
        let contribution = 20000;
        let credit = 5000;
        if (match.result == 1) {
            contribution = 10000;
            credit = 10000;
        }
        match.contribution = contribution;
        if (contributor != null) {
            contributor.contribTime = contributor.contribTime + 1;
            match.creditBeforeContrib = contributor.credit;
            contributor.credit = contributor.credit - contribution;
            if (contributor.credit <= 0) {
                let contributionFinal = Math.abs(contributor.credit);
                contributor.credit = 0;
                contributor.contribution = contributor.contribution + contributionFinal;
                this.data.totalContribution = this.data.totalContribution + contributionFinal;
                match.contributionFinal = contributionFinal;
            } else {
                contributor.contribution = 0;
                match.contributionFinal = 0;
            }
            contributor.historyContrib
            match.totalAfter = this.data.totalContribution;
            match.creditAfterContrib = contributor.credit;
        }
        if (creditor != null) {
            creditor.mvp = creditor.mvp + 1;
            match.creditorBefore = creditor.credit;
            match.credit = credit;
            creditor.credit = creditor.credit + credit;
            match.creditorAfter = creditor.credit;
            match.creditor = creditor;
        }
    };

    showMatch() {
        let message = `Xin nhập một số từ ${this.data.matchFirst.id} đến ${this.data.matchLast.id}`;
        this.currentShowId = parseInt(document.getElementById('inputMatchId').value);
        if (!Common.isNumeric(this.currentShowId) || this.currentShowId < this.data.matchFirst.id ||
            this.currentShowId > this.data.matchLast.id) {
            this.currentShowId = null;
            Common.showMessage(message);
            return;
        }

        let parent = this;
        let divOverlay = document.createElement('div');
        divOverlay.classList.add('general-overlay');
        let divParent = Common.createElement('div', 'index-popup-match-parent', divOverlay);
        let divOuter = Common.createElement('div', 'index-popup-match-grid-outer', divParent);
        let divGrid = Common.createElement('div', 'index-popup-match-grid', divOuter);

        let buttonPrev = Common.createElement('button', 'general-button', divParent);
        buttonPrev.innerText = '< Trận trước';
        buttonPrev.onclick = function () {
            divGrid.innerHTML = '';
            parent.currentShowId = Math.max(parent.currentShowId - 1, parent.data.matchFirst.id);
            parent.createPopupMatch(parent.data.data[parent.currentShowId], divGrid, buttonPrev, buttonNext);
        };

        let buttonClose = Common.createElement('button', 'general-button', divParent);
        buttonClose.innerText = 'Đóng';
        buttonClose.onclick = function () {
            document.body.removeChild(divOverlay);
        };

        let buttonNext = Common.createElement('button', 'general-button', divParent);
        buttonNext.innerText = 'Trận kế >';
        buttonNext.onclick = function () {
            divGrid.innerHTML = '';
            parent.currentShowId = Math.min(parent.currentShowId + 1, parent.data.matchLast.id);
            parent.createPopupMatch(parent.data.data[parent.currentShowId], divGrid, buttonPrev, buttonNext);
        };
        this.createPopupMatch(this.data.data[this.currentShowId], divGrid, buttonPrev, buttonNext);
        document.body.appendChild(divOverlay);
    };

    createPopupMatch(match, divGrid, buttonPrev, buttonNext) {
        if (match.id == this.data.matchFirst.id) {
            buttonPrev.style.pointerEvents = 'none';
            buttonPrev.style.color = 'gray';
        } else {
            buttonPrev.style.pointerEvents = 'auto';
            buttonPrev.style.color = 'black';
        }
        if (match.id == this.data.matchLast.id) {
            buttonNext.style.pointerEvents = 'none';
            buttonNext.style.color = 'gray';
        } else {
            buttonNext.style.pointerEvents = 'auto';
            buttonNext.style.color = 'black';
        }

        let divImage = Common.createElement('div', 'index-popup-match-image', divGrid);
        divImage.style.backgroundImage = `url(https://capsulestudio.com.vn/lqct/images/match/${match.id}.jpg)`;

        let divLabelMathId = Common.createElement('div', ['general-title', 'medium'], divGrid);
        divLabelMathId.style.textAlign = 'center';
        divLabelMathId.innerText = `Trận ${match.id}`;

        let divLabelCalc = Common.createElement('div', ['general-label'], divGrid);
        divLabelCalc.innerHTML = 'Cách tính';
        let divCalc = Common.createElement('div', ['general-label', 'number', 'calc'], divGrid);
        divCalc.innerHTML = window.dataCore.match.calculation[match.calculation].name;
        divCalc.onclick = function () {
            Common.showMessage(window.dataCore.match.calculation[match.calculation].desc.join('<br>'));
        };

        let divLabelContribBefore = Common.createElement('div', ['general-label',], divGrid);
        divLabelContribBefore.innerText = 'Quỹ trước trận';
        let divContribBefore = Common.createElement('div', ['general-label', 'number'], divGrid);
        divContribBefore.innerText = `${Number(match.totalBefore).toLocaleString('vi-vn')}`;

        let divLabelContribtor = Common.createElement('div', ['general-label',], divGrid);
        divLabelContribtor.innerHTML = '<b>Người đóng góp</b>';
        let divContribtor = Common.createElement('div', ['general-label', 'number'], divGrid);
        divContribtor.innerHTML = `<b>${this.objectPlayer[match.contributor].name}</b>`;

        let divLabelContribRequired = Common.createElement('div', ['general-label',], divGrid);
        divLabelContribRequired.innerText = 'Số tiền cần góp';
        let divContribRequired = Common.createElement('div', ['general-label', 'number'], divGrid);
        divContribRequired.innerText = `${Number(match.contribution).toLocaleString('vi-vn')}`;

        let divLabelCreditBefore = Common.createElement('div', ['general-label',], divGrid);
        divLabelCreditBefore.innerText = 'Credit trước trận';
        let divCreditBefore = Common.createElement('div', ['general-label', 'number'], divGrid);
        divCreditBefore.innerText = `${Number(match.creditBeforeContrib).toLocaleString('vi-vn')}`;

        let divLabelContrib = Common.createElement('div', ['general-label',], divGrid);
        divLabelContrib.innerText = 'Số tiền đóng góp';
        let divContrib = Common.createElement('div', ['general-label', 'number'], divGrid);
        divContrib.innerText = `${Number(match.contributionFinal).toLocaleString('vi-vn')}`;

        let divLabelCreditAfter = Common.createElement('div', ['general-label',], divGrid);
        divLabelCreditAfter.innerText = 'Credit sau trận';
        let divCreditAfter = Common.createElement('div', ['general-label', 'number'], divGrid);
        divCreditAfter.innerText = `${Number(match.creditAfterContrib).toLocaleString('vi-vn')}`;

        let divLabelContribAfter = Common.createElement('div', ['general-label'], divGrid);
        divLabelContribAfter.innerHTML = '<b>Quỹ sau trận</b>';
        let divContribAfter = Common.createElement('div', ['general-label', 'number'], divGrid);
        divContribAfter.innerHTML = `<b>${Number(match.totalAfter).toLocaleString('vi-vn')}</b>`;

        Common.createElement('div', ['general-label'], divGrid);
        Common.createElement('div', ['general-label'], divGrid);


        let divLabelCredior = Common.createElement('div', ['general-label'], divGrid);
        divLabelCredior.innerHTML = '<b>Người nhận credit</b>';
        let divCreditor = Common.createElement('div', ['general-label', 'number'], divGrid);
        if (match.creditor == null) {
            divCreditor.innerHTML = `<b>Không có</b>`;
        } else {
            divCreditor.innerHTML = `<b>${match.creditor.name}</b>`;

            let divLabelCreditBefore = Common.createElement('div', ['general-label'], divGrid);
            divLabelCreditBefore.innerText = 'Credit trước trận';
            let divCreditBefore = Common.createElement('div', ['general-label', 'number'], divGrid);
            divCreditBefore.innerText = `${Number(match.creditorBefore).toLocaleString('vi-vn')}`;

            let divLabelCredit = Common.createElement('div', ['general-label'], divGrid);
            divLabelCredit.innerText = 'Credit';
            let divCredit = Common.createElement('div', ['general-label', 'number'], divGrid);
            divCredit.innerText = `${Number(match.credit).toLocaleString('vi-vn')}`;

            let divLabelCreditAfter = Common.createElement('div', ['general-label'], divGrid);
            divLabelCreditAfter.innerText = 'Credit sau trận trận';
            let divCreditAfter = Common.createElement('div', ['general-label', 'number'], divGrid);
            divCreditAfter.innerText = `${Number(match.creditorAfter).toLocaleString('vi-vn')}`;
        }

        let divTitlePosition = Common.createElement('div', ['general-title', 'medium'], divGrid);
        divTitlePosition.innerText = 'CHI TIẾT ĐIỂM SỐ';

        let divLabelResult = Common.createElement('div', ['general-label'], divGrid);
        divLabelResult.innerHTML = '<b>Kết quả</b>';
        let divResult = Common.createElement('div', ['general-label', 'number'], divGrid);
        let colorResult = window.dataCore.match.typeResult[match.result].color;
        let textResult = window.dataCore.match.typeResult[match.result].name;
        divResult.style.color = colorResult;
        divResult.innerHTML = `<b>${textResult}</b>`;

        for (let i = 0; i < match.detail.length; i++) {
            let detail = match.detail[i];

            let divLabelPosition = Common.createElement('div', ['general-title', 'medium'], divGrid);
            let textPosition = `Vị trí ${i + 1}`;
            if (detail.player == match.mvp) {
                textPosition = textPosition + ' (MVP)';
            }
            divLabelPosition.innerHTML = textPosition;


            let divName = Common.createElement('div', ['general-label',], divGrid);
            divName.innerText = this.objectPlayer[detail.player].name;

            let divNick = Common.createElement('div', ['general-label', 'number'], divGrid);
            divNick.innerText = window.dataCore.match.nick[detail.nick].name;

            let divChar = Common.createElement('div', ['general-label',], divGrid);
            divChar.innerText = window.dataCore.match.character[detail.character].name;

            let divRole = Common.createElement('div', ['general-label', 'number'], divGrid);
            divRole.innerText = window.dataCore.match.role[detail.role].name;

            let divLabelKDA = Common.createElement('div', ['general-label'], divGrid);
            divLabelKDA.innerText = 'K / D / A';
            let divKDA = Common.createElement('div', ['general-label', 'number'], divGrid);
            divKDA.innerText = `${detail.k} / ${detail.d} / ${detail.a}`;

            let divLabelScore = Common.createElement('div', ['general-label'], divGrid);
            divLabelScore.innerText = 'Điểm';
            let divScore = Common.createElement('div', ['general-label', 'number'], divGrid);
            divScore.innerText = parseInt(detail.score) / 100;
        }
    };
};