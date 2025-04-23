document.addEventListener('DOMContentLoaded', () => {
    const quizContainer = document.getElementById('quiz-container');

    let currentQuestions = [];
    let currentQuestionIndex = 0;

    function fetchQuiz() {
        fetch('https://opentdb.com/api.php?amount=5&type=multiple')
            .then(response => response.json())
            .then(data => {
                currentQuestions = data.results;
                currentQuestionIndex = 0;
                displayQuestion(currentQuestionIndex);
            })
            .catch(error => console.error('Error fetching the quiz:', error));
    }

    function displayQuestion(index) {
        const question = currentQuestions[index];
        quizContainer.innerHTML = `
            <div class="card question-card">
                <p>${index + 1}. ${decodeHTML(question.question)}</p>
                <div class="options-container">
                    ${generateOptions(question)}
                </div>
            </div>
        `;

        const buttons = document.querySelectorAll('.option-button');
        buttons.forEach(button => button.addEventListener('click', () => {
            selectOption(button, index);
            moveToNext(index);
        }));
    }

    function generateOptions(question) {
        let options = [...question.incorrect_answers, question.correct_answer];
        options.sort(() => Math.random() - 0.5);
        return options.map(option => `
            <button class="option option-button" data-value="${decodeHTML(option)}">
                ${decodeHTML(option)}
            </button>
        `).join('');
    }

    function selectOption(button, index) {
        document.querySelectorAll('.option-button').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        checkAnswer(index);
    }

    function checkAnswer(index) {
        const question = currentQuestions[index];
        const selectedButton = document.querySelector('.option-button.selected');
        if (selectedButton) {
            question.userAnswer = selectedButton.dataset.value === decodeHTML(question.correct_answer);
            selectedButton.classList.add(question.userAnswer ? 'correct-option' : 'incorrect-option');
        }
    }

    function moveToNext(index) {
        setTimeout(() => {
            if (index < currentQuestions.length - 1) {
                currentQuestionIndex++;
                displayQuestion(currentQuestionIndex);
            } else {
                displayResults();
            }
        }, 1000);
    }

    function displayResults() {
        let correctAnswers = currentQuestions.filter(question => question.userAnswer).length;
        quizContainer.innerHTML = `<h2>Results</h2>`;
        quizContainer.innerHTML += `<h3 style="font-size: 2em; margin-bottom: 20px;">${correctAnswers}/5 Correct</h3>`; // Display the results score

        currentQuestions.forEach((question, index) => {
            const resultElem = document.createElement('p');
            if (question.userAnswer) {
                resultElem.textContent = `${index + 1}. Correct: The answer is: ${decodeHTML(question.correct_answer)}`;
                resultElem.style.color = 'green';
            } else {
                resultElem.textContent = `${index + 1}. Wrong: The correct answer was: ${decodeHTML(question.correct_answer)}`;
                resultElem.style.color = 'red';
            }
            quizContainer.appendChild(resultElem);
        });

        const retryButton = document.createElement('button');
        retryButton.textContent = 'Retry';
        retryButton.onclick = fetchQuiz;
        quizContainer.appendChild(retryButton);
    }

    function decodeHTML(html) {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    }

    fetchQuiz(); // Fetch a new quiz on page load
});