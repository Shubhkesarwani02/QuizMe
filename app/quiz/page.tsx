"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Clock, CheckCircle, Circle, Eye } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Question {
  question: string
  correct_answer: string
  incorrect_answers: string[]
  type: string
  difficulty: string
  category: string
}

interface QuizState {
  questions: Question[]
  currentQuestion: number
  answers: { [key: number]: string }
  visitedQuestions: Set<number>
  timeLeft: number
  isLoading: boolean
}

export default function QuizPage() {
  const router = useRouter()
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentQuestion: 0,
    answers: {},
    visitedQuestions: new Set([0]),
    timeLeft: 30 * 60, // 30 minutes in seconds
    isLoading: true,
  })

  // Fetch questions on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("https://opentdb.com/api.php?amount=15")
        const data = await response.json()

        if (data.results) {
          setQuizState((prev) => ({
            ...prev,
            questions: data.results,
            isLoading: false,
          }))
        }
      } catch (error) {
        console.error("Failed to fetch questions:", error)
        setQuizState((prev) => ({ ...prev, isLoading: false }))
      }
    }

    fetchQuestions()
  }, [])

  // Timer countdown
  useEffect(() => {
    if (quizState.timeLeft <= 0) {
      handleSubmitQuiz()
      return
    }

    const timer = setInterval(() => {
      setQuizState((prev) => ({
        ...prev,
        timeLeft: prev.timeLeft - 1,
      }))
    }, 1000)

    return () => clearInterval(timer)
  }, [quizState.timeLeft])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (answer: string) => {
    setQuizState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [prev.currentQuestion]: answer,
      },
    }))
  }

  const navigateToQuestion = (questionIndex: number) => {
    setQuizState((prev) => ({
      ...prev,
      currentQuestion: questionIndex,
      visitedQuestions: new Set([...prev.visitedQuestions, questionIndex]),
    }))
  }

  const handleNext = () => {
    if (quizState.currentQuestion < quizState.questions.length - 1) {
      navigateToQuestion(quizState.currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (quizState.currentQuestion > 0) {
      navigateToQuestion(quizState.currentQuestion - 1)
    }
  }

  const handleSubmitQuiz = () => {
    // Store quiz results in localStorage
    localStorage.setItem(
      "quizResults",
      JSON.stringify({
        questions: quizState.questions,
        answers: quizState.answers,
        timeLeft: quizState.timeLeft,
      }),
    )

    router.push("/results")
  }

  if (quizState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          ></motion.div>
          <motion.p 
            className="text-lg"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Loading quiz questions...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  if (quizState.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-lg mb-4">Failed to load quiz questions.</p>
            <Button onClick={() => router.push("/")}>Return to Start</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQ = quizState.questions[quizState.currentQuestion]
  const allChoices = [...currentQ.incorrect_answers, currentQ.correct_answer].sort()
  const progress = ((quizState.currentQuestion + 1) / quizState.questions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with timer */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">CausalFunnel Quiz</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-lg font-semibold">
              <Clock className="h-5 w-5 text-red-500" />
              <span className={quizState.timeLeft < 300 ? "text-red-500" : "text-gray-700"}>
                {formatTime(quizState.timeLeft)}
              </span>
            </div>
            <Button onClick={handleSubmitQuiz} variant="outline">
              Submit Quiz
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Overview Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                {quizState.questions.map((_, index) => {
                  const isVisited = quizState.visitedQuestions.has(index)
                  const isAnswered = quizState.answers[index] !== undefined
                  const isCurrent = index === quizState.currentQuestion

                  return (
                    <button
                      key={index}
                      onClick={() => navigateToQuestion(index)}
                      className={`
                        p-2 rounded text-sm font-medium border-2 transition-colors
                        ${
                          isCurrent
                            ? "border-blue-500 bg-blue-500 text-white"
                            : isAnswered
                              ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100"
                              : isVisited
                                ? "border-yellow-500 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }
                      `}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <span>{index + 1}</span>
                        {isAnswered && <CheckCircle className="h-3 w-3" />}
                        {isVisited && !isAnswered && <Eye className="h-3 w-3" />}
                        {!isVisited && <Circle className="h-3 w-3" />}
                      </div>
                    </button>
                  )
                })}
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-50 border-2 border-green-500 rounded"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-50 border-2 border-yellow-500 rounded"></div>
                  <span>Visited</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
                  <span>Not visited</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Question Area */}
        <motion.div 
          className="lg:col-span-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Question {quizState.currentQuestion + 1} of {quizState.questions.length}
                </CardTitle>
                <div className="text-sm text-gray-500">
                  {currentQ.category} • {currentQ.difficulty}
                </div>
              </div>
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4 }}
                style={{ originX: 0 }}
              >
                <Progress value={progress} className="w-full" />
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={quizState.currentQuestion}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: currentQ.question }} />
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div
                  key={quizState.currentQuestion}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <RadioGroup
                    value={quizState.answers[quizState.currentQuestion] || ""}
                    onValueChange={handleAnswerChange}
                    className="space-y-3"
                  >
                    {allChoices.map((choice, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 + index * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50"
                      >
                        <RadioGroupItem value={choice} id={`choice-${index}`} />
                        <Label
                          htmlFor={`choice-${index}`}
                          className="flex-1 cursor-pointer"
                          dangerouslySetInnerHTML={{ __html: choice }}
                        />
                      </motion.div>
                    ))}
                  </RadioGroup>
                </motion.div>
              </AnimatePresence>

              <motion.div 
                className="flex justify-between pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={handlePrevious} disabled={quizState.currentQuestion === 0} variant="outline">
                    Previous
                  </Button>
                </motion.div>

                <div className="space-x-2">
                  {quizState.currentQuestion === quizState.questions.length - 1 ? (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button onClick={handleSubmitQuiz}>Submit Quiz</Button>
                    </motion.div>
                  ) : (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button onClick={handleNext}>Next</Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
