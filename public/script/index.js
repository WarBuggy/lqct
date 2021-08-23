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
    };

    sortData() {
        let sort = function (a, b) {
            return b.date > a.date;
        };
        let matchList = Object.values(this.data.data);
        matchList.sort(sort);
        this.data.matchList = matchList;
        console.log(this.data);

        displayData();
    };

    displayData() {
        document.getElementById('divSeasonName').innerText = window.dataCore.match.season[this.data.season].name;
        document.getElementById('divTotalMatch').innerText = this.data.matchList.length;
        let matchFirst = this.data.this.data.matchList[this.data.matchList.length - 1];
        let matchLast = this.data.this.data.matchList[0];
        document.getElementById('divMatchFrom').innerText = `${matchFirts.id}, ${matchFirst.date}`;
        document.getElementById('divMatchTo').innerText = `${matchLast.id}, ${matchLast.date}`;
    };
};