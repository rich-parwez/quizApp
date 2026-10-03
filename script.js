const configContainer = document.querySelector(".config-container");
const quizContainer = document.querySelector(".quiz-container");
const resultContainer = document.querySelector(".result-container");
const answerOptions = document.querySelector(".answer-options");
const nextQuestionBtn = document.querySelector(".next-question-btn");
const questionStatus = document.querySelector(".question-status");
const timerDisplay = document.querySelector(".time-duration");
const progressFill = document.querySelector(".progress-fill");
const progressLabel = document.querySelector(".progress-label");
const questionText = document.querySelector(".question-text");
const selectedCategoryPill = document.querySelector(".selected-category-pill");
const scoreValue = document.querySelector(".score-value");
const gradeValue = document.querySelector(".grade-value");
const resultTitle = document.querySelector(".result-title");
const resultMessage = document.querySelector(".result-message");

const QUIZ_TIME_LIMIT = 10;
let currentTime = QUIZ_TIME_LIMIT;
let timer = null;
let quizCategory = "entertainment";
let numberOfQuestions = 10;
let currentQuestion = null;
const questionsIndexHistory = [];
let correctAnswerCount = 0;

const normalizeCategory = (category) => category.toLowerCase().trim();

const updateCategorySelection = () => {
    const activeCategory = document.querySelector(".category-option.active");
    if (!activeCategory) return;
    selectedCategoryPill.textContent = activeCategory.textContent.trim();
};

const updateProgressUI = () => {
    const progressPercentage = (questionsIndexHistory.length / numberOfQuestions) * 100;
    progressFill.style.width = `${Math.min(progressPercentage, 100)}%`;
    progressLabel.textContent = `${questionsIndexHistory.length} / ${numberOfQuestions}`;
    questionStatus.innerHTML = `<b>${questionsIndexHistory.length}</b> of <b>${numberOfQuestions}</b> Questions`;
};

const getQuizCategoryQuestions = () => {
    const categoryMatch = questions.find(
        (category) => normalizeCategory(category.category) === normalizeCategory(quizCategory)
    );

    return categoryMatch ? categoryMatch.questions : [];
};

const showQuizResult = () => {
    const percentage = (correctAnswerCount / numberOfQuestions) * 100;

    quizContainer.style.display = "none";
    resultContainer.style.display = "block";

    if (percentage >= 80) {
        resultTitle.textContent = "Excellent work!";
        resultMessage.innerHTML = `You scored <b>${correctAnswerCount}</b> out of <b>${numberOfQuestions}</b> with a <b>${Math.round(percentage)}%</b> accuracy.`;
        gradeValue.textContent = "Excellent";
    } else if (percentage >= 60) {
        resultTitle.textContent = "Nice job!";
        resultMessage.innerHTML = `You answered <b>${correctAnswerCount}</b> questions correctly out of <b>${numberOfQuestions}</b>. Strong effort!`;
        gradeValue.textContent = "Good";
    } else if (percentage >= 40) {
        resultTitle.textContent = "Good try!";
        resultMessage.innerHTML = `You got <b>${correctAnswerCount}</b> correct out of <b>${numberOfQuestions}</b>. A little more practice and you'll shine.`;
        gradeValue.textContent = "Fair";
    } else {
        resultTitle.textContent = "Keep learning!";
        resultMessage.innerHTML = `You answered <b>${correctAnswerCount}</b> out of <b>${numberOfQuestions}</b> correctly. Every round helps you improve.`;
        gradeValue.textContent = "Practice";
    }

    scoreValue.textContent = `${correctAnswerCount} / ${numberOfQuestions}`;
};

const resetTimer = () => {
    clearInterval(timer);
    currentTime = QUIZ_TIME_LIMIT;
    timerDisplay.textContent = `${currentTime}s`;
    document.querySelector(".quiz-timer").style.background = "#111827";
};

const startTimer = () => {
    timer = setInterval(() => {
        currentTime--;
        timerDisplay.textContent = `${currentTime}s`;

        if (currentTime <= 0) {
            clearInterval(timer);
            highlightCorrectAnswer();
            nextQuestionBtn.style.visibility = "visible";
            document.querySelector(".quiz-timer").style.background = "#dc2626";
            answerOptions.querySelectorAll(".answer-option").forEach((option) => {
                option.style.pointerEvents = "none";
            });
        }
    }, 1000);
};

