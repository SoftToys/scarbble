class AppViewModel {
    constructor(riddleText, correctAnswer, maxTries, gameId, freeLetters) {
        this.correctAnswer = correctAnswer;
        this.maxTries = maxTries;
        this.answer = '';
        this.tries = localStorage.getItem(`${gameId}#tries`) || 0;
        this.gameId = gameId;
        this.words = riddleText.split(" ").map(w => { return { word: w }; });
        this.revealedLetters = [];
        const letters = localStorage.getItem(`${gameId}#letter`);
        this.revealedLetters = letters ? JSON.parse(letters) : freeLetters;
        this.winDate = ko.observable(localStorage.getItem(`${gameId}#wonDate`) || 0);
        var urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has("l")) {
            this.revealLetter(urlParams.get("l"));
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

    submitAnswer() {
        if (this.tries >= this.maxTries) {
            alert("צטערת!!");
            return;
        }
        this.tries++;
        this.triesLeft(this.maxTries - this.tries);
        localStorage.setItem(`${this.gameId}#tries`, this.tries);
        if (this.correctAnswer.toLowerCase() == this.answer.toLocaleLowerCase()) {
            this.winDate(new Date().getTime());
            localStorage.setItem(`${this.gameId}#wonDate`, new Date().getTime());
        }
    }
    won() {
        const wd = this.winDate();
        return wd > 0;
    }
    winTime() {
        const wd = this.winDate();
        return new Date(Number(wd)).toLocaleTimeString();
    }
}
