const playContainer = document.getElementById("playContainer");
const questionContainer = document.getElementById("QuestionContainer");
const questionElement = document.getElementById("question");
const optionsElement = document.getElementById("options");

let currentQuiz = null;
let currentQuestionIndex = 0;
let score = 0;

async function fetchQuizList() {
    try {
        const response = await fetch('http://localhost:3000/quizzes');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Could not fetch quiz list:", error);
        return [];
    }
}

async function loadQuiz(quizId) {
    try {
        const response = await fetch(`http://localhost:3000/quizzes/${quizId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        currentQuiz = await response.json();
        currentQuestionIndex = 0;
        score = 0;
        loadQuestion();
        playContainer.style.display = "none";
        questionContainer.style.display = "block";
    } catch (error) {
        console.error("Could not load quiz:", error);
        questionElement.textContent = "Failed to load quiz. Please try again later.";
    }
}

function loadQuestion() {
    if (!currentQuiz || currentQuestionIndex >= currentQuiz.questions.length) {
        // Quiz finished
        questionElement.textContent = `Quiz Completed! Your score: ${score}/${currentQuiz ? currentQuiz.questions.length : 0}`;
        optionsElement.innerHTML = `<li>Thanks for playing! <button class="btn btn-primary" onclick="restartQuiz()">Play Again</button></li>`;
        return;
    }

    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    questionElement.textContent = currentQuestion.question;
    optionsElement.innerHTML = ""; // Clear previous options

    currentQuestion.options.forEach((option, index) => {
        const li = document.createElement("li");
        li.innerHTML = `<button class="btn" onclick="checkAnswer(${index})">${option}</button>`;
        optionsElement.appendChild(li);
    });
}

function checkAnswer(selectedIndex) {
    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    const buttons = optionsElement.querySelectorAll(".btn");
    const correctAnswerIndex = currentQuestion.correctAnswer;

    buttons.forEach((button, index) => {
        button.disabled = true; // Disable all buttons

        if (index === correctAnswerIndex) {
            button.classList.add("correct");
        } else if (index === selectedIndex) {
            button.classList.add("wrong");
        }
    });

    if (selectedIndex === correctAnswerIndex) {
        score++;
    }

    setTimeout(() => {
        currentQuestionIndex++;
        loadQuestion();
    }, 1500); // Move to the next question after a short delay
}

function playClick() {
    const quizSelect = document.getElementById('quizSelect');
    const selectedQuizId = quizSelect.value;
    if (selectedQuizId) {
        loadQuiz(selectedQuizId);
    } else {
        alert("Please select a quiz!");
    }
}

function restartQuiz() {
    const quizSelect = document.getElementById('quizSelect');
    const selectedQuizId = quizSelect.value;
    if (selectedQuizId) {
        loadQuiz(selectedQuizId);
    } else {
        // If no quiz was selected before, show the selection screen again
        playContainer.style.display = "block";
        questionContainer.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const quizzes = await fetchQuizList();
    const quizSelect = document.getElementById('quizSelect');

    if (quizzes.length === 0) {
        playContainer.innerHTML = "<p>No quizzes available. Please check your JSON Server.</p>";
        return;
    }

    quizzes.forEach(quiz => {
        const option = document.createElement('option');
        option.value = quiz.id;
        option.textContent = quiz.title;
        quizSelect.appendChild(option);
    });
});