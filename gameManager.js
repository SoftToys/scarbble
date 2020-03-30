class AppViewModel {
    /**
        * @param {Object} config - game config
        * @param {string} config.gameName - Game Name
        * @param {string} config.riddleTextEncrypted - riddle full
        * @param {string[]} config.correctAnswersHased - base64 of hased possible answers
        * @param {number} config.maxTries - The employee's department.
        * @param {string} config.gameId - game id
        * @param {string} config.freeLetters - freeLetters
        * @param {string} config.badTryText - badTryText
        * @param {string} config.maxTriesReachedText - maxTriesReachedText
        * @param {object[]} config.codesHelpArray - codes Help texts
        * @param {string} config.greet - game label
     */
    constructor(config) {
        this.shouldShowHelp = ko.observable(localStorage.getItem(`${config.gameId}#shouldShowHelp`) || true);
        this.codesHelp = config.codesHelpArray.map((t, index) => {
            t.done = ko.observable(JSON.parse(localStorage.getItem(`${config.gameId}#help#${index}`)) || false);
            return t;
        });
        this.gameName = config.gameName;
        this.greet = config.greet || "מזל טוב";
        this.enterCode = ko.observable(false);
        this.manualCode = ko.observable();
        this.badTryText = config.badTryText;
        this.maxTriesReachedText = config.maxTriesReachedText;
        this.correctAnswersHashed = config.correctAnswersHased;
        this.maxTries = config.maxTries;
        this.answer = ko.observable('');
        this.tries = localStorage.getItem(`${config.gameId}#tries`) || 0;
        this.gameId = config.gameId;
        this.words = ko.observableArray(decodeURIComponent(atob(config.riddleTextEncrypted)).split(" ").map(w => { return { word: w }; }));
        this.revealedLetters = [];
        const letters = localStorage.getItem(`${config.gameId}#letter`);
        this.revealedLetters = letters ? JSON.parse(letters) : config.freeLetters;
        this.winDate = ko.observable(localStorage.getItem(`${config.gameId}#wonDate`) || 0);
        var urlParams = new URLSearchParams(window.location.search);
        this.currentLetter = ko.observable('');
        this.debug = JSON.parse(urlParams.get("debug")) == true;
        this.qrScannerOpened = ko.observable(false);
        if (urlParams.has("l")) {
            try {
                const letter = decodeURIComponent(atob(urlParams.get("l")));
                this.currentLetter(letter);
                this.revealLetter(this.currentLetter());
            }
            catch{
                alert("קוד לא חוקי")
            }
        }
        this.notificationsPermissionsRequest();

        this.triesLeft = ko.observable(this.maxTries - this.tries);
        if (urlParams.has("scan")) {
            setTimeout(() => {
                $("#scan-btn").trigger("click");
            }, 1000);
        }
        this.gameEnded = JSON.parse(localStorage.getItem(`${this.gameId}#gameEnded`) || false);

        const now = new Date().getTime();
        this.helps = config.helps;

        if (config.helps && !this.gameEnded) {
            if (!localStorage.getItem(`${this.gameId}#help`)) {
                const next = now + (this.helps.intervalMin * 60 * 1000);
                localStorage.setItem(`${this.gameId}#help`, next);
            }
            setInterval(() => {
                if (!this.gameEnded) {
                    this.checkHelpDeadLine();
                }
            }, 1000 * 20);
        }

        if (config.gameMaxTimeMin && !this.gameEnded) {
            let endGameNotificationTime = localStorage.getItem(`${this.gameId}#end-time`);
            if (!endGameNotificationTime) {
                endGameNotificationTime = now + (config.gameMaxTimeMin * 60 * 1000);
                localStorage.setItem(`${this.gameId}#end-time`, endGameNotificationTime);
            }
            const interval = setInterval(() => {
                if (new Date().getTime() > endGameNotificationTime) {
                    clearInterval(interval);
                    localStorage.setItem(`${this.gameId}#gameEnded`, true);
                    this.gameEnded = true;
                    this.notify(config.gameEndedText);
                }
            }, 1000 * 20);
        }
    }

    checkHelpDeadLine() {
        const nextNotificationTime = localStorage.getItem(`${this.gameId}#help`);
        const now = new Date().getTime();
        const notifyNum = Number(localStorage.getItem(`${this.gameId}#help-count`) || 0);

        if (Number(nextNotificationTime) < now && notifyNum < this.helps.maxHelps && this.winDate() == 0) {
            localStorage.setItem(`${this.gameId}#help-count`, notifyNum + 1);
            const next = now + (this.helps.intervalMin * 60 * 1000);
            localStorage.setItem(`${this.gameId}#help`, next);
            this.notify(this.helps.notificationText);
        }
    }
    notificationsPermissionsRequest() {
        this.notificationsMethod = "alert";
        if (!("Notification" in window)) {
            this.notificationsMethod = "alert";
        }
        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            this.notificationsMethod = "notifications";
        }
        else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
                // If the user accepts, let's create a notification                
                if (permission === "granted") {
                    this.notificationsMethod = "notifications";
                } else {
                    this.notificationsMethod = "alert";
                }
            });
        }

    }
    notify(text) {
        if (this.notificationsMethod == "alert") {
            alert(text);
        }

        // Let's check whether notification permissions have already been granted
        else if (this.notificationsMethod == "notifications") {
            // If it's okay let's create a notification
            var notification = new Notification(text);
        }
    }

    async toggleCodeScanner() {
        this.enterCode(!this.enterCode());
        if (this.qrScanner) {
            this.qrScanner.destroy();
            this.qrScanner = null;
            this.qrScannerOpened(false);
            return;
        }
        const hasCam = await QrScanner.hasCamera();
        if (hasCam) {

            const videoElem = document.querySelector('video');

            this.qrScanner = new window.QrScanner(videoElem, result => {
                console.log('decoded qr code:', result);
                if (result && result.length > 0) {
                    //this.currentLetter(decodeURIComponent(atob(result)));
                    //this.revealLetter(this.currentLetter());
                    this.qrScanner.destroy();
                    this.qrScanner = null;
                    this.qrScannerOpened(false);
                    this.redirectToPage(result);
                }
            }, 200);
            this.qrScanner.start()
            this.qrScannerOpened(true);
        }
    }
    submitManualCode() {
        if (this.manualCode() && this.manualCode().length > 0) {
            this.useCode(this.manualCode());
        }
    }
    redirectToPage(pageUrl) {
        window.location.href = pageUrl
    }
    useCode(letterCode) {
        let searchParams = new URLSearchParams(window.location.search);
        searchParams.set("l", letterCode);
        this.redirectToPage(`${window.location.href.split('?')[0]}?${searchParams.toString()}`);
    }
    revealLetter(letter) {
        this.revealedLetters.push(letter);
        localStorage.setItem(`${this.gameId}#letter`, JSON.stringify(this.revealedLetters))
        this.words.valueHasMutated();
    }
    isHidden(letter) {
        return this.revealedLetters.findIndex(l => l.toLowerCase() == letter.toLowerCase()) == -1;
    }
    isCurrentLetter(letter) {
        const isCurrent = letter == this.currentLetter();
        if (isCurrent) {
            return true;
        }
        return false;
    }

    async submitAnswer() {
        if (this.answer().length > 0) {
            if (this.triesLeft() <= 0) {
                this.triesLeft(0);
                alert(this.maxTriesReachedText);
                return;
            }

            this.tries++;
            this.triesLeft(this.maxTries - this.tries);

            localStorage.setItem(`${this.gameId}#tries`, this.tries);
            const hashedAnswer = await this.digestMessage(this.answer().trim());

            if (this.correctAnswersHashed.indexOf(hashedAnswer) >= 0) {
                this.winDate(new Date().getTime());
                localStorage.setItem(`${this.gameId}#wonDate`, new Date().getTime());
            } else {
                if (this.triesLeft() > 0) {
                    alert(this.badTryText);
                } else {
                    alert(this.maxTriesReachedText);
                }
            }
        }
    }
    async digestMessage(message) {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const bytes = await window.crypto.subtle.digest('SHA-256', data);

        const hashed = btoa(
            new Uint8Array(bytes)
                .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        return hashed;
    }
    won() {
        const wd = this.winDate();
        return wd > 0;
    }
    winTime() {
        const wd = this.winDate();
        return new Date(Number(wd)).toLocaleTimeString();
    }
    toggleHelp() {
        this.shouldShowHelp(!this.shouldShowHelp());
        localStorage.setItem(`${this.gameId}#shouldShowHelp`, this.shouldShowHelp());
    }
    saveHelp(that) {
        that.codesHelp.forEach((help, index) => {
            localStorage.setItem(`${this.gameId}#help#${index}`, this.codesHelp[index].done());
        });
    }
    clearAll() {
        if (confirm("בטוח שתרצו להתחיל מחדש?")) {
            localStorage.clear();
            location.reload(true);
        }

    }
}
