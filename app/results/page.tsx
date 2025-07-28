"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, User, RotateCcw } from "lucide-react"

interface Question {
  question: string
  correct_answer: string
  incorrect_answers: string[]
  type: string
  difficulty: string
  category: string
}

interface QuizResults {
  questions: Question[]
  answers: { [key: number]: string }
  timeLeft: number
}

export default function ResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<QuizResults | null>(null)
  const [userEmail, setUserEmail] = useState<string>("")

  useEffect(() => {
    const storedResults = localStorage.getItem("quizResults")
    const storedEmail = localStorage.getItem("userEmail")

    if (storedResults) {
      setResults(JSON.parse(storedResults))
    }

    if (storedEmail) {
      setUserEmail(storedEmail)
    }
  }, [])

  const handleRetakeQuiz = () => {
    localStorage.removeItem("quizResults")
    router.push("/")
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-lg mb-4">No quiz results found.</p>
            <Button onClick={() => router.push("/")}>Start New Quiz</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalQuestions = results.questions.length
  const answeredQuestions = Object.keys(results.answers).length
  const correctAnswers = results.questions.filter((q, index) => results.answers[index] === q.correct_answer).length
  const score = Math.round((correctAnswers / totalQuestions) * 100)
  const timeUsed = 30 * 60 - results.timeLeft
  const timeUsedFormatted = `${Math.floor(timeUsed / 60)}:${(timeUsed % 60).toString().padStart(2, "0")}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-600">Quiz Results</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Quiz Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="text-lg font-bold text-blue-600 break-all px-2">{userEmail}</div>
                <div className="text-sm text-gray-500">Participant</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-green-600">
                  {correctAnswers}/{totalQuestions}
                </div>
                <div className="text-sm text-gray-500">Correct Answers</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-purple-600">{score}%</div>
                <div className="text-sm text-gray-500">Score</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-orange-600 flex items-center justify-center space-x-1">
                  <Clock className="h-5 w-5" />
                  <span>{timeUsedFormatted}</span>
                </div>
                <div className="text-sm text-gray-500">Time Used</div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Button onClick={handleRetakeQuiz} className="flex items-center space-x-2">
                <RotateCcw className="h-4 w-4" />
                <span>Retake Quiz</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Detailed Results</h2>

          {results.questions.map((question, index) => {
            const userAnswer = results.answers[index]
            const isCorrect = userAnswer === question.correct_answer
            const wasAnswered = userAnswer !== undefined
            const allChoices = [...question.incorrect_answers, question.correct_answer].sort()

            return (
              <Card
                key={index}
                className={`border-l-4 ${
                  !wasAnswered ? "border-l-gray-400" : isCorrect ? "border-l-green-500" : "border-l-red-500"
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <span>Question {index + 1}</span>
                      {!wasAnswered ? (
                        <Badge variant="secondary">Not Answered</Badge>
                      ) : isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </CardTitle>
                    <div className="text-sm text-gray-500">
                      {question.category} • {question.difficulty}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: question.question }} />

                  <div className="grid gap-2">
                    {allChoices.map((choice, choiceIndex) => {
                      const isUserAnswer = choice === userAnswer
                      const isCorrectAnswer = choice === question.correct_answer

                      return (
                        <div
                          key={choiceIndex}
                          className={`p-3 rounded-lg border ${
                            isCorrectAnswer
                              ? "bg-green-50 border-green-200"
                              : isUserAnswer && !isCorrectAnswer
                                ? "bg-red-50 border-red-200"
                                : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span dangerouslySetInnerHTML={{ __html: choice }} />
                            <div className="flex items-center space-x-2">
                              {isUserAnswer && (
                                <Badge variant={isCorrectAnswer ? "default" : "destructive"}>Your Answer</Badge>
                              )}
                              {isCorrectAnswer && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  Correct Answer
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
