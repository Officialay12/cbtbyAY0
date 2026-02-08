// Ultimate CBT Portal - Main Application
document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const preloader = document.querySelector(".preloader");
  const screens = {
    welcome: document.getElementById("welcomeScreen"),
    course: document.getElementById("courseScreen"),
    exam: document.getElementById("examScreen"),
    results: document.getElementById("resultsScreen"),
  };

  const startBtn = document.getElementById("startBtn");
  const backBtn = document.getElementById("backBtn");
  const examBackBtn = document.getElementById("examBackBtn");
  const courseCards = document.querySelectorAll(".course-card");

  // Exam elements
  const examTitle = document.getElementById("examTitle");
  const examSubtitle = document.getElementById("examSubtitle");
  const currentQuestionNumber = document.getElementById(
    "currentQuestionNumber",
  );
  const totalQuestions = document.getElementById("totalQuestions");
  const questionText = document.getElementById("questionText");
  const optionsContainer = document.getElementById("optionsContainer");
  const questionStatus = document.getElementById("questionStatus");
  const markReviewBtn = document.getElementById("markReviewBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const questionGrid = document.getElementById("questionGrid");

  // Progress elements
  const answeredCount = document.getElementById("answeredCount");
  const notAnsweredCount = document.getElementById("notAnsweredCount");
  const markedCount = document.getElementById("markedCount");
  const progressBarFill = document.getElementById("progressBarFill");
  const progressPercentage = document.getElementById("progressPercentage");

  // Timer elements
  const timerDisplay = document.getElementById("timerDisplay");
  const timerWarning = document.getElementById("timerWarning");
  const timerProgress = document.querySelector(".timer-progress");

  // Results elements
  const resultsCourse = document.getElementById("resultsCourse");
  const finalScore = document.getElementById("finalScore");
  const grade = document.getElementById("grade");
  const performance = document.getElementById("performance");
  const correctAnswers = document.getElementById("correctAnswers");
  const wrongAnswers = document.getElementById("wrongAnswers");
  const timeUsed = document.getElementById("timeUsed");
  const accuracyRate = document.getElementById("accuracyRate");
  const sectionBreakdown = document.getElementById("sectionBreakdown");
  const reviewQuestions = document.getElementById("reviewQuestions");
  const reviewFilters = document.querySelectorAll(".review-filter");

  // Buttons
  const submitExamBtn = document.getElementById("submitExamBtn");
  const retakeBtn = document.getElementById("retakeBtn");
  const newCourseBtn = document.getElementById("newCourseBtn");
  const printResultsBtn = document.getElementById("printResultsBtn");
  const shareResultsBtn = document.getElementById("shareResultsBtn");

  // Modal elements
  const confirmationModal = document.getElementById("confirmationModal");
  const modalClose = document.getElementById("modalClose");
  const cancelSubmitBtn = document.getElementById("cancelSubmitBtn");
  const confirmSubmitBtn = document.getElementById("confirmSubmitBtn");
  const remainingQuestionsCount = document.getElementById(
    "remainingQuestionsCount",
  );
  const modalAnsweredCount = document.getElementById("modalAnsweredCount");
  const modalMarkedCount = document.getElementById("modalMarkedCount");

  // Fullscreen elements
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const fullscreenWarning = document.getElementById("fullscreenWarning");

  // Audio elements
  const clickSound = document.getElementById("clickSound");
  const correctSound = document.getElementById("correctSound");
  const submitSound = document.getElementById("submitSound");

  // Application State
  let currentScreen = "welcome";
  let currentCourse = null;
  let currentExam = null;
  let userAnswers = {};
  let markedQuestions = new Set();
  let currentQuestionIndex = 0;
  let timerInterval = null;
  let timeRemaining = 0;
  let examStartTime = null;
  let examResults = null;

  // Initialize application
  function init() {
    // Start preloader animation
    startPreloader();

    // Setup event listeners
    setupEventListeners();

    // Create floating particles
    createParticles();

    // Initialize audio
    initializeAudio();
  }

  // Start preloader animation
  function startPreloader() {
    const progressBar = document.querySelector(".progress-bar");
    const loadingDots = document.querySelectorAll(".loading-dots span");

    // Animate progress bar
    progressBar.style.width = "100%";

    // Animate dots sequentially
    loadingDots.forEach((dot, index) => {
      dot.style.animationDelay = `${index * 0.2}s`;
    });

    // Hide preloader after 3 seconds
    setTimeout(() => {
      preloader.classList.add("fade-out");

      setTimeout(() => {
        preloader.style.display = "none";
        showScreen("welcome");
        playSound(clickSound);
      }, 800);
    }, 3000);
  }

  // Setup all event listeners
  function setupEventListeners() {
    // Navigation buttons
    startBtn.addEventListener("click", () => {
      playSound(clickSound);
      showScreen("course");
    });

    backBtn.addEventListener("click", () => {
      playSound(clickSound);
      showScreen("welcome");
    });

    examBackBtn.addEventListener("click", () => {
      playSound(clickSound);
      showConfirmExit();
    });

    // Course selection
    courseCards.forEach((card) => {
      card.addEventListener("click", function () {
        const course = this.getAttribute("data-course");
        playSound(clickSound);
        startExam(course);
      });
    });

    // Exam navigation
    prevBtn.addEventListener("click", () => {
      playSound(clickSound);
      showPreviousQuestion();
    });

    nextBtn.addEventListener("click", () => {
      playSound(clickSound);
      showNextQuestion();
    });

    // Mark for review
    markReviewBtn.addEventListener("click", () => {
      playSound(clickSound);
      toggleMarkReview();
    });

    // Submit exam
    submitExamBtn.addEventListener("click", () => {
      playSound(clickSound);
      showSubmitConfirmation();
    });

    // Modal buttons
    modalClose.addEventListener("click", hideSubmitConfirmation);
    cancelSubmitBtn.addEventListener("click", hideSubmitConfirmation);
    confirmSubmitBtn.addEventListener("click", submitExam);

    // Results buttons
    retakeBtn.addEventListener("click", () => {
      playSound(clickSound);
      startExam(currentCourse);
    });

    newCourseBtn.addEventListener("click", () => {
      playSound(clickSound);
      showScreen("course");
    });

    printResultsBtn.addEventListener("click", () => {
      playSound(clickSound);
      printResults();
    });

    shareResultsBtn.addEventListener("click", () => {
      playSound(clickSound);
      shareResults();
    });

    // Review filters
    reviewFilters.forEach((filter) => {
      filter.addEventListener("click", function () {
        playSound(clickSound);
        reviewFilters.forEach((f) => f.classList.remove("active"));
        this.classList.add("active");
        filterReviewQuestions(this.getAttribute("data-filter"));
      });
    });

    // Fullscreen
    fullscreenBtn.addEventListener("click", toggleFullscreen);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.fullscreenElement) {
        document.exitFullscreen();
      }
    });

    // Keyboard shortcuts for exam
    document.addEventListener("keydown", handleKeyboardShortcuts);
  }

  // Show specific screen
  function showScreen(screenName) {
    // Hide all screens
    Object.values(screens).forEach((screen) => {
      screen.classList.remove("active");
    });

    // Show requested screen
    screens[screenName].classList.add("active");
    currentScreen = screenName;

    // Add entrance animation
    const screenElement = screens[screenName];
    screenElement.style.animation = "slideUp 0.8s ease-out";

    setTimeout(() => {
      screenElement.style.animation = "";
    }, 800);
  }

  // Start exam
  function startExam(course) {
    currentCourse = course;
    currentExam = questionsData[course];

    if (!currentExam) {
      alert("Exam data not available. Please try again later.");
      return;
    }

    // Reset exam state
    userAnswers = {};
    markedQuestions.clear();
    currentQuestionIndex = 0;
    timeRemaining = currentExam.duration * 60;
    examStartTime = new Date();

    // Update UI
    examTitle.textContent = currentExam.course;
    examSubtitle.textContent = "CBT Practice Examination";
    totalQuestions.textContent = currentExam.questions.length;

    // Initialize question navigation
    initQuestionGrid();

    // Load first question
    loadQuestion(0);

    // Show exam screen
    showScreen("exam");

    // Start timer
    startTimer();
  }

  // Initialize question grid
  function initQuestionGrid() {
    questionGrid.innerHTML = "";

    currentExam.questions.forEach((question, index) => {
      const questionNumber = document.createElement("div");
      questionNumber.className = "question-number";
      questionNumber.textContent = index + 1;
      questionNumber.dataset.index = index;

      questionNumber.addEventListener("click", () => {
        playSound(clickSound);
        loadQuestion(index);
      });

      questionGrid.appendChild(questionNumber);
    });

    updateProgress();
  }

  // Load specific question
  function loadQuestion(index) {
    if (index < 0 || index >= currentExam.questions.length) return;

    currentQuestionIndex = index;
    const question = currentExam.questions[index];

    // Update question number
    currentQuestionNumber.textContent = index + 1;

    // Update question text
    questionText.textContent = question.text;

    // Clear and rebuild options
    optionsContainer.innerHTML = "";

    question.options.forEach((option, optionIndex) => {
      const optionElement = document.createElement("div");
      optionElement.className = "option-item";

      if (userAnswers[question.id] === optionIndex) {
        optionElement.classList.add("selected");
      }

      optionElement.innerHTML = `
                <div class="option-letter">${String.fromCharCode(65 + optionIndex)}</div>
                <div class="option-text">${option}</div>
            `;

      optionElement.addEventListener("click", () => {
        selectOption(question.id, optionIndex);
      });

      optionsContainer.appendChild(optionElement);
    });

    // Update question status
    updateQuestionStatus();

    // Update mark review button
    updateMarkReviewButton();

    // Update question grid highlighting
    updateQuestionGridHighlighting();

    // Update navigation buttons
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === currentExam.questions.length - 1;
  }

  // Select an option
  function selectOption(questionId, optionIndex) {
    const question = currentExam.questions.find((q) => q.id === questionId);

    // Play sound based on correctness (for demo, assume all are correct)
    playSound(correctSound);

    // Update user answer
    userAnswers[questionId] = optionIndex;

    // Update UI
    const options = document.querySelectorAll(".option-item");
    options.forEach((option, index) => {
      if (index === optionIndex) {
        option.classList.add("selected");
      } else {
        option.classList.remove("selected");
      }
    });

    // Update question status
    updateQuestionStatus();

    // Update progress
    updateProgress();

    // Update question grid
    updateQuestionGridHighlighting();

    // Auto-advance to next question after short delay
    setTimeout(() => {
      if (currentQuestionIndex < currentExam.questions.length - 1) {
        showNextQuestion();
      }
    }, 500);
  }

  // Update question status
  function updateQuestionStatus() {
    const question = currentExam.questions[currentQuestionIndex];

    if (userAnswers[question.id] !== undefined) {
      questionStatus.textContent = "Answered";
      questionStatus.style.color = "#00ff88";
    } else {
      questionStatus.textContent = "Not Answered";
      questionStatus.style.color = "#ff6b6b";
    }
  }

  // Toggle mark for review
  function toggleMarkReview() {
    const questionId = currentExam.questions[currentQuestionIndex].id;

    if (markedQuestions.has(questionId)) {
      markedQuestions.delete(questionId);
    } else {
      markedQuestions.add(questionId);
    }

    updateMarkReviewButton();
    updateQuestionGridHighlighting();
    updateProgress();
  }

  // Update mark review button
  function updateMarkReviewButton() {
    const questionId = currentExam.questions[currentQuestionIndex].id;
    const isMarked = markedQuestions.has(questionId);

    if (isMarked) {
      markReviewBtn.innerHTML =
        '<i class="fas fa-flag"></i> <span>Unmark Review</span>';
      markReviewBtn.classList.add("active");
    } else {
      markReviewBtn.innerHTML =
        '<i class="far fa-flag"></i> <span>Mark for Review</span>';
      markReviewBtn.classList.remove("active");
    }
  }

  // Update question grid highlighting
  function updateQuestionGridHighlighting() {
    const questionNumbers = document.querySelectorAll(".question-number");

    questionNumbers.forEach((numberElement, index) => {
      const questionId = currentExam.questions[index].id;

      // Reset classes
      numberElement.className = "question-number";

      // Add appropriate classes
      if (index === currentQuestionIndex) {
        numberElement.classList.add("current");
      }

      if (userAnswers[questionId] !== undefined) {
        numberElement.classList.add("answered");
      }

      if (markedQuestions.has(questionId)) {
        numberElement.classList.add("marked");
      }
    });
  }

  // Update progress display
  function updateProgress() {
    const total = currentExam.questions.length;
    const answered = Object.keys(userAnswers).length;
    const marked = markedQuestions.size;
    const notAnswered = total - answered;
    const percentage = Math.round((answered / total) * 100);

    // Update counts
    answeredCount.textContent = answered;
    notAnsweredCount.textContent = notAnswered;
    markedCount.textContent = marked;

    // Update progress bar
    progressBarFill.style.width = `${percentage}%`;
    progressPercentage.textContent = `${percentage}%`;

    // Update modal counts
    modalAnsweredCount.textContent = answered;
    modalMarkedCount.textContent = marked;
    remainingQuestionsCount.textContent = notAnswered;
  }

  // Show previous question
  function showPreviousQuestion() {
    if (currentQuestionIndex > 0) {
      loadQuestion(currentQuestionIndex - 1);
    }
  }

  // Show next question
  function showNextQuestion() {
    if (currentQuestionIndex < currentExam.questions.length - 1) {
      loadQuestion(currentQuestionIndex + 1);
    }
  }

  // Start exam timer
  function startTimer() {
    // Clear existing timer
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    // Update display immediately
    updateTimerDisplay();

    // Start timer interval
    timerInterval = setInterval(() => {
      timeRemaining--;
      updateTimerDisplay();

      // Check for time expiration
      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        submitExam();
      }

      // Show warnings
      if (timeRemaining === 300) {
        // 5 minutes
        showTimerWarning("5 minutes remaining!");
      } else if (timeRemaining === 60) {
        // 1 minute
        showTimerWarning("1 minute remaining! Hurry up!");
      }
    }, 1000);
  }

  // Update timer display
  function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    // Update text
    timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    // Update progress circle
    const totalTime = currentExam.duration * 60;
    const progress = ((totalTime - timeRemaining) / totalTime) * 360;

    if (timerProgress) {
      timerProgress.style.strokeDasharray = `${progress}, 20000`;
    }

    // Change color based on time remaining
    if (timeRemaining <= 300) {
      // 5 minutes or less
      timerDisplay.style.color = "#ff6b6b";
      if (timerProgress) {
        timerProgress.style.stroke = "#ff6b6b";
      }
    }
  }

  // Show timer warning
  function showTimerWarning(message) {
    timerWarning.textContent = message;
    timerWarning.style.animation = "pulse 1s infinite";

    // Flash warning
    setTimeout(() => {
      timerWarning.style.animation = "";
      setTimeout(() => {
        timerWarning.textContent = "";
      }, 2000);
    }, 3000);
  }

  // Show submit confirmation
  function showSubmitConfirmation() {
    confirmationModal.classList.add("active");
    updateProgress(); // Ensure counts are current
  }

  // Hide submit confirmation
  function hideSubmitConfirmation() {
    confirmationModal.classList.remove("active");
  }

  // Submit exam
  function submitExam() {
    // Stop timer
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    // Play submit sound
    playSound(submitSound);

    // Hide confirmation modal
    hideSubmitConfirmation();

    // Calculate results
    calculateResults();

    // Show results screen
    showResults();
  }

  // Calculate exam results
  function calculateResults() {
    let correctCount = 0;
    let sectionPerformance = {};

    currentExam.questions.forEach((question) => {
      // Initialize section if not exists
      if (!sectionPerformance[question.section]) {
        sectionPerformance[question.section] = {
          total: 0,
          correct: 0,
        };
      }

      // Count question in section
      sectionPerformance[question.section].total++;

      // Check if answer is correct
      const userAnswer = userAnswers[question.id];
      if (userAnswer !== undefined && userAnswer === question.correct) {
        correctCount++;
        sectionPerformance[question.section].correct++;
      }
    });

    // Calculate statistics
    const totalQuestions = currentExam.questions.length;
    const wrongCount = totalQuestions - correctCount;
    const percentage =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;
    const accuracy =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;

    // Calculate time used
    const examEndTime = new Date();
    const timeUsedMs = examEndTime - examStartTime;
    const timeUsedMinutes = Math.floor(timeUsedMs / 60000);
    const timeUsedSeconds = Math.floor((timeUsedMs % 60000) / 1000);
    const timeUsedFormatted = `${timeUsedMinutes}:${timeUsedSeconds.toString().padStart(2, "0")}`;

    // Determine grade based on OOU system
    let gradeText, performanceText, scoreBadge;
    if (percentage >= 70) {
      gradeText = "A";
      performanceText = "Excellent";
      scoreBadge = "Outstanding Performance";
    } else if (percentage >= 60) {
      gradeText = "B";
      performanceText = "Very Good";
      scoreBadge = "Strong Performance";
    } else if (percentage >= 50) {
      gradeText = "C";
      performanceText = "Good";
      scoreBadge = "Satisfactory Performance";
    } else if (percentage >= 45) {
      gradeText = "D";
      performanceText = "Pass";
      scoreBadge = "Minimum Pass";
    } else if (percentage >= 40) {
      gradeText = "E";
      performanceText = "Fair";
      scoreBadge = "Below Average";
    } else {
      gradeText = "F";
      performanceText = "Fail";
      scoreBadge = "Needs Improvement";
    }

    // Store results
    examResults = {
      course: currentExam.course,
      totalQuestions,
      correctCount,
      wrongCount,
      percentage,
      accuracy,
      timeUsed: timeUsedFormatted,
      grade: gradeText,
      performance: performanceText,
      scoreBadge,
      sectionPerformance,
      questions: currentExam.questions,
      userAnswers,
      markedQuestions: Array.from(markedQuestions),
      correctAnswers: currentExam.questions.reduce((acc, q) => {
        acc[q.id] = q.correct;
        return acc;
      }, {}),
      explanations: currentExam.questions.reduce((acc, q) => {
        acc[q.id] = q.explanation;
        return acc;
      }, {}),
    };
  }

  // Show results screen
  function showResults() {
    if (!examResults) return;

    // Update results display
    resultsCourse.textContent = examResults.course;
    finalScore.textContent = examResults.percentage;
    grade.textContent = `GRADE: ${examResults.grade}`;
    performance.textContent = `Performance: ${examResults.performance}`;
    correctAnswers.textContent = examResults.correctCount;
    wrongAnswers.textContent = examResults.wrongCount;
    timeUsed.textContent = examResults.timeUsed;
    accuracyRate.textContent = `${examResults.accuracy}%`;

    // Update score circle
    const scoreProgress = document.querySelector(".score-progress");
    if (scoreProgress) {
      const progress = (examResults.percentage / 100) * 360;
      scoreProgress.style.strokeDasharray = `${progress}, 20000`;

      // Set color based on grade
      if (examResults.grade === "A" || examResults.grade === "B") {
        scoreProgress.style.stroke = "#00ff88";
      } else if (examResults.grade === "C" || examResults.grade === "D") {
        scoreProgress.style.stroke = "#ffd166";
      } else {
        scoreProgress.style.stroke = "#ff6b6b";
      }
    }

    // Update score badge
    const scoreBadge = document.getElementById("scoreBadge");
    if (scoreBadge) {
      scoreBadge.querySelector("span").textContent = examResults.scoreBadge;
    }

    // Update section breakdown
    updateSectionBreakdown();

    // Update question review
    updateQuestionReview();

    // Show results screen
    showScreen("results");
  }

  // Update section breakdown
  function updateSectionBreakdown() {
    sectionBreakdown.innerHTML = "";

    for (const [section, data] of Object.entries(
      examResults.sectionPerformance,
    )) {
      const percentage =
        data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;

      const breakdownItem = document.createElement("div");
      breakdownItem.className = "breakdown-item";
      breakdownItem.innerHTML = `
                <h4>${section}</h4>
                <div class="breakdown-stats">
                    <span>${data.correct}/${data.total} Correct</span>
                    <span>${percentage}%</span>
                </div>
                <div class="breakdown-bar">
                    <div class="breakdown-bar-fill" style="width: ${percentage}%"></div>
                </div>
            `;

      sectionBreakdown.appendChild(breakdownItem);
    }
  }

  // Update question review
  function updateQuestionReview() {
    reviewQuestions.innerHTML = "";

    examResults.questions.forEach((question, index) => {
      const userAnswer = examResults.userAnswers[question.id];
      const isCorrect = userAnswer === question.correct;
      const isMarked = examResults.markedQuestions.includes(question.id);

      const reviewQuestion = document.createElement("div");
      reviewQuestion.className = `review-question ${isCorrect ? "correct" : "incorrect"}`;
      reviewQuestion.dataset.status = isCorrect ? "correct" : "incorrect";
      reviewQuestion.dataset.marked = isMarked;

      reviewQuestion.innerHTML = `
                <div class="review-question-header">
                    <div class="review-question-number">Question ${index + 1}</div>
                    <div class="review-question-status">${isCorrect ? "Correct" : "Incorrect"}</div>
                </div>
                <div class="review-question-text">${question.text}</div>
                <div class="review-answer">
                    <div class="review-answer-label">Your Answer:</div>
                    <div class="review-answer-text">
                        ${userAnswer !== undefined ? question.options[userAnswer] : "Not Answered"}
                    </div>
                </div>
                <div class="review-answer">
                    <div class="review-answer-label">Correct Answer:</div>
                    <div class="review-answer-text">${question.options[question.correct]}</div>
                </div>
                <div class="review-explanation">
                    <div class="review-explanation-label">Explanation:</div>
                    <div class="review-explanation-text">${question.explanation}</div>
                </div>
            `;

      reviewQuestions.appendChild(reviewQuestion);
    });
  }

  // Filter review questions
  function filterReviewQuestions(filter) {
    const questions = document.querySelectorAll(".review-question");

    questions.forEach((question) => {
      const status = question.dataset.status;
      const marked = question.dataset.marked === "true";

      switch (filter) {
        case "all":
          question.style.display = "block";
          break;
        case "incorrect":
          question.style.display = status === "incorrect" ? "block" : "none";
          break;
        case "marked":
          question.style.display = marked ? "block" : "none";
          break;
      }
    });
  }

  // Print results
  function printResults() {
    window.print();
  }

  // Share results
  function shareResults() {
    if (navigator.share) {
      navigator.share({
        title: `${examResults.course} - Exam Results`,
        text: `I scored ${examResults.percentage}% (Grade: ${examResults.grade}) on my ${examResults.course} exam!`,
        url: window.location.href,
      });
    } else {
      // Fallback: Copy to clipboard
      const text = `My ${examResults.course} Exam Results:\nScore: ${examResults.percentage}%\nGrade: ${examResults.grade}\nCorrect: ${examResults.correctCount}/${examResults.totalQuestions}`;

      navigator.clipboard.writeText(text).then(() => {
        alert("Results copied to clipboard!");
      });
    }
  }

  // Show confirm exit dialog
  function showConfirmExit() {
    if (
      confirm(
        "Are you sure you want to exit the exam? All progress will be lost.",
      )
    ) {
      showScreen("course");
    }
  }

  // Toggle fullscreen
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.log(`Fullscreen error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }

  // Handle fullscreen change
  function handleFullscreenChange() {
    if (document.fullscreenElement) {
      fullscreenWarning.style.display = "block";
      fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
      fullscreenWarning.style.display = "none";
      fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
  }

  // Handle keyboard shortcuts
  function handleKeyboardShortcuts(e) {
    if (currentScreen !== "exam") return;

    // Number keys 1-4 for answer selection
    if (e.key >= "1" && e.key <= "4") {
      const optionIndex = parseInt(e.key) - 1;
      const question = currentExam.questions[currentQuestionIndex];
      selectOption(question.id, optionIndex);
    }

    // Arrow keys for navigation
    if (e.key === "ArrowLeft" && currentQuestionIndex > 0) {
      showPreviousQuestion();
    } else if (
      e.key === "ArrowRight" &&
      currentQuestionIndex < currentExam.questions.length - 1
    ) {
      showNextQuestion();
    }

    // Space for mark/review
    if (e.key === " ") {
      e.preventDefault();
      toggleMarkReview();
    }

    // Enter for submit
    if (e.key === "Enter" && e.ctrlKey) {
      showSubmitConfirmation();
    }
  }

  // Create floating particles
  function createParticles() {
    const container = document.getElementById("particlesContainer");
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";

      // Random properties
      const size = Math.random() * 5 + 2;
      const posX = Math.random() * 100;
      const duration = Math.random() * 30 + 20;
      const delay = Math.random() * 10;

      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${posX}%`;
      particle.style.background = `rgba(255, 255, 255, ${Math.random() * 0.1 + 0.05})`;
      particle.style.animationDuration = `${duration}s`;
      particle.style.animationDelay = `${delay}s`;

      container.appendChild(particle);
    }
  }

  // Initialize audio
  function initializeAudio() {
    // Preload sounds
    [clickSound, correctSound, submitSound].forEach((sound) => {
      sound.volume = 0.3;
    });
  }

  // Play sound
  function playSound(sound) {
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch((e) => console.log("Audio play failed:", e));
    }
  }

  // Start the application
  init();
});
