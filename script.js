class WordPuzzleGame {
    constructor() {
        this.words = [];
        this.currentWord = '';
        this.scrambledWord = '';
        this.usedWords = new Set();
        this.score = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.timeLeft = 60;
        this.timer = null;
        this.gameActive = false;
        this.hintUsed = false;
        this.wordCount = 10;
        this.musicEnabled = true;
        this.sfxEnabled = true;

        this.init();
    }

    init() {
        this.loadPreferences();
        this.setupEventListeners();
        this.setupAudio();
        this.showMainScreen();
    }

    loadPreferences() {
        const savedWordCount = localStorage.getItem('wordCount');
        const savedMusic = localStorage.getItem('musicEnabled');
        const savedSfx = localStorage.getItem('sfxEnabled');

        this.wordCount = savedWordCount ? parseInt(savedWordCount) : 10;
        this.musicEnabled = savedMusic ? savedMusic === 'true' : true;
        this.sfxEnabled = savedSfx ? savedSfx === 'true' : true;

        document.getElementById('word-count').value = this.wordCount;
        document.getElementById('music-toggle').checked = this.musicEnabled;
        document.getElementById('sfx-toggle').checked = this.sfxEnabled;
    }

    savePreferences() {
        localStorage.setItem('wordCount', this.wordCount);
        localStorage.setItem('musicEnabled', this.musicEnabled);
        localStorage.setItem('sfxEnabled', this.sfxEnabled);
    }

    setupEventListeners() {
        document.getElementById('submit-guess').addEventListener('click', () => this.checkGuess());
        document.getElementById('user-guess').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkGuess();
        });

        document.getElementById('hint-btn').addEventListener('click', () => this.useHint());
        document.getElementById('new-game-btn').addEventListener('click', () => this.startGame());
        document.getElementById('settings-btn').addEventListener('click', () => this.toggleSettings());
        document.getElementById('save-settings').addEventListener('click', () => this.saveSettings());
        document.getElementById('close-settings').addEventListener('click', () => this.toggleSettings());
        document.getElementById('play-again').addEventListener('click', () => this.startGame());
    }

    setupAudio() {
        this.tickSound = document.getElementById('tick-sound');
        this.successSound = document.getElementById('success-sound');
        this.failSound = document.getElementById('fail-sound');
        this.backgroundMusic = document.getElementById('background-music');

        this.backgroundMusic.volume = 0.3;
        this.tickSound.volume = 0.5;
        this.successSound.volume = 0.7;
        this.failSound.volume = 0.7;

        // Start music after user interaction
        document.addEventListener('click', () => {
            if (this.musicEnabled && this.backgroundMusic.paused) {
                this.backgroundMusic.play().catch(e => console.log("Audio play prevented:", e));
            }
        }, { once: true });
    }

    toggleSettings() {
        const panel = document.getElementById('settings-panel');
        panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
    }

    saveSettings() {
        this.wordCount = parseInt(document.getElementById('word-count').value);
        this.musicEnabled = document.getElementById('music-toggle').checked;
        this.sfxEnabled = document.getElementById('sfx-toggle').checked;

        this.savePreferences();
        this.toggleSettings();

        if (!this.musicEnabled) {
            this.backgroundMusic.pause();
        } else if (this.gameActive) {
            this.backgroundMusic.play().catch(e => console.log("Audio play prevented:", e));
        }
    }

    showMainScreen() {
        document.querySelector('.game-container').style.display = 'block';
        document.getElementById('settings-panel').style.display = 'none';
        document.getElementById('results-panel').style.display = 'none';
    }

    showResults() {
        document.getElementById('words-found').textContent = this.usedWords.size;
        document.getElementById('total-words').textContent = this.words.length;
        document.getElementById('accuracy').textContent = this.words.length > 0 ?
            Math.round((this.usedWords.size / this.words.length) * 100) : 0;
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('best-streak').textContent = this.bestStreak;

        const missedWordsList = document.getElementById('missed-words-list');
        missedWordsList.innerHTML = '';
        this.words.forEach(word => {
            if (!this.usedWords.has(word)) {
                const li = document.createElement('li');
                li.textContent = word;
                missedWordsList.appendChild(li);
            }
        });

        document.querySelector('.game-container').style.display = 'none';
        document.getElementById('results-panel').style.display = 'flex';
    }

    startGame() {
        this.words = this.getRandomWords();
        this.usedWords.clear();
        this.score = 0;
        this.streak = 0;
        this.hintUsed = false;
        this.timeLeft = 60;
        this.gameActive = true;

        this.updateUI();
        this.displayWord();
        this.startTimer();

        document.getElementById('user-guess').focus();
    }

    getRandomWords() {
        const shuffled = [...WORD_LIST].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, this.wordCount);
    }

    displayWord() {
        const remainingWords = this.words.filter(word => !this.usedWords.has(word));
        if (remainingWords.length === 0) {
            this.endGame();
            return;
        }

        this.currentWord = remainingWords[0];
        this.scrambledWord = this.scrambleWord(this.currentWord);
        document.getElementById('scrambled-word').textContent = this.scrambledWord;
        this.updateWordList();
    }

    scrambleWord(word) {
        const letters = word.split('');
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1
