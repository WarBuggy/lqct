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
    };

    sortData() {
        let sort = function (a, b) {
            return b.o_date > a.o_date;
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
            };
            this.data.totalContribution = this.data.totalContribution + contribution;
        }
    };

    displayData() {
        document.getElementById('divSeasonName').innerText = window.dataCore.match.season[this.data.season].name;
        document.getElementById('divTotalMatch').innerText = this.data.matchList.length;
        let matchFirst = this.data.matchList[this.data.matchList.length - 1];
        let matchLast = this.data.matchList[0];
        document.getElementById('divMatchFrom').innerHTML = `Trận ${matchFirst.id},<br>${matchFirst.date}`;
        document.getElementById('divMatchTo').innerHTML = `Trận ${matchLast.id},<br>${matchLast.date}`;
        document.getElementById('divMatchWin').innerHTML = `${this.data.summary.win} trận`;
        document.getElementById('divMatchLost').innerHTML = `${this.data.summary.lost} trận`;

        document.getElementById('divTotalContrib').innerHTML = `<b>${Number(this.data.totalContribution).toLocaleString('vi-vn')} VNĐ</b>`;
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
            divLabelContrib.innerText = 'Tổng đóng góp';
            let divContrib = Common.createElement('div', ['general-label', 'number',], divGrid);
            divContrib.innerText = Number(object.contribution).toLocaleString('vi-vn');

            let divLabelCredit = Common.createElement('div', 'general-label', divGrid);
            divLabelCredit.innerText = 'Credit còn';
            let divCredit = Common.createElement('div', ['general-label', 'number',], divGrid);
            divCredit.innerText = Number(object.credit).toLocaleString('vi-vn');

            let divLabelPlay = Common.createElement('div', 'general-label', divGrid);
            divLabelPlay.innerText = 'Lần chơi';
            let divPlay = Common.createElement('div', ['general-label', 'number',], divGrid);
            divPlay.innerText = Number(object.play).toLocaleString('vi-vn');

            let divLabelContribTime = Common.createElement('div', 'general-label', divGrid);
            divLabelContribTime.innerText = 'Lần thua';
            let divContribTime = Common.createElement('div', ['general-label', 'number',], divGrid);
            divContribTime.innerText = Number(object.lost).toLocaleString('vi-vn');

            let divLabelMVPTime = Common.createElement('div', 'general-label', divGrid);
            divLabelMVPTime.innerText = 'Lần MVP';
            let divMVPTime = Common.createElement('div', ['general-label', 'number',], divGrid);
            divMVPTime.innerText = Number(object.mvp).toLocaleString('vi-vn');

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
                this.calculateMethod1(match);
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
            this.objectPlayer[detail.player].play = this.objectPlayer[detail.player].play + 1;
        }
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
        if (contributor != null) {
            contributor.lost = contributor.lost + 1;
            contributor.credit = contributor.credit - contribution;
            if (contributor.credit <= 0) {
                let contributionFinal = - contributor.credit;
                contributor.credit = 0;
                contributor.contribution = contributor.contribution + contributionFinal;
                this.data.totalContribution = this.data.totalContribution + contributionFinal;
            }
        }
        if (creditor != null) {
            creditor.mvp = creditor.mvp + 1;
            creditor.credit = creditor.credit + credit;
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
                detail.score = detail.score - 500;
            }
            this.objectPlayer[detail.player].play = this.objectPlayer[detail.player].play + 1;
        }
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
        if (contributor != null) {
            contributor.lost = contributor.lost + 1;
            contributor.credit = contributor.credit - contribution;
            if (contributor.credit <= 0) {
                let contributionFinal = - contributor.credit;
                contributor.credit = 0;
                contributor.contribution = contributor.contribution + contributionFinal;
                this.data.totalContribution = this.data.totalContribution + contributionFinal;
            }
        }
        if (creditor != null) {
            creditor.mvp = creditor.mvp + 1;
            creditor.credit = creditor.credit + credit;
        }
    };
};