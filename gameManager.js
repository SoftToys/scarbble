class AppViewModel {
    constructor(riddleText, correctAnswer, maxTries, gameId, freeLetters, badTryText, maxTriesReachedText, codesHelpArray) {
        this.shouldShowHelp = ko.observable(localStorage.getItem(`${gameId}#shouldShowHelp`) || true);
        this.codesHelp = codesHelpArray.map((t, index) => {
            return {
                text: t,
                done: ko.observable(JSON.parse(localStorage.getItem(`${gameId}#help#${index}`)) || false)
            };
        });
        this.badTryText = badTryText;
        this.maxTriesReachedText = maxTriesReachedText;
        this.correctAnswer = correctAnswer;
        this.maxTries = maxTries;
        this.answer = ko.observable('');
        this.tries = localStorage.getItem(`${gameId}#tries`) || 0;
        this.gameId = gameId;
        this.words = riddleText.split(" ").map(w => { return { word: w }; });
        this.revealedLetters = [];
        const letters = localStorage.getItem(`${gameId}#letter`);
        this.revealedLetters = letters ? JSON.parse(letters) : freeLetters;
        this.winDate = ko.observable(localStorage.getItem(`${gameId}#wonDate`) || 0);
        var urlParams = new URLSearchParams(window.location.search);
        this.currentLetter = '';
        if (urlParams.has("l")) {
            this.currentLetter = urlParams.get("l");
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

    submitAnswer() {
        debugger;
        if (this.answer().length > 0) {
            if (this.triesLeft() <= 0) {
                this.triesLeft(0);
                alert(this.maxTriesReachedText);
                return;
            }

            this.tries++;
            this.triesLeft(this.maxTries - this.tries);

            localStorage.setItem(`${this.gameId}#tries`, this.tries);
            if (this.correctAnswer.toLowerCase() == this.answer().toLocaleLowerCase()) {
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
