/**
 * config 
 *  */

class AppViewModel {
    /**
        * @param {Object} config - game config
        * @param {string} config.riddleTextEncrypted - riddle full
        * @param {string} config.correctAnswerHased - base64 of hased answer
        * @param {number} config.maxTries - The employee's department.
        * @param {string} config.gameId - game id
        * @param {string} config.freeLetters - freeLetters
        * @param {string} config.badTryText - badTryText
        * @param {string} config.maxTriesReachedText - maxTriesReachedText
        * @param {string[]} config.codesHelpArray - codes Help texts
     */
    constructor(config) {
        this.shouldShowHelp = ko.observable(localStorage.getItem(`${config.gameId}#shouldShowHelp`) || true);
        this.codesHelp = config.codesHelpArray.map((t, index) => {
            return {
                text: t,
                done: ko.observable(JSON.parse(localStorage.getItem(`${config.gameId}#help#${index}`)) || false)
            };
        });
        this.badTryText = config.badTryText;
        this.maxTriesReachedText = config.maxTriesReachedText;
        this.correctAnswerHashed = config.correctAnswerHased;
        this.maxTries = config.maxTries;
        this.answer = ko.observable('');
        this.tries = localStorage.getItem(`${config.gameId}#tries`) || 0;
        this.gameId = config.gameId;
        this.words = decodeURIComponent(atob(config.riddleTextEncrypted)).split(" ").map(w => { return { word: w }; });
        this.revealedLetters = [];
        const letters = localStorage.getItem(`${config.gameId}#letter`);
        this.revealedLetters = letters ? JSON.parse(letters) : config.freeLetters;
        this.winDate = ko.observable(localStorage.getItem(`${config.gameId}#wonDate`) || 0);
        var urlParams = new URLSearchParams(window.location.search);
        this.currentLetter = '';
        this.debug = JSON.parse(urlParams.get("debug")) == true;
        if (urlParams.has("l")) {
            this.currentLetter = decodeURIComponent(atob(urlParams.get("l")));
            this.revealLetter(this.currentLetter);
        }

        this.triesLeft = ko.observable(this.maxTries - this.tries);
    }
    revealLetter(letter) {
        this.revealedLetters.push(letter);
        localStorage.setItem(`${this.gameId}#letter`, JSON.stringify(this.revealedLetters))
    }
    isHidden(letter) {
        if (letter == "?") return false;
        return this.revealedLetters.findIndex(l => l.toLowerCase() == letter.toLowerCase()) == -1;
    }
    isCurrentLetter(letter) {
        return letter == this.currentLetter;
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
            const hashedAnswer = await this.digestMessage(this.answer());

            if (this.correctAnswerHashed == hashedAnswer) {
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
