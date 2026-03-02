class TextResponseExperiment {
    constructor() {
        this.texts = [];
        this.responses = [];
        this.currentIndex = 0;
        this.isStarted = false;
        this.userId = null;
        this.listId = this.getListIdFromUrl();
        
        this.initializeElements();
        this.bindEvents();
        this.loadFromCSV(this.getListFilename());
    }

    initializeElements() {
        // Screen elements
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.experimentScreen = document.getElementById('experiment-screen');
        this.completionScreen = document.getElementById('completion-screen');
        
        // Welcome screen elements
        this.startBtn = document.getElementById('start-btn');
        this.totalTextsSpan = document.getElementById('total-texts');
        this.userIdInput = document.getElementById('user-id-input');
        this.userIdError = document.getElementById('user-id-error');
        
        // Experiment screen elements
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        this.currentTextNumber = document.getElementById('current-text-number');
        this.textContent = document.getElementById('text-content');
        this.responseTextarea = document.getElementById('response-textarea');
        this.nextBtn = document.getElementById('next-btn');
        
        // Completion screen elements
        this.downloadBtn = document.getElementById('download-btn');
        this.completionCode = document.getElementById('completion-code');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startExperiment());
        this.nextBtn.addEventListener('click', () => this.nextText());
        this.responseTextarea.addEventListener('input', () => this.validateResponse());
        this.downloadBtn.addEventListener('click', () => this.downloadResults());
        this.userIdInput.addEventListener('input', () => this.validateUserId());
        
        // Allow Enter key to submit (with Ctrl/Cmd modifier to prevent accidental submission)
        this.responseTextarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                if (!this.nextBtn.disabled) {
                    this.nextText();
                }
            }
        });
    }

    getListIdFromUrl() {
        try {
            const params = new URLSearchParams(window.location.search);
            const raw = params.get('list_id');
            let listId = parseInt(raw, 10);
            if (!Number.isFinite(listId) || listId < 1 || listId > 20) {
                listId = 1;
            }
            return listId;
        } catch (e) {
            console.warn('Error parsing list_id from URL, defaulting to 1', e);
            return 1;
        }
    }

    getListFilename() {
        return `dei10_list_${this.listId}.csv`;
    }

    // Method to load data from CSV
    async loadFromCSV(csvFile) {
        try {
            const response = await fetch(csvFile);
            const csvText = await response.text();
            this.texts = this.parseCSV(csvText);
            this.updateWelcomeScreen();
        } catch (error) {
            console.error('Error loading CSV:', error);
            alert('Error loading experiment data. Please check the CSV file.');
        }
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const texts = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            if (values.length >= 2) {
                texts.push({
                    id: parseInt(values[0]) || i,
                    text: values[1] || values[0] // Use second column if available, otherwise first
                });
            }
        }
        // Randomize order so participants with the same list_id
        // do not all see items in the same sequence
        for (let i = texts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [texts[i], texts[j]] = [texts[j], texts[i]];
        }

        return texts;
    }

    updateWelcomeScreen() {
        this.totalTextsSpan.textContent = this.texts.length;
    }

    validateUserId() {
        const userId = this.userIdInput.value.trim();
        const errorElement = this.userIdError;
        
        if (userId.length === 0) {
            errorElement.textContent = 'Please enter your User ID';
            this.startBtn.disabled = true;
            return false;
        } else if (userId.length < 3) {
            errorElement.textContent = 'User ID must be at least 3 characters long';
            this.startBtn.disabled = true;
            return false;
        } else {
            errorElement.textContent = '';
            this.startBtn.disabled = false;
            return true;
        }
    }

    startExperiment() {
        if (this.texts.length === 0) {
            alert('No texts available for the experiment.');
            return;
        }

        if (!this.validateUserId()) {
            return;
        }

        this.userId = this.userIdInput.value.trim();
        this.isStarted = true;
        this.currentIndex = 0;
        this.responses = [];
        
        this.showScreen('experiment');
        this.displayCurrentText();
    }

    showScreen(screenName) {
        // Hide all screens
        this.welcomeScreen.classList.remove('active');
        this.experimentScreen.classList.remove('active');
        this.completionScreen.classList.remove('active');
        
        // Show the requested screen
        switch (screenName) {
            case 'welcome':
                this.welcomeScreen.classList.add('active');
                break;
            case 'experiment':
                this.experimentScreen.classList.add('active');
                break;
            case 'completion':
                this.completionScreen.classList.add('active');
                break;
        }
    }

    displayCurrentText() {
        const currentText = this.texts[this.currentIndex];
        
        // Update progress
        const progress = ((this.currentIndex + 1) / this.texts.length) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.progressText.textContent = `${this.currentIndex + 1} / ${this.texts.length}`;
        
        // Update text content
        this.currentTextNumber.textContent = this.currentIndex + 1;
        this.textContent.textContent = currentText.text;
        
        // Clear response and reset button
        this.responseTextarea.value = '';
        this.nextBtn.disabled = true;
        this.responseTextarea.focus();
    }

    validateResponse() {
        const response = this.responseTextarea.value.trim();
        this.nextBtn.disabled = response.length === 0;
    }

    nextText() {
        if (this.nextBtn.disabled) return;
        
        // Save current response
        const response = this.responseTextarea.value.trim();
        this.responses.push({
            textId: this.texts[this.currentIndex].id,
            textIndex: this.currentIndex,
            response: response,
            timestamp: new Date().toISOString()
        });
        
        // Move to next text or complete experiment
        this.currentIndex++;
        
        if (this.currentIndex < this.texts.length) {
            this.displayCurrentText();
        } else {
            this.completeExperiment();
        }
    }

    completeExperiment() {
        // Generate a completion code (placeholder implementation)
        const completionCode = this.generateCompletionCode();
        this.completionCode.textContent = completionCode;
        this.showScreen('completion');
    }

    generateCompletionCode() {
        // Simple completion code generation (placeholder)
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 9; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    downloadResults() {
        const results = {
            experiment: 'Language Comprehension Game',
            userId: this.userId,
            completionCode: this.completionCode.textContent,
            completedAt: new Date().toISOString(),
            totalTexts: this.texts.length,
            responses: this.responses
        };
        
        const dataStr = JSON.stringify(results, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `experiment_results_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Public method to load custom CSV data
    setTexts(texts) {
        this.texts = texts;
        this.updateWelcomeScreen();
    }
}

// Initialize the experiment when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.experiment = new TextResponseExperiment();
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextResponseExperiment;
}
