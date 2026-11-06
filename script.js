        this.scrambledLetters = [];
        this.usedWords = new Set();
        this.score = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.timeLeft = 60;
        this.timer = null;
        this.gameActive = false;
        this.hintUsed = false;
        this.intenseEffects = true;
        this.audioEnabled = true;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.5;

        // DOM Elements
        this.elements = {
            startModal: document.getElementById('start-modal'),
            pauseModal: document.getElementById('pause-modal'),
            endModal: document.getElementById('end-modal'),
            settingsPanel: document.getElementById('settings-panel'),
            settingsContent: document.querySelector('.settings-content'),
            startBtn: document.getElementById('start-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            resumeBtn: document.getElementById('resume-btn'),
            menuBtn: document.getElementById('menu-btn'),
            menuBtnEnd: document.getElementById('menu-btn-end'),
            restartBtn: document.getElementById('restart-btn'),
            restartLevelBtn: document.getElementById('restart-level-btn'),
            nextLevelBtn: document.getElementById('next-level-btn'),
            settingsBtn: document.getElementById('settings-btn'),
            levelLength: document.getElementById('level-length'),
            levelLengthValue: document.getElementById('level-length-value'),
            intenseEffectsCheckbox: document.getElementById('intense-effects'),
            musicVolume: document.getElementById('music-volume'),
            sfxVolume: document.getElementById('sfx-volume'),
            muteAll: document.getElementById('mute-all'),
            timer: document.getElementById('timer'),
            scrambledLetters: document.getElementById('scrambled-letters'),
            answerInput: document.getElementById('answer-input'),
            submitBtn: document.getElementById('submit-btn'),
            hintBtn: document.getElementById('hint-btn'),
            hintStatus: document.getElementById('hint-status'),
            feedback: document.getElementById('feedback'),
            levelProgress: document.getElementById('level-progress'),
            progressFill: document.getElementById('progress-fill'),
            scoreDisplay: document.getElementById('score'),
            streakDisplay: document.getElementById('streak'),
            solvedCount: document.getElementById('solved-count'),
            missedCount: document.getElementById('missed-count'),
            accuracy: document.getElementById('accuracy'),
            finalScore: document.getElementById('final-score'),
            bestStreak: document.getElementById('best-streak'),
            backgroundMusic: document.getElementById('background-music'),
            tickSound: document.getElementById('tick-sound'),
            correctSound: document.getElementById('correct-sound'),
            wrongSound: document.getElementById('wrong-sound'),
            hintSound: document.getElementById('hint-sound'),
            levelCompleteSound: document.getElementById('level-complete-sound'),
            finalStretchSound: document.getElementById('final-stretch-sound')
        };

        // Initialize game
        this.init();
    }

    init() {
        this.loadPreferences();
        this.setupEventListeners();
        this.updateSettingsDisplay();
        this.loadWords();
    }

    loadPreferences() {
        const saved = localStorage.getItem('wordPuzzlePrefs');
        if (saved) {
            const prefs = JSON.parse(saved);
            this.wordsPerLevel = prefs.wordsPerLevel || 10;
            this.intenseEffects = prefs.intenseEffects !== false;
            this.musicVolume = prefs.musicVolume !== undefined ? prefs.musicVolume : 0.5;
            this.sfxVolume = prefs.sfxVolume !== undefined ? prefs.sfxVolume : 0.5;
            this.audioEnabled = prefs.audioEnabled !== false;
        }

        this.elements.levelLength.value = this.wordsPerLevel;
        this.elements.levelLengthValue.textContent = this.wordsPerLevel;
        this.elements.intenseEffectsCheckbox.checked = this.intenseEffects;
        this.elements.musicVolume.value = this.musicVolume;
        this.elements.sfxVolume.value = this.sfxVolume;
        this.elements.muteAll.checked = !this.audioEnabled;

        this.updateAudioSettings();
    }

    savePreferences() {
        const prefs = {
            wordsPerLevel: this.wordsPerLevel,
            intenseEffects: this.intenseEffects,
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
            audioEnabled: this.audioEnabled
        };
        localStorage.setItem('wordPuzzlePrefs', JSON.stringify(prefs));
    }

    updateAudioSettings() {
        this.elements.backgroundMusic.volume = this.musicVolume;
        this.elements.tickSound.volume = this.sfxVolume;
        this.elements.correctSound.volume = this.sfxVolume;
        this.elements.wrongSound.volume = this.sfxVolume;
        this.elements.hintSound.volume = this.sfxVolume;
        this.elements.levelCompleteSound.volume = this.sfxVolume;
        this.elements.finalStretchSound.volume = this.sfxVolume;

        if (!this.audioEnabled) {
            this.elements.backgroundMusic.pause();
            this.elements.backgroundMusic.currentTime = 0;
        }
    }

    setupEventListeners() {
        // Start game
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.levelLength.addEventListener('input', (e) => {
            this.wordsPerLevel = parseInt(e.target.value);
            this.elements.levelLengthValue.textContent = this.wordsPerLevel;
        });

        // Game controls
        this.elements.pauseBtn.addEventListener('click', () => this.pauseGame());
        this.elements.resumeBtn.addEventListener('click', () => this.resumeGame());
        this.elements.menuBtn.addEventListener('click', () => this.returnToMenu());
        this.elements.menuBtnEnd.addEventListener('click', () => this.returnToMenu());
        this.elements.restartBtn.addEventListener('click', () => this.restartGame());
        this.elements.restartLevelBtn.addEventListener('click', () => this.restartLevel());
        this.elements.nextLevelBtn.addEventListener('click', () => this.nextLevel());

        // Settings
        this.elements.settingsBtn.addEventListener('click', () => {
            this.elements.settingsContent.classList.toggle('active');
        });

        this.elements.intenseEffectsCheckbox.addEventListener('change', (e) => {
            this.intenseEffects = e.target.checked;
            this.savePreferences();
        });

        this.elements.musicVolume.addEventListener('input', (e) => {
            this.musicVolume = parseFloat(e.target.value);
            this.updateAudioSettings();
            this.savePreferences();
        });

        this.elements.sfxVolume.addEventListener('input', (e) => {
            this.sfxVolume = parseFloat(e.target.value);
            this.updateAudioSettings();
            this.savePreferences();
        });

        this.elements.muteAll.addEventListener('change', (e) => {
            this.audioEnabled = !e.target.checked;
            this.updateAudioSettings();
            this.savePreferences();
        });

        // Gameplay
        this.elements.submitBtn.addEventListener('click', () => this.checkAnswer());
        this.elements.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAnswer();
        });

        this.elements.hintBtn.addEventListener('click', () => this.useHint());
    }

    loadWords() {
        // In a real implementation, you would load from a file or API
        // For this example, we'll use a small sample word list
        this.words = WORD_LIST.filter(word => word.length === 6);
        if (this.words.length < this.wordsPerLevel * 5) {
            console.warn('Word list may be too small for multiple levels');
        }
    }

    startGame() {
        this.currentLevel = 1;
        this.score = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.usedWords.clear();
        this.elements.startModal.classList.remove('active');
        this.elements.backgroundMusic.currentTime = 0;
        this.elements.backgroundMusic.play().catch(e => console.log("Audio play prevented:", e));
        this.nextLevel();
    }

    nextLevel() {
        this.currentWordIndex = 0;
        this.hintUsed = false;
        this.elements.endModal.classList.remove('active');
        this.elements.levelProgress.textContent = `${this.currentLevel}/1`;
        this.elements.scoreDisplay.textContent = this.score;
        this.elements.streakDisplay.textContent = this.streak;
        this.showWord();
    }

    showWord() {
        if (this.currentWordIndex >= this.wordsPerLevel) {
            this.endLevel();
            return;
        }

        // Find a word that hasn't been used yet
        let attempts = 0;
        do {
            const randomIndex = Math.floor(Math.random() * this.words.length);
            this.currentWord = this.words[randomIndex];
            attempts++;
            if (attempts > 100) {
                console.error('Could not find unused word');
                break;
            }
        } while (this.usedWords.has(this.currentWord));

        this.usedWords.add(this.currentWord);
        this.scrambledLetters = this.scrambleWord(this.currentWord);
        this.hintUsed = false;
        this.elements.hintStatus.textContent = 'Hint available';

        this.updateUI();
        this.startTimer();
    }

    scrambleWord(word) {
        const letters = word.split('');
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        return letters;
    }

    startTimer() {
        this.timeLeft = 60;
        this.updateTimerDisplay();

        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 10 && this.timeLeft > 5) {
                this.elements.timer.classList.add('pulse');
                if (this.intenseEffects) {
                    this.elements.finalStretchSound.currentTime = 0;
                    this.elements.finalStretchSound.play().catch(e => console.log("Audio play prevented:", e));
                }
            } else if (this.timeLeft <= 5) {
                this.elements.timer.classList.add('shake');
                if (this.intenseEffects) {
                    this.elements.tickSound.currentTime = 0;
                    this.elements.tickSound.play().catch(e => console.log("Audio play prevented:", e));
                }
            }

            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        this.elements.timer.textContent = this.timeLeft;

        if (this.timeLeft <= 10) {
            this.elements.timer.style.color = 'var(--timer-critical)';
        } else if (this.timeLeft <= 20) {
            this.elements.timer.style.color = 'var(--timer-warning)';
        } else {
            this.elements.timer.style.color = 'var(--accent-color)';
        }
    }

    timeUp() {
        clearInterval(this.timer);
        this.elements.feedback.textContent = 'Time\'s up!';
        this.elements.feedback.className = 'feedback incorrect';
        this.streak = 0;
        this.elements.streakDisplay.textContent = this.streak;

        // Record missed word
        this.currentWordIndex++;
        this.updateProgress();

        // Move to next word after delay
        setTimeout(() => {
            if (this.currentWordIndex < this.wordsPerLevel) {
                this.showWord();
            }
        }, 1500);
    }

    checkAnswer() {
        const answer = this.elements.answerInput.value.trim().toLowerCase();
        this.elements.answerInput.value = '';

        if (!answer) return;

        if (answer === this.currentWord.toLowerCase()) {
            // Correct answer
            this.score += 100 + (this.streak * 20);
            this.streak++;
            this.bestStreak = Math.max(this.bestStreak, this.streak);

            this.elements.feedback.textContent = 'Correct!';
            this.elements.feedback.className = 'feedback correct';

            if (this.audioEnabled) {
                this.elements.correctSound.currentTime = 0;
                this.elements.correctSound.play().catch(e => console.log("Audio play prevented:", e));
            }

            this.currentWordIndex++;
            this.updateProgress();
        } else {
            // Incorrect answer
            this.streak = 0;
            this.elements.feedback.textContent = 'Incorrect!';
            this.elements.feedback.className = 'feedback incorrect';

            if (this.audioEnabled) {
                this.elements.wrongSound.currentTime = 0;
                this.elements.wrongSound.play().catch(e => console.log("Audio play prevented:", e));
            }

            this.currentWordIndex++;
            this.updateProgress();
        }

        this.elements.scoreDisplay.textContent = this.score;
        this.elements.streakDisplay.textContent = this.streak;

        // Move to next word after delay
        setTimeout(() => {
            if (this.currentWordIndex < this.wordsPerLevel) {
                this.showWord();
            }
        }, 1000);
    }

    useHint() {
        if (this.hintUsed || this.currentWordIndex >= this.wordsPerLevel) return;

        this.hintUsed = true;
        this.elements.hintStatus.textContent = 'Hint used';

        if (this.audioEnabled) {
            this.elements.hintSound.currentTime = 0;
            this.elements.hintSound.play().catch(e => console.log("Audio play prevented:", e));
        }

        // Show hint (first letter and length)
        const hint = `${this.currentWord[0]}${'*'.repeat(this.currentWord.length - 1)}`;
        this.elements.feedback.textContent = `Hint: ${hint}`;
        this.elements.feedback.className = 'feedback';

        // Reset feedback after delay
        setTimeout(() => {
            this.elements.feedback.textContent = '';
        }, 3000);
    }

    updateProgress() {
        const progress = ((this.currentWordIndex) / this.wordsPerLevel) * 100;
        this.elements.progressFill.style.width = `${progress}%`;
        this.elements.levelProgress.textContent = `${this.currentLevel}/${Math.ceil((this.currentWordIndex + 1) / this.wordsPerLevel)}`;
    }

    endLevel() {
        clearInterval(this.timer);

        // Calculate stats
        const solved = this.currentWordIndex;
        const missed = this.wordsPerLevel - solved;
        const accuracy = this.wordsPerLevel > 0 ? Math.round((solved / this.wordsPerLevel) * 100) : 0;

        // Update end modal
        this.elements.solvedCount.textContent = solved;
        this.elements.missedCount.textContent = missed;
        this.elements.accuracy.textContent = `${accuracy}%`;
        this.elements.finalScore.textContent = this.score;
        this.elements.bestStreak.textContent = this.bestStreak;

        // Show end modal
        this.elements.endModal.classList.add('active');

        // Play completion sound
        if (this.audioEnabled) {
            this.elements.levelCompleteSound.currentTime = 0;
            this.elements.levelCompleteSound.play().catch(e => console.log("Audio play prevented:", e));
        }

        // Stop background music
        this.elements.backgroundMusic.pause();
    }

    pauseGame() {
        clearInterval(this.timer);
        this.elements.pauseModal.classList.add('active');
        this.elements.backgroundMusic.pause();
    }

    resumeGame() {
        this.elements.pauseModal.classList.remove('active');
        this.startTimer();
        this.elements.backgroundMusic.play().catch(e => console.log("Audio play prevented:", e));
    }

    returnToMenu() {
        clearInterval(this.timer);
        this.elements.pauseModal.classList.remove('active');
        this.elements.endModal.classList.remove('active');
        this.elements.startModal.classList.add('active');
        this.elements.backgroundMusic.pause();
        this.elements.backgroundMusic.currentTime = 0;
    }

    restartGame() {
        clearInterval(this.timer);
        this.elements.backgroundMusic.pause();
        this.elements.backgroundMusic.currentTime = 0;
        this.startGame();
    }

    restartLevel() {
        clearInterval(this.timer);
        this.elements.backgroundMusic.pause();
        this.elements.backgroundMusic.currentTime = 0;
        this.nextLevel();
    }

    updateUI() {
        // Clear previous letters
        this.elements.scrambledLetters.innerHTML = '';

        // Create letter tiles
        this.scrambledLetters.forEach(letter => {
            const tile = document.createElement('div');
            tile.className = 'letter-tile';
            tile.textContent = letter.toUpperCase();
            tile.draggable = true;

            tile.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', letter);
                tile.classList.add('dragging');
            });

            tile.addEventListener('dragend', () => {
                tile.classList.remove('dragging');
            });

            this.elements.scrambledLetters.appendChild(tile);
        });

        // Set up drop zone for answer input
        this.elements.answerInput.value = '';
        this.elements.feedback.textContent = '';
        this.elements.feedback.className = 'feedback';
        this.elements.timer.classList.remove('pulse', 'shake');
    }

    updateSettingsDisplay() {
        // Update settings panel display
        this.elements.settingsContent.style.display = 'none';
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WordPuzzleGame();
});
