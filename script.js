class WordPuzzleGame {
    constructor() {
        this.words = [];
        this.currentWord = '';
        this.usedWords = new Set();
        this.score = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.timeLeft = 30;
        this.timer = null;
        this.gameActive = false;
        this.wordCount = 10;
        this.letters = [];
        this.correctLetters = [];
        this.draggedLetter = null;
        this.dropZone = null;

        this.init();
    }

    init() {
        this.loadPreferences();
        this.setupEventListeners();
        this.showMainScreen();
    }

    loadPreferences() {
        const savedWordCount = localStorage.getItem('wordCount');
        this.wordCount = savedWordCount ? parseInt(savedWordCount) : 10;
        document.getElementById('word-count').value = this.wordCount;
    }

    savePreferences() {
        localStorage.setItem('wordCount', this.wordCount);
    }

    setupEventListeners() {
        document.getElementById('new-game-btn').addEventListener('click', () => this.startGame());
        document.getElementById('settings-btn').addEventListener('click', () => this.toggleSettings());
        document.getElementById('save-settings').addEventListener('click', () => this.saveSettings());
        document.getElementById('close-settings').addEventListener('click', () => this.toggleSettings());
        document.getElementById('play-again').addEventListener('click', () => this.startGame());

        // Drag and drop events
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('letter-tile')) {
                this.draggedLetter = e.target;
                e.target.classList.add('dragging');
                e.dataTransfer.setData('text/plain', e.target.dataset.letter);
            }
        });

        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('letter-tile')) {
                e.target.classList.remove('dragging');
            }
        });

        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('drop-zone') || e.target.classList.contains('letter-tile')) {
                this.dropZone = e.target;
                e.dataTransfer.dropEffect = 'move';
            }
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            if (this.draggedLetter && this.dropZone) {
                if (this.dropZone.classList.contains('drop-zone')) {
                    this.dropZone.textContent = this.draggedLetter.dataset.letter;
                    this.dropZone.classList.add('filled');
                } else if (this.dropZone.classList.contains('letter-tile')) {
                    this.dropZone.textContent = this.draggedLetter.dataset.letter;
                }
            }
        });
    }

    toggleSettings() {
        const panel = document.getElementById('settings-panel');
        panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
    }

    saveSettings() {
        this.wordCount = parseInt(document.getElementById('word-count').value);
        this.savePreferences();
        this.toggleSettings();
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
        this.timeLeft = 30;
        this.gameActive = true;

        this.updateUI();
        this.displayWord();
        this.startTimer();
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
        this.letters = this.getRandomLetters();
        this.correctLetters = this.currentWord.split('');
        this.updateWordDisplay();
        this.updateLetterTiles();
    }

    getRandomLetters() {
        const allLetters = this.currentWord.split('');
        const shuffled = [...allLetters].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 8); // Get 8 random letters
    }

    updateWordDisplay() {
        const wordDisplay = document.getElementById('word-display');
        wordDisplay.innerHTML = '';

        for (let i = 0; i < this.currentWord.length; i++) {
            const dropZone = document.createElement('div');
            dropZone.className = 'drop-zone';
            dropZone.dataset.position = i;
            wordDisplay.appendChild(dropZone);
        }
    }

    updateLetterTiles() {
        const letterContainer = document.getElementById('letter-container');
        letterContainer.innerHTML = '';

        this.letters.forEach(letter => {
            const tile = document.createElement('div');
            tile.className = 'letter-tile';
            tile.textContent = letter;
            tile.dataset.letter = letter;
            tile.draggable = true;
            letterContainer.appendChild(tile);
        });
    }

    checkWord() {
        const dropZones = document.querySelectorAll('.drop-zone');
        let correct = true;

        dropZones.forEach((zone, index) => {
            if (zone.textContent !== this.currentWord[index]) {
                correct = false;
            }
        });

        if (correct) {
            this.handleCorrectWord();
        } else {
            this.handleIncorrectWord();
        }
    }

    handleCorrectWord() {
        this.usedWords.add(this.currentWord);
        this.score += 10 * this.streak;
        this.streak++;
        this.bestStreak = Math.max(this.bestStreak, this.streak);

        if (this.usedWords.size === this.words.length) {
            this.endGame();
            return;
        }

        this.displayWord();
    }

    handleIncorrectWord() {
        // Clear the word display
        const dropZones = document.querySelectorAll('.drop-zone');
        dropZones.forEach(zone => {
            zone.textContent = '';
            zone.classList.remove('filled');
        });

        // Reset streak
        this.streak = 0;
        this.timeLeft = 30; // Reset timer
        this.updateTimerDisplay();
    }

    startTimer() {
        clearInterval(this.timer);
        this.updateTimerDisplay();

        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.handleIncorrectWord();
                if (this.usedWords.size === this.words.length) {
                    this.endGame();
                }
            }
        }, 1000);
    }

    updateTimerDisplay() {
        document.getElementById('time-left').textContent = this.timeLeft;
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('streak').textContent = this.streak;
    }

    endGame() {
        clearInterval(this.timer);
        this.gameActive = false;
        this.showResults();
    }
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new WordPuzzleGame();
});