const getRandomQuestion = () => {
    const categoryQuestions = getQuizCategoryQuestions();

    if (questionsIndexHistory.length >= Math.min(categoryQuestions.length, numberOfQuestions)) {
        showQuizResult();
        return null;
    }

    const availableQuestions = categoryQuestions.filter((_, index) => !questionsIndexHistory.includes(index));
    const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

    if (!randomQuestion) {
        showQuizResult();
        return null;
    }

    questionsIndexHistory.push(categoryQuestions.indexOf(randomQuestion));
    return randomQuestion;
};

const highlightCorrectAnswer = () => {
    if (!currentQuestion) return;

    const correctOption = answerOptions.querySelectorAll(".answer-option")[currentQuestion.correctAnswer];
    if (!correctOption) return;

    correctOption.classList.add("correct");
    correctOption.insertAdjacentHTML("beforeend", '<span class="material-symbols-rounded">check_circle</span>');
};

const handleAnswer = (option, answerIndex) => {
    if (!currentQuestion) return;

    clearInterval(timer);
    const isCorrect = currentQuestion.correctAnswer === answerIndex;
    option.classList.add(isCorrect ? "correct" : "incorrect");

    if (isCorrect) {
        correctAnswerCount += 1;
        option.insertAdjacentHTML("beforeend", '<span class="material-symbols-rounded">check_circle</span>');
    } else {
        highlightCorrectAnswer();
        option.insertAdjacentHTML("beforeend", '<span class="material-symbols-rounded">cancel</span>');
    }

    answerOptions.querySelectorAll(".answer-option").forEach((answerOption) => {
        answerOption.style.pointerEvents = "none";
    });

    nextQuestionBtn.style.visibility = "visible";
};

const renderQuestion = () => {
    currentQuestion = getRandomQuestion();
    if (!currentQuestion) return;

    resetTimer();
    startTimer();

    answerOptions.innerHTML = "";
    nextQuestionBtn.style.visibility = "hidden";
    questionText.textContent = currentQuestion.question;
    updateProgressUI();

    currentQuestion.options.forEach((optionText, index) => {
        const option = document.createElement("li");
        option.classList.add("answer-option");
        option.textContent = optionText;
        option.setAttribute("role", "button");
        option.setAttribute("tabindex", "0");
        option.addEventListener("click", () => handleAnswer(option, index));
        option.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleAnswer(option, index);
            }
        });
        answerOptions.appendChild(option);
    });
};

const startQuiz = () => {
    correctAnswerCount = 0;
    questionsIndexHistory.length = 0;
    quizCategory = configContainer.querySelector(".category-option.active").textContent.trim();
    numberOfQuestions = Number(configContainer.querySelector(".question-option.active").textContent.trim());

    configContainer.classList.remove("active");
    quizContainer.classList.add("active");
    resultContainer.style.display = "none";
    renderQuestion();
};

document.querySelectorAll(".category-option").forEach((option) => {
    option.addEventListener("click", () => {
        option.parentNode.querySelector(".active").classList.remove("active");
        option.classList.add("active");
        updateCategorySelection();
    });
});

document.querySelectorAll(".question-option").forEach((option) => {
    option.addEventListener("click", () => {
        option.parentNode.querySelector(".active").classList.remove("active");
        option.classList.add("active");
    });
});

const resetQuiz = () => {
    clearInterval(timer);
    correctAnswerCount = 0;
    questionsIndexHistory.length = 0;
    scoreValue.textContent = "0 / 10";
    gradeValue.textContent = "Keep going";
    resultTitle.textContent = "Great effort!";
    resultMessage.textContent = "";
    resetTimer();
    configContainer.classList.add("active");
    quizContainer.classList.remove("active");
    resultContainer.style.display = "none";
    updateCategorySelection();
    progressFill.style.width = "0%";
    progressLabel.textContent = `0 / ${numberOfQuestions}`;
    questionStatus.innerHTML = `<b>0</b> of <b>${numberOfQuestions}</b> Questions`;
};

nextQuestionBtn.addEventListener("click", renderQuestion);
document.querySelector(".try-again-btn").addEventListener("click", resetQuiz);
document.querySelector(".back-to-config-btn").addEventListener("click", resetQuiz);
document.querySelector(".start-quiz-btn").addEventListener("click", startQuiz);

updateCategorySelection();
updateProgressUI();
resetQuiz();
