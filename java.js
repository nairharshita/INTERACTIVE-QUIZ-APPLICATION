// Select elements
const questionDisplay = document.getElementById("question");
const choicesContainer = document.getElementById("answers");
const feedbackMessage = document.getElementById("feedback");
const countdownTimer = document.getElementById("time-left");
const progressIndicator = document.getElementById("progress-bar");

const apiEndpoint = "https://opentdb.com/api.php?amount=5&type=multiple";
let quizData = [];
let activeQuestionIndex = 0;
let userScore = 0;
let countdown = 10;
let timer;
let isAnswered = false; // Ensures users cannot click multiple times

// Fetch questions from API
async function fetchQuizData() {
    try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) throw new Error("Failed to fetch questions");

        const data = await response.json();
        if (!data.results || data.results.length === 0) throw new Error("No questions available");

        // Process quiz data
        quizData = data.results.map(entry => ({
            prompt: entry.question,
            options: [...entry.incorrect_answers, entry.correct_answer].sort(() => Math.random() - 0.5),
            solution: entry.correct_answer
        }));

        displayNextQuestion();
    } catch (error) {
        console.error("Error loading quiz:", error);
        questionDisplay.textContent = "Error loading quiz. Please refresh.";
    }
}

// Start countdown
function startCountdown() {
    countdown = 10;
    countdownTimer.textContent = countdown;
    clearInterval(timer);

    timer = setInterval(() => {
        countdown--;
        countdownTimer.textContent = countdown;

        if (countdown === 0) {
            clearInterval(timer);
            handleTimeUp();
        }
    }, 1000);
}

// Update progress bar
function updateProgress() {
    const progress = ((activeQuestionIndex + 1) / quizData.length) * 100;
    progressIndicator.style.width = `${progress}%`;
}

// Disable answer buttons
function disableOptions() {
    document.querySelectorAll("#answers button").forEach(btn => btn.disabled = true);
}

// Load next question automatically
function displayNextQuestion() {
    if (activeQuestionIndex >= quizData.length) {
        showFinalScore();
        return;
    }

    feedbackMessage.textContent = "";
    isAnswered = false; // Reset answered state

    const currentQuery = quizData[activeQuestionIndex];
    questionDisplay.innerHTML = currentQuery.prompt;
    choicesContainer.innerHTML = "";

    currentQuery.options.forEach(choice => {
        const optionButton = document.createElement("button");
        optionButton.textContent = choice;
        optionButton.onclick = () => {
            if (!isAnswered) {
                clearInterval(timer);
                evaluateAnswer(choice);
                isAnswered = true;
                setTimeout(moveToNext, 2000); // Auto-move to next after 2 seconds
            }
        };
        choicesContainer.appendChild(optionButton);
    });

    updateProgress();
    startCountdown();
}

// Check answer and allow moving to next question
function evaluateAnswer(selection) {
    const currentQuery = quizData[activeQuestionIndex];

    if (selection === currentQuery.solution) {
        feedbackMessage.textContent = "Correct!";
        feedbackMessage.className = "correct";
        userScore++;
    } else {
        feedbackMessage.textContent = `Incorrect! Correct answer: ${currentQuery.solution}`;
        feedbackMessage.className = "wrong";
    }

    disableOptions();
}

// If time runs out, show correct answer and move to next question
function handleTimeUp() {
    feedbackMessage.textContent = `Time's up! Correct answer: ${quizData[activeQuestionIndex]?.solution || "N/A"}`;
    feedbackMessage.className = "wrong";
    disableOptions();
    setTimeout(moveToNext, 2000); // Auto-move after 2 seconds
}

// Move to the next question automatically
function moveToNext() {
    activeQuestionIndex++;

    if (activeQuestionIndex < quizData.length) {
        displayNextQuestion();
    } else {
        showFinalScore();
    }
}

// Show final score when quiz ends
function showFinalScore() {
    questionDisplay.textContent = `Quiz Finished! 🎉 Your score: ${userScore}/${quizData.length}`;
    choicesContainer.innerHTML = "";
    progressIndicator.style.width = "100%";
}

// Start quiz
fetchQuizData();
